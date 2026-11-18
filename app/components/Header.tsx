import {Suspense, useId, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {useHeaderTone} from '~/lib/header-tone';
import {BagIcon, BurgerIcon, SearchIcon} from '~/components/Icons';
import {LanguageSwitcher} from '~/components/LanguageSwitcher';
import {CURRENCY_SYMBOL, CURRENCY_CODE} from '~/lib/currency';
import {useT} from '~/lib/i18n';
import {
  buildNavGroups,
  NAV_SERVICE_LINKS,
  type NavCollection,
  type NavGroup,
} from '~/lib/nav';
import {isSingleProductMode} from '~/lib/singleProduct';

export type {NavCollection};

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  navCollections: NavCollection[];
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, cart, navCollections}: HeaderProps) {
  const {shop} = header;
  const {open} = useAside();
  const t = useT();
  const {transparent} = useHeaderTone();
  // Drives a short press animation on the wordmark; cleared on animation end
  // so it can replay on every click.
  const [logoPressed, setLogoPressed] = useState(false);

  const headerClassName = [
    'site-header',
    transparent && 'site-header--transparent',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headerClassName}>
      {/* Three tracks — left, centre, right — so the wordmark is optically
          centred in the header whatever the nav or icons weigh. */}
      <div className="site-header__side site-header__side--start">
        <button
          className="site-header__icon-btn site-header__burger"
          onClick={() => open('mobile')}
          aria-label={t('nav.openMenu')}
        >
          <BurgerIcon />
        </button>
        <HeaderMenu collections={navCollections} viewport="desktop" />
      </div>

      <NavLink
        to="/"
        end
        prefetch="intent"
        className={`site-header__logo ${logoPressed ? 'site-header__logo--pressed' : ''}`}
        aria-label={shop.name}
        onClick={() => setLogoPressed(true)}
        onAnimationEnd={() => setLogoPressed(false)}
      >
        {/* The wordmark is painted with currentColor through a CSS mask, so it
            turns white by itself when the header goes transparent over the
            hero. The text stays for screen readers and as a fallback. */}
        <span className="site-header__wordmark" aria-hidden="true" />
        <span className="sr-only">{shop.name}</span>
      </NavLink>

      <div className="site-header__side site-header__side--end">
        {/* Nothing to search on a single-product site. */}
        {!isSingleProductMode() && (
          <button
            className="site-header__icon-btn"
            onClick={() => open('search')}
            aria-label={t('nav.search')}
          >
            <SearchIcon />
          </button>
        )}
        <CartToggle cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  collections,
  viewport,
}: {
  collections: NavCollection[];
  viewport: Viewport;
}) {
  const {close} = useAside();
  const t = useT();
  const groups = buildNavGroups(collections);

  if (viewport === 'desktop') {
    return (
      <nav className="site-header__nav" role="navigation">
        {groups.map((group) => (
          <DesktopGroup key={group.id} group={group} />
        ))}
      </nav>
    );
  }

  return (
    <nav className="mobile-nav" role="navigation">
      <NavLink to="/" end onClick={close} prefetch="intent">
        {t('nav.home')}
      </NavLink>

      {groups.map((group) => (
        <MobileGroup key={group.id} group={group} onNavigate={close} />
      ))}

      {/* Service links sit under the categories, not among them. */}
      {NAV_SERVICE_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className="mobile-nav__service"
          onClick={close}
          prefetch="intent"
        >
          {t(link.labelKey)}
        </NavLink>
      ))}

      <LocalePreferences className="mobile-nav__settings" />
    </nav>
  );
}

/**
 * Desktop: the group name in the bar, its collections in a panel underneath.
 *
 * Opened by hover and by `:focus-within`, with no state to keep in sync. The
 * label has to be a real button for that to work: the panel is hidden with
 * `visibility: hidden`, which makes everything inside it unfocusable, so
 * `:focus-within` could never fire from the links themselves. Tabbing to the
 * button opens the panel, and the links become reachable because they are now
 * visible.
 */
function DesktopGroup({group}: {group: NavGroup}) {
  const t = useT();

  return (
    <div className="nav-group">
      <button
        type="button"
        className="site-header__nav-link nav-group__label"
      >
        {t(group.labelKey)}
      </button>
      <div className="nav-group__panel">
        <ul>
          {group.collections.map((collection) => (
            <li key={collection.id}>
              <NavLink
                to={`/collections/${collection.handle}`}
                prefetch="intent"
              >
                {collection.title.toLowerCase()}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Mobile: a collapsible group. `grid-template-rows: 0fr → 1fr` opens it to the
 * height of its own contents, so the panel never needs a guessed max-height.
 */
function MobileGroup({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const t = useT();

  return (
    <div className={`mobile-group ${open ? 'mobile-group--open' : ''}`}>
      <button
        type="button"
        className="mobile-group__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{t(group.labelKey)}</span>
        <span className="mobile-group__chevron" aria-hidden="true" />
      </button>

      <div className="mobile-group__panel" id={panelId}>
        <div className="mobile-group__panel-inner">
          {group.collections.map((collection) => (
            <NavLink
              key={collection.id}
              to={`/collections/${collection.handle}`}
              onClick={onNavigate}
              prefetch="intent"
            >
              {collection.title.toLowerCase()}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartButton count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

function CartButton({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <button
      className="site-header__icon-btn"
      aria-label={`Cart, ${count} item${count > 1 ? 's' : ''}`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <BagIcon />
      {count > 0 && <span className="site-header__cart-count">{count}</span>}
    </button>
  );
}

/**
 * Store preferences — language and currency — as a small settings block.
 *
 * The language switcher used to sit loose in the header bar. It now lives
 * here, next to the currency it belongs with: two facts about how the shop is
 * displayed, stated in one place instead of scattered across the chrome. The
 * block is rendered inside the menu drawer and in the footer, so it is
 * reachable on a phone and on a desktop without the header carrying it.
 *
 * The currency is a statement, not a control: Shopify prices this storefront
 * in euros, and offering a switch that cannot change the price would be a lie.
 */
export function LocalePreferences({className}: {className?: string}) {
  const t = useT();

  return (
    <div className={['locale-prefs', className].filter(Boolean).join(' ')}>
      <span className="locale-prefs__title">{t('nav.settings')}</span>

      <div className="locale-prefs__row">
        <span className="locale-prefs__label">{t('nav.language')}</span>
        <LanguageSwitcher />
      </div>

      <div className="locale-prefs__row">
        <span className="locale-prefs__label">{t('nav.currency')}</span>
        <span className="locale-prefs__value">
          {CURRENCY_CODE}&nbsp;{CURRENCY_SYMBOL}
        </span>
      </div>
    </div>
  );
}
