# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from __future__ import annotations

from collections.abc import Iterable
from typing import Any
from urllib.parse import quote, urlsplit, urlunsplit

import requests
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from cvat.apps.organizations.models import Membership, Organization


class KeycloakSyncError(Exception):
    """Raised when Keycloak cannot be queried or a sync operation is invalid."""


class KeycloakAdminClient:
    """Small Keycloak Admin REST API client used by the management command."""

    PAGE_SIZE = 100

    def __init__(self, provider: dict[str, Any], *, timeout: int = 15, session=None):
        self.provider = provider
        self.timeout = timeout
        self.session = session or requests.Session()

        discovery_url = provider["server_url"].rstrip("/")
        suffix = "/.well-known/openid-configuration"
        if discovery_url.endswith(suffix):
            discovery_url = discovery_url[: -len(suffix)]

        parsed = urlsplit(discovery_url)
        parts = [part for part in parsed.path.split("/") if part]
        try:
            realm_index = parts.index("realms")
            realm = parts[realm_index + 1]
        except (ValueError, IndexError) as exc:
            raise KeycloakSyncError("Keycloak server_url must contain /realms/<realm>") from exc

        self.issuer_url = urlunsplit(
            (parsed.scheme, parsed.netloc, "/".join(parts[: realm_index + 2]), "", "")
        ).rstrip("/")
        self.base_url = urlunsplit(
            (parsed.scheme, parsed.netloc, "/".join(parts[:realm_index]), "", "")
        ).rstrip("/")
        self.realm = realm
        self.provider_id = provider["id"]

    def _request(self, method: str, path: str, **kwargs):
        try:
            response = self.session.request(
                method, self.base_url + path, timeout=self.timeout, **kwargs
            )
        except requests.RequestException as exc:
            raise KeycloakSyncError(f"Keycloak request failed: {exc}") from exc

        if not response.ok:
            detail = response.text[:300].strip()
            raise KeycloakSyncError(
                f"Keycloak returned HTTP {response.status_code} for {method} {path}"
                + (f": {detail}" if detail else "")
            )
        try:
            return response.json()
        except ValueError as exc:
            raise KeycloakSyncError(f"Keycloak returned invalid JSON for {method} {path}") from exc

    def _admin_request(self, method: str, path: str, **kwargs):
        if not hasattr(self, "access_token"):
            self.access_token = self._get_access_token()
        headers = {**kwargs.pop("headers", {}), "Authorization": f"Bearer {self.access_token}"}
        return self._request(
            method, f"/admin/realms/{quote(self.realm, safe='')}{path}", headers=headers, **kwargs
        )

    def _get_access_token(self) -> str:
        client_id = self.provider.get("sync_client_id") or self.provider["client_id"]
        client_secret = self.provider.get("sync_client_secret") or self.provider["client_secret"]
        data = {
            "grant_type": "client_credentials",
            "client_id": client_id,
        }
        auth = None
        if self.provider.get("token_auth_method") == "client_secret_basic":
            auth = (client_id, client_secret)
        else:
            data["client_secret"] = client_secret

        try:
            response = self.session.post(
                f"{self.issuer_url}/protocol/openid-connect/token",
                data=data,
                auth=auth,
                timeout=self.timeout,
            )
        except requests.RequestException as exc:
            raise KeycloakSyncError(f"Keycloak token request failed: {exc}") from exc
        if not response.ok:
            detail = response.text[:300].strip()
            if response.status_code == 401 and "unauthorized_client" in detail:
                detail += (
                    "; configure a confidential Keycloak sync client with service accounts enabled"
                )
            raise KeycloakSyncError(
                f"Keycloak token request returned HTTP {response.status_code}"
                + (f": {detail}" if detail else "")
            )
        try:
            token = response.json().get("access_token")
        except ValueError as exc:
            raise KeycloakSyncError("Keycloak token response was not valid JSON") from exc
        if not token:
            raise KeycloakSyncError("Keycloak token response did not contain access_token")
        return token

    @staticmethod
    def is_eligible_user(user: dict[str, Any]) -> bool:
        return bool(user.get("enabled")) and bool(str(user.get("email", "")).strip())

    def list_groups(self, search: str | None = None) -> list[dict[str, Any]]:
        groups = []
        first = 0
        while True:
            params = {"first": first, "max": self.PAGE_SIZE, "briefRepresentation": "false"}
            if search:
                params["search"] = search
            page = self._admin_request("GET", "/groups", params=params)
            if not isinstance(page, list):
                raise KeycloakSyncError("Keycloak groups response was not a list")
            groups.extend(page)
            if len(page) < self.PAGE_SIZE:
                return groups
            first += len(page)

    def list_groups_recursive(self) -> list[dict[str, Any]]:
        result = []

        def visit(group: dict[str, Any]):
            result.append(
                {"id": group.get("id"), "name": group.get("name"), "path": group.get("path")}
            )
            for child in self._list_children(group["id"]):
                visit(child)

        for group in self.list_groups():
            visit(group)
        return result

    def _list_children(self, group_id: str) -> list[dict[str, Any]]:
        children = []
        first = 0
        while True:
            page = self._admin_request(
                "GET",
                f"/groups/{quote(group_id, safe='')}/children",
                params={"first": first, "max": self.PAGE_SIZE, "briefRepresentation": "false"},
            )
            if not isinstance(page, list):
                raise KeycloakSyncError("Keycloak group children response was not a list")
            children.extend(page)
            if len(page) < self.PAGE_SIZE:
                return children
            first += len(page)

    def resolve_group(self, group_path: str) -> dict[str, Any]:
        normalized_path = "/" + group_path.strip("/") if group_path.strip("/") else "/"
        group_name = normalized_path.rsplit("/", 1)[-1]
        candidates = self.list_groups(search=group_name)
        for group in candidates:
            if group.get("path") == normalized_path:
                return group

        for group in self.list_groups():
            for nested in self._flatten_group(group):
                if nested.get("path") == normalized_path:
                    return nested

        raise KeycloakSyncError(f"Keycloak group not found: {normalized_path}")

    def _flatten_group(self, group: dict[str, Any]) -> Iterable[dict[str, Any]]:
        yield group
        for child in self._list_children(group["id"]):
            yield from self._flatten_group(child)

    def list_group_members(self, group_path: str) -> list[dict[str, Any]]:
        group = self.resolve_group(group_path)
        members = []
        first = 0
        while True:
            page = self._admin_request(
                "GET",
                f"/groups/{quote(group['id'], safe='')}/members",
                params={"first": first, "max": self.PAGE_SIZE, "briefRepresentation": "true"},
            )
            if not isinstance(page, list):
                raise KeycloakSyncError("Keycloak group members response was not a list")
            members.extend(page)
            if len(page) < self.PAGE_SIZE:
                return members
            first += len(page)


