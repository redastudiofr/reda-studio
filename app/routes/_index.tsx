import {Link} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import type {Route} from './+types/_index';
import {AnimatedHero} from '~/components/AnimatedHero';
import {CommunityV2} from '~/components/CommunityV2';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {MAIN_PRODUCT_PATH} from '~/lib/visibleProducts';
import {useT} from '~/lib/i18n';

/*
 * Nouvelle version : l'accueil n'a plus de slider de collections, plus de
 * grille « tous les produits », plus de vitrines de collections (automne
 * drop, summer, best seller) ni leurs bannières. Il montre la bannière, la
 * pièce en photo portée avec ses détails, le bloc communauté repris de
 * Hustle Studio, les avis, la FAQ et la newsletter.
 */

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio'},
    {name: 'description', content: 'reda studio — minimalist essentials.'},
  ];
};

/**
 * Preload the hero image (LCP element on the homepage), one per breakpoint,
 * each behind the same media query the hero uses.
 */
export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: HERO_IMAGE_MOBILE.src,
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: HERO_IMAGE_DESKTOP.src,
      media: '(min-width: 48em)',
    },
  ];
}

// Les photos du Royal Longsleeve envoyées par le propriétaire : la même rue,
// en paysage sur ordinateur et en vertical sur mobile (public/v2/).
const HERO_IMAGE_MOBILE = {
  src: '/v2/banner-mobile.webp',
  alt: 'Two men in the reda studio Royal Longsleeve, white with red embroidery on the sleeves, on a city street in autumn',
};

const HERO_IMAGE_DESKTOP = {
  src: '/v2/banner-desktop.webp',
  alt: 'Two men in the reda studio Royal Longsleeve, white with red embroidery on the sleeves, on a city street in autumn',
};

/** Les détails listés à gauche du produit, dans l'ordre, du dictionnaire. */
const DETAILS = [
  'v2.detailShipping',
  'v2.detailQuality',
  'v2.detailAmbition',
  'v2.detailStock',
] as const;

export default function Homepage() {
  const t = useT();

  return (
    <div className="home">
      <AnimatedHero
        imageMobile={HERO_IMAGE_MOBILE}
        imageDesktop={HERO_IMAGE_DESKTOP}
        badge={{
          mobile: '/images/trustpilot-mobile.webp',
          desktop: '/images/trustpilot-desktop.webp',
          alt: t('home.trustAlt'),
        }}
        eyebrow={t('home.eyebrow')}
        title="reda studio"
        description={t('home.tagline')}
        // Plus de catalogue à parcourir : « shop now » mène à la pièce.
        ctaButton={{text: t('home.shopNow'), href: MAIN_PRODUCT_PATH}}
        secondaryCta={{text: t('home.ourStory'), href: '/about'}}
      />

      {/* La pièce, en photo portée, avec ses détails : sur ordinateur le
          texte à gauche et la photo à droite ; sur mobile la photo puis le
          texte, qui apparaît ligne par ligne (voir .v2-feature dans app.css).
          La photo mène à la fiche produit. */}
      <section className="v2-products" aria-labelledby="v2-products-title">
        <h2 className="v2-products__title" id="v2-products-title">
          {t('v2.productsTitle')}
        </h2>
        <div className="v2-feature">
          <DetailsList />
          <Link
            to={MAIN_PRODUCT_PATH}
            prefetch="intent"
            className="v2-feature__media"
            aria-label={t('v2.viewProduct')}
          >
            <img
              src="/v2/feature-selfie.webp"
              alt={t('v2.altSelfie')}
              width={800}
              height={1421}
              loading="lazy"
              decoding="async"
            />
          </Link>
        </div>
      </section>

      <CommunityV2 />

      {/* Sous le bloc communauté, à la demande du propriétaire. */}
      <HomeReviews />

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}

/**
 * Les détails du produit, qui apparaissent l'un après l'autre quand la liste
 * arrive à l'écran — pas avant, même si la page est ouverte depuis
 * longtemps.
 *
 * Visibles par défaut : sans JavaScript, ou avec les animations réduites,
 * rien n'est caché. JavaScript arme la liste (lignes en retrait) puis la
 * joue quand elle est vraiment à l'écran. Si l'observateur ne répond jamais
 * (onglet en arrière-plan, navigateur capricieux), un défilement qui la
 * trouve à l'écran la joue aussi : elle ne peut pas rester cachée.
 */
function DetailsList() {
  const t = useT();
  const ref = useRef<HTMLUListElement | null>(null);
  const [state, setState] = useState<'idle' | 'armed' | 'in'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setState('armed');

    const play = () => {
      setState('in');
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
      },
      {threshold: 0.3},
    );
    const onScroll = () => {
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) play();
    };
    observer.observe(node);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <ul
      ref={ref}
      className={`v2-products__details ${state === 'armed' ? 'v2-products__details--armed' : ''} ${state === 'in' ? 'v2-products__details--in' : ''}`}
    >
      {DETAILS.map((key) => (
        <li key={key} className="v2-products__detail">
          {t(key)}
        </li>
      ))}
    </ul>
  );
}
