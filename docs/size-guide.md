# Guide des tailles

Sur chaque fiche produit, le lien « guide des tailles » ouvre, pour la pièce
consultée :

- son type et sa coupe (« hoodie · coupe normale ») ;
- un dessin de la pièce, avec une lettre par mesure ;
- un tableau des mesures du vêtement à plat, pour chaque taille que la
  pièce a réellement dans Shopify, avec sa disponibilité ;
- « trouver ma taille » : taille en cm, poids en kg et coupe préférée
  (ajustée, normale, oversized), puis la taille suggérée parmi celles de la
  pièce, ses mesures, le pourquoi de la suggestion, et un bouton qui
  sélectionne cette taille.

## Les mesures sont estimées, et le guide le dit

Aucun produit de la boutique n'a de mesures en centimètres : Shopify ne
connaît que les tailles et une description de la coupe. Toutes les valeurs
affichées sont donc des **estimations**, signalées par « ≈ », par le badge
« mesures estimées » et par la phrase sous le tableau (« pas une mesure du
fabricant »). Elles viennent de :

- la **catégorie**, lue dans le titre (`t-shirt`, `longsleeve`, `hoodie`,
  `zip`, `knit`, `jacket`, `jeans`, `jogging`, `shorts`), qui décide des
  mesures montrées : poitrine, longueur, épaules et manche pour un haut ;
  tour de taille, longueur, entrejambe, cuisse et bas de jambe pour un bas ;
- la **coupe** (`slim`, `regular`, `relaxed`, `oversized`) et, pour un bas,
  la **forme de jambe** (`straight`, `flared`, `wide`, `tapered`), lues dans
  la description ;
- une base en M par catégorie et une gradation par taille, dans
  `app/lib/sizeGuide/catalog.ts`.

## Où modifier

| Pour… | Fichier |
| --- | --- |
| Corriger la catégorie ou la coupe d'un produit | `app/lib/sizeGuide/products.ts` (une ligne par handle) |
| Saisir de vraies mesures | `app/lib/sizeGuide/products.ts`, champ `verified` |
| Changer les bases ou la gradation d'une catégorie | `app/lib/sizeGuide/catalog.ts` |
| Les textes | `app/lib/i18n/dictionary.ts`, clés `sizeGuide.*` |

Exemple de mesures réelles, prises à plat :

```ts
'vercetti-hoodie-noir-1': {
  category: 'hoodie',
  fit: 'regular',
  verified: {M: {chest: 60, length: 71, shoulders: 53, sleeve: 63}},
},
```

Une valeur vérifiée remplace l'estimation pour cette taille et cette mesure,
s'affiche sans « ≈ », et le badge devient « mesuré sur la pièce ».
Comment prendre chaque mesure : voir le commentaire de `BASE_M` dans
`catalog.ts` (largeurs = d'un bord à l'autre, tour de taille = tour complet,
manche depuis la couture d'épaule).

## Les produits ajoutés plus tard

Un produit absent de `products.ts` a quand même son guide : sa catégorie
est lue dans le titre (puis la description), sa coupe et sa jambe dans la
description, en ignorant les phrases de conseil (« one size up for a more
oversized look » ne fait pas d'une pièce une pièce oversized). Si le titre
ne dit pas quel vêtement c'est, ou si ses tailles ne sont pas des lettres
(XS à 3XL), le guide montre la simple liste des tailles et de leur stock,
comme avant.

## La suggestion de taille

1. Taille et poids donnent une poitrine et un tour de taille moyens
   (`estimateBody` dans `index.ts`), et de là la taille habituelle : surtout
   la poitrine (hauts) ou la taille (bas), un peu la hauteur.
2. La coupe préférée applique le conseil de la marque, celui des fiches :
   taille habituelle pour le rendu prévu ; une au-dessus pour plus ample sur
   une coupe près du corps, normale ou ample ; une en dessous pour plus
   ajusté sur une coupe ample ou oversized. Un jean, à taille fixe, se
   choisit au tour de taille et ne change pas de taille pour la coupe.
3. La taille retenue est la plus proche parmi celles du produit ; si elle
   sort de la gamme, ou si elle est épuisée, le guide le dit.

C'est une moyenne : le guide précise que deux personnes de même taille et de
même poids peuvent porter une taille d'écart.

## Données à corriger dans Shopify

Repérées en construisant les profils :

- `vercetti-jogging-gris` : la description est celle du Vercetti Hoodie
  (« structured hood »).
- `im-scared-of-girls-tshirt-white` : la description est celle du longsleeve
  I Only Want Baddies.
- Plusieurs titres ne disent pas la couleur de leur handle
  (`reda-longsleeve-black` s'intitule « — White », `leopard-zip-dark-grey`
  « — Light Grey ») : sans effet sur le guide, qui suit le handle.
