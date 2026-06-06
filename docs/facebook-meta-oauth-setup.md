# Facebook / Meta OAuth Setup — EazyPost

## Vue d'ensemble

EazyPost utilise **Facebook Login for Business** pour connecter :
- Les Pages Facebook (pour publier des posts)
- Les comptes Instagram Business (liés aux Pages Facebook)
- WhatsApp Business

L'OAuth Facebook est partagé entre Facebook, Instagram et WhatsApp — ils utilisent tous le même callback `/callback/facebook`, le guard `FacebookConnectGuard`, et la stratégie `facebook-connect.strategy.ts`.

---

## Comptes et Portfolios Meta Business Suite

### Portfolio 1 — Pene Nkouam Bryan (personnel)
- **ID :** *(voir Business Suite)*
- **Actifs :** Page EazyPostt + Instagram @penebrayann
- **Statut :** Non vérifié

### Portfolio 2 — Eazypost (BUILDING ELECTRONIC SPORT TECHNOLOGY CORPORATION)
- **ID :** 1497943822125399
- **Actifs :** *(actuellement vide — la page doit être migrée ici)*
- **Statut :** Vérifié le 04 mai 2026
- **Rôle pour App Review :** Ce portfolio doit contenir la page EazyPostt pour soumettre les permissions avancées à l'App Review Facebook.

### Admins des portfolios
| Personne | Rôle |
|---|---|
| Pene Brayan (`penebrayann@gmail.com`) | Business Admin (les deux portfolios) |
| Pene Nkouam Bryan | Business Admin (les deux portfolios) |

---

## Application Facebook (Facebook App)

