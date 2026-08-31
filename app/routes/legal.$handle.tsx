import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/legal.$handle';
import {
  LEGAL_DOCUMENTS,
  findLegalDocument,
  type LegalSection,
} from '~/data/legal';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `reda studio | ${data?.document.title ?? 'legal'}`},
    {name: 'description', content: data?.document.intro ?? ''},
  ];
};

export async function loader({params}: Route.LoaderArgs) {
  const document = findLegalDocument(params.handle);

  if (!document) {
    throw new Response('Not found', {status: 404});
  }

  return {
    document,
    // The other documents, for the sidebar — every legal page links to all
    // the others, which is what people actually do on these pages.
    others: LEGAL_DOCUMENTS.map(({handle, navLabel}) => ({handle, navLabel})),
  };
}

export default function LegalPage() {
  const {document, others} = useLoaderData<typeof loader>();

  return (
    <div className="legal">
      <header className="legal__header">
        <p className="legal__eyebrow">legal</p>
        <h1 className="legal__title">{document.title}</h1>
        <p className="legal__intro">{document.intro}</p>
        <p className="legal__updated">last updated — {document.updated}</p>
      </header>

      <div className="legal__layout">
        {/* Sticky on desktop, a plain row of links on mobile. */}
        <nav className="legal__nav" aria-label="Legal documents">
          <p className="legal__nav-title">documents</p>
          <ul>
            {others.map((entry) => (
              <li key={entry.handle}>
                <Link
                  to={`/legal/${entry.handle}`}
                  aria-current={
                    entry.handle === document.handle ? 'page' : undefined
                  }
                >
                  {entry.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="legal__body">
          {document.sections.map((section) => (
            <Section key={section.heading} section={section} />
          ))}

          <footer className="legal__foot">
            <p>
              A question about any of this? Write to us from the{' '}
              <Link to="/contact">contact page</Link>.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

/** A value still to be filled in reads as "[à compléter]" — see app/data/legal.ts. */
const PLACEHOLDER_PATTERN = /^\[.*\]$/;

function Section({section}: {section: LegalSection}) {
  return (
    <section className="legal__section">
      <h2>{section.heading}</h2>
      {section.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.list && (
        <ul className="legal__list">
          {section.list.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}
      {section.fields && (
        <dl className="legal__fields">
          {section.fields.map((field) => {
            const isPlaceholder = PLACEHOLDER_PATTERN.test(field.value);
            return (
              <div className="legal__field" key={field.label}>
                <dt>{field.label}</dt>
                <dd data-placeholder={isPlaceholder ? 'true' : undefined}>
                  {field.href && !isPlaceholder ? (
                    <a href={field.href}>{field.value}</a>
                  ) : (
                    field.value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {section.cta && (
        <Link to={section.cta.to} className="btn btn--outline legal__cta">
          {section.cta.label}
        </Link>
      )}
    </section>
  );
}
