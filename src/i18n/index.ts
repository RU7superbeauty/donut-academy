import en from './en';
import zh from './zh';
import { type Lang, defaultLang } from './languages';

const translations: Record<Lang, Record<string, string>> = { en, zh };

export function t(key: string, lang: Lang): string {
  return translations[lang]?.[key] ?? translations[defaultLang]?.[key] ?? key;
}

export function useTranslations(lang: Lang) {
  return (key: string) => t(key, lang);
}

export { languages, defaultLang, getLangFromUrl, getLocalizedPath } from './languages';
export type { Lang } from './languages';
