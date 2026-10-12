# reda studio — repères pour Claude

Boutique **Shopify Hydrogen** (React Router 7, Vite, Tailwind v4 en CSS-first),
en ligne sur **redastudio.fr**. Streetwear français, premium et sobre : noir et
blanc, minuscules, pas de bandeau promo, pas de compte à rebours.

## Déploiement

**Consigne du propriétaire (12 octobre 2026) :** une fois les modifications
terminées et vérifiées (lint, types, build, test dans un navigateur), les
déployer directement en production sur Oxygen, sans lui demander de
confirmation. GitHub ne sert plus que de sauvegarde : GitHub Actions ne se
déclenche plus pour les sessions Claude, un push sur `main` ne déploie rien.

Il faut que l'environnement de la session fournisse
`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`. La branche locale doit s'appeler `main` :
c'est le nom de branche qui envoie en production.

```sh
git branch -f main HEAD && git checkout main
CI=true NODE_USE_ENV_PROXY=1 npx shopify hydrogen deploy --no-json-output \
  --metadata-description "<ce qui change>"
```

Sans `NODE_USE_ENV_PROXY=1`, l'outil Shopify ne passe pas par le proxy de la
session et ne trouve pas `oxygen.shopifyapps.com`.

Pour tester avant la production sur les vrais produits : la même commande
avec `--preview --auth-bypass-token --json-output`. L'adresse de l'aperçu et
le jeton (à envoyer dans l'en-tête `oxygen-auth-bypass-token`) sont dans
`h2_deploy_log.json`, à supprimer ensuite.

Vérifier ensuite sur redastudio.fr que la nouvelle version est en ligne,
plutôt que le supposer, puis pousser le code sur la branche de la session
pour que la session suivante reparte du code publié.

## Ce qu'il faut lire avant de toucher aux offres

Trois réductions coexistent, configurées à trois endroits différents. Se
tromper de code coûte de l'argent réel, en silence.

| Offre | Code | Écrit dans |
| --- | --- | --- |
| Pack : 3 pièces, le tshirt Business After Hour offert | `FREEBSN` | `app/lib/packOffer.ts` |
| Second produit −30 % (posé à partir de 2 articles) | `REDA1130` | `app/lib/offers.ts` |
| Paliers 2ᵉ −20 % / 3ᵉ −30 % — **désactivés** (`TIER_ENABLED = false`) | — | `app/lib/tierDiscount.ts` |

Un panier ne porte **jamais** deux codes d'offre : la règle est dans
`app/routes/cart.tsx`, et elle rend au panier le code qu'il portait avant
chaque modification — Shopify le retire dès que le panier cesse d'y donner
droit, et ne le remet pas.

Détails et pièges dans `docs/pack-essentiel.md` et `docs/tier-discount.md`.

## Le reste de la documentation

`docs/` : pages légales, précommande, notifications, avis de synthèse,
affichage du stock, vidéos produit portées, e-mails.

## Principes tenus dans ce code

- **Ne jamais annoncer une remise que Shopify n'applique pas.** Le site
  affiche, Shopify facture ; quand les deux divergent, le client voit un prix
  et en paie un autre.
- **Ne jamais cacher du contenu derrière une animation.** Les animations
  d'apparition n'agissent que sur `transform`, jamais sur `opacity` seule, et
  `Reveal` affiche sans transition si son observateur ne répond pas. Un site
  dont les produits disparaissent sur mobile, c'est arrivé ici.
- **Le texte passe par `app/lib/i18n/dictionary.ts`**, anglais par défaut,
  français si le visiteur le choisit. Les deux tables doivent avoir les mêmes
  clés.
- Messages de commit en français, à l'indicatif, expliquant *pourquoi*.

## Ce qui reste à faire côté Shopify (pas dans le code)

- Créer la collection **`pack-essentiel`** et y pointer la règle FREEBSN :
  tant qu'elle n'existe pas, `/pack` marche sur la liste de repli de
  `app/lib/packOffer.ts`, à tenir à jour à la main.
- Remplacer la photo d'ambiance du pack (`PACK_IMAGE` dans
  `app/routes/pack.tsx`), aujourd'hui une image d'archive.
- Désactiver l'ancien code `REDA1120` et l'app de paliers dans l'admin :
  seul `REDA1130` porte le −30 % du second produit.
