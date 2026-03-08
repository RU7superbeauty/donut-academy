export const languages = {
  en: 'English',
  zh: '中文',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove any existing lang prefix
  const cleaned = path.replace(/^\/(en|zh)/, '') || '/';
  return `/${lang}${cleaned === '/' ? '/' : cleaned}`;
}
