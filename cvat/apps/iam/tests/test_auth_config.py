# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import tempfile
from pathlib import Path
from textwrap import dedent

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from cvat.apps.iam.auth_config import load_auth_config


class AuthenticationConfigTest(SimpleTestCase):
    def _load(self, content: str):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "auth_config.yml"
            path.write_text(dedent(content), encoding="utf-8")
            return load_auth_config(str(path))

    def test_defaults_keep_basic_authentication_enabled(self):
        config = load_auth_config(None)

        self.assertTrue(config["basic"]["registration"]["enabled"])
        self.assertTrue(config["basic"]["login"]["enabled"])
        self.assertFalse(config["sso"]["enabled"])

    def test_basic_registration_can_be_disabled(self):
        config = self._load("""
            basic:
              registration:
                enabled: false
            """)

        self.assertFalse(config["basic"]["registration"]["enabled"])
        self.assertTrue(config["basic"]["login"]["enabled"])

    def test_enabled_keycloak_provider_is_normalized(self):
        config = self._load("""
            sso:
              enabled: true
              identity_providers:
                - id: keycloak
                  protocol: oidc
                  name: Keycloak
                  server_url: https://keycloak.example.com/realms/cvat
                  client_id: cvat
                  client_secret: secret
                  email_domain: EXAMPLE.COM
            """)

        provider = config["sso"]["identity_providers"][0]
        self.assertEqual(provider["protocol"], "OIDC")
        self.assertEqual(provider["email_domain"], "example.com")

    def test_sync_client_credentials_must_be_configured_together(self):
        with self.assertRaises(ImproperlyConfigured):
            self._load("""
                sso:
                  enabled: true
                  identity_providers:
                    - id: keycloak
                      protocol: oidc
                      name: Keycloak
                      server_url: https://keycloak.example.com/realms/cvat
                      client_id: cvat
                      client_secret: secret
                      sync_client_id: cvat-user-sync
                """)

    def test_enabled_sso_requires_keycloak_configuration(self):
        with self.assertRaises(ImproperlyConfigured):
            self._load("sso:\n  enabled: true\n")

    def test_invalid_boolean_is_rejected(self):
        with self.assertRaises(ImproperlyConfigured):
            self._load("""
                basic:
                  registration:
                    enabled: disabled
                """)

    def test_configuration_cannot_disable_every_login_method(self):
        with self.assertRaises(ImproperlyConfigured):
            self._load("""
                basic:
                  login:
                    enabled: false
                sso:
                  enabled: false
                """)
