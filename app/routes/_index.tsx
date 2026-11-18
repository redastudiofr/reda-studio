import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import type {Route} from './+types/_index';
import {AnimatedHero} from '~/components/AnimatedHero';
import {CommunityV2} from '~/components/CommunityV2';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {MAIN_PRODUCT_QUERY} from '~/lib/homeProductQueries';
import {MAIN_PRODUCT_PATH, VISIBLE_PRODUCT_HANDLES} from '~/lib/visibleProducts';
import {useT} from '~/lib/i18n';

/*
 * Nouvelle version : l'accueil n'a plus de slider de collections, plus de
 * grille « tous les produits », plus de vitrines de collections (automne
 * drop, summer, best seller) ni leurs bannières. Il montre la bannière, les
 * seuls produits en vente (VISIBLE_PRODUCT_HANDLES), les avis, le bloc
 * communauté repris de Hustle Studio, la FAQ et la newsletter.
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

export async function loader({context}: Route.LoaderArgs) {
  // Les cartes des produits en vente, dans l'ordre de la liste. Différé :
  // la section arrive après la bannière et ne la retarde jamais.
  const products = Promise.all(
    VISIBLE_PRODUCT_HANDLES.map((handle) =>
      context.storefront
        .query(MAIN_PRODUCT_QUERY, {variables: {handle}})
        .then((data) => data?.product ?? null)
        .catch((error: Error) => {
          console.error(error);
          return null;
        }),
    ),
  ).then((list) => list.filter((product) => product !== null));

  return {products};
}

export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();
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

      {/* Les cartes à la taille de celles de prxclo.shop, comme demandé :
          carrées, 4 par ligne dans 1200 px sur ordinateur, 2 par ligne avec
          16 px de marge sur mobile (voir .v2-products dans app.css). */}
      <section className="v2-products" aria-labelledby="v2-products-title">
        <h2 className="v2-products__title" id="v2-products-title">
          {t('v2.productsTitle')}
        </h2>
        <Suspense fallback={<div className="v2-products__grid" aria-hidden="true" />}>
          <Await resolve={products}>
            {(list) => (
              <div className="v2-products__grid">
                {list.map((product) => (
                  <ProductItem key={product.id} product={product} loading="eager" />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </section>

      <HomeReviews />

      <CommunityV2 />

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}
