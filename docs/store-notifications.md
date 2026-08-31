# Recevoir les avis clients et les numéros par e-mail

Deux choses arrivent maintenant par e-mail, à **redastudio.fr@gmail.com** :

- chaque **avis client** soumis sur `/reviews` (le bouton « laisser un avis »
  sous les avis, sur l'accueil et sur chaque page produit) ;
- chaque **numéro de téléphone** collecté par le pop-up de bienvenue, en plus
  de Shopify Admin et de Notion (voir `docs/emails-newsletter.md`).

Aucun des deux n'est câblé à un service e-mail par défaut : tant que la
configuration ci-dessous n'est pas faite, la page `/reviews` affiche un
message « ce formulaire ne reçoit pas encore de réponses » avec un lien vers
la page contact, et le pop-up continue de fonctionner normalement (Shopify
Admin reste alimenté).

## Pourquoi un service tiers

Le site n'a pas de serveur e-mail à lui — comme n'importe quel site
Hydrogen/Oxygen, il ne peut qu'appeler une API. **Resend** a été choisi parce
que son plan gratuit (3 000 e-mails/mois, largement suffisant) permet
d'envoyer un e-mail à sa propre adresse sans même vérifier de nom de domaine,
à condition d'avoir créé le compte avec cette adresse-là.

## Configurer Resend (une seule fois)

1. Aller sur **resend.com** → créer un compte **avec l'adresse
   redastudio.fr@gmail.com** — c'est ce qui permet de recevoir des e-mails
   sans configuration DNS supplémentaire.
2. Dans le tableau de bord Resend → **API Keys** → **Create API Key** →
   copier la clé affichée. Elle ne sera plus jamais montrée après cette
   fenêtre — la garder de côté un instant.
3. Dans **Shopify Admin** → Hydrogen → ta storefront → **Environments** →
   l'environnement de production → variables d'environnement, ajouter :

   | Variable | Valeur |
   | --- | --- |
   | `RESEND_API_KEY` | la clé copiée à l'étape 2 |

   Cette clé ne doit être collée que dans ce formulaire Shopify — jamais
   dans une conversation, jamais dans un fichier du dépôt.

Une fois cette variable présente, les deux formulaires se mettent à envoyer
sans aucun autre changement : rien à modifier côté code.

## Ce que contient chaque e-mail

**Avis client** — objet `Nouvel avis client — {produit} ({note}/5)` (ou sans
le produit s'il n'a pas été précisé), corps : note, produit, nom, e-mail du
client, puis le texte de l'avis en entier.

**Numéro collecté** — objet `Nouveau numéro collecté — pop-up`, corps : le
numéro au format international, la langue du visiteur, le code promo
distribué (`REDA10`).

## Un avis n'est jamais publié automatiquement

Cette page n'est pas branchée sur une app d'avis Shopify — il n'y en a pas
d'installée sur la boutique. Chaque soumission part par e-mail pour être lue
par une personne, qui décide ensuite de le publier (via l'app d'avis, si un
jour il y en a une) ou non. Rien n'apparaît automatiquement sur le site.

## Expéditeur

Les e-mails arrivent depuis `onboarding@resend.dev`, l'adresse de test
fournie par Resend — pas depuis une adresse `@redastudio.fr`. C'est le prix
de ne pas avoir à vérifier de domaine ; si tu veux un jour un expéditeur à
l'image du site (`avis@redastudio.fr` par exemple), il faudra vérifier ce
domaine dans Resend, une étape distincte que je peux faire quand tu veux.
