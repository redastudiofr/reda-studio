import {Link, useLoaderData} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import type {Route} from './+types/_index';
import {AnimatedHero} from '~/components/AnimatedHero';
import {CommunityV2} from '~/components/CommunityV2';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {MAIN_PRODUCT_QUERY} from '~/lib/homeProductQueries';
import {loadProductVideos} from '~/lib/productVideos';
import {
  MAIN_PRODUCT_PATH,
  VISIBLE_PRODUCT_HANDLES,
} from '~/lib/visibleProducts';
import {useT} from '~/lib/i18n';

/*
 * Nouvelle version : l'accueil n'a plus de slider de collections, plus de
 * grille « tous les produits », plus de vitrines de collections (automne
 * drop, summer, best seller) ni leurs bannières. Il montre la bannière, la
 * pièce seule sur fond blanc, le bloc communauté repris de Hustle Studio,
 * les détails de la pièce avec sa photo portée, les avis, la FAQ et la
 * newsletter.
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

// Les photos du Royal Longsleeve envoyées par le propriétaire (public/v2/) :
// la rue en paysage sur ordinateur, le studio blanc en vertical sur mobile.
const HERO_IMAGE_MOBILE = {
  src: '/v2/banner-mobile.webp',
  alt: 'Two men in the reda studio Royal Longsleeve, white with red embroidery on the sleeves, front and back, in a white studio',
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

export async function loader({context}: Route.LoaderArgs) {
  // La photo de la pièce sur fond blanc : la première image Shopify du
  // produit en vente. Si Shopify ne répond pas, la section n'a que son titre.
  const handle = VISIBLE_PRODUCT_HANDLES[0];
  // Et ses vidéos, celles ajoutées à sa fiche dans Shopify.
  const [data, videos] = await Promise.all([
    context.storefront
      .query(MAIN_PRODUCT_QUERY, {variables: {handle}})
      .catch((error: Error) => {
        console.error(error);
        return null;
      }),
    loadProductVideos(context.storefront, handle),
  ]);
  const product = data?.product;
  const image = product?.featuredImage;
  return {
    videos,
    packshot: image
      ? {
          url: image.url,
          altText: image.altText || product.title,
          width: image.width ?? 1254,
          height: image.height ?? 1254,
        }
      : null,
  };
}

export default function Homepage() {
  const {packshot, videos} = useLoaderData<typeof loader>();
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
        secondaryCta={{text: t('home.ourStory'), href: '/about'}}
      />

      {/* La pièce seule, sur fond blanc, plus grande qu'une carte produit,
          qui apparaît en montant quand on arrive dessus ; elle mène à la
          fiche. */}
      <section className="v2-products" aria-labelledby="v2-products-title">
        <h2 className="v2-products__title" id="v2-products-title">
          {t('v2.productsTitle')}
        </h2>
        {packshot && <Packshot image={packshot} />}
      </section>

      <CommunityV2 videos={videos} />

      {/* Sous le bloc communauté et ses vidéos : les détails de la pièce et
          la photo portée, animés à l'arrivée (voir FeatureSection). */}
      <FeatureSection />

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
 * Joue une apparition une seule fois, quand l'élément arrive à l'écran — pas
 * avant, même si la page est ouverte depuis longtemps.
 *
 * Rien n'est caché par défaut : sans JavaScript, ou avec les animations
 * réduites, l'état reste 'idle' et tout s'affiche. JavaScript arme
 * l'élément ('armed', les styles cachent alors son contenu) puis le joue
 * ('in') quand il est vraiment à l'écran. Si l'observateur ne répond jamais
 * (onglet en arrière-plan, navigateur capricieux), un défilement qui le
 * trouve à l'écran le joue aussi : il ne peut pas rester caché.
 */
function usePlayOnView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
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
      {threshold},
    );
    const onScroll = () => {
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.85 && box.bottom > 0) play();
    };
    observer.observe(node);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  const stateClass = state === 'idle' ? '' : `is-${state}`;
  return {ref, stateClass};
}

/** La pièce seule sur fond blanc, en grand ; mène à la fiche. */
function Packshot({
  image,
}: {
  image: {url: string; altText: string; width: number; height: number};
}) {
  const t = useT();
  const {ref, stateClass} = usePlayOnView<HTMLAnchorElement>(0.2);
  const sized = (width: number) =>
    `${image.url}${image.url.includes('?') ? '&' : '?'}width=${width}`;

  return (
    <Link
      ref={ref}
      to={MAIN_PRODUCT_PATH}
      prefetch="intent"
      className={`v2-packshot ${stateClass}`}
      aria-label={t('v2.viewProduct')}
    >
      <img
        src={sized(1100)}
        srcSet={`${sized(600)} 600w, ${sized(900)} 900w, ${sized(1100)} 1100w`}
        sizes="(min-width: 48em) 560px, 92vw"
        alt={image.altText}
        width={image.width}
        height={image.height}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}

/**
 * Les détails de la pièce et sa photo portée. Ordinateur : le texte à
 * gauche, la photo à droite ; mobile : la photo puis le texte. À l'arrivée,
 * la photo se dévoile de bas en haut en se resserrant, puis les lignes
 * entrent l'une après l'autre, numérotées, et le bouton en dernier.
 */
function FeatureSection() {
  const t = useT();
  const {ref, stateClass} = usePlayOnView<HTMLElement>(0.2);

  return (
    <section
      ref={ref}
      className={`v2-feature ${stateClass}`}
      aria-labelledby="v2-feature-title"
    >
      <div className="v2-feature__text">
        <p className="v2-feature__eyebrow">{t('v2.featureEyebrow')}</p>
        <h2 className="v2-feature__title" id="v2-feature-title">
          {t('v2.featureTitle')}
        </h2>
        <ol className="v2-feature__list">
          {DETAILS.map((key, index) => (
            <li key={key} className="v2-feature__line">
              <span className="v2-feature__num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
        <Link
          to={MAIN_PRODUCT_PATH}
          prefetch="intent"
          className="btn v2-feature__cta"
        >
          {t('v2.featureCta')}
        </Link>
      </div>
      <Link
        to={MAIN_PRODUCT_PATH}
        prefetch="intent"
        className="v2-feature__media"
        aria-label={t('v2.viewProduct')}
        tabIndex={-1}
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
    </section>
  );
}