def _username_for_user(user_data: dict[str, Any], subject: str) -> str:
    username = (user_data.get("username") or user_data.get("email", "").split("@", 1)[0]).strip()
    username = username[:150]
    return username or f"keycloak-{subject[:32]}"


def _unique_username(username: str, subject: str, user_model) -> str:
    if not user_model.objects.filter(username=username).exists():
        return username
    suffix = f"-{subject[:12]}"
    return f"{username[: 150 - len(suffix)]}{suffix}"


def _user_summary(user_data: dict[str, Any]) -> dict[str, Any]:
    return {
        "subject": str(user_data.get("id", "")),
        "username": user_data.get("username", ""),
        "email": user_data.get("email", ""),
    }


def _ensure_email(user, email: str, verified: bool) -> None:
    email_address = (
        EmailAddress.objects.filter(user=user, email__iexact=email).order_by("-primary").first()
    )
    if email_address is None:
        EmailAddress.objects.filter(user=user, primary=True).update(primary=False)
        EmailAddress.objects.create(user=user, email=email, primary=True, verified=verified)
        return

    fields = []
    if verified and not email_address.verified:
        email_address.verified = True
        fields.append("verified")
    if not email_address.primary:
        EmailAddress.objects.filter(user=user, primary=True).exclude(pk=email_address.pk).update(
            primary=False
        )
        email_address.primary = True
        fields.append("primary")
    if fields:
        email_address.save(update_fields=fields)


