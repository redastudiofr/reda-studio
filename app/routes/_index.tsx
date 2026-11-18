import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import ProductPage, {loadProductPage} from './products.$handle';
import {AnimatedHero} from '~/components/AnimatedHero';
import {SINGLE_PRODUCT_HANDLE} from '~/lib/singleProduct';
import {useT} from '~/lib/i18n';

/*
 * Single-product site: the home page is the one product's page, under a
 * banner — see app/lib/singleProduct.ts and docs/single-product.md. The
 * catalogue home page lives on in the history of the site's main branch.
 */

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return [
    {title: product ? `reda studio | ${product.title}` : 'reda studio'},
    {
      name: 'description',
      content: product?.seo?.description || product?.description?.slice(0, 155) || '',
    },
    {rel: 'canonical', href: '/'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  return loadProductPage(args, SINGLE_PRODUCT_HANDLE ?? undefined);
}

/**
 * Banner photos. Until the new visuals arrive, the product's own worn photo
 * from Shopify (its third image, the mirror selfie), resized by Shopify's
 * CDN. To use dedicated banners, put the files in public/images/ and point
 * these two at them.
 */
function bannerImages(images: Array<{url: string; altText?: string | null}>) {
  const worn = images[2] ?? images[0];
  if (!worn) return null;
  const sized = (width: number) =>
    `${worn.url}${worn.url.includes('?') ? '&' : '?'}width=${width}`;
  const alt = worn.altText ?? '';
  return {
    mobile: {src: sized(900), alt},
    desktop: {src: sized(1800), alt},
  };
}

export default function Home() {
  const {product} = useLoaderData<typeof loader>();
  const t = useT();
  const banner = bannerImages(product.images.nodes);

  return (
    <div className="home home--single">
      {banner && (
        <AnimatedHero
          imageMobile={banner.mobile}
          imageDesktop={banner.desktop}
          badge={{
            mobile: '/images/trustpilot-mobile.webp',
            desktop: '/images/trustpilot-desktop.webp',
            alt: t('home.trustAlt'),
          }}
          eyebrow={t('single.eyebrow')}
          title={product.title}
          description={t('home.tagline')}
          ctaButton={{text: t('single.buy'), href: '#acheter'}}
          secondaryCta={{text: t('home.ourStory'), href: '/about'}}
        />
      )}

      <ProductPage />
    </div>
  );
}
