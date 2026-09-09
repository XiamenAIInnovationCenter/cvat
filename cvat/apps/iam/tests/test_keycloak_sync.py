# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from unittest.mock import Mock

from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model
from django.test import TestCase

from cvat.apps.iam.keycloak_sync import KeycloakAdminClient, sync_keycloak_users
from cvat.apps.organizations.models import Membership, Organization


class FakeResponse:
    def __init__(self, payload, status_code=200):
        self.payload = payload
        self.status_code = status_code
        self.ok = status_code < 400
        self.text = ""

    def json(self):
        return self.payload


class KeycloakAdminClientTest(TestCase):
    def test_lists_group_members_using_client_credentials(self):
        session = Mock()
        session.post.return_value = FakeResponse({"access_token": "admin-token"})
        session.request.side_effect = [
            FakeResponse([{"id": "group-id", "name": "Users", "path": "/CVAT/Users"}]),
            FakeResponse(
                [
                    {
                        "id": "user-id",
                        "username": "alice",
                        "email": "alice@example.com",
                        "enabled": True,
                        "emailVerified": True,
                    }
                ]
            ),
        ]
        client = KeycloakAdminClient(
            {
                "id": "keycloak",
                "server_url": "https://keycloak.example.com/auth/realms/cvat",
                "client_id": "sync-client",
                "client_secret": "secret",
            },
            session=session,
        )

        members = client.list_group_members("/CVAT/Users")

        self.assertEqual(members[0]["id"], "user-id")
        self.assertEqual(client.base_url, "https://keycloak.example.com/auth")
        session.post.assert_called_once()
        self.assertEqual(
            session.request.call_args_list[0].kwargs["headers"]["Authorization"],
            "Bearer admin-token",
        )
        self.assertTrue(client.is_eligible_user(members[0]))
        self.assertTrue(client.is_eligible_user({**members[0], "emailVerified": False}))


class KeycloakUserSyncTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="test-password",
        )
        self.organization = Organization.objects.create(slug="sync-org", owner=self.owner)

    def test_creates_user_social_account_and_active_membership(self):
        report = sync_keycloak_users(
            [
                {
                    "id": "keycloak-user-id",
                    "username": "alice",
                    "email": "alice@example.com",
                    "firstName": "Alice",
                    "lastName": "Example",
                    "enabled": True,
                    "emailVerified": True,
                }
            ],
            organization_slug="sync-org",
            role=Membership.WORKER,
            dry_run=False,
        )

        user = get_user_model().objects.get(email="alice@example.com")
        self.assertEqual(report["created"][0]["email"], "alice@example.com")
        self.assertTrue(user.has_usable_password() is False)
        self.assertTrue(
            SocialAccount.objects.filter(
                user=user, provider="keycloak", uid="keycloak-user-id"
            ).exists()
        )
        membership = Membership.objects.get(user=user, organization=self.organization)
        self.assertTrue(membership.is_active)
        self.assertEqual(membership.role, Membership.WORKER)

    def test_sync_is_idempotent(self):
        user_data = {
            "id": "keycloak-user-id",
            "username": "alice",
            "email": "alice@example.com",
            "enabled": True,
            "emailVerified": True,
        }

        sync_keycloak_users(
            [user_data], organization_slug="sync-org", role=Membership.WORKER, dry_run=False
        )
        report = sync_keycloak_users(
            [user_data], organization_slug="sync-org", role=Membership.WORKER, dry_run=False
        )

        self.assertEqual(get_user_model().objects.filter(email="alice@example.com").count(), 1)
        self.assertEqual(SocialAccount.objects.filter(uid="keycloak-user-id").count(), 1)
        self.assertEqual(Membership.objects.filter(organization=self.organization).count(), 1)
        self.assertEqual(len(report["unchanged"]), 1)

    def test_existing_email_with_another_keycloak_identity_is_reported_as_conflict(self):
        User = get_user_model()
        User.objects.create_user(
            username="alice-local",
            email="alice@example.com",
            password="test-password",
        )
        local_user = User.objects.get(username="alice-local")
        SocialAccount.objects.create(user=local_user, provider="keycloak", uid="other-subject")

        report = sync_keycloak_users(
            [
                {
                    "id": "keycloak-user-id",
                    "username": "alice",
                    "email": "alice@example.com",
                    "enabled": True,
                    "emailVerified": True,
                }
            ],
            organization_slug="sync-org",
            role=Membership.WORKER,
            dry_run=False,
        )

        self.assertEqual(len(report["conflicts"]), 1)
        self.assertEqual(SocialAccount.objects.count(), 1)

    def test_unverified_email_is_imported_but_remains_unverified(self):
        report = sync_keycloak_users(
            [
                {
                    "id": "unverified-user-id",
                    "username": "unverified",
                    "email": "unverified@example.com",
                    "enabled": True,
                    "emailVerified": False,
                }
            ],
            organization_slug="sync-org",
            role=Membership.WORKER,
            dry_run=False,
        )

        user = get_user_model().objects.get(email="unverified@example.com")
        self.assertEqual(len(report["created"]), 1)
        self.assertFalse(user.emailaddress_set.get(email="unverified@example.com").verified)

    def test_dry_run_reports_membership_for_new_user(self):
        report = sync_keycloak_users(
            [
                {
                    "id": "dry-run-user-id",
                    "username": "dry-run-user",
                    "email": "dry-run@example.com",
                    "enabled": True,
                    "emailVerified": False,
                }
            ],
            organization_slug="sync-org",
            role=Membership.WORKER,
            dry_run=True,
        )

        self.assertEqual(len(report["created"]), 1)
        self.assertEqual(len(report["memberships_created"]), 1)
        self.assertFalse(get_user_model().objects.filter(email="dry-run@example.com").exists())

    def test_subject_with_conflicting_email_is_reported_as_conflict(self):
        User = get_user_model()
        synced_user = User.objects.create_user(
            username="alice-synced",
            email="old@example.com",
            password="test-password",
        )
        SocialAccount.objects.create(
            user=synced_user,
            provider="keycloak",
            uid="keycloak-user-id",
        )
        User.objects.create_user(
            username="alice-local",
            email="alice@example.com",
            password="test-password",
        )

        report = sync_keycloak_users(
            [
                {
                    "id": "keycloak-user-id",
                    "username": "alice",
                    "email": "alice@example.com",
                    "enabled": True,
                    "emailVerified": True,
                }
            ],
            organization_slug="sync-org",
            role=Membership.WORKER,
            dry_run=False,
        )

        self.assertEqual(len(report["conflicts"]), 1)
        self.assertEqual(User.objects.get(pk=synced_user.pk).email, "old@example.com")
