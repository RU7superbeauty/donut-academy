# i18n Migration Task

## What's already done
- `src/i18n/` — languages.ts, index.ts, en.ts, zh.ts (translation dictionaries)
- `src/components/LanguageSwitcher.astro` — language selector component
- `src/layouts/BaseLayout.astro` — already updated to accept `lang` prop and use `t()` for nav/footer
- `src/layouts/ArticleLayout.astro` — needs `lang` prop added
- Redirect stubs for all old routes (`src/pages/index.astro`, `src/pages/learn/index.astro`, etc.)
- Empty `src/pages/[lang]/` directory structure created

## What you need to do

### 1. Create `src/pages/[lang]/index.astro`
Copy the content from the OLD `src/pages/index.astro` (git show HEAD~1:src/pages/index.astro).
Wrap with:
```
import { languages, type Lang, useTranslations } from '../../i18n';
export function getStaticPaths() {
  return Object.keys(languages).map(lang => ({ params: { lang } }));
}
const { lang } = Astro.params as { lang: Lang };
const t = useTranslations(lang);
```
Replace all hardcoded strings with `t('key')` calls. Use `set:html` for strings containing HTML.
Pass `lang={lang}` to BaseLayout.
Update all internal links to include `/${lang}/` prefix.

### 2. Create `src/pages/[lang]/learn/index.astro`
Same pattern — copy old learn/index.astro content, add i18n imports and getStaticPaths, replace strings with t() calls.

### 3. Create `src/pages/[lang]/learn/quickstart.astro`
Copy old learn/quickstart.astro, add i18n.

### 4. Create `src/pages/[lang]/learn/[slug].astro`
Copy old learn/[slug].astro. Add lang to getStaticPaths (nested: for each lang, for each course).

### 5. Create `src/pages/[lang]/playbook/index.astro`
Copy old playbook/index.astro, add i18n.

### 6. Create `src/pages/[lang]/playbook/[slug].astro`
Copy old playbook/[slug].astro. Add lang to getStaticPaths.

### 7. Create `src/pages/[lang]/research/index.astro`
Copy old research/index.astro, add i18n.

### 8. Create `src/pages/[lang]/updates/index.astro`
Copy old updates/index.astro, add i18n.

### 9. Create `src/pages/[lang]/articles/index.astro` (if needed — may redirect to research)
### 10. Create `src/pages/[lang]/articles/[id].astro`
Copy old articles/[id].astro. Add lang to getStaticPaths.

### 11. Update `src/layouts/ArticleLayout.astro`
Add `lang?: Lang` prop, pass to BaseLayout, use lang in all internal links.

## Key rules
- ALL hardcoded user-facing text must use `t('key')` — check en.ts/zh.ts for available keys
- If a key is missing, add it to BOTH en.ts and zh.ts
- ALL internal links (href) must include `/${lang}/` prefix
- Pass `lang={lang}` to BaseLayout in every page
- For HTML-containing strings, use `set:html={t('key')}`
- The `<style>` blocks should be copied AS-IS from the old pages (no changes needed)
- The `<script>` blocks should be copied AS-IS (client-side JS doesn't need i18n)
- Run `npm run build` at the end to verify everything compiles

## Testing
After all files are created:
```
npm run build
```
Should produce pages under `/en/...` and `/zh/...` for every route.
