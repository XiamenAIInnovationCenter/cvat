# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import filter_users_by_email
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.http import HttpResponseForbidden, HttpResponseRedirect


class DefaultAccountAdapterEx(DefaultAccountAdapter):
    def respond_email_verification_sent(self, request, user):
        return HttpResponseRedirect(settings.ACCOUNT_EMAIL_VERIFICATION_SENT_REDIRECT_URL)


class CVATSocialAccountAdapter(DefaultSocialAccountAdapter):
    @staticmethod
    def _claims(sociallogin):
        extra_data = sociallogin.account.extra_data
        claims = {}
        if isinstance(extra_data, dict):
            for source in ("id_token", "userinfo"):
                if isinstance(extra_data.get(source), dict):
                    claims.update(extra_data[source])
            if not claims:
                claims.update(extra_data)
        return claims

    @staticmethod
    def _reject(message: str):
        raise ImmediateHttpResponse(HttpResponseForbidden(message))

    def pre_social_login(self, request, sociallogin):
        claims = self._claims(sociallogin)
        email = claims.get("email") or getattr(sociallogin.user, "email", "")
        if not email:
            self._reject("Keycloak did not provide an email address.")

        email = email.strip().lower()
        configured_domain = settings.SSO_IDENTITY_PROVIDER.get("email_domain")
        if configured_domain and email.rpartition("@")[2] != configured_domain:
            self._reject("The Keycloak email domain is not allowed.")

        if sociallogin.is_existing:
            return

        existing_users = list(filter_users_by_email(email))
        if len(existing_users) > 1:
            self._reject("Multiple CVAT users have the same email address.")
        if existing_users:
            # Link the trusted Keycloak identity without replacing the local password.
            sociallogin.connect(request, existing_users[0])
