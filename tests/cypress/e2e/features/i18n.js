// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

const namespaces = ['auth', 'base', 'business', 'header'];
const localeStorageKey = 'i18nextLng';

const intentionallySharedTranslations = new Set([
    'base.project.fields.ID',
    'base.task.fields.ID',
    'base.job.fields.ID',
    'base.cloudStorage.fields.ID',
    'business.ID',
    'business.URL',
    'business.{{type}} #{{id}}',
    'header.settings.Workspace.text-settings-contents.ID',
]);

function collectLeaves(value) {
    const leaves = {};

    function visit(item, path = '') {
        if (Array.isArray(item)) {
            item.forEach((child, index) => visit(child, `${path}.${index}`));
        } else if (item && typeof item === 'object') {
            Object.entries(item).forEach(([key, child]) => {
                visit(child, path ? `${path}.${key}` : key);
            });
        } else {
            leaves[path] = item;
        }
    }

    visit(value);
    return leaves;
}

function extractTemplateTokens(value) {
    if (typeof value !== 'string') {
        return [];
    }

    const tokens = [];
    const interpolationPattern = /{{\s*([^},\s]+)[^}]*}}/g;
    const componentPattern = /<\/?(\d+)\s*\/?>/g;
    let match = interpolationPattern.exec(value);

    while (match) {
        tokens.push(`variable:${match[1]}`);
        match = interpolationPattern.exec(value);
    }

    match = componentPattern.exec(value);
    while (match) {
        tokens.push(`component:${match[1]}`);
        match = componentPattern.exec(value);
    }

    return tokens.sort();
}

function visitLogin(language = 'en') {
    cy.clearCookies();
    cy.visit('/auth/login', {
        onBeforeLoad(window) {
            window.localStorage.setItem(localeStorageKey, language);
        },
    });
    cy.url().should('include', '/auth/login');
}

function loginThroughAPI() {
    cy.clearCookies();
    cy.request('POST', '/api/auth/login', {
        username: Cypress.env('user'),
        password: Cypress.env('password'),
    }).its('status').should('equal', 200);
    cy.visit('/tasks', {
        onBeforeLoad(window) {
            window.localStorage.setItem(localeStorageKey, 'en');
        },
    });
    cy.url().should('include', '/tasks');
}

function switchLocale(option, modalTitle) {
    cy.get('.cvat-switch-i18n-locale-button').should('be.visible').click();
    cy.contains('.ant-modal-title', modalTitle).should('be.visible');
    cy.get('.ant-modal-content:visible .ant-select').click();
    cy.contains('.ant-select-item-option-content', option).should('be.visible').click();
    cy.get('.ant-modal-content:visible .ant-btn-primary').should('be.visible').click();
    cy.contains('.ant-modal-title', modalTitle).should('not.be.visible');
}

