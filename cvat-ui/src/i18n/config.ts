interface Locale {
    code: string;
    name: string;
    hidden: boolean;
}

function genLocale(code: Locale['code'], name: Locale['name'], hidden = false): Locale {
    return { code, name, hidden };
}

export const localeList: readonly Locale[] = [
    // don't change/remove en locale, it's default and base locale
    genLocale('en', 'English'),
    genLocale('zh-CN', '简体中文'),
];

export const defaultNS = 'base';

export const namespaceList = [
    'base',
    'auth',
    'header',
    'business',
];

export const fallbackLng = 'en';

export const supportedLanguages: readonly string[] = localeList
    .map((locale) => locale.code);

export const localeOptions = localeList
    .filter((locale) => !locale.hidden);

export function normalizeLocale(language: string): string {
    return language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}
