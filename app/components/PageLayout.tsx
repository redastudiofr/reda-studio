import {Await, Link, useLocation} from 'react-router';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu, type NavCollection} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {NewsletterPopup} from '~/components/NewsletterPopup';
import {LanguagePrompt} from '~/components/LanguagePrompt';
import {useT} from '~/lib/i18n';
import {SearchIcon} from '~/components/Icons';
import {HeaderToneProvider} from '~/lib/header-tone';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  navCollections: NavCollection[];
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  promoSignupEnabled?: boolean;
  /** False only for a visitor who has never answered the language question. */
  localeChosen?: boolean;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  header,
  navCollections,
  isLoggedIn,
  publicStoreDomain,
  promoSignupEnabled = false,
  localeChosen = true,
}: PageLayoutProps) {
  // The header is fixed (see .site-header), so it no longer reserves layout
  // space itself — every route needs that space reserved via padding,
  // except the homepage, whose hero is meant to start at the very top and
  // show through the header while it's transparent.
  const {pathname} = useLocation();
  const isHome = pathname === '/';

  return (
    <Aside.Provider>
      <HeaderToneProvider>
        <CartAside cart={cart} />
        <SearchAside />
        <MobileMenuAside collections={navCollections} />
        {header && (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
            navCollections={navCollections}
          />
        )}
        <main className={isHome ? undefined : 'main--with-header-space'}>{children}</main>
        <Footer header={header} />
        <NewsletterPopup enabled={promoSignupEnabled} />
        {!localeChosen && <LanguagePrompt />}
      </HeaderToneProvider>
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  const t = useT();

  return (
    <Aside type="cart" heading={t('cart.title')}>
      <Suspense fallback={<p>{t('common.loading')}</p>}>
        <Await resolve={cart}>
          {(resolved) => <CartMain cart={resolved} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  const t = useT();
  return (
    <Aside type="search" heading={t('nav.search')}>
      <div className="predictive-search">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="search-bar">
              <SearchIcon />
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder={t('search.placeholder')}
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              <button className="link" onClick={goToSearch}>
                {t('search.go')}
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <p className="search-group">{t('search.searching')}</p>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>voir tous les résultats pour « {term.current} » →</p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({collections}: {collections: NavCollection[]}) {
  const t = useT();

  return (
    <Aside type="mobile" heading={t('nav.menu')}>
      <HeaderMenu collections={collections} viewport="mobile" />
    </Aside>
  );
}
