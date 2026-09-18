import type {ReactNode} from 'react';
import type {Translate} from '~/lib/i18n';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/** General questions — shipping, quality, refunds. */
export function getGeneralFaq(t: Translate): FaqItem[] {
  return [
    {question: t('faqData.shippingQ'), answer: t('faqData.shippingA')},
    {question: t('faqData.madeQ'), answer: t('faqData.madeA')},
    {question: t('faqData.qualityQ'), answer: t('faqData.qualityA')},
    {question: t('faqData.refundQ'), answer: t('faqData.refundA')},
  ];
}

/**
 * Pulls the composition out of a product description.
 *
 * Shops write it in prose ("Composition: 100% cotton"), so we look for an
 * explicit "composition" sentence first, then for any sentence carrying a
 * material percentage. Returns null when the description says nothing about
 * it — the FAQ then points to the garment's own label rather than inventing a
 * fabric.
 */
export function extractComposition(description: string): string | null {
  const text = description.replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const sentences = text.split(/(?<=[.!?])\s+|\s*[\n•·]\s*/);

  const labelled = sentences.find((sentence) =>
    /composition\s*:?/i.test(sentence),
  );
  if (labelled) {
    const cleaned = labelled.replace(/^.*?composition\s*:?\s*/i, '').trim();
    if (cleaned.length > 2) return cleaned.replace(/\.$/, '');
    return labelled.trim().replace(/\.$/, '');
  }

  // No explicit label: pick the clauses that actually carry a material
  // percentage, e.g. "80% cotton, 20% polyester" out of a longer sentence.
  const withPercent = sentences.find((sentence) =>
    /\d+\s*%\s*\p{L}/u.test(sentence),
  );
  if (withPercent) {
    const clauses = withPercent
      .split(',')
      .map((clause) => clause.trim())
      .filter((clause) => /\d+\s*%\s*\p{L}/u.test(clause));
    if (clauses.length) return clauses.join(', ').replace(/\.$/, '');
    return withPercent.trim().replace(/\.$/, '');
  }

  return null;
}

/**
 * Product-page FAQ. `composition` is derived from the product's own
 * description, so each product states its real materials.
 */
export function getProductFaq(t: Translate, description = ''): FaqItem[] {
  const composition = extractComposition(description);

  return [
    {question: t('faqData.fitQ'), answer: t('faqData.fitA')},
    {
      question: t('faqData.compositionQ'),
      answer: composition ? `${composition}.` : t('faqData.compositionA'),
    },
    {question: t('faqData.manufacturingQ'), answer: t('faqData.manufacturingA')},
    {
      question: t('faqData.shipping2Q'),
      answer: (
        <>
          {t('faqData.shipping2A')} <a href="/legal/shipping">{t('faqData.shippingLink')}</a>.
        </>
      ),
    },
    {
      question: t('faqData.returnsQ'),
      answer: (
        <>
          {t('faqData.returnsA')} <a href="/legal/returns">{t('faqData.returnsLink')}</a>.
        </>
      ),
    },
    {question: t('faqData.careQ'), answer: t('faqData.careA')},
  ];
}
