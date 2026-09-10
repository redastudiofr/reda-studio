/**
 * The storefront's legal and service documents.
 *
 * Held here rather than in Shopify Admin's policy editor for two reasons: they
 * are versioned with the code, and Shopify has no slot at all for a French
 * *mentions légales*, which is a legal requirement for a site selling into
 * France. The Admin policies still exist and are what Shopify's own checkout
 * links to — keep the two in step (see docs/legal-pages.md).
 *
 * The Legal Notice (`legal-notice`) is written in French rather than English,
 * unlike the other four documents — "mentions légales" is a specific French
 * legal filing, not a genre that translates, and every field it names (SIREN,
 * SIRET, TVA intracommunautaire) is a French concept with no English
 * equivalent to translate it into.
 *
 * Every fact it states — the hosting, the payment provider, which cookies are
 * set, what data the site actually collects — was verified against this
 * codebase, not assumed. What could **not** be verified this way — the
 * registered company name, its legal form, its address, its SIREN/SIRET, its
 * VAT number, its phone number, who its legal representative is — is left as
 * a bracketed placeholder (`[à compléter]`) rather than guessed. The
 * renderer below gives placeholders a visibly different style specifically so
 * one can never be mistaken for real data. See docs/legal-pages.md for the
 * complete list and what replaces each one.
 */

export type LegalField = {
  label: string;
  /**
   * The real value, or a bracketed placeholder such as "[à compléter]" —
   * anything matching `/^\[.*\]$/` renders with the "still to fill in" style
   * instead of as real data. See the module doc above.
   */
  value: string;
  /** Renders `value` as a link (a mailto:, typically) when set. */
  href?: string;
};

export type LegalSection = {
  heading: string;
  /** Paragraphs. Plain strings — no markup, no HTML injection. */
  body: string[];
  /** Optional bullet list rendered after the paragraphs. */
  list?: string[];
  /** Label/value pairs — for a block that reads as a form, not prose. */
  fields?: LegalField[];
  /** An optional link/button at the end of the section. */
  cta?: {label: string; to: string};
};

