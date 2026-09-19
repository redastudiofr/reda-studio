import type {LegalDocument} from './legal';

/**
 * The French versions of the store's legal and service documents.
 *
 * Same five documents as the English set in ./legal.ts, same handles, same
 * order — the site simply serves the set matching the chosen language. They
 * live in their own file because legal prose is written, not interpolated:
 * translating fragment by fragment through the dictionary would have made
 * every sentence unreadable in both languages at once.
 *
 * For a shop selling from France to French consumers, this is the version
 * that governs: the mentions légales are a French legal filing, and the terms
 * of sale a French customer agrees to should be the ones they can actually
 * read.
 */
export const LEGAL_DOCUMENTS_FR: LegalDocument[] = [
  {
    handle: 'terms',
    title: 'conditions générales de vente',
    navLabel: 'conditions générales',
    intro:
      'Les conditions dans lesquelles reda studio vous vend ses pièces, et les règles d’utilisation de ce site.',
    updated: 'août 2026',
    sections: [
      {
        heading: '1. qui nous sommes',
        body: [
          `Dans les présentes conditions, « nous » et « reda studio » désignent la société qui exploite cette boutique, et « vous » désigne la personne qui passe commande ou consulte le site.`,
          `Ces conditions s’appliquent à toute commande passée sur cette boutique. Passer commande vaut acceptation : merci de les lire avant d’acheter. Nous pouvons les modifier à tout moment ; la version applicable à votre commande est celle publiée au moment où vous la passez.`,
        ],
      },
      {
        heading: '2. les produits',
        body: [
          `Nous décrivons et photographions chaque pièce avec le plus de fidélité possible. Les écrans restituent les couleurs différemment : une légère variation entre la photo et le vêtement est normale et ne constitue pas un défaut.`,
          `Nos pièces sont produites en séries limitées. La disponibilité affichée sur le site est indicative : si un article est épuisé entre votre commande et sa préparation, nous vous prévenons et vous remboursons intégralement cet article.`,
        ],
      },
      {
        heading: '3. les prix',
        body: [
          `Les prix sont affichés en euros, toutes taxes comprises (TVA française). Les frais de livraison sont calculés au moment du paiement et affichés avant validation : le total que vous confirmez est le total qui vous est débité.`,
          `Nous pouvons modifier nos prix à tout moment. Le prix applicable à votre commande est celui affiché au moment où vous la confirmez.`,
          `Si un article est affiché à un prix manifestement erroné — une virgule mal placée, une surchemise à 10 € — nous pouvons annuler la commande et vous rembourser intégralement plutôt que de l’honorer. Nous vous contactons au préalable.`,
        ],
      },
      {
        heading: '4. passer commande',
        body: [
          `Vous passez commande en ajoutant des articles au panier puis en validant le paiement. Votre commande constitue une offre d’achat ; le contrat est formé lorsque nous vous envoyons l’e-mail de confirmation.`,
          `Nous pouvons refuser une commande si l’article n’est pas disponible, si l’autorisation de paiement ne peut être obtenue, en cas de soupçon de fraude, ou lorsque le comportement d’achat indique une revente plutôt qu’un usage personnel.`,
        ],
      },
      {
        heading: '5. paiement',
        body: [
          `Le paiement est encaissé au moment de la commande, via Shopify Payments et les moyens affichés lors du règlement. Les données de carte bancaire sont traitées par le prestataire de paiement et n’atteignent jamais nos serveurs.`,
          `Votre commande est préparée dès confirmation du paiement.`,
        ],
      },
      {
        heading: '6. livraison',
        body: [
          `Les délais, les frais et les zones de livraison figurent dans notre politique de livraison, qui fait partie intégrante des présentes conditions.`,
          `Le transfert des risques sur les marchandises s’opère à la livraison.`,
        ],
      },
      {
        heading: '7. droit de rétractation et retours',
        body: [
          `Si vous êtes consommateur dans l’Union européenne, vous disposez d’un droit légal de rétractation de quatorze jours à compter de la réception, sans avoir à motiver votre décision. Nous le portons commercialement à trente jours.`,
          `Les modalités d’exercice et le déroulement du remboursement figurent dans notre politique de retours et remboursements, qui fait partie intégrante des présentes conditions. Rien dans cette politique ne réduit vos droits légaux.`,
        ],
      },
      {
        heading: '8. garanties légales',
        body: [
          `Indépendamment de nos engagements commerciaux, vous bénéficiez de la garantie légale de conformité (articles L.217-3 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).`,
          `Au titre de la garantie de conformité, vous disposez de deux ans à compter de la délivrance pour agir et vous pouvez choisir entre la réparation et le remplacement. Vous n’avez pas à prouver l’existence du défaut au moment de la délivrance pendant ces deux années.`,
        ],
      },
      {
        heading: '9. propriété intellectuelle',
        body: [
          `L’ensemble des éléments de ce site — le nom, le logo, les photographies, les créations, les textes et le code — appartient à reda studio ou est utilisé avec autorisation. Vous ne pouvez ni les copier, ni les reproduire, ni les exploiter commercialement sans notre accord écrit.`,
          `Acheter un vêtement vous donne le vêtement. Cela ne vous accorde aucune licence pour en reproduire la création.`,
        ],
      },
      {
        heading: '10. utilisation du site',
        body: [
          `Vous vous engagez à ne pas perturber le fonctionnement du site, à ne pas accéder à des données auxquelles vous n’avez pas droit, à ne pas l’aspirer à un rythme qui le dégraderait pour les autres, et à ne pas l’utiliser à des fins illicites.`,
        ],
      },
      {
        heading: '11. responsabilité',
        body: [
          `Nous répondons des dommages prévisibles résultant d’un manquement à ces conditions. Nous ne répondons pas des dommages imprévisibles, ni des pertes d’exploitation : nos produits sont vendus pour un usage personnel.`,
          `Rien ici ne limite notre responsabilité en cas de dommage corporel causé par notre négligence, de fraude, ou dans tous les cas où la loi interdit une telle limitation.`,
        ],
      },
      {
        heading: '12. réclamations et litiges',
        body: [
          `Écrivez-nous d’abord depuis la page contact de ce site. La plupart des situations se règlent ainsi.`,
          `À défaut d’accord, vous pouvez recourir à la plateforme européenne de résolution des litiges en ligne (ec.europa.eu/consumers/odr) ou saisir gratuitement un médiateur de la consommation.`,
          `Les présentes conditions sont soumises au droit français. Si vous êtes consommateur, vous conservez le bénéfice des dispositions impératives du pays où vous résidez.`,
        ],
      },
    ],
  },

  {
    handle: 'shipping',
    title: 'politique de livraison',
    navLabel: 'livraison',
    intro: 'Comment et quand votre commande vous parvient.',
    updated: 'août 2026',
    sections: [
      {
        heading: 'préparation',
        body: [
          `Nous préparons et expédions toutes les commandes sous un à trois jours ouvrés. Les commandes passées le week-end ou un jour férié sont préparées le jour ouvré suivant.`,
          `Pendant les drops et les périodes de soldes, la préparation peut prendre un peu plus de temps. Le cas échéant, nous l’indiquons sur le site plutôt que de vous laisser le découvrir devant un suivi qui n’avance pas.`,
        ],
      },
      {
        heading: 'délais de livraison',
        body: [`Une fois le colis parti, comptez :`],
        list: [
          'France — 48 heures, avec suivi',
          'Belgique, Luxembourg, Allemagne, Espagne, Italie, Pays-Bas — 3 à 5 jours ouvrés',
          'Reste de l’Union européenne — 4 à 7 jours ouvrés',
          'Reste du monde — 7 à 14 jours ouvrés',
        ],
      },
      {
        heading: 'frais de livraison',
        body: [
          `Les frais sont calculés au moment du paiement, selon la destination et le poids du colis, et affichés intégralement avant le règlement.`,
          `La livraison est offerte à partir de 150 € d’achat pour les commandes livrées en France.`,
        ],
      },
      {
        heading: 'suivi',
        body: [
          `Chaque colis est suivi. Vous recevez un numéro de suivi par e-mail dès la création de l’étiquette, et vous pouvez suivre le colis à tout moment depuis notre page de suivi de commande.`,
          `Un numéro de suivi peut mettre quelques heures à s’activer chez le transporteur. S’il n’affiche rien au début, c’est normal.`,
        ],
      },
      {
        heading: 'douane et droits d’importation',
        body: [
          `Les commandes expédiées hors de l’Union européenne peuvent donner lieu à des droits et taxes à l’arrivée. Ils sont fixés par le pays de destination, restent à votre charge et ne sont pas inclus dans ce que vous nous avez payé.`,
          `Nous ne pouvons pas déclarer une commande comme cadeau ni en sous-évaluer le montant. Nous ne le faisons pas, et le demander ne change pas la réponse.`,
        ],
      },
      {
        heading: 'adresse erronée, livraison non aboutie',
        body: [
          `Merci de vérifier votre adresse avant de valider. Nous ne pouvons la corriger que tant que la commande est en préparation — écrivez-nous immédiatement depuis la page contact.`,
          `Si un colis nous revient parce que l’adresse était erronée ou qu’il n’a pas été retiré, nous remboursons les articles mais pas les frais d’envoi initiaux, et la réexpédition est à votre charge.`,
        ],
      },
      {
        heading: 'colis perdu ou endommagé',
        body: [
          `Si le suivi n’a pas bougé depuis sept jours ouvrés, ou si le colis arrive endommagé, contactez-nous. Nous ouvrons une réclamation auprès du transporteur et procédons soit à une réexpédition, soit à un remboursement — nous ne vous laissons pas discuter seul avec le transporteur.`,
        ],
      },
    ],
  },

  {
    handle: 'returns',
    title: 'retours et remboursements',
    navLabel: 'retours et remboursements',
    intro: 'Trente jours pour changer d’avis, et ce qui se passe ensuite.',
    updated: 'août 2026',
    sections: [
      {
        heading: 'le délai',
        body: [
          `Vous disposez de trente jours à compter de la réception de votre commande pour la retourner. C’est plus que les quatorze jours prévus par le droit européen, et cela ne remplace pas vos droits légaux : cela s’y ajoute.`,
        ],
      },
      {
        heading: 'état des articles',
        body: [
          `Les pièces doivent nous revenir non portées, non lavées, étiquettes attachées et dans leur emballage d’origine. Essayer une pièce ne pose aucun problème ; la porter à l’extérieur, si.`,
          `Nous nous réservons le droit de refuser un retour qui nous parvient visiblement porté, taché, ou imprégné d’odeur de tabac ou de parfum, et de vous le renvoyer.`,
        ],
      },
      {
        heading: 'ce qui ne peut pas être retourné',
        body: [
          `Pour des raisons d’hygiène, les sous-vêtements et les chaussettes ne peuvent pas être retournés une fois l’emballage ouvert. Les cartes cadeaux ne sont pas remboursables. Toute pièce fabriquée ou retouchée à votre demande n’est pas reprise.`,
        ],
      },
      {
        heading: 'comment retourner',
        body: [
          `Écrivez-nous depuis la page contact en indiquant votre numéro de commande et ce que vous renvoyez. Nous répondons sous un jour ouvré avec l’adresse de retour et la marche à suivre.`,
          `Les frais de retour sont à votre charge, sauf si l’article est défectueux ou si nous nous sommes trompés, auquel cas nous les prenons en charge. Utilisez un envoi suivi : jusqu’à réception, le colis reste sous votre responsabilité.`,
        ],
      },
      {
        heading: 'remboursements',
        body: [
          `Nous contrôlons le retour et vous remboursons dans les quatorze jours suivant sa réception, sur le moyen de paiement utilisé. Votre banque peut mettre quelques jours de plus à l’afficher.`,
          `Nous remboursons le prix des articles ainsi que les frais d’envoi standard. Si vous aviez choisi une option express, nous remboursons le tarif standard, pas la différence.`,
          `Lorsqu’une commande a bénéficié d’une remise liée à un ensemble — l’offre casquette, par exemple — retourner une partie de l’ensemble supprime la remise sur ce que vous gardez, et le remboursement est ajusté en conséquence.`,
        ],
      },
      {
        heading: 'échanges',
        body: [
          `Le plus rapide est de retourner l’article pour remboursement et de passer une nouvelle commande dans la taille ou la couleur souhaitée. Cela évite que votre taille parte pendant qu’un colis voyage.`,
          `Si vous préférez que nous gérions l’échange directement, demandez-le : nous le ferons, dans la limite des stocks.`,
        ],
      },
      {
        heading: 'articles défectueux',
        body: [
          `Si une pièce arrive défectueuse ou ne correspond pas à votre commande, signalez-le dans un délai raisonnable en joignant une photo. Nous prenons en charge les frais de retour et procédons, à votre choix, au remplacement ou au remboursement intégral.`,
          `Cela s’ajoute à la garantie légale de conformité et à la garantie contre les vices cachés décrites dans nos conditions générales.`,
        ],
      },
    ],
  },

  {
    handle: 'privacy',
    title: 'politique de confidentialité',
    navLabel: 'confidentialité',
    intro:
      'Ce que nous collectons, pourquoi, et ce que vous pouvez nous demander à ce sujet.',
    updated: 'août 2026',
    sections: [
      {
        heading: 'qui est responsable',
        body: [
          `La société qui exploite cette boutique est responsable du traitement des données personnelles collectées via ce site — son identité complète figure dans nos mentions légales. Pour toute question sur vos données, écrivez-nous depuis la page contact : nous vous répondrons.`,
        ],
      },
      {
        heading: 'ce que nous collectons',
        body: [
          `Nous ne collectons que ce qu’une commande ou une demande nécessite réellement :`,
        ],
        list: [
          'identité et coordonnées — nom, e-mail, adresse postale, numéro de téléphone',
          'détails de commande — ce que vous avez acheté, quand, à quel prix et où cela a été expédié',
          'confirmation de paiement — jamais le numéro de carte, qui reste chez notre prestataire de paiement',
          'inscription à la newsletter, si vous l’avez demandée',
          'données techniques — adresse IP, navigateur, pages consultées, via notre outil de mesure d’audience',
        ],
      },
      {
        heading: 'pourquoi, et sur quelle base légale',
        body: [
          `Pour exécuter votre commande et assurer le service client : parce qu’un contrat nous lie.`,
          `Pour vous envoyer des e-mails commerciaux : parce que vous y avez consenti, et jusqu’à ce que vous le retiriez.`,
          `Pour tenir notre comptabilité et nos factures : parce que la loi l’exige.`,
          `Pour sécuriser le site et comprendre son utilisation : parce que nous avons un intérêt légitime à ce qu’il fonctionne et ne soit pas détourné.`,
        ],
      },
      {
        heading: 'qui y a accès',
        body: [
          `Nos sous-traitants, et personne d’autre. Shopify héberge la boutique et traite les commandes ; notre prestataire de paiement gère les règlements ; nos transporteurs livrent les colis ; notre prestataire d’e-mailing envoie la newsletter.`,
          `Nous ne vendons pas vos données. Nous ne les louons pas. Nous ne les échangeons pas contre de la visibilité.`,
          `Certains de ces prestataires opèrent hors de l’Union européenne. Dans ce cas, les transferts sont encadrés par les clauses contractuelles types de la Commission européenne.`,
        ],
      },
      {
        heading: 'durées de conservation',
        body: [
          `Commandes et factures : dix ans, comme l’exige le droit commercial français.`,
          `Données de compte client : tant que le compte est ouvert, puis trois ans après votre dernier contact avec nous.`,
          `Données de newsletter : jusqu’à votre désinscription, puis suppression.`,
          `Données de mesure d’audience : treize mois.`,
        ],
      },
      {
        heading: 'vos droits',
        body: [
          `Le RGPD vous permet de demander une copie de vos données, leur rectification, leur effacement, la limitation de leur traitement ou leur portabilité vers un autre prestataire. Vous pouvez vous opposer à un traitement fondé sur l’intérêt légitime et retirer à tout moment votre consentement aux communications commerciales — chaque e-mail comporte un lien de désinscription.`,
          `Écrivez-nous depuis la page contact. Nous répondons sous un mois. Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL (cnil.fr).`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `Nous utilisons des cookies strictement nécessaires au fonctionnement du site — votre panier, votre session et votre préférence de langue. Nous utilisons également l’outil de mesure d’audience intégré de Shopify pour comprendre les visites et les commandes de cette boutique ; aucun pixel publicitaire tiers (Meta, TikTok, Google Ads ou équivalent) n’est utilisé. Vous pouvez bloquer les cookies depuis les réglages de votre navigateur à tout moment, au risque d’affecter le panier.`,
          `Le pop-up newsletter enregistre le fait d’avoir été affiché, dans votre navigateur uniquement. Cet enregistrement ne quitte jamais votre appareil et ne nous apprend rien sur vous.`,
        ],
      },
    ],
  },

  {
    handle: 'legal-notice',
    title: 'mentions légales',
    navLabel: 'mentions légales',
    intro:
      "L'éditeur du site, l'hébergement, le paiement, la propriété intellectuelle et les données personnelles.",
    updated: 'août 2026',
    sections: [
      {
        heading: 'éditeur du site',
        body: [`Le présent site est édité par :`],
        fields: [
          {label: 'Nom / raison sociale', value: 'Reda Studio'},
          {label: 'Nom commercial', value: 'Reda Studio'},
          {label: 'Forme juridique', value: 'Micro-entreprise'},
          {label: 'Siège social', value: '52 Rue Rémy Dumoncel'},
          {label: 'SIREN', value: '583 741 926'},
          {label: 'SIRET', value: '583 741 926 00047'},
          {
            label: 'Numéro de TVA intracommunautaire',
            value: 'FR 74 583741926',
          },
          {
            label: 'Représentants légaux',
            value: 'Alex Salvatico et Antoine Dubosque',
          },
          {
            label: 'Contact',
            value: 'redastudio.fr@gmail.com',
            href: 'mailto:redastudio.fr@gmail.com',
          },
          {
            label: 'Téléphone',
            value: '06 50 39 83 10',
            href: 'tel:+33650398310',
          },
        ],
      },
      {
        heading: 'hébergement',
        body: [
          `Ce site est hébergé sur Shopify Oxygen, l'infrastructure d'hébergement fournie par Shopify International Limited, Victoria Buildings, 1–2 Haddington Road, Dublin 4, D04 XN32, Irlande.`,
          `La plateforme de commerce en ligne — prise de commande, paiement et gestion des expéditions — est fournie par Shopify Inc. et ses filiales.`,
        ],
      },
      {
        heading: 'paiement',
        body: [
          `Les paiements effectués sur ce site sont traités de manière sécurisée par Shopify Payments. Reda Studio ne stocke ni ne traite directement les données de carte bancaire : elles sont transmises directement à ce prestataire de paiement.`,
        ],
      },
      {
        heading: 'propriété intellectuelle',
        body: [
          `L'ensemble des éléments présents sur le site Reda Studio, notamment les textes, photographies, images, logos, graphismes, icônes, éléments visuels, produits et mise en page, est protégé par les dispositions applicables en matière de propriété intellectuelle.`,
          `Toute reproduction, représentation, modification, adaptation ou exploitation, totale ou partielle, de ces éléments sans autorisation préalable est interdite, sauf dans les cas prévus par la loi.`,
        ],
      },
      {
        heading: 'données personnelles',
        body: [
          `Dans le cadre du fonctionnement du site, Reda Studio est amené à collecter et traiter certaines données personnelles, uniquement dans les cas suivants :`,
        ],
        list: [
          'commandes et livraison — nom, adresse, e-mail et téléphone, transmis à notre transporteur pour l’expédition',
          'paiement — traité directement par Shopify Payments ; Reda Studio n’accède à aucune donnée bancaire',
          'service client et avis clients — informations transmises via la page contact ou le formulaire d’avis, pour répondre à une demande ou publier un retour d’expérience',
          'newsletter et offres — e-mail ou numéro de téléphone laissés volontairement, pour l’envoi d’offres commerciales, uniquement avec le consentement de la personne concernée',
          'sécurité — données techniques nécessaires au bon fonctionnement du site et à la prévention des abus',
        ],
      },
      {
        heading: 'données personnelles — vos droits',
        body: [
          `Ces données sont conservées le temps nécessaire à ces finalités, dans le respect du Règlement Général sur la Protection des Données (RGPD). Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données, ainsi que du droit de retirer à tout moment votre consentement aux communications marketing.`,
          `Le détail complet — ce qui est collecté, pourquoi, combien de temps et avec qui c'est partagé — figure dans notre Politique de confidentialité. Pour exercer ces droits, écrivez-nous à redastudio.fr@gmail.com ou depuis la page contact.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `Ce site utilise des cookies strictement nécessaires à son fonctionnement — panier, session de navigation et préférence de langue — qui ne nécessitent pas de consentement.`,
          `Il utilise également l'outil de mesure d'audience natif fourni par Shopify, pour nos propres statistiques de visites et de commandes. Aucun pixel publicitaire tiers (Meta, TikTok, Google Ads ou équivalent) n'est utilisé à ce jour.`,
          `Vous pouvez configurer votre navigateur pour refuser les cookies à tout moment ; certaines fonctionnalités, notamment le panier, peuvent alors ne plus fonctionner correctement.`,
        ],
      },
      {
        heading: 'responsabilité',
        body: [
          `Reda Studio s'efforce de maintenir les informations présentes sur ce site aussi exactes et à jour que possible. Ces informations — notamment les produits, les prix et les délais — peuvent néanmoins évoluer sans préavis.`,
          `Reda Studio ne saurait être tenu responsable des interruptions temporaires du site liées à la maintenance, à des causes techniques ou à des événements indépendants de sa volonté.`,
        ],
      },
      {
        heading: 'médiation et résolution des litiges en ligne',
        body: [
          `Conformément à l'article L.612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en cas de litige. La Commission européenne met également à disposition une plateforme de résolution des litiges en ligne, accessible à l'adresse ec.europa.eu/consumers/odr.`,
        ],
      },
      {
        heading: 'nous contacter',
        body: [`Une question sur ces mentions, une commande ou vos données ?`],
        fields: [
          {
            label: 'Email',
            value: 'redastudio.fr@gmail.com',
            href: 'mailto:redastudio.fr@gmail.com',
          },
          {
            label: 'Téléphone',
            value: '06 50 39 83 10',
            href: 'tel:+33650398310',
          },
          {label: 'Adresse', value: '52 Rue Rémy Dumoncel'},
        ],
        cta: {label: 'écrire depuis la page contact', to: '/contact'},
      },
    ],
  },
];
