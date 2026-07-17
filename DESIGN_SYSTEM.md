# EazyPost — Design System

**Status: source of truth**, as of 2026-07-14. This document describes the design language actually implemented across the **public/marketing site** (landing home, `/tarifs`, `/canaux/*`, `/pour/*`, auth pages, `/checkout`) — it does **not** cover `/dashboard/*`, which has its own separate neubrutalist system (see `src/features/dashboard/easypost/`).

Every rule below is extracted directly from the current codebase, not aspirational. Where the codebase is inconsistent, that's called out explicitly under [Known Inconsistencies](#known-inconsistencies) rather than papered over — treat those as a backlog, not as license to add a fourth variant.

---

## Table of Contents

1. [Foundational Setup](#1-foundational-setup)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing, Containers & Breakpoints](#4-spacing-containers--breakpoints)
5. [Buttons & CTAs](#5-buttons--ctas)
6. [Cards](#6-cards)
7. [Forms & Inputs](#7-forms--inputs)
8. [Navigation](#8-navigation)
9. [Icons](#9-icons)
10. [Motion & Interaction](#10-motion--interaction)
11. [Page Inventory](#11-page-inventory)
12. [Known Inconsistencies](#12-known-inconsistencies)

---

## 1. Foundational Setup

- **Framework:** Next.js 15 App Router, React 19, Tailwind CSS (`tailwind.config.ts`).
- **Font loading:** `Rubik` only, via `next/font/google` in `src/app/layout.tsx`:
  ```ts
  const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik", display: "swap", weight: ["400","500","700","800","900"] });
  ```
  `tailwind.config.ts` maps both `font-sans` and `font-mono` to `var(--font-rubik)`. **Never import a second font family** (no Poppins, no Roboto, no Inter) even if a Figma handoff specifies one — swap it for the closest Rubik weight instead. (One exception exists in the codebase today and is flagged in §12.)
- **`<body>`** carries `${rubik.variable} font-sans antialiased bg-white text-black` directly in `layout.tsx` — this is what actually makes Rubik the default everywhere, not the `body` rule in `globals.css` (see §12 for a dead-code note on that).
- **Dark mode:** `darkMode: "class"` is configured in Tailwind, but **no public/marketing page uses it** — dark-mode classes (`dark:bg-...`) only appear in dashboard code. Every marketing page is light-mode-only by construction.
- **Custom breakpoint:** `3xl` = `2000px`, defined in `tailwind.config.ts` (`theme.extend.screens`). This is a real, first-class breakpoint — use it for ultra-wide/4K tuning, the same way you'd use `lg` or `xl`.
- **`<Navbar />` is not global.** It is not rendered in the root layout — each page that wants it imports and renders `<Navbar />` itself (home, `/tarifs`, `/canaux/[channel]` via `ChannelLanding`, etc.). Auth pages (`/login`, `/signup`, `/checkout`) intentionally omit it in favor of their own split-screen chrome.
- **`<Footer />` is global** (rendered once in `src/app/layout.tsx`, after `{children}`), but self-hides via `usePathname()` for routes starting with `/login`, `/signup`, `/checkout`, and `/dashboard` (`src/components/layout/Footer.tsx`).

---

## 2. Color Palette

### Official brand colors (confirmed with the user 2026-07-10)

| Swatch | Hex | Role |
|---|---|---|
| ⬛ | `#040028` | Deep navy — Navbar background, Footer background, dark headline text on white sections |
| 🟦 | `#174CD2` | **Primary brand blue** — the dominant color across every page (119 occurrences in landing code). Primary CTAs, links, icons, section accents, blue full-bleed sections |
| ⬜ | `#FFFFFF` / `#FFF` | White — base background, text-on-blue |
| 🟨 | `#D2E823` (proposed) | Electric lime — suggested as the 4th accent color, **not yet confirmed by the user**. Already live as the hero blue-swap variant on `/canaux/facebook` and as feature-card backgrounds in `ChannelLanding`. Treat as provisional until confirmed. |

**Rule:** dark text/surfaces → `#040028`. Primary actions/brand accents → `#174CD2`. Don't introduce a new blue for a new page — reuse `#174CD2` (or its close sibling `#184CD1`, see below) rather than eyeballing a new hex from a Figma export.

### Blue variants in active use (not typos — used interchangeably by different sections)

| Hex | Where |
|---|---|
| `#174CD2` | Dominant — Navbar, Footer accents, FAQ toggle, ContactSection, ImpactSection, most CTAs |
| `#184CD1` | `/tarifs` pricing cards + comparison table, `/checkout` (step dots, focus rings, submit buttons) |
| `#061492` | `/canaux/*` channel-template accent (span highlight in hero H1, some section backgrounds) |

These three are visually indistinguishable at a glance and are **not** meant to be a deliberate 3-tone system — they're drift from different build sessions. When touching a page, match whichever variant that page already uses rather than mixing two in the same section. If starting something brand new, default to `#174CD2`.

### Secondary / ink colors

| Hex | Role |
|---|---|
| `#040028` | Navy (see above) |
| `#000B33` | Alternate near-black navy — used on `/tarifs` for price text, headings, badge text |
| `#0D0303` | Near-black — `/tarifs` subtitle, payment methods text |
| `#12141D` | Near-black ink — used on `/pour/pme` and `/pour/agences` for headings (see §12, these two pages deviate from the rest) |

### Neutrals & UI grays

| Hex | Role |
|---|---|
| `#D9D9D9` | Input borders (auth pages) |
| `#8E8E8E` | Input placeholder text (auth pages) |
| `#8D8D8D` | Placeholder text (ContactSection underline inputs) |
| `#717171` | Secondary/subtitle text (ContactSection) |
| `#C4C4C4` | Avatar placeholder backgrounds (`/pour/*`) |
| `#E0E0E0` | Unselected radio dots (ContactSection) |
| `slate-100` / `slate-700` | FAQ card border / answer text (Tailwind default slate scale) |

### Utility/feedback colors

Standard Tailwind semantic colors are used directly (not themed) for status/feedback: `red-500`/`red-600` (errors, cross icons on `/tarifs`), `green-600` (checkmarks), `#C9FAD6`/`#1AA703` ("Coming Soon" pill on `/tarifs`), `#FFFDE8`/`#FFB342` (tooltip popovers on `/tarifs`).

### Social brand colors

Every social icon (Facebook, Instagram, TikTok, LinkedIn, WhatsApp, YouTube, Twitter/X, Pinterest, Telegram, Discord, Snapchat, Google) is rendered as inline SVG with **that platform's real official brand colors/gradients** (e.g. Instagram's radial gradient `#B13589 → #C62F94 → #8A3AC8`, WhatsApp's green `#25D366`/`#5BD066→#27B43E`). Never recolor these to the brand blue — they're meant to be instantly recognizable per-platform. Source: `src/components/landing/hero/SocialIcons.tsx` and inline duplicates in `ConnectSection.tsx`, `UsersSection.tsx`.

### ⚠️ Theme tokens do not match actual usage

- `tailwind.config.ts` → `colors.primary.DEFAULT = '#3C48F5'`
- `globals.css` → `--primary: 232 83% 55%` (≈ `#304AEB`, per the file's own comment)

**Neither matches** the real brand blue (`#174CD2`) used everywhere in actual markup. Both are leftovers from an older iteration (`#3C48F5` is literally the pre-May-2026 dashboard blue). **Do not use `bg-primary`/`text-primary`/`ring-primary` expecting brand blue** — you'll get the wrong color. Every current landing component uses the literal arbitrary value `bg-[#174CD2]` instead of the semantic token, and that's the correct thing to keep doing until someone deliberately fixes the theme tokens to match.

---

## 3. Typography

### Font families in play

| Family | Where | Notes |
|---|---|---|
| **Rubik** (400/500/700/800/900) | Everything — body text, nav, buttons, inputs | The only font that should ever be introduced. Applied via `font-sans` (maps to `var(--font-rubik)`) |
| **"Rubik One"** | Large display headlines only | A separate Google Font (`@import url(...)` in `globals.css`), a bold/condensed all-caps display cut. Used via inline `style={{ fontFamily: "'Rubik One', sans-serif" }}` or the class `font-['Rubik_One']`. This is intentional and part of the system — reserve it for hero-scale headings (H1/H2 of a section), never body copy |

Practical rule: if it's a big blocky section headline (ImpactSection "Impact", ConnectSection "Connectez Vos Réseaux sociaux", ContactSection "Contactez-nous", Navbar wordmark "azypost", FaqSection "Foire Aux / Questions"), it's **Rubik One**. Everything else — paragraphs, nav links, buttons, form labels — is plain **Rubik** at various weights.

### Heading scale (Rubik One display headings)

Sizes scale up through breakpoints including the custom `3xl` (2000px):

```
text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px]              — small display heading (e.g. UsersSection "EazyPost" eyebrow)
text-[28px] md:text-[36px] lg:text-[48px]                              — mid display heading
text-[40px] md:text-[58px]/[60px] lg:text-[70px] 3xl:text-[88px]       — large hero-scale heading (ImpactSection, ConnectSection, ContactSection, FaqSection, /tarifs H1 pattern varies slightly: 44/72px)
```

Line-height is always tight/near-1 for these (`leading-tight`, or explicit px values close to font-size × 1.1–1.25).

### Body & UI text scale (Rubik, regular weights)

| Size | Typical use |
|---|---|
| `text-[70px]` / `text-[87px]` leading | Hero-scale numerals/prices (`/tarifs` price: `text-[66px] leading-[73px]`) |
| `text-[48px]` | Section H2 (comparison table title on `/tarifs`) |
| `text-[24px]`–`[28px]` | Card headings, plan currency prefixes |
| `text-[18px]`–`[20px]` | Section body copy / lead paragraphs |
| `text-[16px]` | Default body text, form labels emphasis |
| `text-[14px]` | Form labels, secondary CTAs, nav links (desktop) |
| `text-[12px]`–`[13px]` | Fine print, footer links, badges |
| `text-[9px]`–`[11px]` | Micro-badges ("Coming Soon" pill, mobile nav labels) |

### Font weights

- `font-normal` (400) — body copy, paragraph text
- `font-medium` (500) — form labels, nav links, secondary emphasis
- `font-semibold` — subtitles, card labels
- `font-bold` (700) — CTAs, headings that aren't Rubik One, footer column headers
- `font-black` (900) — the heaviest weight, reserved for hero numerals and the boldest headline moments — used sparingly on the marketing site (it's the dashboard's default heading weight, not the landing site's)

### Text colors

- `#040028` / `#000B33` / `#0D0303` — headings and body text on white backgrounds (pick per-page, see §2)
- `#174CD2` (or page-local blue variant) — the "highlight span" pattern: one word/phrase inside a heading gets colored while the rest stays dark ink. Seen in `/tarifs` H1, `/canaux/*` hero H1, `AProposSection`
- `white` / `white/80` — text on blue or navy backgrounds
- `text-slate-700`, `text-gray-500`, `#717171`, `#8D8D8D` — secondary/muted text on white

---

## 4. Spacing, Containers & Breakpoints

### Breakpoint ladder

Standard Tailwind (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536) **plus** the custom `3xl` at **2000px**. Sections routinely define values at every one of these six steps for hero-scale type and spacing — don't stop tuning at `lg`; ultra-wide/4K screens are a first-class target on this site (see the July 14 pass that added `3xl:` rules across Hero/Impact/Publish/Connect/Faq/UsersSection specifically to fix content looking too small on 4K).

### Container widths

| Max-width | Where |
|---|---|
| `max-w-[1440px]` (→ `3xl:max-w-[1900px]`) | The standard content container — Navbar, ImpactSection, PublishSection, ConnectSection, UsersSection, FaqSection |
| `max-w-[1435px]` | Equivalent alternate value used in a few sections (PublishSection, ConnectSection header) — functionally the same intent as 1440, just off-by-5px from copy-paste |
| `max-w-[1320px]` (→ `3xl:max-w-[1700px]`) | ContactSection form card |
| `max-w-[1200px]` (→ `3xl:max-w-[1600px]`) | AProposSection card |
| `max-w-[2200px]` | Navbar's own inner container at `2xl`/`3xl` — the nav is allowed to stretch wider than the body content |

Pattern: **centered container, `mx-auto`, horizontal padding via `px-[16px]` → `px-[52px]` → `px-[157px]` (xl) → bump `max-w-*` again at `3xl`.** Don't invent a seventh container width — reuse 1440/1435 unless the section is deliberately narrower (forms, cards).

### Section vertical rhythm

Typical section padding: `py-[60px] md:py-[100px]` for standard sections, up to `pt-[128px]`/`pb-[150px]` for hero-adjacent sections. Header-to-navbar clearance is consistently **~87px** (`mt-[87px]`, `top-[87px]`) matching the Navbar's own height, or `pt-[100px] lg:pt-[140px]` where a page renders its own Navbar inline above the hero (see `ChannelLanding`).

### Border radius scale

| Radius | Use |
|---|---|
| `rounded-full` | Pills (CTAs, badges, avatar circles, toggle dots) |
| `rounded-[10px]` | Cards, inputs, FAQ accordion items — the default "card" radius |
| `rounded-[9px]` / `rounded-[5px]` / `rounded-[4px]` | `/tarifs` and `/checkout` — smaller, sharper radius than the rest of the site (these two pages read slightly more "fintech-flat" than the rounded marketing pages) |
| `rounded-[16px]`–`[32px]` | Larger feature cards, image frames (`ChannelLanding` feature cards, testimonial image) |
| `rounded-lg` (Tailwind default, 8px) | AProposSection main card |

### Shadows

- `shadow-[0px_10px_40px_rgba(0,0,0,0.08)]` — soft card elevation (`/tarifs` plan cards, currency dropdown)
- `shadow-[0_0_50px_rgba(0,0,0,0.1)]` — ContactSection form card
- `shadow-md` / `shadow-lg` — Tailwind defaults, used for simpler cards (AProposSection, buttons)
- `shadow-2xl` — Navbar mega-dropdown

---

## 5. Buttons & CTAs

There is one dominant pattern with a few page-local variants:

### Pill CTA (dominant pattern)

```
inline-flex items-center justify-center h-[62px] px-[30px] rounded-full
font-extrabold text-[14px] leading-[24px] tracking-[0.16px]
transition-transform hover:scale-[1.03]
```
Background/text color pair is passed in per-instance (e.g. bg `#061492`/text white on `/canaux/*`, bg `#174CD2`/text white elsewhere). Source: `PillCta` component in `ChannelLanding.tsx`, reused for every "Start for free"/"Explore" CTA on channel pages. `AProposSection`'s button follows the same shape (`rounded-full`, `hover:scale-105`) at a larger size (`h-[55px] md:h-[70px]`).

### Navbar CTA (outlined pill, inverse-on-hover)

```
border-[2px] border-white rounded-[12px]→[20px] (scales up per breakpoint)
hover:bg-white hover:text-[#040028]
```
This is the signature "Sign up" treatment in the navy Navbar — transparent/bordered by default, fills solid white with navy text on hover. Reused identically in the mobile menu.

### Flat rectangular button (`/tarifs`, `/checkout` only)

```
h-[37px]–[54px] rounded-[4px] font-bold text-[14.77px]–[16px]
hover:scale-[1.02]–[1.03]
```
Smaller radius, smaller scale-on-hover than the pill pattern — these two pages are intentionally a bit more "transactional/fintech" than the rest of the marketing site. Background is the page's local blue (`#184CD1`) or, for the dark plan card's CTA, inverted to white-bg/blue-text.

### Toggle / segmented buttons

Billing-cycle toggle on `/tarifs` (`Monthly`/`Yearly`): two buttons sharing one pill, active state is solid `#184CD1` + white text, inactive is white + black border. Same active/inactive contrast logic reused for the FAQ `+`/`×` circular toggle (blue circle, white icon, `rotate-45` on open) and radio-style selectors (ContactSection subject picker, small filled/unfilled circle).

### Hover conventions

- **Scale, not color-shift, is the primary hover cue** for CTAs: `hover:scale-[1.02]` to `hover:scale-110` depending on element size (buttons scale less, small icons/avatars scale more).
- Text links use `hover:text-white` (on navy) or `hover:text-gray-300`/`hover:underline` (secondary links).
- Icon-only circular buttons (ContactSection socials) invert fill/text on hover (`bg-[#1B1B1B] hover:bg-white hover:text-black` and the mirror pair).
- Transitions are consistently `transition-colors` / `transition-transform` / `transition-all`, no custom easing beyond Tailwind defaults, `duration-200`–`duration-300` is typical.

---

## 6. Cards

Four recurring card shapes:

1. **Pricing/plan card** (`/tarifs` `PlanCard`) — white or blue-filled (`dark` prop), `rounded-[9px]`, `shadow-[0px_10px_40px_rgba(0,0,0,0.08)]`, internal `<hr>` dividers between badge/price/features blocks, feature list with a custom circular check/cross `FeatureIcon`, tooltip-on-hover info bubbles (`#FFFDE8` background, triangular pointer). The "popular" card is visually promoted by floating it up (`lg:-translate-y-[71px]`) and inverting to a solid blue fill.

2. **Feature card** (`ChannelLanding` `FeatureCard`) — `rounded-[32px]`, colored solid background (lime is the default accent here), image + title + description + `PlanChips` (pill-shaped plan-availability tags with a border matching text color).

3. **FAQ accordion item** — white, `rounded-[10px]`, `border border-slate-100`, click-to-expand via `max-h` transition (not `height: auto`, so the transition can animate), blue circular `+`/`×` toggle in the top-right.

4. **Testimonial / info card** — simple white or bordered card, no elaborate shadow system; content-driven (image + quote + attribution), see `AProposSection`'s bordered/blue-accented card and `ChannelLanding`'s testimonial block.

General card conventions: white background unless the card is deliberately "inverted" (blue fill) to draw attention (popular pricing tier, some channel-template feature blocks). Padding is generous (`p-[40px]` is typical for a substantial card). Borders, when present, are thin (`border`, 1px) and low-contrast (`border-slate-100`, `border-black/10`, `border-gray-300`) — the card is defined more by background-color contrast and shadow than by a heavy border.

---

## 7. Forms & Inputs

Two distinct input patterns coexist, used consistently within their own contexts — don't mix them within one form:

### Pattern A — Boxed input (auth pages: login, signup, forgot-password, reset-password)

```
h-[40px] md:h-[44px] lg:h-[48px]
bg-white border border-[#D9D9D9] rounded-[10px]
px-[10px] font-medium text-[14px] text-black
outline-none focus:border-[#174CD2] transition-colors
placeholder:text-[#8E8E8E]
[&:-webkit-autofill]:[box-shadow:0_0_0_30px_white_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]
```
Label sits above the input (`text-[14px] font-medium`, `mb-[5px]` gap). The autofill override is load-bearing — without it Chrome's yellow autofill background breaks the white-card look. Submit buttons in this pattern are full-width pills: `h-[40–48px] bg-[#174CD2] rounded-[10px] text-white font-bold`.

### Pattern B — Underline input (ContactSection, `/checkout`)

```
w-full bg-transparent border-0 border-b border-black (or border-black/40)
outline-none py-[4px] / pb-[10px]
text-[14px]–[15px] text-black
placeholder:text-[#8D8D8D]/50 (or #8E8E8E)
focus:border-[#184CD1] (checkout only — ContactSection has no focus-color change)
```
Label sits above, smaller (`text-[12px] font-medium`). No background, no border-radius — a minimal underline field, used where the form sits inside a card that's already visually contained (so the inputs themselves stay quiet).

### Radio / checkbox styling

Never uses the native input appearance — always a custom circle:
- **Checkbox** (signup terms agreement): `w-[14px] h-[14px] border border-black rounded-[2px]`, filled `bg-[#174CD2]` + white checkmark icon when checked, native `<input type="checkbox">` visually hidden (`className="hidden"`) but kept for a11y/form semantics.
- **Radio** (ContactSection subject picker): `w-[13px] h-[13px] rounded-full`, filled blue with a smaller white dot inside when selected, same hidden-native-input technique.

### Dropdowns

Simple custom dropdown pattern (`/tarifs` currency selector): button showing current value + chevron (`rotate-180` when open), `absolute` positioned `<ul role="listbox">` below it, `border border-black/50 rounded-[10px]`, closes on outside click via a full-screen invisible overlay `<div className="fixed inset-0" onClick={...}>`.

---

## 8. Navigation

- **Fixed Navbar**, `h-[100px]` mobile / `h-[88px]` desktop (`lg:`), `bg-[#040028]`, `z-50`, gains a shadow on scroll (`isScrolled` state via a `scroll` listener, threshold `20px`).
- Logo: `WiggleLogo.png` + wordmark in **Rubik One**.
- Desktop nav links (`hidden lg:flex`) are also **Rubik One**, `font-normal`, sized `11px → 16px` across `base → 3xl`.
- **Mega dropdowns** (Fonctionnalités, Canaux, Pour qui, Ressources): absolutely positioned full-width panel, `bg-[#040028]`, 3-column grid, opens on hover (unless a click has "pinned" it open — `clickActiveRef` pattern lets a click override hover-close behavior), chevron icon rotates 180° when open.
- **Mobile menu**: hamburger (`Menu`/`X` icon from lucide-react) toggles a full-screen or slide-in panel; CTA buttons repeat the same bordered/hover-invert treatment as desktop.
- **Footer**: `bg-[#040028]`, large Rubik-One-esque bold headline ("Boost your online presence today"), 5-column link grid on desktop (`hidden md:grid`), accordion sections on mobile (`AccordionSection` component, chevron rotates on open), decorative Spline PNG image bottom-right, back-to-top arrow button that appears after `scrollY > 400`.

---

## 9. Icons

- **UI icons**: `lucide-react` throughout (chevrons, `Menu`/`X`, `Phone`/`Mail`/`MapPin`, `Loader2` for spinners, `Check`/`Plus`/`Minus`).
- **Social/brand icons**: always **inline SVG**, hand-coded per platform with that platform's real gradient/brand color (never recolored to fit the site palette) — see `src/components/landing/hero/SocialIcons.tsx` for the canonical set (Facebook, Instagram, Twitter/X, LinkedIn, WhatsApp, YouTube). Duplicated inline in a few places (`ConnectSection`, `UsersSection`) rather than imported — if adding a new instance of an existing platform icon, prefer importing from `SocialIcons.tsx` over re-pasting the SVG.
- **Decorative/custom SVG**: bespoke illustrative SVGs are used for flourishes (the pricing page's calligraphic swash under "right for you", the FAQ's blue circle-plus). These are one-off, page-specific — not part of a shared icon set.
- **Trustpilot**: the official Trustpilot star-rating + wordmark SVG is reproduced faithfully (green `#00B67A` stars) wherever social proof is shown (`ChannelLanding`'s `RatingRow`).

---

## 10. Motion & Interaction

- **Hover**: `hover:scale-*` is the primary affordance for clickable elements (buttons, cards, icons) — see §5. Color-invert-on-hover is the secondary pattern for bordered/outlined elements.
- **Transitions**: `transition-colors`, `transition-transform`, or `transition-all`, generally left at Tailwind's default duration unless explicitly set (`duration-200`/`duration-300` shows up for dropdown chevrons and accordions).
- **Accordion/expand pattern**: never `height: auto` — always `max-h-0` ↔ `max-h-[500px]` (or similar generous fixed cap) with `overflow-hidden transition-all duration-300`, paired with `opacity-0 → opacity-100`. This is the FAQ, the mobile footer accordion, and the mobile Navbar sub-menus.
- **CSS keyframe animations**: the animated hero background (icons flowing toward the isometric cube) uses raw `@keyframes` + `animation-delay` per icon for a staggered effect (`src/app/page.tsx`, `.icon-lane1`/`.icon-lane2` etc.).
  - **Gotcha (fixed 2026-07-14):** when staggering multiple elements with `animation-delay` on an `infinite` animation, always pair it with `animation-fill-mode: backwards`. Without it, every element sits at its **un-animated default position** (fully visible, no transform) for the entire length of its delay before snapping into the keyframe's `0%` state — on a page reload this reads as icons "stacking up" for several seconds before the animation appears to start. `backwards` makes the browser apply the `0%` keyframe (usually `opacity: 0` + an off-screen `transform`) retroactively during the delay, so delayed elements are invisible/off-screen until it's actually their turn.
- **Framer Motion** (`framer-motion`) is used in a few dashboard-adjacent and interactive components but is **not** a marketing-site-wide dependency — most landing sections use plain CSS transitions. Reach for CSS transitions first; only pull in `framer-motion` if you need spring physics, exit animations, or gesture handling that CSS genuinely can't do.

---

## 11. Page Inventory

| Route | Notes |
|---|---|
| `/` (home) | Hero (navy bg, isometric cube + animated social icons), Impact, Publish, Connect, Users (profile-type collage — has a dedicated flowing mobile/tablet layout below `xl`), AProposSection, FAQ, Contact |
| `/tarifs` | Own container, `/tarifs`-local blue `#184CD1`, sharper radii (`rounded-[4px]`–`[9px]`), pricing cards + comparison table + payment-method logos |
| `/canaux/[channel]` | Single shared template (`ChannelLanding.tsx`) parametrized by `channelName`, serves all 17 channel slugs. Local accent `#061492`. Hero image is currently hardcoded to a Facebook-specific asset (known gap — other channels reuse it as a placeholder) |
| `/pour/createurs`, `/pour/pme`, `/pour/agences`, `/pour/organisations` | Audience-specific landing pages. **`pme` and `agences` deviate from the rest of the site** — see §12 |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Own split-screen layout (form left, blue `#174CD2` illustration panel right on `lg+`), Pattern A inputs |
| `/checkout` | Own split layout (form + blue `#184CD1` summary panel), Pattern B inputs, step-dot progress indicator, success screen with auto-redirect to `/dashboard` |
| `/pour/createurs`, `/canaux/*` marquee sections | Horizontal infinite-scroll "creator marquee" pattern (`translateX(-50%)` looped track, duplicated item list) |

**Explicitly out of scope / not live** (do not treat as reference despite existing in the repo):
- `src/components/landing/AnalyzeSection.tsx`, `CollaborateSection.tsx`, `GrowSection.tsx`, `StatsSection.tsx` — not imported anywhere, dead code from a prior homepage iteration.
- `/community`, `/creator-fund` (`src/app/(marketing)/`) — not linked from Navbar or Footer, and still use the retired `#3C48F5` blue rather than `#174CD2`. Stale, not part of the current design language.
- `/fonctionnalites/*`, `/ressources/*` — linked from the Navbar mega-dropdowns but the pages don't exist yet (no `page.tsx`). Placeholder routes for future content.

---

## 12. Known Inconsistencies

Flagging these explicitly so they're fixed deliberately, not accidentally copied into new work:

1. **Theme tokens vs. real brand color** (see §2) — `colors.primary` in `tailwind.config.ts` and `--primary` in `globals.css` both resolve to blues that are *not* `#174CD2`. Don't use `bg-primary`/`text-primary` on marketing pages.
2. **Three blue variants** (`#174CD2`, `#184CD1`, `#061492`) are all "brand blue" depending on which page you're in, with no documented reason for the split. Match the page you're editing; don't invent a fourth.
3. **`/pour/pme` and `/pour/agences` use a different font-family declaration** (`font-['Inter',_sans-serif]` for body copy, `#12141D` instead of `#040028`/`#000B33` for ink) — this is the one place on the site that isn't strictly Rubik-only. `Inter` is not loaded via `next/font`, so if it's ever unavailable the browser falls back straight to generic `sans-serif`, **not** Rubik. This should be reconciled to the rest of the site's font/color system rather than treated as precedent.
4. **`globals.css`'s `body { font-family: var(--font-jetbrains-mono), monospace; }`** rule is dead code — `--font-jetbrains-mono` is never defined anywhere (no matching `next/font` call), and the rule is overridden in practice by the `font-sans` class Tailwind applies directly to `<body>` in `layout.tsx`. Harmless today, but confusing to read; safe to delete whenever someone's in that file.
5. **`max-w-[1440px]` vs `max-w-[1435px]`** — used interchangeably for what's meant to be the same standard container. Not worth a mass find-replace, but default to `1440` for anything new.
6. **Legacy/orphaned pages** listed at the end of §11 use the retired `#3C48F5` blue and, in the four orphaned landing components, aren't reachable at all. Don't reference them when building something new.

---

*This document should be updated whenever a new page or section introduces a genuinely new pattern (not just a one-off tweak) — append to the relevant section rather than leaving the addition undocumented.*
