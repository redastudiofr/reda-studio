import {NavLink, Link} from 'react-router';
import type {HeaderQuery} from 'storefrontapi.generated';
import {InstagramIcon, TiktokIcon} from '~/components/Icons';
import {INSTAGRAM_URL} from '~/lib/social';
import {STORE_NOTIFICATION_EMAIL} from '~/lib/email';
import {useT} from '~/lib/i18n';
import type {TranslationKey} from '~/lib/i18n';
import {Newsletter} from '~/components/Newsletter';

interface FooterProps {
  header: HeaderQuery;
}

const INFO_LINKS: Array<{key: TranslationKey; to: string}> = [
  {key: 'nav.track', to: '/order-tracking'},
  {key: 'footer.faq', to: '/faq'},
  {key: 'home.ourStory', to: '/about'},
  {key: 'footer.contact', to: '/contact'},
];

/*
 * These point at the storefront's own documents under /legal, not at Shopify
 * Admin's policy pages: the text lives in the repo, and Shopify has no slot at
 * all for a legal notice. See docs/legal-pages.md.
 */
const POLICY_LINKS: Array<{key: TranslationKey; to: string}> = [
  {key: 'footer.shipping', to: '/legal/shipping'},
  {key: 'footer.returns', to: '/legal/returns'},
  {key: 'footer.terms', to: '/legal/terms'},
  {key: 'footer.privacy', to: '/legal/privacy'},
  {key: 'footer.legalNotice', to: '/legal/legal-notice'},
];

export function Footer({header}: FooterProps) {
  const t = useT();
  const shopName = header?.shop?.name ?? 'reda studio';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            {shopName.toLowerCase()}
          </Link>
          <p className="site-footer__blurb">{t('footer.blurb')}</p>
          {/* The one real, verified piece of legal-contact info the footer
              can show today — the rest (SIRET, phone, address) lives on
              /legal/legal-notice, clearly marked "à compléter" rather than
              guessed. See app/data/legal.ts. */}
          <a className="site-footer__email" href={`mailto:${STORE_NOTIFICATION_EMAIL}`}>
            {STORE_NOTIFICATION_EMAIL}
          </a>
          <div className="site-footer__social">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TiktokIcon />
            </a>
          </div>
        </div>

        <nav className="site-footer__col" aria-label={t('footer.info')}>
          <h3 className="site-footer__col-title">{t('footer.info')}</h3>
          <ul>
            {INFO_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} prefetch="intent">
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label={t('footer.policies')}>
          <h3 className="site-footer__col-title">{t('footer.policies')}</h3>
          <ul>
            {POLICY_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} prefetch="intent">
                  {t(link.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col site-footer__newsletter">
          <h3 className="site-footer__col-title">{t('news.title')}</h3>
          <Newsletter />
        </div>
      </div>

      <div className="site-footer__bottom">
        <span className="site-footer__copy">
          © {year} {shopName.toLowerCase()}
        </span>
      </div>
    </footer>
  );
}