def _sync_one_user(
    user_data: dict[str, Any], organization, role: str, dry_run: bool
) -> dict[str, Any]:
    User = get_user_model()
    subject = str(user_data.get("id", "")).strip()
    email = str(user_data.get("email", "")).strip().lower()
    provider = "keycloak"
    summary = _user_summary(user_data)
    account = (
        SocialAccount.objects.select_related("user").filter(provider=provider, uid=subject).first()
    )
    user = account.user if account else None

    if user is not None:
        email_conflicts = User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists()
        if email_conflicts:
            return {**summary, "reason": "email belongs to another CVAT user"}

    if user is None:
        email_users = list(User.objects.filter(email__iexact=email)[:2])
        if len(email_users) > 1:
            return {**summary, "reason": "multiple CVAT users use this email"}
        if email_users:
            existing_accounts = SocialAccount.objects.filter(user=email_users[0], provider=provider)
            if existing_accounts.exists():
                return {**summary, "reason": "email belongs to another Keycloak identity"}
            user = email_users[0]

    created = False
    linked = False
    updated = False
    membership_created = False
    membership_activated = False

    if dry_run:
        if user is None:
            created = True
        else:
            linked = account is None
        if organization is not None:
            if user is None:
                membership_created = True
            else:
                membership = Membership.objects.filter(user=user, organization=organization).first()
                membership_created = membership is None
                membership_activated = membership is not None and not membership.is_active
    else:
        try:
            with transaction.atomic():
                if user is None:
                    username = _unique_username(
                        _username_for_user(user_data, subject), subject, User
                    )
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=user_data.get("firstName", "") or "",
                        last_name=user_data.get("lastName", "") or "",
                    )
                    user.set_unusable_password()
                    user.save(update_fields=["password"])
                    created = True
                else:
                    linked = account is None
                    fields = []
                    for field, key in (("first_name", "firstName"), ("last_name", "lastName")):
                        value = user_data.get(key)
                        if value and getattr(user, field) != value:
                            setattr(user, field, value)
                            fields.append(field)
                    if user.email.lower() != email:
                        user.email = email
                        fields.append("email")
                    if fields:
                        user.save(update_fields=fields)
                        updated = True

                if account is None:
                    SocialAccount.objects.create(
                        user=user,
                        provider=provider,
                        uid=subject,
                        extra_data=user_data,
                    )
                _ensure_email(user, email, bool(user_data.get("emailVerified")))

                if organization is not None:
                    membership, membership_created = Membership.objects.get_or_create(
                        user=user,
                        organization=organization,
                        defaults={
                            "is_active": True,
                            "joined_date": timezone.now(),
                            "role": role,
                        },
                    )
                    if not membership_created and not membership.is_active:
                        membership.is_active = True
                        membership.joined_date = timezone.now()
                        membership.save(update_fields=["is_active", "joined_date"])
                        membership_activated = True
        except IntegrityError as exc:
            return {**summary, "reason": f"database conflict: {exc}"}

    if created:
        action = "created"
    elif linked:
        action = "linked"
    elif updated:
        action = "updated"
    else:
        action = "unchanged"
    result = {**summary, "action": action}
    if membership_created:
        result["membership"] = "created"
    elif membership_activated:
        result["membership"] = "activated"
    return result


def sync_keycloak_users(
    users: Iterable[dict[str, Any]], *, organization_slug: str | None, role: str, dry_run: bool
) -> dict[str, Any]:
    organization = None
    if organization_slug:
        try:
            organization = Organization.objects.get(slug=organization_slug)
        except Organization.DoesNotExist as exc:
            raise KeycloakSyncError(
                f"CVAT organization does not exist: {organization_slug}"
            ) from exc

    report = {
        "created": [],
        "updated": [],
        "linked": [],
        "unchanged": [],
        "memberships_created": [],
        "memberships_activated": [],
        "conflicts": [],
    }
    for user_data in users:
        result = _sync_one_user(user_data, organization, role, dry_run)
        if "reason" in result:
            report["conflicts"].append(result)
            continue
        action = result.pop("action")
        membership = result.pop("membership", None)
        report[action].append(result)
        if membership == "created":
            report["memberships_created"].append(result)
        elif membership == "activated":
            report["memberships_activated"].append(result)
    return report


def format_sync_report(report: dict[str, list[dict[str, Any]]]) -> str:
    lines = []
    for key in (
        "created",
        "updated",
        "linked",
        "unchanged",
        "memberships_created",
        "memberships_activated",
        "conflicts",
    ):
        lines.append(f"{key}: {len(report[key])}")
        for item in report[key]:
            identity = item.get("email") or item.get("username") or item.get("subject")
            if key == "conflicts":
                lines.append(f"  - {identity}: {item['reason']}")
            else:
                lines.append(f"  - {identity}")
    return "\n".join(lines)
