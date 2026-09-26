# reda studio — repères pour Claude

Boutique **Shopify Hydrogen** (React Router 7, Vite, Tailwind v4 en CSS-first),
en ligne sur **redastudio.fr**. Streetwear français, premium et sobre : noir et
blanc, minuscules, pas de bandeau promo, pas de compte à rebours.

## Déploiement

Pousser sur `main` déclenche GitHub Actions, qui construit et publie sur
Oxygen en deux minutes environ. **Le propriétaire a donné son autorisation de
pousser sans demander à chaque fois.**

Vérifier que le run a bien démarré dans l'onglet Actions : un `git push` fait
depuis une session Claude dans le cloud est arrivé sur `main` sans déclencher
aucun déploiement, et le site est resté sur l'ancienne version en silence.
Vérifier ensuite en interrogeant le site en ligne plutôt qu'en le supposant.

## Ce qu'il faut lire avant de toucher aux offres

Trois réductions coexistent, configurées à trois endroits différents. Se
tromper de code coûte de l'argent réel, en silence.

| Offre | Code | Écrit dans |
| --- | --- | --- |
| Pack : 3 pièces, le tshirt Business After Hour offert | `FREEBSN` | `app/lib/packOffer.ts` |
| Bloc « second produit −30 % » de la fiche produit | `REDA1120` | `app/lib/offers.ts` |
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
- Vérifier que l'ancien code `REDA1130` est bien désactivé dans l'admin.
