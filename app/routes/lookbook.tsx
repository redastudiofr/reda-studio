import type {Route} from './+types/lookbook';
import {redirectHomeIfSingleProduct} from '~/lib/singleProduct';

export function loader() {
  redirectHomeIfSingleProduct();
  return null;
}

export const meta: Route.MetaFunction = () => {
  return [{title: 'reda studio | lookbook'}];
};

// Placeholder tiles — replace with real campaign imagery when available.
const TILES = Array.from({length: 6}, (_, i) => `look-placeholder-${i + 1}`);

export default function Lookbook() {
  return (
    <div className="page page--wide">
      <h1>lookbook</h1>
      <div className="lookbook-grid">
        {TILES.map((tile) => (
          <div key={tile} className="lookbook-grid__tile" aria-hidden="true">
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
}
