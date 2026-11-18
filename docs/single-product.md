# Site à un seul produit (branche `version-produit-unique`)

Nouvelle version du site, construite à côté du site en ligne : tout le site
vend une seule pièce, le **Royal Longsleeve — White**. Elle n'est publiée
qu'en aperçu Oxygen tant que le propriétaire ne demande pas la mise en ligne
(voir `CLAUDE.md`).

## Ce qui change

- **Accueil** (`app/routes/_index.tsx`) : une bannière, puis la page complète
  du produit — galerie, achat, guide des tailles, description, FAQ, vidéos
  portées, vision, avis. Le bouton de la bannière descend à l'achat
  (`#acheter`).
- **Masqué** (tout ce qui mène à d'autres produits) : l'offre « à associer »,
  « vous aimerez aussi », les tuiles de collections, les suggestions du
  panier, les menus de collections, la recherche, le lien vers le pack.
- **Renvoyé vers l'accueil** (redirection temporaire 302) : `/products/*`,
  `/collections/*`, `/search`, `/pack`, `/lookbook`.
- **Inchangé** : panier, paiement, pages légales, contact, FAQ, « notre
  histoire », suivi de commande, compte client.

## Le réglage

`app/lib/singleProduct.ts` → `SINGLE_PRODUCT_HANDLE`. Pour vendre une autre
pièce, y mettre son handle Shopify.

## À fournir / à faire

- Bannières (mobile et ordinateur) : `bannerImages()` dans
  `app/routes/_index.tsx`, aujourd'hui la photo portée du produit dans
  Shopify, en attendant des visuels dédiés.
- Vidéos : celles de `public/videos/worn/` (`ProductWornVideos`) sont encore
  celles du site complet.
- Offres du panier : `REDA1130` (−30 % sur le 2ᵉ article) s'applique
  toujours dès 2 articles, donc sur deux Royal Longsleeve. À décider.
