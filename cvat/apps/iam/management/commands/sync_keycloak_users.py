# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import json
import os
from collections.abc import Iterable

from django.core.management.base import BaseCommand, CommandError

from cvat.apps.iam.auth_config import load_auth_config
from cvat.apps.iam.keycloak_sync import (
    KeycloakAdminClient,
    KeycloakSyncError,
    format_sync_report,
    sync_keycloak_users,
)


class Command(BaseCommand):
    help = "Synchronize users from a Keycloak group into CVAT"

    def add_arguments(self, parser):
        parser.add_argument(
            "--group",
            help="Keycloak group path, for example /CVAT/Annotators",
        )
        parser.add_argument(
            "--list-groups",
            action="store_true",
            help="List Keycloak groups and exit",
        )
        parser.add_argument(
            "--list",
            action="store_true",
            help="List eligible users in the selected Keycloak group and exit",
        )
        parser.add_argument(
            "--user",
            dest="users",
            action="append",
            help="User email, username, or Keycloak subject; may be specified multiple times",
        )
        parser.add_argument(
            "--all-group-users",
            action="store_true",
            help="Synchronize every eligible user in the selected group",
        )
        parser.add_argument(
            "--organization",
            help="Existing CVAT organization slug to which synchronized users are added",
        )
        parser.add_argument(
            "--role",
            default="worker",
            choices=("worker", "supervisor", "maintainer"),
            help="Organization role for newly added members (default: worker)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show planned changes without modifying CVAT",
        )
        parser.add_argument(
            "--json",
            action="store_true",
            help="Print machine-readable JSON output",
        )

    def handle(self, *args, **options):
        try:
            auth_config = load_auth_config(os.getenv("AUTH_CONFIG_PATH"))
            if not auth_config["sso"]["enabled"]:
                raise CommandError("SSO is disabled in the authentication configuration")
            providers = auth_config["sso"]["identity_providers"]
            if not providers or providers[0].get("id") != "keycloak":
                raise CommandError("A Keycloak identity provider is required")

            client = KeycloakAdminClient(providers[0])
            group_path = options.get("group")

            if options["list_groups"]:
                groups = client.list_groups_recursive()
                self._write(groups, options["json"])
                return

            if not group_path:
                raise CommandError("--group is required unless --list-groups is used")

            users = client.list_group_members(group_path)
            eligible_users = [user for user in users if client.is_eligible_user(user)]

            if options["list"]:
                self._write(eligible_users, options["json"])
                return

            selected_users = self._select_users(
                eligible_users, options["users"], options["all_group_users"]
            )
            report = sync_keycloak_users(
                selected_users,
                organization_slug=options.get("organization"),
                role=options["role"],
                dry_run=options["dry_run"],
            )
            self._write(report if options["json"] else format_sync_report(report), options["json"])
        except KeycloakSyncError as exc:
            raise CommandError(str(exc)) from exc

    @staticmethod
    def _select_users(users: list[dict], requested: Iterable[str] | None, all_group_users: bool):
        if requested and all_group_users:
            raise CommandError("--user and --all-group-users cannot be used together")
        if not requested and not all_group_users:
            raise CommandError(
                "Specify at least one --user, or use --all-group-users; "
                "use --list to inspect eligible users"
            )
        if all_group_users:
            return users

        selected = []
        missing = []
        for identifier in requested:
            matches = [
                user
                for user in users
                if identifier.casefold()
                in {
                    str(user.get("id", "")).casefold(),
                    str(user.get("username", "")).casefold(),
                    str(user.get("email", "")).casefold(),
                }
            ]
            if not matches:
                missing.append(identifier)
            else:
                selected.extend(matches)

        if missing:
            raise CommandError(
                "The following users were not found in the eligible group: " + ", ".join(missing)
            )

        unique_users = {str(user["id"]): user for user in selected}
        return list(unique_users.values())

    def _write(self, value, as_json: bool):
        if as_json:
            self.stdout.write(json.dumps(value, ensure_ascii=False, indent=2, default=str))
        elif isinstance(value, list):
            for item in value:
                self.stdout.write(json.dumps(item, ensure_ascii=False, default=str))
        else:
            self.stdout.write(value)
