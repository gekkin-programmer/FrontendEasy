Add English/French translations to a React component in EasyPostV2.

Component path: $ARGUMENTS

Read the file at the given path, then:

1. **Add the `useLanguage` import** if not already present:
   ```tsx
   import { useLanguage } from '@/context/LanguageContext';
   ```

2. **Destructure `t` from the hook** inside the component function:
   ```tsx
   const { t } = useLanguage();
   ```

3. **Find all hardcoded visible strings** in JSX — including:
   - Button labels
   - Headings and subheadings
   - Placeholder text (`placeholder="..."` → use `{t("EN", "FR")}`)
   - Tooltip content
   - Empty state messages
   - Error messages
   - `aria-label` values
   - `title` attributes

4. **Replace each string** with a `t()` call:
   ```tsx
   // Before:
   <button>Save changes</button>
   <p>No posts yet</p>
   <input placeholder="Search..." />

   // After:
   <button>{t("Save changes", "Enregistrer les modifications")}</button>
   <p>{t("No posts yet", "Aucune publication pour l'instant")}</p>
   <input placeholder={t("Search...", "Rechercher...")} />
   ```

5. **Do NOT translate**:
   - Platform names (Facebook, Instagram, Twitter, etc.)
   - Brand names (EasyPost, EasyAI)
   - Variable values or dynamic data
   - CSS class names or IDs
   - URLs or route paths
   - Code strings (enum values, API keys)

6. **French translation quality**:
   - Use standard French (not Camfranglais/Nouchi — those are AI tone options, not UI language)
   - Keep translations natural and concise
   - Preserve capitalization conventions of the original

After making all changes, output a summary of how many strings were translated.
