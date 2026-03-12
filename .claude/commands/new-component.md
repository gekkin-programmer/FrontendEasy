Create a new React component for EasyPostV2's dashboard following the project's neubrutalist design conventions.

Component name: $ARGUMENTS

Create the file at `frontend-next/src/components/easypost/<ComponentName>.tsx`.

Requirements:

1. **File header**
   - Add `'use client'` directive if the component uses state, effects, or event handlers
   - Import React hooks as needed

2. **TypeScript**
   - Define a `<ComponentName>Props` interface with explicit types for all props
   - No `any` types

3. **i18n**
   - Import `useLanguage` from `@/context/LanguageContext`
   - Use `const { t } = useLanguage()` and wrap all visible text with `t("English text", "Texte français")`
   - Never hardcode English-only strings in JSX

4. **Neubrutalist design** (match existing components like `Composer.tsx`, `BoardView.tsx`):
   - Font: JetBrains Mono via Tailwind (already set globally — no need to add font class)
   - Borders: `border-2 border-black dark:border-white` or `border-4 border-black`
   - Hard drop shadows: `shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]`
   - Rounded corners: `rounded-none` or `rounded-sm` (avoid large radius)
   - Brand color: `#3C48F5` → `bg-[#3C48F5]` or `text-[#3C48F5]`
   - Background: `bg-white dark:bg-black` or `bg-[#F4F4F0] dark:bg-zinc-900`
   - Buttons: solid background + border + hard shadow, no soft shadows or gradients

5. **Dark mode**
   - Every color class must have a `dark:` counterpart
   - Example: `text-black dark:text-white`, `bg-white dark:bg-zinc-900`

6. **Responsive**
   - Mobile-first with `md:` and `lg:` breakpoints as needed

7. **Loading & empty states**
   - Show `<SpinningLoader />` (import from `@/components/SpinningLoader`) for async data
   - Show an empty state message wrapped in `t()` when lists are empty

After creating the component, show an example usage snippet.
