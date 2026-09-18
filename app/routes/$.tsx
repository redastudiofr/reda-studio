import {Link} from 'react-router';
import {useT} from '~/lib/i18n';
import type {Route} from './+types/$';

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  const t = useT();

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{t('notFound.text')}</p>
      <Link to="/" className="btn--ghost">
        {t('notFound.back')}
      </Link>
    </div>
  );
}
