import type {Locale} from './locale';

/**
 * Every string the storefront owns, in both languages.
 *
 * One flat map keyed by a dotted path. Flat rather than nested because the
 * only operation is lookup, and a flat map makes "is anything missing?" a
 * one-line check — which `npm run typecheck` now performs for us: `fr` is
 * typed as a complete record of the English keys, so a forgotten translation
 * is a build error rather than an English word on a French page.
 *
 * What is NOT here, and cannot be: product titles, product descriptions and
 * collection names. Those live in Shopify and are translated in Shopify Admin
 * (Translate & Adapt). The storefront asks for them in the right language —
 * see `shopifyLanguage` — but it cannot invent a translation the merchant has
 * not published. Same for the checkout, which is Shopify's own page.
 */

export const en = {
  // — header / nav —
  'nav.home': 'home',
  'nav.basics': 'our basics',
  'nav.drops': 'our drops',
  'nav.track': 'track my order',
  'nav.conditions': 'conditions',
  'nav.menu': 'menu',
  'nav.openMenu': 'Open menu',
  'nav.search': 'Search',
  'nav.cart': 'Cart',
  'nav.close': 'Close',
  'nav.language': 'Language',
  'nav.currency': 'Currency',
  'nav.settings': 'settings',

  // — home —
  'home.eyebrow': 'new collection',
  'home.tagline': 'designed for people with ambition.',
  'home.shopNow': 'shop now',
  'home.ourStory': 'our story',
  'home.allProducts': 'all products',
  'home.viewAll': 'view all',
  'home.basics': 'our basics',

  // — collections —
  'collections.eyebrow': 'shop',
  'collections.title': 'all collections',
  'collections.intro':
    "every piece we make, sorted. tap a collection to see what's in it.",
  'collections.empty':
    'no collections published yet. everything we have is in',
  'collections.browseAll': 'browse all products',

  // — product —
  'product.addToCart': 'add to cart',
  'product.buyNow': 'buy now',
  'product.soldOut': 'sold out',
  'product.saleBadge': 'sale',
  'product.adding': 'adding…',
  'product.inStock': 'in stock',
  'product.lowStock': 'low stock — {count} left',
  'product.taxIncluded': 'taxes included ·',
  'product.shipping': 'shipping',
  'product.calculatedAtCheckout': 'calculated at checkout.',
  'product.quantity': 'quantity',
  'product.sizeGuide': 'size guide',
  'product.description': 'description',
  'product.youMightLike': 'you might also like',
  'product.faqTitle': 'frequently asked questions',
  'product.ratedOutOf': 'rated {value} out of 5',
  'product.fromReviews': 'from {count} reviews',
  'product.perk.delivery': '48-hour delivery across france',
  'product.perk.returns': '30-day returns & exchanges',
  'product.perk.payment': 'secure payment',

  // — offer —
  'offer.heading': 'limited offer',
  'offer.ribbon': '−{percent}% on your second piece',
  'offer.takeTwo': 'take two',
  'offer.sub': 'add a second piece — any piece — and {percent}% comes off it',
  'offer.subOff': 'same aesthetic, same details',
  'offer.pick': 'pick your second piece',
  'offer.addBoth': 'add both to cart',
  'offer.noteCode':
    'works with any second piece, not just this pair. we add code {code} to your cart for you — it stays visible there, and you can type it in yourself at any time.',
  'offer.noteAuto':
    'works with any second piece, not just this pair. no code needed — the reduction applies itself in your cart and at checkout.',

  // — cart —
  'cart.title': 'cart',
  'cart.empty': 'your cart is empty.',
  'cart.continue': 'continue shopping',
  'cart.remove': 'remove',
  'cart.subtotal': 'subtotal',
  'cart.taxNote': 'taxes included · shipping calculated at checkout',
  'cart.checkout': 'proceed to checkout',
  'cart.promoCode': 'promo code',
  'cart.apply': 'ok',
  'cart.freeShippingAway': '{amount} away from free shipping',
  'cart.freeShippingUnlocked': 'free shipping unlocked ✓',
  'cart.offerApplied':
    'offer applied — {amount} off, carried through to checkout',
  'cart.offerInviteCode':
    'add a second piece and {percent}% comes off it — with code {code}, which we add for you',
  'cart.offerInviteAuto':
    'add a second piece and {percent}% comes off it, automatically',
  'cart.offerActiveCode':
    'your second piece is {percent}% off — with code {code}, which we add for you',
  'cart.offerActiveAuto': 'your second piece is {percent}% off',
  'cart.suggestTitle': 'complete your order',
  'cart.add': 'add',

  // — reviews —
  'reviews.title': 'what our customers say',
  'reviews.subtitle':
    'honest words from the reda studio community, on pieces made to last.',
  'reviews.forProduct': 'reviews for {product}',
  'reviews.verified': 'verified review',
  'reviews.ctaText': 'seen it, worn it, loved it?',
  'reviews.ctaButton': 'write a review',

  // — write a review —
  'reviewForm.title': 'write a review',
  'reviewForm.intro': 'tell us what you thought — we read every one.',
  'reviewForm.name': 'name',
  'reviewForm.email': 'email',
  'reviewForm.rating': 'rating',
  'reviewForm.product': 'product (optional)',
  'reviewForm.productPlaceholder': 'e.g. money knit — grey',
  'reviewForm.text': 'your review',
  'reviewForm.submit': 'send my review',
  'reviewForm.sending': 'sending…',
  'reviewForm.thanksTitle': 'thank you',
  'reviewForm.thanks': 'your review has been sent — we read every one.',
  'reviewForm.error': 'something went wrong, please try again.',
  'reviewForm.unavailable':
    'this form isn’t receiving submissions right now — write to us instead.',
  'reviewForm.missingFields': 'please fill in every required field.',
  'reviewForm.contactLink': 'contact page',

  // — help / faq —
  'faq.eyebrow': 'support',
  'faq.title': 'need some help?',
  'faq.shipping': 'shipping time',
  'faq.shippingBody':
    'we process and ship all orders within 1–3 business days. once dispatched from our paris studio, delivery takes 48 hours anywhere in france, with tracking on every parcel — follow yours on the',
  'faq.trackingPage': 'order tracking page',
  'faq.returns': 'returns & exchanges',
  'faq.returnsBody1':
    'returns and exchanges are accepted within 30 days of delivery, on unworn pieces in their original packaging.',
  'faq.returnsBody2':
    'refunds are issued once the returned item reaches us and has been checked. the full procedure is on our',
  'faq.returnsPage': 'returns page',
  'faq.legal': 'legal policies',
  'faq.legalBody': 'our terms are available at any time:',
  'faq.terms': 'terms of service',
  'faq.privacy': 'privacy policy',
  'faq.shippingPolicy': 'shipping policy',
  'faq.and': 'and',
  'faq.support': 'support',
  'faq.supportBody':
    'a question about sizing, an order in progress or a return? write to us from the',
  'faq.contactPage': 'contact page',
  'faq.supportBodyEnd': 'and we will reply within 24 working hours.',

  // — newsletter / popup —
  'news.title': 'newsletter',
  'news.pitch1': 'sign up for early access to new drops.',
  'news.pitch2': '−10% off your first order.',
  'news.firstName': 'first name (optional)',
  'news.firstNameLabel': 'first name',
  'news.placeholder': 'email',
  'news.emailLabel': 'email',
  'news.subscribe': 'sign up',
  'news.thanks': 'thank you — you’re in.',
  'news.error': 'something went wrong, please try again.',
  'popup.title': '-10% off your first order',
  'popup.text':
    'leave your phone number and your promo code appears right after. quick and simple.',
  'popup.cta': 'get my -10% now',
  'popup.fineprint': 'exclusive offers by SMS only. unsubscribe anytime, reply STOP.',
  'popup.phonePlaceholder': 'phone number',
  'popup.phoneLabel': 'phone number',
  'popup.invalidPhone': 'please enter a valid phone number.',
  'popup.codeLabel': 'your promo code',
  'popup.codeHint': 'valid on your next order.',

  // — footer —
  'footer.blurb':
    'an independent streetwear house — premium, minimalist pieces made to last. fast delivery across france.',
  'footer.info': 'informations',
  'footer.policies': 'shipping & policies',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.shipping': 'shipping',
  'footer.returns': 'returns & refunds',
  'footer.terms': 'terms & conditions',
  'footer.privacy': 'privacy',
  'footer.legalNotice': 'legal notice',

  // — order tracking —
  'track.eyebrow': 'support',
  'track.title': 'order tracking',
  'track.intro':
    'Your order number is in your confirmation email — it looks like #1024. Enter it with the email you ordered with.',
  'track.orderNumber': 'order number',
  'track.email': 'email address',
  'track.submit': 'track order',
  'track.looking': 'looking…',
  'track.missingFields':
    'Please give both your order number and the email you ordered with.',
  'track.notFound':
    "We couldn't find order #{number} on this account. Check the number, or sign in with the account the order was placed on.",
  'track.emailMismatch':
    "That email doesn't match the one on order #{number}.",
  'track.gateTitle': 'one step first',
  'track.gateBody':
    "We only show order details to the person who placed the order. Confirm your email address and we'll bring you straight back here — Shopify sends you a one-time code, there is no password to remember.",
  'track.gateCta': 'confirm my email',
  'track.order': 'order',
  'track.placed': 'placed',
  'track.status': 'status',
  'track.carrier': 'carrier',
  'track.trackingNumber': 'tracking number',
  'track.shipped': 'shipped',
  'track.estimated': 'estimated delivery',
  'track.history': 'history',
  'track.parcelOf': 'parcel {index} of {total}',
  'track.pending':
    'Your order is confirmed and being prepared. A tracking number appears here as soon as it ships — one to three business days.',
  'track.statusPage': 'open the full order status page →',
  'track.helpTitle': "can't find your order?",
  'track.helpBody1':
    'Tracking becomes available once the parcel leaves us, one to three business days after you order. A freshly created tracking number can also take a few hours to activate with the carrier.',
  'track.helpBody2': "Still stuck? Write to us from the",
  'track.helpBody3': "and we'll look it up ourselves. Full delivery times are in our",
  'track.signedIn': "You're signed in — all your orders are in",
  'track.yourAccount': 'your account',

  // — legal —
  'legal.eyebrow': 'legal',
  'legal.documents': 'documents',
  'legal.updated': 'last updated —',
  'legal.question': 'A question about any of this? Write to us from the',

  'cart.decrease': 'Decrease quantity',
  'cart.increase': 'Increase quantity',
  'size.available': 'available',
  'size.soldOut': 'sold out',
  'size.note1':
    'our pieces fit true to size. if you fall between two sizes, take the larger one for a looser wear. not sure?',
  'size.writeToUs': 'write to us',
  'size.note2': 'before ordering — we reply within 24 hours.',
  'vision.title': 'the reda studio vision',
  'vision.ambition': 'ambition',
  'vision.ambitionBody':
    'A new generation driven by ambition and the will to build a future of its own.',
  'vision.identity': 'identity',
  'vision.identityBody':
    'Distinctive pieces made for the people who refuse to go unnoticed.',
  'vision.minimalism': 'minimalism',
  'vision.minimalismBody':
    'A stripped-back aesthetic where every cut, fabric and detail serves a real purpose.',
  'vision.streetwear': 'streetwear',
  'vision.streetwearBody':
    'A contemporary take on streetwear, between elegance, character and city culture.',
  'vision.vision': 'vision',
  'vision.visionBody':
    'Reda Studio does not simply follow trends — the house builds a world of its own.',
  'vision.cta': 'discover the story behind the brand',
  'vision.intro':
    'Reda Studio builds a premium, minimalist vision of streetwear. Our pieces are made for founders, creators and anyone building something of their own: every design is shaped around ambition, identity and a refusal to overlook the detail.',

  // — errors —
  'error.oops': 'Oops',
  'error.notFound': 'This page could not be found.',
  'error.back': 'back to the shop',
} as const;

