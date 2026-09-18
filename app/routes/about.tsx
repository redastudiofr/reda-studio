import {Link} from 'react-router';
import type {Route} from './+types/about';
import {Reveal} from '~/components/Reveal';
import {useT, type Translate} from '~/lib/i18n';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'reda studio | our story'},
    {
      name: 'description',
      content:
        'reda studio — an independent streetwear house: premium, minimalist, driven by ambition and contemporary culture.',
    },
  ];
};

const pillars = (t: Translate) => [
  {title: t('about.pillar1Title'), body: t('about.pillar1Body')},
  {title: t('about.pillar2Title'), body: t('about.pillar2Body')},
  {title: t('about.pillar3Title'), body: t('about.pillar3Body')},
];

/**
 * Visual closing each text block. One image per block, always in the same
 * place, so the page reads as an alternation texte → image du début à la fin.
 */
function BlockFigure({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="about__block-media">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

export default function About() {
  const t = useT();

  return (
    <div className="about">
      <Reveal as="section" className="about__intro">
        <p className="about__eyebrow">{t('about.eyebrowStory')}</p>
        <h1 className="about__title">reda studio</h1>
        <p className="about__lead">{t('about.lead')}</p>
        <BlockFigure
          src="/images/histoire-piscine.webp"
          alt={t('about.altPool')}
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">{t('about.originEyebrow')}</p>
        <h2>{t('about.originTitle')}</h2>
        <p>{t('about.originP1')}</p>
        <p>{t('about.originP2')}</p>
        <BlockFigure
          src="/images/histoire-cerisiers.webp"
          alt={t('about.altBlossom')}
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__manifesto">
        <p>&ldquo;{t('about.manifesto')}&rdquo;</p>
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">{t('about.approachEyebrow')}</p>
        <h2>{t('about.approachTitle')}</h2>
        <p>{t('about.approachP1')}</p>
        <p>{t('about.approachP2')}</p>
        <BlockFigure
          src="/images/histoire-chambre.webp"
          alt={t('about.altRoom')}
          width={675}
          height={1200}
        />
      </Reveal>

      <Reveal as="section" className="about__block">
        <p className="about__eyebrow">{t('about.detailEyebrow')}</p>
        <h2>{t('about.detailTitle')}</h2>
        <p>{t('about.detailP1')}</p>
        <p>{t('about.detailP2')}</p>
        <BlockFigure
          src="/images/lookbook-denim.webp"
          alt={t('about.altDenim')}
          width={901}
          height={1200}
        />
      </Reveal>

      <section className="about__values">
        {pillars(t).map((pillar, index) => (
          <Reveal
            key={pillar.title}
            as="div"
            className="about__value"
            style={{transitionDelay: `${index * 80}ms`}}
          >
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </Reveal>
        ))}
      </section>

      <Reveal as="section" className="about__cta">
        <h2>{t('about.ctaTitle')}</h2>
        <p>{t('about.ctaBody')}</p>
        <Link to="/collections/all" className="btn">
          {t('about.ctaButton')}
        </Link>
      </Reveal>
    </div>
  );
}