- **Nom :** EazyPost
- **Mode :** Live (basculé le 05 mai 2026 — avant c'était Development)
- **App ID :** Voir `FACEBOOK_APP_ID` dans `Nestjs_Backend/.env`
- **App Secret :** Voir `FACEBOOK_APP_SECRET` dans `Nestjs_Backend/.env`

### Permissions demandées (scopes OAuth)
```
email
public_profile
pages_show_list
pages_read_engagement
pages_manage_posts
pages_read_user_content
instagram_basic
instagram_content_publish
business_management        ← requis pour les pages gérées via Business Portfolio
whatsapp_business_management
whatsapp_business_messaging
```

### Statut des permissions
| Permission | Niveau | App Review requis (pour tous users) |
|---|---|---|
| `email` | Standard | Non |
| `public_profile` | Standard | Non |
| `pages_show_list` | Standard | Oui |
| `pages_read_engagement` | Standard | Oui |
| `pages_manage_posts` | Avancé | Oui |
| `instagram_basic` | Standard | Oui |
| `instagram_content_publish` | Avancé | Oui |
| `business_management` | Avancé | Oui |

> **Note :** En mode Live, les admins/développeurs de l'app peuvent utiliser toutes les permissions sans App Review. Les autres utilisateurs ont besoin de l'App Review pour les permissions avancées.

---

## Pourquoi `/me/accounts` retourne 0 pages

### Cause

L'API `/me/accounts` ne retourne **que** les pages où l'utilisateur est admin **direct** (rôle personnel sur la page). Elle ne retourne **pas** les pages gérées via un **Business Portfolio** Meta Business Suite.

La page EazyPostt étant dans un Business Portfolio, `/me/accounts` la ignore même si :
- L'utilisateur a "Contrôle total" dans Business Suite
- Toutes les permissions OAuth sont accordées
- L'utilisateur a sélectionné la page dans le dialogue de consentement

### Solution implémentée

Le `handleFacebookCallback` dans `social-accounts.service.ts` utilise un fallback en deux étapes :

1. **Étape 1** : Appel `/me/accounts` (fonctionne pour les pages personnelles)
2. **Étape 2** (si étape 1 vide) : Appel `/me/businesses?fields=owned_pages` avec `business_management` — retourne les pages des Business Portfolios dont l'utilisateur est admin

### Comportement quand les deux retournent 0

Si les deux endpoints retournent 0 pages :
1. Le backend révoque automatiquement l'autorisation Facebook (`DELETE /me/permissions`)
2. Lance une erreur `FB_NO_PAGES_EXISTS`
3. Le frontend affiche le message d'erreur bilingue correspondant
4. Le prochain clic sur "Connecter Facebook" affiche un dialogue de consentement complet avec sélection de pages

---

## Flux OAuth complet

```
User clique "Connecter Facebook"
    → GET /api/social-accounts/connect/facebook?workspaceId=...&token=...
    → FacebookConnectGuard sauvegarde workspaceId+token en session
    → Redirect vers Facebook (dialog de consentement)

User sélectionne pages + Instagram + accorde permissions
    → Facebook redirect vers GET /api/social-accounts/callback/facebook?code=...
    → FacebookConnectGuard récupère le code et échange contre un access token
    → facebook-connect.strategy.ts:validate() appelle /me?fields=id,name
    → Récupère workspaceId+token depuis la session
    → Valide le JWT token → résout userId
    → Retourne payload à handleFacebookCallback

handleFacebookCallback:
    1. Échange short-lived token → long-lived token (60 jours)
    2. GET /me/accounts (pages personnelles)
    3. Si vide → vérifie permissions (/me/permissions)
       - Si pages_show_list refusé → révoque + throw FB_PERMISSION_DENIED
       - Si pages_show_list accordé → try /me/businesses (Business Portfolio)
         - Si page trouvée → upsert SocialAccount avec page token
         - Si toujours vide → révoque + throw FB_NO_PAGES_EXISTS
    4. Si page trouvée → upsert SocialAccount

Redirect vers frontend/dashboard/{workspaceId}?success=true
```

---

## Flux Instagram

Instagram utilise le même OAuth Facebook (Login for Business). Le callback `/callback/facebook` différencie par `platform` en session.

`handleInstagramCallback` :
1. Cherche un `SocialAccount` Facebook existant en DB (pour récupérer le page token)
2. Utilise le page token pour appeler `/{pageId}?fields=instagram_business_account`
3. Si ça échoue (ex: l'ID stocké est un profil user et non une page) → fallback `/me/accounts` avec le token OAuth frais
4. Si aucun compte Instagram Business trouvé → throw `IG_NO_BUSINESS_ACCOUNT`

**Prérequis Instagram :**
- La page Facebook (EazyPostt) doit avoir un compte Instagram Business/Creator lié
- Le compte Instagram doit être en mode **Professionnel** (pas personnel)
- Lien : Page Facebook → Paramètres → Instagram → Connecter un compte Instagram

---

## Migration de la page EazyPostt vers Portfolio vérifié

Pour l'App Review Facebook, la page EazyPostt doit être dans le portfolio vérifié.

**Étapes :**
1. Aller sur **business.facebook.com** → sélectionner portfolio **"Eazypost"** (vérifié)
2. **Paramètres** → **Actifs** → **Pages** → **Ajouter** → **Revendiquer une Page**
3. Rechercher "EazyPostt" → revendiquer (pas d'approbation requise car tu es admin)
4. Retourner dans portfolio "Pene Nkouam Bryan" → **Pages** → **EazyPostt** → **Supprimer du portefeuille**

---

## Variables d'environnement requises

```env
# Nestjs_Backend/.env
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
API_URL=https://backend-eazypost.mbokofit.com
FRONTEND_URL=https://eazypost.cm
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/modules/social-accounts/guards/facebook-connect.guard.ts` | Sauvegarde session, définit les scopes OAuth |
| `src/modules/social-accounts/strategies/facebook-connect.strategy.ts` | Échange code → token, fetch profil, valide JWT |
| `src/modules/social-accounts/social-accounts.service.ts` | `handleFacebookCallback`, `handleInstagramCallback` |
| `src/modules/social-accounts/social-accounts.controller.ts` | Routes `/connect/*` et `/callback/*` |

---

## Erreurs courantes et solutions

| Erreur | Cause | Solution |
|---|---|---|
| `FB_PERMISSION_DENIED` | L'utilisateur a refusé `pages_show_list` | Cliquer à nouveau "Connecter Facebook" et cocher les pages |
| `FB_NO_PAGES_EXISTS` | Pages vides après consentement | Le backend révoque auto → re-cliquer "Connecter" pour nouveau dialogue |
| `IG_NO_BUSINESS_ACCOUNT` | Page sans compte Instagram Business lié | Lier un compte Instagram Business à la Page Facebook |
| `FB code 100` | ID stocké est un profil user (pas une page) | Reconnecter Facebook d'abord, puis Instagram |
| `/me/accounts` vide malgré pages | Page dans Business Portfolio | `business_management` scope + fallback `/me/businesses` |

---

## App Review — Checklist pour ouverture au public

- [ ] Déplacer page EazyPostt dans portfolio "Eazypost" (vérifié)
- [ ] Préparer Use Case descriptions pour chaque permission avancée
- [ ] Enregistrer des vidéos de démonstration du flux OAuth
- [ ] Soumettre `pages_manage_posts`, `instagram_content_publish`, `business_management` à la review
- [ ] Configurer `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` pour les webhooks Instagram
