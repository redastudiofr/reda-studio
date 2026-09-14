# Où retrouver les e-mails et numéros collectés

Le pop-up de bienvenue demande un **numéro de téléphone** (plus un e-mail —
ce changement lui est propre). Le formulaire du footer continue de demander
un e-mail. Aucun des deux n'est stocké dans ce dépôt ni sur le serveur de la
boutique : chaque soumission part directement dans **la liste clients de
Shopify**, via le formulaire client natif de la boutique (`/contact`,
`form_type=customer`).

C'est voulu : Shopify gère déjà le consentement, la désinscription et la
suppression sur demande (RGPD). Dupliquer les données ailleurs créerait un
deuxième fichier à sécuriser et à tenir à jour, pour rien. Un numéro est en
plus copié dans une base Notion — voir plus bas — et par e-mail à
redastudio.fr@gmail.com — voir `docs/store-notifications.md` — pour le
consulter sans ouvrir Shopify Admin ; ce n'est jamais la seule copie.

Le numéro est normalisé côté serveur avant l'envoi (`app/lib/phone.ts`) :
« 06 12 34 56 78 », « 06.12.34.56.78 » ou « +33 6 12 34 56 78 » deviennent
tous `+33612345678`. Un numéro qui n'est ni un 10 chiffres commençant par 0
ni déjà préfixé (`+` ou `00`) est refusé — le pop-up affiche alors un message
d'erreur au lieu d'envoyer une valeur incertaine.

## Les consulter

1. Ouvrir **admin.shopify.com** → boutique **reda studio**.
2. Menu de gauche → **Clients**.
3. Cliquer sur **Filtrer** → **Balise (tag)** → choisir `newsletter`.

La liste affichée est l'ensemble des inscrits, avec leur e-mail ou leur
numéro de téléphone et leur date d'inscription.

## Savoir d'où vient chaque inscription

Chaque fiche reçoit deux ou trois balises :

| Balise               | Signification                              |
| --------------------- | ------------------------------------------ |
| `newsletter`          | inscrit à la newsletter (toutes sources)   |
| `newsletter-popup`    | inscrit via le pop-up de bienvenue         |
| `newsletter-footer`   | inscrit via le formulaire du footer        |
| `phone-optin`         | inscription par numéro de téléphone (pop-up) |

Filtrer sur `newsletter-popup` ou `newsletter-footer` permet de comparer ce
que rapporte chaque emplacement ; filtrer sur `phone-optin` isole les numéros
de téléphone des e-mails.

## Enregistrer la vue une fois pour toutes

Après avoir appliqué le filtre `newsletter`, cliquer sur **Enregistrer comme
segment** et le nommer par exemple « Newsletter ». Il apparaît ensuite en
permanence dans **Clients → Segments** : un seul clic pour revoir la liste,
sans refaire le filtre.

## Exporter la liste

Dans **Clients**, avec le filtre appliqué : bouton **Exporter** → *Clients
correspondant à votre recherche* → **CSV**. Le fichier arrive par e-mail et
s'ouvre dans Excel ou Google Sheets.

## Envoyer un e-mail à cette liste

**Marketing** → **Créer une campagne** → *Shopify Email*, puis choisir le
segment « Newsletter » comme destinataires. Le code promo distribué par le
pop-up est `REDA15`.

## Le pop-up -15 % et Notion

Le pop-up de bienvenue propose **-15 %** (`REDA15`) en échange d'un numéro de
téléphone. Chaque numéro est enregistré dans la base Notion
**[Numéros collectés — Pop-up](https://app.notion.com/p/355905927f8b4d5992248a0ec5d03d0e)**,
dans l'espace « Reda Studio », avec quatre colonnes : **Téléphone**, **Code
promo**, **Langue** et **Date d'inscription** (remplie automatiquement par
Notion).

Ce qui se passe à la validation, entièrement côté serveur
(`app/routes/newsletter.tsx`) :

1. le numéro est normalisé (`+33612345678`) ;
2. le serveur cherche ce numéro dans la base — **s'il y est déjà, aucune
   nouvelle ligne n'est créée** (pas de doublon) et le code est simplement
   réaffiché ;
3. sinon une ligne est ajoutée ;
4. **le code n'est affiché qu'une fois Notion confirmé**. Si Notion ne répond
   pas ou refuse, le client voit un message d'erreur, jamais un faux succès ;
5. une copie part ensuite dans Shopify Admin → Clients (balises `newsletter`,
   `newsletter-popup`, `phone-optin`) et par e-mail, sans bloquer.

**Tant que Notion n'est pas branché, le pop-up ne s'affiche pas du tout** :
on ne promet pas un code qu'on ne peut pas enregistrer.

### Brancher Notion (à faire une fois)

1. **Créer l'intégration** — sur [notion.so/my-integrations](https://www.notion.so/my-integrations),
   bouton *New integration*, l'associer à l'espace qui contient la base.
   Capacités : **Read content** et **Insert content** — la lecture sert à
   détecter les doublons. Copier le **jeton secret** affiché à la fin — ne le
   communique jamais, ni ici ni ailleurs : il va directement à l'étape 3.
2. **Partager la base avec l'intégration** — ouvrir la base ci-dessus → menu
   **···** en haut à droite → **Connexions** → ajouter l'intégration créée à
   l'étape 1.
3. **Renseigner les deux variables dans Shopify Admin** — Hydrogen → ta
   storefront → **Environments** → l'environnement de production → variables
   d'environnement :

   | Variable | Valeur |
   | --- | --- |
   | `NOTION_API_KEY` | le jeton secret copié à l'étape 1 (cocher « secret ») |
   | `NOTION_PHONE_DATABASE_ID` | `355905927f8b4d5992248a0ec5d03d0e` |

   Puis redéployer. Le jeton n'est lu que par le serveur ; le navigateur ne
   reçoit qu'un oui/non indiquant si le pop-up peut s'afficher.

### Créer le code REDA15 dans Shopify (obligatoire)

Sans cette étape, le code s'affiche mais le paiement le refuse.

1. Shopify Admin → **Réductions** → **Créer une réduction** → **Montant de
   réduction sur la commande**.
2. Méthode : **Code de réduction** → `REDA15`.
3. Valeur : **Pourcentage** → `15`.
4. Utilisations : cocher **Limiter à une utilisation par client**.
5. Enregistrer, et vérifier que la réduction est **Active**.

Le bouton « appliquer à mon panier » du pop-up passe par `/discount/REDA15`,
qui ajoute le code au panier Shopify du visiteur.

### Quand le pop-up s'affiche

- Jamais pour un visiteur qui s'est déjà inscrit (cookie d'un an + stockage
  local, posés dès que Notion a confirmé).
- Fermé avec la croix, le fond ou Échap : il ne revient pas pendant **7 jours**
  (constante `DISMISS_DAYS` dans `app/components/NewsletterPopup.tsx`).

## Pourquoi pas une page « admin » sur le site ?

Une page qui listerait les e-mails devrait être publique (la boutique n'a pas
de système de connexion administrateur), ce qui exposerait le fichier clients
à n'importe quel visiteur. L'API Storefront utilisée par le site ne donne
d'ailleurs pas accès à la liste des clients — seule l'API Admin le permet, et
elle exige une clé secrète qui n'a rien à faire dans un dépôt public.
L'interface Shopify ci-dessus est l'outil prévu pour ça, et elle est déjà
protégée par le mot de passe du compte.
