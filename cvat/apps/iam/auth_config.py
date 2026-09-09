# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from copy import deepcopy
from pathlib import Path
from typing import Any

import yaml
from django.core.exceptions import ImproperlyConfigured

DEFAULT_AUTH_CONFIG = {
    "basic": {
        "registration": {"enabled": True},
        "login": {"enabled": True},
    },
    "sso": {
        "enabled": False,
        "enable_pkce": True,
        "identity_providers": [],
    },
}


def _mapping(value: Any, path: str) -> dict[str, Any]:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ImproperlyConfigured(f"{path} must be a mapping")
    return value


def _boolean(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise ImproperlyConfigured(f"{path} must be a boolean")
    return value


def _required_string(value: Any, path: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ImproperlyConfigured(f"{path} must be a non-empty string")
    return value.strip()


def _optional_string(value: Any, path: str) -> str | None:
    if value is None:
        return None
    return _required_string(value, path)


def load_auth_config(path: str | None) -> dict[str, Any]:
    """Load and normalize the optional CVAT authentication configuration."""
    config = deepcopy(DEFAULT_AUTH_CONFIG)
    if not path:
        return config

    config_path = Path(path)
    try:
        raw_config = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except FileNotFoundError as exc:
        raise ImproperlyConfigured(f"Authentication config does not exist: {config_path}") from exc
    except yaml.YAMLError as exc:
        raise ImproperlyConfigured(f"Invalid YAML in authentication config: {config_path}") from exc

    root = _mapping(raw_config, "authentication config")
    basic = _mapping(root.get("basic"), "basic")
    registration = _mapping(basic.get("registration"), "basic.registration")
    login = _mapping(basic.get("login"), "basic.login")

    if "enabled" in registration:
        config["basic"]["registration"]["enabled"] = _boolean(
            registration["enabled"], "basic.registration.enabled"
        )
    if "enabled" in login:
        config["basic"]["login"]["enabled"] = _boolean(login["enabled"], "basic.login.enabled")

    sso = _mapping(root.get("sso"), "sso")
    if "enabled" in sso:
        config["sso"]["enabled"] = _boolean(sso["enabled"], "sso.enabled")
    if "enable_pkce" in sso:
        config["sso"]["enable_pkce"] = _boolean(sso["enable_pkce"], "sso.enable_pkce")

    identity_providers = sso.get("identity_providers", [])
    if not isinstance(identity_providers, list):
        raise ImproperlyConfigured("sso.identity_providers must be a list")
    config["sso"]["identity_providers"] = identity_providers

    if config["sso"]["enabled"]:
        if len(identity_providers) != 1:
            raise ImproperlyConfigured(
                "Exactly one identity provider is required when SSO is enabled"
            )

        provider = _mapping(identity_providers[0], "sso.identity_providers[0]")
        provider["id"] = _required_string(provider.get("id"), "identity provider id")
        if provider["id"] != "keycloak":
            raise ImproperlyConfigured("The supported identity provider id is 'keycloak'")

        protocol = _required_string(provider.get("protocol"), "identity provider protocol")
        if protocol.upper() != "OIDC":
            raise ImproperlyConfigured("The supported SSO protocol is OIDC")
        provider["protocol"] = "OIDC"

        for key in ("name", "server_url", "client_id", "client_secret"):
            provider[key] = _required_string(provider.get(key), f"identity provider {key}")

        provider["sync_client_id"] = _optional_string(
            provider.get("sync_client_id"), "identity provider sync_client_id"
        )
        provider["sync_client_secret"] = _optional_string(
            provider.get("sync_client_secret"), "identity provider sync_client_secret"
        )
        if bool(provider["sync_client_id"]) != bool(provider["sync_client_secret"]):
            raise ImproperlyConfigured(
                "identity provider sync_client_id and sync_client_secret must be provided together"
            )

        email_domain = provider.get("email_domain")
        if email_domain is not None:
            provider["email_domain"] = _required_string(
                email_domain, "identity provider email_domain"
            ).lower()

        token_auth_method = provider.get("token_auth_method")
        if token_auth_method not in (None, "client_secret_basic", "client_secret_post"):
            raise ImproperlyConfigured(
                "identity provider token_auth_method must be "
                "client_secret_basic or client_secret_post"
            )

    if not config["basic"]["login"]["enabled"] and not config["sso"]["enabled"]:
        raise ImproperlyConfigured("At least one login method must be enabled")

    return config
