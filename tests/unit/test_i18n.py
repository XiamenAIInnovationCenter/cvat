# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import json
import re
import unittest
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
I18N_ROOT = REPOSITORY_ROOT / "cvat-ui" / "src" / "i18n"
LOCALES_ROOT = I18N_ROOT / "locales"
NAMESPACES = ("auth", "base", "business", "header")
LANGUAGES = ("en", "zh-CN")

INTENTIONALLY_SHARED_TRANSLATIONS = {
    "base.project.fields.ID",
    "base.task.fields.ID",
    "base.job.fields.ID",
    "base.cloudStorage.fields.ID",
    "business.ID",
    "business.URL",
    "business.{{type}} #{{id}}",
    "header.settings.Workspace.text-settings-contents.ID",
}

INTERPOLATION_PATTERN = re.compile(r"{{\s*([^},\s]+)[^}]*}}")
COMPONENT_PATTERN = re.compile(r"</?(\d+)\s*/?>")


def flatten_leaves(value, path=""):
    leaves = {}

    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            leaves.update(flatten_leaves(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            leaves.update(flatten_leaves(child, f"{path}.{index}"))
    else:
        leaves[path] = value

    return leaves


def extract_template_tokens(value):
    if not isinstance(value, str):
        return []

    tokens = [f"variable:{match.group(1)}" for match in INTERPOLATION_PATTERN.finditer(value)]
    tokens.extend(f"component:{match.group(1)}" for match in COMPONENT_PATTERN.finditer(value))
    return sorted(tokens)


def load_resource(namespace, language):
    resource_path = LOCALES_ROOT / namespace / f"{language}.json"
    with resource_path.open(encoding="utf-8") as resource_file:
        return json.load(resource_file)


class I18nResourceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.resources = {
            namespace: {language: load_resource(namespace, language) for language in LANGUAGES}
            for namespace in NAMESPACES
        }

    def test_expected_locales_and_namespaces_are_configured(self):
        config_source = (I18N_ROOT / "config.ts").read_text(encoding="utf-8")

        for language in LANGUAGES:
            with self.subTest(language=language):
                self.assertIn(f"genLocale('{language}'", config_source)

        for namespace in NAMESPACES:
            with self.subTest(namespace=namespace):
                self.assertIn(f"'{namespace}'", config_source)

    def test_default_language_is_english_without_a_saved_choice(self):
        config_source = (I18N_ROOT / "config.ts").read_text(encoding="utf-8")
        index_source = (I18N_ROOT / "index.ts").read_text(encoding="utf-8")

        self.assertIn("export const fallbackLng = 'en';", config_source)
        self.assertIn("order: ['localStorage', 'htmlTag']", index_source)

    def test_english_and_chinese_resources_have_matching_keys(self):
        for namespace, resources in self.resources.items():
            with self.subTest(namespace=namespace):
                english_keys = sorted(flatten_leaves(resources["en"]))
                chinese_keys = sorted(flatten_leaves(resources["zh-CN"]))
                self.assertEqual(english_keys, chinese_keys)

    def test_english_locale_preserves_existing_ui_text(self):
        expected_values = {
            ("auth", "loginForm.New user?"): "New user?",
            ("base", "First name"): "First name",
            ("base", "Cloud storages"): "Cloud Storages",
            ("base", "sort.Sort by"): "Sort by",
            ("base", "filter.Quick filters"): "Quick filters",
            ("business", "Ok"): "Ok",
            ("business", "false"): "false",
            ("business", "true"): "true",
            ("business", "ObjectID"): "ObjectID",
            ("business", "ServerID"): "ServerID",
            ("business", "jobs"): "jobs",
            ("business", "tasks"): "tasks",
            ("business", "projects"): "projects",
            (
                "business",
                "Are you sure you want to remove the hook?",
            ): "Are you sure you want to remove the hook?",
            (
                "business",
                "Annotations have been loaded to the [{{instanceType}} #{{id}}]({{url}})",
            ): "Annotations have been loaded to the [{{instanceType}} #{{id}}]({{url}})",
            (
                "business",
                "Dataset was imported to the [{{instanceType}} #{{id}}]({{url}})",
            ): "Dataset was imported to the [{{instanceType}} #{{id}}]({{url}})",
            (
                "business",
                "The {{instanceType}} has been restored successfully. Click [here]({{url}}) to open",
            ): "The {{instanceType}} has been restored successfully. Click [here]({{url}}) to open",
        }

        for (namespace, key), expected_value in expected_values.items():
            with self.subTest(namespace=namespace, key=key):
                english = flatten_leaves(self.resources[namespace]["en"])
                self.assertEqual(expected_value, english[key])

        english_shortcuts = self.resources["header"]["en"]["settings"]["Shortcuts"]
        self.assertEqual(
            [
                "Toggle snap to contour",
                "Toggle automatic snap to contour for polygons and polylines during drawing/editing",
            ],
            english_shortcuts["SWITCH_AUTOMATIC_BORDERING"],
        )

    def test_audio_menu_factory_does_not_call_react_hooks(self):
        menu_source = (
            REPOSITORY_ROOT
            / "cvat-ui/src/audio/components/annotation-page/audio-workspace/audio-region-item-menu.tsx"
        ).read_text(encoding="utf-8")
        menu_factory = menu_source.split("export default function AudioRegionItemMenu", maxsplit=1)[
            1
        ]

        self.assertNotIn("useTranslation(", menu_factory)

    def test_all_translation_values_are_non_empty_strings(self):
        for namespace, resources in self.resources.items():
            for language, resource in resources.items():
                for key, value in flatten_leaves(resource).items():
                    with self.subTest(namespace=namespace, language=language, key=key):
                        self.assertIsInstance(value, str)
                        self.assertTrue(value.strip())

    def test_chinese_translations_preserve_template_tokens(self):
        for namespace, resources in self.resources.items():
            english = flatten_leaves(resources["en"])
            chinese = flatten_leaves(resources["zh-CN"])

            for key, english_value in english.items():
                with self.subTest(namespace=namespace, key=key):
                    self.assertEqual(
                        extract_template_tokens(english_value),
                        extract_template_tokens(chinese[key]),
                    )

    def test_user_facing_chinese_values_are_not_left_in_english(self):
        untranslated = []

        for namespace, resources in self.resources.items():
            english = flatten_leaves(resources["en"])
            chinese = flatten_leaves(resources["zh-CN"])

            for key, english_value in english.items():
                qualified_key = f"{namespace}.{key}"
                if (
                    isinstance(english_value, str)
                    and isinstance(chinese[key], str)
                    and english_value == chinese[key]
                    and re.search(r"[A-Za-z]", english_value)
                    and qualified_key not in INTENTIONALLY_SHARED_TRANSLATIONS
                ):
                    untranslated.append(qualified_key)

        self.assertEqual([], untranslated)

    def test_shortcuts_have_complete_bilingual_metadata(self):
        english_shortcuts = self.resources["header"]["en"]["settings"]["Shortcuts"]
        chinese_shortcuts = self.resources["header"]["zh-CN"]["settings"]["Shortcuts"]
        english_ids = [key for key, value in english_shortcuts.items() if isinstance(value, list)]
        chinese_ids = [key for key, value in chinese_shortcuts.items() if isinstance(value, list)]

        self.assertEqual(english_ids, chinese_ids)

        for shortcut_id in english_ids:
            with self.subTest(shortcut_id=shortcut_id):
                for metadata in (english_shortcuts[shortcut_id], chinese_shortcuts[shortcut_id]):
                    self.assertEqual(2, len(metadata))
                    self.assertTrue(
                        all(isinstance(value, str) and value.strip() for value in metadata)
                    )


if __name__ == "__main__":
    unittest.main()
