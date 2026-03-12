Create a new Next.js App Router page for EasyPostV2.

Route: $ARGUMENTS

Determine from the route whether this is a **public page** (landing/marketing) or a **protected page** (dashboard/requires auth), then follow the appropriate pattern.

---

### Protected Dashboard Page (route starts with `/dashboard`, `/workspaces`, `/admin`, `/onboarding`)

Create `frontend-next/src/app/<route>/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import SpinningLoader from '@/components/SpinningLoader'
import { useLanguage } from '@/context/LanguageContext'

export default function <PageName>Page() {
  const { t } = useLanguage()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/your-endpoint')
      .then(setData)
      .catch(() => router.push('/login?reason=expired'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinningLoader />

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold border-b-2 border-black dark:border-white pb-2">
        {t("Page Title", "Titre de la page")}
      </h1>
      {/* content */}
    </div>
  )
}
```

- Place inside `frontend-next/src/app/dashboard/` for workspace-scoped pages
- Use `useParams()` to get `[id]` from dynamic routes
- Use TanStack Query (`useQuery`) for data that benefits from caching

---

### Public/Marketing Page (route is `/about`, `/pricing`, `/help`, etc.)

Create `frontend-next/src/app/<route>/page.tsx`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | EasyPost',
  description: 'Page description for SEO',
}

export default function <PageName>Page() {
  return (
    <main>
      {/* sections */}
    </main>
  )
}
```

- Server component (no `'use client'`) unless interactivity is needed
- Compose from existing section components in `src/components/`
- Navbar and Footer are already in the root layout — do not add them here

---

### General Rules
- All visible text must use `t("EN", "FR")` from `useLanguage()`
- Use `api` from `@/lib/api` — never raw fetch or axios
- Use `<SpinningLoader />` for loading states
- Follow neubrutalist design: `border-2 border-black dark:border-white`, hard shadows
- Brand color: `#3C48F5`