export type TranslationKey = keyof typeof en;

/**
 * The French side. Typed as a complete record of the English keys, so
 * forgetting one is a compile error.
 */
export const fr: Record<TranslationKey, string> = {
  // — en-tête / navigation —
  'nav.home': 'accueil',
  'nav.basics': 'nos basiques',
  'nav.drops': 'nos drops',
  'nav.track': 'suivre ma commande',
  'nav.conditions': 'conditions',
  'nav.menu': 'menu',
  'nav.openMenu': 'Ouvrir le menu',
  'nav.search': 'Rechercher',
  'nav.cart': 'Panier',
  'nav.close': 'Fermer',
  'nav.language': 'Langue',
  'nav.currency': 'Devise',
  'nav.settings': 'paramètres',

  // — accueil —
  'home.eyebrow': 'nouvelle collection',
  'home.tagline': 'pensé pour celles et ceux qui ont de l’ambition.',
  'home.shopNow': 'découvrir',
  'home.ourStory': 'notre histoire',
  'home.allProducts': 'tous les produits',
  'home.viewAll': 'tout voir',
  'home.basics': 'nos basiques',

  // — collections —
  'collections.eyebrow': 'boutique',
  'collections.title': 'toutes les collections',
  'collections.intro':
    'toutes nos pièces, classées. touchez une collection pour voir ce qu’elle contient.',
  'collections.empty':
    'aucune collection publiée pour l’instant. tout ce que nous avons est dans',
  'collections.browseAll': 'voir tous les produits',

  // — produit —
  'product.addToCart': 'ajouter au panier',
  'product.buyNow': 'acheter maintenant',
  'product.soldOut': 'épuisé',
  'product.saleBadge': 'promo',
  'product.adding': 'ajout…',
  'product.inStock': 'en stock',
  'product.lowStock': 'stock faible — {count} restants',
  'product.taxIncluded': 'taxes incluses ·',
  'product.shipping': 'livraison',
  'product.calculatedAtCheckout': 'calculée au paiement.',
  'product.quantity': 'quantité',
  'product.sizeGuide': 'guide des tailles',
  'product.description': 'description',
  'product.youMightLike': 'vous aimerez aussi',
  'product.faqTitle': 'questions fréquentes',
  'product.ratedOutOf': 'noté {value} sur 5',
  'product.fromReviews': 'sur {count} avis',
  'product.perk.delivery': 'livraison en 48 h partout en france',
  'product.perk.returns': 'retours & échanges sous 30 jours',
  'product.perk.payment': 'paiement sécurisé',

  // — offre —
  'offer.heading': 'offre limitée',
  'offer.ribbon': '−{percent} % sur votre deuxième pièce',
  'offer.takeTwo': 'prenez-en deux',
  'offer.sub':
    'ajoutez une deuxième pièce — celle que vous voulez — et {percent} % en sont déduits',
  'offer.subOff': 'même esthétique, mêmes finitions',
  'offer.pick': 'choisissez votre deuxième pièce',
  'offer.addBoth': 'ajouter les deux au panier',
  'offer.noteCode':
    'valable avec n’importe quelle deuxième pièce, pas seulement ce duo. nous ajoutons le code {code} à votre panier — il y reste visible, et vous pouvez le saisir vous-même à tout moment.',
  'offer.noteAuto':
    'valable avec n’importe quelle deuxième pièce, pas seulement ce duo. aucun code à saisir — la réduction s’applique seule dans votre panier et au paiement.',

  // — panier —
  'cart.title': 'panier',
  'cart.empty': 'votre panier est vide.',
  'cart.continue': 'continuer mes achats',
  'cart.remove': 'retirer',
  'cart.subtotal': 'sous-total',
  'cart.taxNote': 'taxes incluses · livraison calculée au paiement',
  'cart.checkout': 'passer au paiement',
  'cart.promoCode': 'code promo',
  'cart.apply': 'ok',
  'cart.freeShippingAway': 'plus que {amount} pour la livraison offerte',
  'cart.freeShippingUnlocked': 'livraison offerte ✓',
  'cart.offerApplied':
    'offre appliquée — {amount} de réduction, conservée jusqu’au paiement',
  'cart.offerInviteCode':
    'ajoutez une deuxième pièce et {percent} % en sont déduits — avec le code {code}, que nous ajoutons pour vous',
  'cart.offerInviteAuto':
    'ajoutez une deuxième pièce et {percent} % en sont déduits, automatiquement',
  'cart.offerActiveCode':
    'votre deuxième pièce est à −{percent} % — avec le code {code}, que nous ajoutons pour vous',
  'cart.offerActiveAuto': 'votre deuxième pièce est à −{percent} %',
  'cart.suggestTitle': 'complétez votre commande',
  'cart.add': 'ajouter',

  // — avis —
  'reviews.title': 'ce que disent nos clients',
  'reviews.subtitle':
    'des mots sincères de la communauté reda studio, sur des pièces faites pour durer.',
  'reviews.forProduct': 'avis sur {product}',
  'reviews.verified': 'avis vérifié',
  'reviews.ctaText': 'vous l’avez porté ?',
  'reviews.ctaButton': 'laisser un avis',

  // — laisser un avis —
  'reviewForm.title': 'laisser un avis',
  'reviewForm.intro': 'dites-nous ce que vous en avez pensé — on lit chaque avis.',
  'reviewForm.name': 'nom',
  'reviewForm.email': 'e-mail',
  'reviewForm.rating': 'note',
  'reviewForm.product': 'produit (facultatif)',
  'reviewForm.productPlaceholder': 'ex. money knit — grey',
  'reviewForm.text': 'votre avis',
  'reviewForm.submit': 'envoyer mon avis',
  'reviewForm.sending': 'envoi…',
  'reviewForm.thanksTitle': 'merci',
  'reviewForm.thanks': 'votre avis a bien été envoyé — nous lisons chacun d’entre eux.',
  'reviewForm.error': 'une erreur est survenue, réessayez.',
  'reviewForm.unavailable':
    'ce formulaire ne reçoit pas encore de réponses — écrivez-nous plutôt.',
  'reviewForm.missingFields': 'merci de remplir tous les champs requis.',
  'reviewForm.contactLink': 'page contact',

  // — aide / faq —
  'faq.eyebrow': 'assistance',
  'faq.title': 'besoin d’aide ?',
  'faq.shipping': 'délai de livraison',
  'faq.shippingBody':
    'nous préparons et expédions toutes les commandes sous 1 à 3 jours ouvrés. une fois partie de notre studio parisien, la livraison prend 48 h partout en france, avec un suivi sur chaque colis — suivez le vôtre sur la',
  'faq.trackingPage': 'page de suivi de commande',
  'faq.returns': 'retours & échanges',
  'faq.returnsBody1':
    'les retours et échanges sont acceptés sous 30 jours après réception, sur des pièces non portées dans leur emballage d’origine.',
  'faq.returnsBody2':
    'le remboursement intervient dès que l’article nous parvient et a été vérifié. la procédure complète est sur notre',
  'faq.returnsPage': 'page retours',
  'faq.legal': 'mentions et conditions',
  'faq.legalBody': 'nos conditions sont consultables à tout moment :',
  'faq.terms': 'conditions générales',
  'faq.privacy': 'politique de confidentialité',
  'faq.shippingPolicy': 'politique d’expédition',
  'faq.and': 'et',
  'faq.support': 'assistance',
  'faq.supportBody':
    'une question sur une taille, une commande en cours ou un retour ? écrivez-nous depuis la',
  'faq.contactPage': 'page contact',
  'faq.supportBodyEnd': 'et nous répondons sous 24 h ouvrées.',

  // — newsletter / pop-up —
  'news.title': 'newsletter',
  'news.pitch1': 'inscrivez-vous pour un accès anticipé aux nouveaux drops.',
  'news.pitch2': '−10 % sur votre première commande.',
  'news.firstName': 'prénom (facultatif)',
  'news.firstNameLabel': 'prénom',
  'news.placeholder': 'e-mail',
  'news.emailLabel': 'e-mail',
  'news.subscribe': 's’inscrire',
  'news.thanks': 'merci — vous êtes inscrit.',
  'news.error': 'une erreur est survenue, réessayez.',
  'popup.title': '-10 % sur votre première commande',
  'popup.text':
    'laissez votre numéro de téléphone et votre code promo apparaît juste après. rapide et simple.',
  'popup.cta': 'obtenir mes -10 %',
  'popup.fineprint':
    'offres exclusives par sms uniquement. désinscription à tout moment en répondant stop.',
  'popup.phonePlaceholder': 'numéro de téléphone',
  'popup.phoneLabel': 'numéro de téléphone',
  'popup.invalidPhone': 'veuillez saisir un numéro de téléphone valide.',
  'popup.codeLabel': 'votre code promo',
  'popup.codeHint': 'valable sur votre prochaine commande.',

  // — pied de page —
  'footer.blurb':
    'maison de streetwear indépendante — des pièces premium et minimalistes faites pour durer. livraison rapide partout en france.',
  'footer.info': 'informations',
  'footer.policies': 'livraison & conditions',
  'footer.faq': 'faq',
  'footer.contact': 'contact',
  'footer.shipping': 'livraison',
  'footer.returns': 'retours & remboursements',
  'footer.terms': 'conditions générales',
  'footer.privacy': 'confidentialité',
  'footer.legalNotice': 'mentions légales',

  // — suivi de commande —
  'track.eyebrow': 'assistance',
  'track.title': 'suivi de commande',
  'track.intro':
    'Votre numéro de commande figure dans votre e-mail de confirmation — il ressemble à #1024. Saisissez-le avec l’e-mail utilisé lors de la commande.',
  'track.orderNumber': 'numéro de commande',
  'track.email': 'adresse e-mail',
  'track.submit': 'suivre ma commande',
  'track.looking': 'recherche…',
  'track.missingFields':
    'Indiquez votre numéro de commande et l’e-mail utilisé lors de la commande.',
  'track.notFound':
    'Nous n’avons pas trouvé la commande #{number} sur ce compte. Vérifiez le numéro, ou connectez-vous avec le compte utilisé pour la commande.',
  'track.emailMismatch':
    'Cet e-mail ne correspond pas à celui de la commande #{number}.',
  'track.gateTitle': 'une étape d’abord',
  'track.gateBody':
    'Nous ne montrons le détail d’une commande qu’à la personne qui l’a passée. Confirmez votre adresse e-mail et nous vous ramenons directement ici — Shopify vous envoie un code à usage unique, aucun mot de passe à retenir.',
  'track.gateCta': 'confirmer mon e-mail',
  'track.order': 'commande',
  'track.placed': 'passée le',
  'track.status': 'statut',
  'track.carrier': 'transporteur',
  'track.trackingNumber': 'numéro de suivi',
  'track.shipped': 'expédiée le',
  'track.estimated': 'livraison estimée',
  'track.history': 'historique',
  'track.parcelOf': 'colis {index} sur {total}',
  'track.pending':
    'Votre commande est confirmée et en cours de préparation. Un numéro de suivi apparaît ici dès l’expédition — sous 1 à 3 jours ouvrés.',
  'track.statusPage': 'ouvrir la page de suivi complète →',
  'track.helpTitle': 'vous ne trouvez pas votre commande ?',
  'track.helpBody1':
    'Le suivi devient disponible une fois le colis parti, 1 à 3 jours ouvrés après la commande. Un numéro de suivi tout juste créé peut aussi mettre quelques heures à s’activer chez le transporteur.',
  'track.helpBody2': 'Toujours bloqué ? Écrivez-nous depuis la',
  'track.helpBody3':
    'et nous la retrouverons nous-mêmes. Les délais complets sont dans notre',
  'track.signedIn': 'Vous êtes connecté — toutes vos commandes sont dans',
  'track.yourAccount': 'votre compte',

  // — pages légales —
  'legal.eyebrow': 'mentions légales',
  'legal.documents': 'documents',
  'legal.updated': 'dernière mise à jour —',
  'legal.question':
    'Une question à ce sujet ? Écrivez-nous depuis la',

  'cart.decrease': 'Diminuer la quantité',
  'cart.increase': 'Augmenter la quantité',
  'size.available': 'disponible',
  'size.soldOut': 'épuisé',
  'size.note1':
    'nos pièces taillent normalement. si vous hésitez entre deux tailles, prenez la plus grande pour un porté plus ample. un doute ?',
  'size.writeToUs': 'écrivez-nous',
  'size.note2': 'avant de commander — nous répondons sous 24 h.',
  'vision.title': 'la vision reda studio',
  'vision.ambition': 'ambition',
  'vision.ambitionBody':
    'Une nouvelle génération portée par l’ambition et la volonté de bâtir son propre avenir.',
  'vision.identity': 'identité',
  'vision.identityBody':
    'Des pièces marquées, faites pour celles et ceux qui refusent de passer inaperçus.',
  'vision.minimalism': 'minimalisme',
  'vision.minimalismBody':
    'Une esthétique épurée où chaque coupe, chaque tissu et chaque détail a une vraie raison d’être.',
  'vision.streetwear': 'streetwear',
  'vision.streetwearBody':
    'Une lecture contemporaine du streetwear, entre élégance, caractère et culture urbaine.',
  'vision.vision': 'vision',
  'vision.visionBody':
    'Reda Studio ne suit pas les tendances — la maison construit son propre univers.',
  'vision.cta': 'découvrir l’histoire de la marque',
  'vision.intro':
    'Reda Studio construit une vision premium et minimaliste du streetwear. Nos pièces sont faites pour les fondateurs, les créateurs et celles et ceux qui bâtissent quelque chose : chaque design est pensé autour de l’ambition, de l’identité et du refus de négliger le détail.',

  // — erreurs —
  'error.oops': 'Oups',
  'error.notFound': 'Cette page est introuvable.',
  'error.back': 'retour à la boutique',
};

export const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  fr,
};
