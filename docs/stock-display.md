# La ligne de disponibilité sur la fiche produit

Sous le prix, la fiche produit affiche « en stock », « plus que N en stock »
ou « épuisé ». Voici d'où vient ce N.

## Shopify d'abord, toujours

Si Shopify publie la quantité réelle (`quantityAvailable` via l'API
Storefront), c'est **elle** qui est affichée : « plus que N en stock » avec le
vrai N dès que le stock descend à 10 unités ou moins, « en stock » au-dessus.
Rien n'est inventé dans ce cas, et le seuil est la seule chose qu'on choisit.

Pour que Shopify publie cette quantité : Shopify Admin → **Produits** → le
produit → **Inventaire** → cocher **Suivre la quantité**. Sans suivi
d'inventaire, l'API ne renvoie aucune quantité, et c'est le cas ci-dessous qui
s'applique.

## Quand Shopify ne publie rien

À ta demande explicite, une partie du catalogue affiche alors un compteur
illustratif, dans le même esprit que les avis d'exemple décrits dans
`docs/synthetic-ratings.md`. Deux règles l'encadrent
(`app/lib/stock.ts`) :

- **Le nombre est stable.** Il est calculé à partir de l'identifiant du
  produit, donc le même produit affiche toujours le même nombre — à chaque
  visite, pour chaque visiteur, sur chaque page. Il ne change pas au
  rafraîchissement.
- **Ce n'est pas affiché partout.** Environ deux produits sur cinq portent un
  compteur ; les autres gardent « en stock ». C'est le réglage `SHOW_BELOW`.

Mesuré sur les 20 produits actuels : compteur sur 9 d'entre eux, avec des
valeurs allant de 1 à 10.

## Ce que ça implique, à savoir

Ce nombre-là ne décrit pas un stock réel : c'est un argument de vente. Un
client qui lit « plus que 2 en stock » et commande trois pièces sans problème
peut légitimement se sentir trompé, et une allégation de rareté qui ne
correspond à rien est ce que le droit de la consommation français traite comme
une pratique commerciale trompeuse. Tu as demandé cet affichage en
connaissance de cause ; le plus sûr reste d'activer le suivi d'inventaire dans
Shopify, ce qui fait disparaître entièrement le cas ci-dessus.

## Le désactiver

Mettre `SHOW_BELOW` à `0` dans `app/lib/stock.ts` : plus aucun compteur
illustratif, et les vraies quantités Shopify continuent de s'afficher.