context('Internationalization', () => {
    afterEach(() => {
        cy.window().then((window) => {
            window.localStorage.setItem(localeStorageKey, 'en');
        });
        cy.clearCookies();
    });

    it('English and Simplified Chinese resources have matching keys and template tokens', () => {
        for (const namespace of namespaces) {
            cy.readFile(`../cvat-ui/src/i18n/locales/${namespace}/en.json`).then((english) => {
                cy.readFile(`../cvat-ui/src/i18n/locales/${namespace}/zh-CN.json`).then((chinese) => {
                    const englishLeaves = collectLeaves(english);
                    const chineseLeaves = collectLeaves(chinese);
                    const englishKeys = Object.keys(englishLeaves).sort();
                    const chineseKeys = Object.keys(chineseLeaves).sort();

                    expect(chineseKeys, `${namespace} resource keys`).to.deep.equal(englishKeys);

                    for (const key of englishKeys) {
                        expect(chineseLeaves[key], `${namespace}.${key} must not be empty`).not.to.equal('');
                        expect(
                            extractTemplateTokens(chineseLeaves[key]),
                            `${namespace}.${key} template tokens`,
                        ).to.deep.equal(extractTemplateTokens(englishLeaves[key]));
                    }
                });
            });
        }
    });

    it('does not leave new English user-facing strings untranslated', () => {
        for (const namespace of namespaces) {
            cy.readFile(`../cvat-ui/src/i18n/locales/${namespace}/en.json`).then((english) => {
                cy.readFile(`../cvat-ui/src/i18n/locales/${namespace}/zh-CN.json`).then((chinese) => {
                    const englishLeaves = collectLeaves(english);
                    const chineseLeaves = collectLeaves(chinese);
                    const untranslated = Object.keys(englishLeaves).filter((key) => (
                        typeof englishLeaves[key] === 'string' &&
                        englishLeaves[key] === chineseLeaves[key] &&
                        /[A-Za-z]/.test(englishLeaves[key]) &&
                        !intentionallySharedTranslations.has(`${namespace}.${key}`)
                    ));

                    expect(untranslated, `${namespace} untranslated values`).to.deep.equal([]);
                });
            });
        }
    });

    it('contains complete English and Simplified Chinese metadata for every shortcut', () => {
        cy.readFile('../cvat-ui/src/i18n/locales/header/en.json').then((english) => {
            cy.readFile('../cvat-ui/src/i18n/locales/header/zh-CN.json').then((chinese) => {
                const englishShortcuts = english.settings.Shortcuts;
                const chineseShortcuts = chinese.settings.Shortcuts;
                const englishShortcutIds = Object.keys(englishShortcuts)
                    .filter((shortcutId) => Array.isArray(englishShortcuts[shortcutId]));
                const chineseShortcutIds = Object.keys(chineseShortcuts)
                    .filter((shortcutId) => Array.isArray(chineseShortcuts[shortcutId]));

                expect(chineseShortcutIds, 'shortcut IDs').to.deep.equal(englishShortcutIds);
                englishShortcutIds.forEach((shortcutId) => {
                    const englishMetadata = englishShortcuts[shortcutId];
                    const chineseMetadata = chineseShortcuts[shortcutId];

                    expect(englishMetadata, `${shortcutId} English metadata`).to.be.an('array').with.length(2);
                    expect(chineseMetadata, `${shortcutId} Simplified Chinese metadata`).to.be.an('array').with.length(2);
                    chineseMetadata.forEach((text, index) => {
                        expect(text, `${shortcutId} Chinese ${index === 0 ? 'title' : 'description'}`)
                            .to.be.a('string').and.not.empty;
                    });
                });
            });
        });
    });

    it('Switches the login page language, persists it after reload, and switches back to English', () => {
        visitLogin();
        cy.get('.cvat-login-form-wrapper h2').should('have.text', 'Sign in');

        switchLocale('简体中文', 'Switch locale');
        cy.get('.cvat-login-form-wrapper h2').should('have.text', '登录');
        cy.get('.cvat-login-form-wrapper').should('contain.text', '邮箱或用户名');
        cy.document().its('documentElement.lang').should('equal', 'zh-CN');
        cy.window().then((window) => {
            expect(window.localStorage.getItem(localeStorageKey)).to.equal('zh-CN');
        });

        cy.reload();
        cy.get('.cvat-login-form-wrapper h2').should('have.text', '登录');

        switchLocale('English', '切换语言');
        cy.get('.cvat-login-form-wrapper h2').should('have.text', 'Sign in');
        cy.document().its('documentElement.lang').should('equal', 'en');
    });

    it('Renders the registration and password reset forms in Simplified Chinese', () => {
        visitLogin('zh-CN');
        cy.get('.cvat-login-form-wrapper').contains('a', '创建帐号').click();
        cy.url().should('include', '/auth/register');
        cy.get('.cvat-register-form').should('be.visible');
        [
            ['#firstName', '名'],
            ['#lastName', '姓'],
            ['#email', '邮箱'],
            ['#username', '用户名'],
        ].forEach(([selector, label]) => {
            cy.get(selector).closest('.ant-input-affix-wrapper').find('.ant-input-prefix').should('have.text', label);
        });
        cy.get('.cvat-credentials-action-button').should('contain.text', '创建帐号');

        cy.visit('/auth/password/reset', {
            onBeforeLoad(window) {
                window.localStorage.setItem(localeStorageKey, 'zh-CN');
            },
        });
        cy.get('.cvat-password-reset-form-wrapper').should('be.visible');
        cy.get('.cvat-password-reset-form-wrapper').should('contain.text', '忘记密码？');
        cy.get('.cvat-password-reset-form-wrapper').should('contain.text', '让我们创建一个新的');
        cy.get('.cvat-password-reset-tip').should('contain.text', '我们发送链接到你的邮箱');
        cy.get('.cvat-credentials-action-button').invoke('text').should('match', /发\s*送/);
    });

    it('Switches the authenticated UI and shortcut descriptions to Simplified Chinese', () => {
        loginThroughAPI();
        cy.get('.cvat-left-header').should('contain.text', 'Tasks');

        switchLocale('简体中文', 'Switch locale');
        cy.get('.cvat-left-header').should('contain.text', '任务');

        cy.get('.cvat-header-menu-user-dropdown').click();
        cy.get('.cvat-header-menu').contains('[role="menuitem"]', '设置').click();
        cy.get('.cvat-settings-modal').should('be.visible');
        cy.contains('.ant-tabs-tab', '快捷键').click();
        cy.get('.cvat-shortcuts-settings-search input').type('显示设置');
        cy.contains('.cvat-shortcuts-settings-item-title', '显示设置').should('be.visible');
        cy.contains('.cvat-shortcuts-settings-item-description', '显示/隐藏设置弹窗').should('be.visible');
        cy.get('.cvat-shortcuts-settings-search input').clear();
        cy.get('.cvat-shortcuts-settings-search input').type('播放位置');
        cy.contains('.cvat-shortcuts-settings-item-title', '将播放位置设为区间起点').should('be.visible');
        cy.contains('.cvat-shortcuts-settings-item-description', '将播放位置设为所选区间的起点').should('be.visible');
        cy.get('.cvat-close-settings-button').click();

        switchLocale('English', '切换语言');
        cy.get('.cvat-left-header').should('contain.text', 'Tasks');
    });

    it('Renders core authenticated pages with Simplified Chinese navigation', () => {
        loginThroughAPI();
        switchLocale('简体中文', 'Switch locale');

        const pages = [
            { path: '/projects', selector: '.cvat-projects-page', label: '项目' },
            { path: '/tasks', selector: '.cvat-tasks-page', label: '任务' },
            { path: '/jobs', selector: '.cvat-jobs-page', label: '作业' },
            { path: '/cloudstorages', selector: '.cvat-cloud-storages-page', label: '云存储' },
            { path: '/requests', selector: '.cvat-requests-page', label: '请求' },
        ];

        pages.forEach(({ path, selector, label }) => {
            cy.visit(path);
            cy.get(selector).should('be.visible');
            cy.get('.cvat-left-header').should('contain.text', label);
        });
    });
});
