// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

const namespaces = ['auth', 'base', 'business', 'header'];
const localeStorageKey = 'i18nextLng';

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
    cy.headlessLogout();
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
        cy.get('.cvat-close-settings-button').click();

        switchLocale('English', '切换语言');
        cy.get('.cvat-left-header').should('contain.text', 'Tasks');
    });
});
