import type {Route} from './+types/_index';
import {AnimatedHero} from '~/components/AnimatedHero';
import {CommunitySlider} from '~/components/CommunitySlider';
import {Reveal} from '~/components/Reveal';
import {Newsletter} from '~/components/Newsletter';
import {HomeReviews} from '~/components/HomeReviews';
import {HelpFaq} from '~/components/HelpFaq';
import {VISIBLE_PRODUCT_HANDLES} from '~/lib/visibleProducts';
import {useT} from '~/lib/i18n';

/*
 * Nouvelle version : l'accueil n'a plus de slider de collections, plus de
 * grille « tous les produits », plus de vitrines de collections (automne
 * drop, summer, best seller) ni leurs bannières. Il reste la bannière, les
 * avis, la communauté, la FAQ et la newsletter.
 */

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio'},
    {name: 'description', content: 'reda studio — minimalist essentials.'},
  ];
};

/**
 * Preload the hero image (LCP element on the homepage).
 *
 * One entry per breakpoint, each behind the same media query the <picture>
 * uses, so a phone only ever fetches the mobile photo and a desktop only the
 * desktop one.
 */
export function links() {
  return [
    {
      rel: 'preload',
      as: 'image',
      href: '/images/hero3-mobile.webp',
      media: '(max-width: 47.99em)',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/images/home-hero-desktop-milan.webp',
      media: '(min-width: 48em)',
    },
  ];
}

const HERO_IMAGE_MOBILE = {
  src: '/images/hero3-mobile.webp',
  alt: 'A man from behind in a reda studio t-shirt and jeans, looking out over a rooftop pool and the city skyline',
};

const HERO_IMAGE_DESKTOP = {
  src: '/images/home-hero-desktop-milan.webp',
  alt: 'A man in a black leopard-print zip hoodie, white tee and black baggy jeans, sitting on a block in front of a tower covered in greenery',
};

// Plus de catalogue à parcourir : « shop now » mène à la seule pièce en
// vente (voir app/lib/visibleProducts.ts).
const SHOP_NOW_HREF = `/products/${VISIBLE_PRODUCT_HANDLES[0]}`;

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
        ctaButton={{text: t('home.shopNow'), href: SHOP_NOW_HREF}}
        secondaryCta={{text: t('home.ourStory'), href: '/about'}}
      />

      <HomeReviews />

      <CommunitySlider />

      <HelpFaq />

      <Reveal as="section">
        <Newsletter />
      </Reveal>
    </div>
  );
}