export type LegalDocument = {
  handle: string;
  /** Shown in the page title and the header. */
  title: string;
  /** One line under the title. */
  intro: string;
  /** Menu label — shorter than the title. */
  navLabel: string;
  updated: string;
  sections: LegalSection[];
};

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    handle: 'terms',
    title: 'terms & conditions',
    navLabel: 'terms & conditions',
    intro:
      'The terms on which reda studio sells to you, and the rules for using this site.',
    updated: 'August 2026',
    sections: [
      {
        heading: '1. who we are',
        body: [
          `Throughout these terms, "we", "us" and "reda studio" refer to the company operating this store, and "you" refers to the person placing an order or browsing the site.`,
          `These terms apply to every order placed through this store. Placing an order means you accept them, so please read them before you buy. We may change them at any time; the version that governs your order is the one published when you place it.`,
        ],
      },
      {
        heading: '2. the products',
        body: [
          `We describe and photograph each piece as accurately as we can. Screens render colour differently, so a small variation between the photograph and the garment is normal and is not a defect.`,
          `Our pieces are produced in limited runs. Availability shown on the site is indicative: if an item sells out between your order and its preparation, we will tell you and refund that item in full.`,
        ],
      },
      {
        heading: '3. prices',
        body: [
          `Prices are shown in euros, inclusive of French VAT. Shipping is calculated at checkout and shown before you pay, so the total you confirm is the total you are charged.`,
          `We may change prices at any time. The price that applies to your order is the one displayed at the moment you confirm it.`,
          `If an item is listed at an obviously incorrect price — a decimal in the wrong place, a €10 overshirt — we may cancel the order and refund you in full rather than fulfil it. We will contact you first.`,
        ],
      },
      {
        heading: '4. placing an order',
        body: [
          `You place an order by adding items to your cart and completing checkout. Your order is an offer to buy; the contract is formed when we send you a confirmation email.`,
          `We may refuse an order where the item is unavailable, where we cannot obtain payment authorisation, where we suspect fraud, or where a resale pattern suggests the order is not for personal use.`,
        ],
      },
      {
        heading: '5. payment',
        body: [
          `Payment is taken at the time of the order, through Shopify Payments and the methods shown at checkout. Card details are handled by the payment provider and never reach our servers.`,
          `Your order is prepared once payment is confirmed.`,
        ],
      },
      {
        heading: '6. delivery',
        body: [
          `Shipping times, costs and territories are set out in our Shipping Policy, which forms part of these terms.`,
          `Risk in the goods passes to you on delivery.`,
        ],
      },
      {
        heading: '7. right of withdrawal and returns',
        body: [
          `If you are a consumer in the European Union, you have a statutory right to withdraw from your purchase within fourteen days of receiving it, without giving a reason. We extend this to thirty days as a commercial gesture.`,
          `How to exercise it, and what happens to your refund, are set out in our Return & Refund Policy, which forms part of these terms. Nothing in that policy reduces your statutory rights.`,
        ],
      },
      {
        heading: '8. legal guarantees',
        body: [
          `Beyond anything we offer commercially, you benefit from the legal guarantee of conformity (articles L.217-3 and following of the French Consumer Code) and the guarantee against hidden defects (articles 1641 and following of the Civil Code).`,
          `Under the guarantee of conformity you have two years from delivery to act, and you may choose between repair and replacement. You do not have to prove the defect existed at delivery during the first two years.`,
        ],
      },
      {
        heading: '9. intellectual property',
        body: [
          `Everything on this site — the name, the logo, the photographs, the garment designs, the texts and the code — belongs to reda studio or is used with permission. You may not copy, reproduce or reuse it commercially without our written agreement.`,
          `Buying a garment gives you the garment. It does not give you a licence to reproduce its design.`,
        ],
      },
      {
        heading: '10. your use of the site',
        body: [
          `You agree not to attempt to disrupt the site, to access data you are not entitled to, to scrape it at a scale that degrades it for others, or to use it for anything unlawful.`,
        ],
      },
      {
        heading: '11. liability',
        body: [
          `We are liable for foreseeable loss caused by our failure to meet these terms. We are not liable for loss that was not foreseeable, nor for business losses, since our products are sold for personal use.`,
          `Nothing here limits our liability for death or personal injury caused by our negligence, for fraud, or for anything that cannot lawfully be limited.`,
        ],
      },
      {
        heading: '12. complaints and disputes',
        body: [
          `Write to us first, from the contact page on this site. Most things are settled that way.`,
          `If we cannot agree, you may use the European Commission's online dispute resolution platform at ec.europa.eu/consumers/odr, or refer the matter to a consumer mediator, free of charge to you.`,
          `These terms are governed by French law. If you are a consumer, you keep the protection of the mandatory rules of the country where you live.`,
        ],
      },
    ],
  },

  {
    handle: 'shipping',
    title: 'shipping policy',
    navLabel: 'shipping',
    intro: 'How and when your order reaches you.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'processing',
        body: [
          `We process and ship all orders within one to three business days. Orders placed at the weekend or on a public holiday are prepared on the next business day.`,
          `During drops and sale periods, preparation can take slightly longer. If it does, we say so on the site rather than letting you find out from a tracking page that has not moved.`,
        ],
      },
      {
        heading: 'delivery times',
        body: [
          `Once your parcel leaves us, expect:`,
        ],
        list: [
          'France — 48 hours, tracked',
          'Belgium, Luxembourg, Germany, Spain, Italy, Netherlands — 3 to 5 business days',
          'Rest of the European Union — 4 to 7 business days',
          'Rest of the world — 7 to 14 business days',
        ],
      },
      {
        heading: 'shipping costs',
        body: [
          `Shipping is calculated at checkout from the destination and the weight of the parcel, and shown in full before you pay.`,
          `Shipping is free on orders over €150 delivered within France.`,
        ],
      },
      {
        heading: 'tracking',
        body: [
          `Every parcel is tracked. You receive a tracking number by email as soon as the label is created, and you can follow the parcel at any time from our order tracking page.`,
          `A tracking number can take a few hours to become active with the carrier. If it shows nothing at first, that is normal.`,
        ],
      },
      {
        heading: 'customs and import duties',
        body: [
          `Orders shipped outside the European Union may attract import duties and taxes on arrival. These are set by the destination country, are payable by you, and are not included in what you paid us.`,
          `We cannot declare an order as a gift or under-declare its value. We do not do it, and being asked does not change the answer.`,
        ],
      },
      {
        heading: 'wrong address, failed delivery',
        body: [
          `Please check your address before confirming. We can correct it only while the order is still being prepared — write to us immediately from the contact page.`,
          `If a parcel comes back to us because the address was wrong or nobody collected it, we will refund the items but not the original shipping, and reshipping is at your cost.`,
        ],
      },
      {
        heading: 'lost or damaged parcels',
        body: [
          `If tracking has not moved for seven business days, or the parcel arrives damaged, contact us. We open a claim with the carrier and either reship or refund you — we do not leave you to argue with the carrier yourself.`,
        ],
      },
    ],
  },

  {
    handle: 'returns',
    title: 'return & refund policy',
    navLabel: 'returns & refunds',
    intro: 'Thirty days to change your mind, and what happens next.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'the window',
        body: [
          `You have thirty days from the day you receive your order to return it. That is longer than the fourteen days EU law requires, and it does not replace your statutory rights — it adds to them.`,
        ],
      },
      {
        heading: 'condition',
        body: [
          `Pieces must come back unworn, unwashed, with their tags attached and in their original packaging. Trying something on is fine; wearing it out is not.`,
          `We reserve the right to refuse a return that arrives visibly worn, marked, or smelling of smoke or perfume, and to send it back to you.`,
        ],
      },
      {
        heading: 'what cannot be returned',
        body: [
          `For hygiene reasons, underwear and socks cannot be returned once the seal is broken. Gift cards are not refundable. Anything made or altered to your specification is not returnable.`,
        ],
      },
      {
        heading: 'how to return',
        body: [
          `Write to us from the contact page with your order number and what you are sending back. We reply with the return address and instructions within one business day.`,
          `Return shipping is at your cost unless the item is faulty or we sent the wrong one, in which case we cover it. Use a tracked service — until the parcel reaches us, it is your responsibility.`,
        ],
      },
      {
        heading: 'refunds',
        body: [
          `We inspect the return and refund you within fourteen days of receiving it, to the payment method you used. Your bank may take a few more days to show it.`,
          `We refund the price of the items and the standard outbound shipping. If you chose an express option, we refund the standard rate, not the difference.`,
          `Where an order was discounted as a set — the cap offer, for instance — returning part of it removes the discount from the part you keep, and the refund is adjusted accordingly.`,
        ],
      },
      {
        heading: 'exchanges',
        body: [
          `The fastest route is to return the item for a refund and place a new order for the size or colour you want. It avoids your size selling out while a parcel is in transit.`,
          `If you would rather we handled the exchange directly, ask and we will, subject to stock.`,
        ],
      },
      {
        heading: 'faulty items',
        body: [
          `If something arrives faulty or is not what you ordered, tell us within a reasonable time and send a photograph. We cover return shipping and either replace the item or refund you in full, as you prefer.`,
          `This is on top of the legal guarantee of conformity and the guarantee against hidden defects described in our terms.`,
        ],
      },
    ],
  },

  {
    handle: 'privacy',
    title: 'privacy policy',
    navLabel: 'privacy',
    intro: 'What we collect, why, and what you can ask us to do about it.',
    updated: 'August 2026',
    sections: [
      {
        heading: 'who is responsible',
        body: [
          `The company operating this store is the data controller for the personal data collected through it — see our Legal Notice for its full registered identity. For any question about your data, write to us from the contact page and we will answer.`,
        ],
      },
      {
        heading: 'what we collect',
        body: [`We collect only what an order or a request actually needs:`],
        list: [
          'Identity and contact details — name, email, postal address, phone number',
          'Order details — what you bought, when, for how much, and where it was sent',
          'Payment confirmation — never the card number itself, which stays with our payment provider',
          'Newsletter subscription, if you asked for it',
          'Technical data — IP address, browser, pages visited, through our analytics',
        ],
      },
      {
        heading: 'why we use it, and on what legal basis',
        body: [
          `To fulfil your order and provide support: because we have a contract with you.`,
          `To send you marketing emails: because you consented, and only until you withdraw it.`,
          `To keep accounting and invoicing records: because the law requires it.`,
          `To secure the site and understand how it is used: because we have a legitimate interest in it working and not being abused.`,
        ],
      },
      {
        heading: 'who sees it',
        body: [
          `Our processors, and nobody else. Shopify hosts the store and processes orders; our payment provider handles payment; our carriers deliver the parcel; our email provider sends the newsletter.`,
          `We do not sell your data. We do not rent it. We do not trade it for reach.`,
          `Some of these providers operate outside the European Union. Where they do, transfers are covered by the European Commission's standard contractual clauses.`,
        ],
      },
      {
        heading: 'how long we keep it',
        body: [
          `Order and invoice data: ten years, as French commercial law requires.`,
          `Customer account data: for as long as the account is open, then three years after your last contact with us.`,
          `Newsletter data: until you unsubscribe, then we delete it.`,
          `Analytics data: thirteen months.`,
        ],
      },
      {
        heading: 'your rights',
        body: [
          `Under the GDPR you can ask us to give you a copy of your data, correct it, delete it, restrict what we do with it, or send it to another provider. You can object to processing based on legitimate interest, and withdraw consent for marketing at any time — every email has an unsubscribe link.`,
          `Write to us from the contact page. We answer within one month. If you are not satisfied, you can complain to the CNIL at cnil.fr.`,
        ],
      },
      {
        heading: 'cookies',
        body: [
          `We use cookies that are strictly necessary for the site to work — your cart, your session and your language preference. We also use Shopify's own built-in analytics to understand visits and orders on this store; we do not use any third-party advertising pixel (Meta, TikTok, Google Ads or similar). You can block cookies from your browser settings at any time, though this may affect the cart.`,
          `The newsletter pop-up records that it has been shown, in your browser only. That record never leaves your device and tells us nothing about you.`,
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
    updated: 'August 2026',
    sections: [
      {
        heading: 'éditeur du site',
        body: [`Le présent site est édité par :`],
        fields: [
          {label: 'Nom / raison sociale', value: 'Reda Studio'},
          {label: 'Nom commercial', value: 'Reda Studio'},
          {label: 'Forme juridique', value: '[à compléter]'},
          {label: 'Siège social', value: '[à compléter]'},
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
          {label: 'Directeur de la publication', value: '[à compléter]'},
          {
            label: 'Contact',
            value: 'redastudio.fr@gmail.com',
            href: 'mailto:redastudio.fr@gmail.com',
          },
          {
            label: 'Téléphone',
            value: '06 50 39 83 11',
            href: 'tel:+33650398311',
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
            value: '06 50 39 83 11',
            href: 'tel:+33650398311',
          },
          {label: 'Adresse', value: '[à compléter]'},
        ],
        cta: {label: 'écrire depuis la page contact', to: '/contact'},
      },
    ],
  },
];

/** Lookup by URL handle. */
export function findLegalDocument(handle?: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((document) => document.handle === handle);
}
