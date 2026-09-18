import type {Route} from './+types/faq';
import {Reveal} from '~/components/Reveal';
import {BigFaqAccordion} from '~/components/BigFaqAccordion';
import {getGeneralFaq, getProductFaq} from '~/data/faq';
import {useT} from '~/lib/i18n';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | faq'},
    {name: 'description', content: 'frequently asked questions — reda studio.'},
  ];
};

export default function Faq() {
  const t = useT();

  return (
    <div className="faq-page">
      <Reveal as="section">
        <h1 className="section-title">{t('faqPage.title')}</h1>
        <p className="faq-page__intro">{t('faqPage.intro')}</p>
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">{t('faqPage.groupOrders')}</h2>
        <BigFaqAccordion items={getGeneralFaq(t)} />
      </Reveal>

      <Reveal as="section">
        <h2 className="faq-page__group-title">{t('faqPage.groupPieces')}</h2>
        <BigFaqAccordion items={getProductFaq(t)} />
      </Reveal>
    </div>
  );
}
