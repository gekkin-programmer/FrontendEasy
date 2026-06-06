# Session Summary — Facebook/Instagram OAuth Debug
**Date :** 05 mai 2026  
**Durée :** ~4h  
**Résultat :** Instagram @penebrayann connecté avec succès ✅

---

## Problème initial

L'endpoint `/api/social-accounts/callback/facebook` retournait systématiquement `FB pages found: 0 — []`, empêchant la connexion Facebook et Instagram pour l'utilisateur `penebrayann@gmail.com`.

---

## Causes racines identifiées (par ordre de découverte)

### 1. App Facebook en mode Développement
L'app EazyPost était en **Development mode**. En mode Dev, `/me/accounts` ne retourne les pages que pour les admins/testeurs de l'app. L'autorisation accordée en Dev n'incluait pas l'étape de sélection de pages.

**Fix :** Basculer l'app en **Live mode** dans le Facebook Developer Console.

### 2. Autorisation mise en cache (sans sélection de pages)
Même après le passage en Live, le dialogue Facebook affichait "Continuer en tant que Pene Brayan" et réutilisait l'ancienne autorisation Dev — sans jamais montrer l'étape "Quelles pages voulez-vous partager ?".

**Root cause :** `auth_type=rerequest` dans le code ne re-demande que les permissions *refusées*. Pour une autorisation déjà accordée (même incomplète), il la réutilise silencieusement.

**Fix :** Supprimer `auth_type: 'rerequest'` de `facebook-connect.strategy.ts` → laisser Facebook décider.

### 3. Page dans un Meta Business Portfolio
La page **EazyPostt** (ID: `1057411670794729`) est gérée via **Meta Business Suite** (Portfolio "Pene Nkouam Bryan"). L'API `/me/accounts` ne retourne **pas** les pages appartenant à un Business Portfolio — uniquement les pages avec rôle personnel direct.

Même après un consentement complet avec sélection de 1 page + 1 compte Instagram, `/me/accounts` retournait `[]`.

**Fix :** Ajout de deux fallbacks dans `handleFacebookCallback` :
- Fallback 2 : `/me/businesses?fields=owned_pages` (nécessite `business_management` — non utilisable sans App Review)
- **Fallback 3 : `GET /{pageId}?fields=access_token` via `FB_KNOWN_PAGE_IDS` env var** ← c'est celui qui a fonctionné

### 4. `business_management` scope bloque le login
Ajouter `business_management` aux scopes OAuth a causé l'erreur **"Facebook Login n'est pas disponible pour cette app"** car la permission n'était pas activée dans le Facebook Developer Console.

**Fix :** Retirer `business_management` des scopes.

---

## Fixes appliqués (commits par ordre chronologique)

| Commit | Description |
|--------|-------------|
| `ed62631` | Supprimer `auth_type:rerequest` — laisse Facebook afficher le dialogue complet |
| `56d9344` | Auto-revoke quand `/me/accounts` vide → force nouveau dialogue avec sélection de pages |
| `2bff72c` | Ajout scope `business_management` + fallback `/me/businesses` *(revert partiel ensuite)* |
| `3d1c87e` | **Fallback 3** : fetch direct du page token via `FB_KNOWN_PAGE_IDS` env var |
| `fbeee36` | Retirer `business_management` du scope (causait "Login non disponible") |

---

## Architecture finale du flow Facebook

```
handleFacebookCallback()
  ├── 1. Échange token court → long-lived (60j)
  ├── 2. GET /me/accounts
  │     └── Si pages trouvées → upsert page → ✅
  ├── 3. Si vide → check /me/permissions
  │     └── Si pages_show_list refusé → revoke + throw FB_PERMISSION_DENIED
  ├── 4. Fallback Business Portfolio: GET /me/businesses?fields=owned_pages
  │     └── Si page trouvée → upsert page → ✅
  ├── 5. Fallback direct: GET /{pageId}?fields=access_token (via FB_KNOWN_PAGE_IDS)
  │     └── Si page trouvée → upsert page → ✅  ← A fonctionné ici
  └── 6. Sinon → revoke + throw FB_NO_PAGES_EXISTS
```

```
handleInstagramCallback()
  ├── 1. Cherche SocialAccount FACEBOOK en DB (page token stocké)
  ├── 2. GET /{pageId}?fields=instagram_business_account avec le page token
  │     └── Si IG Business Account trouvé → fetch username → upsert → ✅  ← A fonctionné ici
  ├── 3. Fallback: GET /me/accounts avec le fresh token OAuth
  │     └── Si page avec IG trouvée → upsert → ✅
  └── 4. Sinon → throw IG_NO_BUSINESS_ACCOUNT
```

---

## Résultat final

| Compte | Statut | Détails |
|--------|--------|---------|
| Facebook Page | ✅ Connecté | EazyPostt (ID: `1057411670794729`) |
| Instagram | ✅ Connecté | @penebrayann (ID: `17841425392617020`) |

---

## Variables d'environnement ajoutées

```env
# Nestjs_Backend/.env (production via Dokploy)
FB_KNOWN_PAGE_IDS=1057411670794729
```

---

## Fichiers modifiés

| Fichier | Changements |
|---------|-------------|
| `src/modules/social-accounts/strategies/facebook-connect.strategy.ts` | Supprimé `auth_type:rerequest` |
| `src/modules/social-accounts/guards/facebook-connect.guard.ts` | Ajout/retrait `business_management` scope |
| `src/modules/social-accounts/social-accounts.service.ts` | Auto-revoke + Fallback Business Portfolio + Fallback direct page ID |
| `Nestjs_Backend/.env.example` | Ajout `FB_KNOWN_PAGE_IDS` |
| `docs/facebook-meta-oauth-setup.md` | Documentation complète du setup Meta |

---

## Points en suspens pour la suite

1. **App Review Facebook** : pour permettre à d'autres utilisateurs (non-admins) de connecter leurs pages, les permissions avancées doivent passer par App Review :
   - `pages_manage_posts`
   - `instagram_content_publish`
   - `pages_show_list` (Standard Access → Advanced Access)

2. **Migration de la page** : déplacer EazyPostt du Portfolio "Pene Nkouam Bryan" vers le Portfolio vérifié "Eazypost" (BUILDING ELECTRONIC SPORT TECHNOLOGY CORPORATION, ID: `1497943822125399`) — requis pour l'App Review.

3. **`FB_KNOWN_PAGE_IDS` est un workaround** : il fonctionne pour les utilisateurs dont on connaît l'ID de page à l'avance. Pour les utilisateurs tiers (après App Review), `/me/accounts` devrait fonctionner normalement car leurs pages ne seront pas dans un Business Portfolio.

4. **Token de page permanent** : le page token stocké en DB doit être rafraîchi si l'utilisateur révoque et reconnecte. Le `refreshToken` (long-lived user token) sert à re-dériver le page token si nécessaire.
