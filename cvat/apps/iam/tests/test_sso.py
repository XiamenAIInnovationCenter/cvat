# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from types import SimpleNamespace

from allauth.core.exceptions import ImmediateHttpResponse
from django.test import RequestFactory, SimpleTestCase, override_settings

from cvat.apps.iam.adapters import CVATSocialAccountAdapter


@override_settings(SSO_IDENTITY_PROVIDER={"email_domain": "example.com"})
class CVATSocialAccountAdapterTest(SimpleTestCase):
    def setUp(self):
        self.request = RequestFactory().get("/")
        self.adapter = CVATSocialAccountAdapter(self.request)

    @staticmethod
    def _social_login(claims):
        return SimpleNamespace(
            account=SimpleNamespace(extra_data={"userinfo": claims}),
            user=SimpleNamespace(email=claims.get("email", "")),
            is_existing=True,
        )

    def test_accepts_verified_email_from_allowed_domain(self):
        sociallogin = self._social_login({"email": "user@example.com", "email_verified": True})

        self.adapter.pre_social_login(self.request, sociallogin)

    def test_accepts_unverified_email(self):
        sociallogin = self._social_login({"email": "user@example.com", "email_verified": False})

        self.adapter.pre_social_login(self.request, sociallogin)

    def test_rejects_email_from_other_domain(self):
        sociallogin = self._social_login({"email": "user@other.example", "email_verified": True})

        with self.assertRaises(ImmediateHttpResponse) as context:
            self.adapter.pre_social_login(self.request, sociallogin)

        self.assertEqual(context.exception.response.status_code, 403)
