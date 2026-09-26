/**
 * Star rating: five square tiles, a white star cut out of each — the tile
 * fills, not the star, so a 4.5 reads as four full tiles and half a fifth.
 * One colour for every tile, the shop's own --color-star; the unfilled part
 * of a tile stays neutral grey, or a 4.5 would look like a 5. Drawn inline so
 * it needs no image request and scales cleanly.
 */
export function StarRating({
  rating,
  count,
  size = 13,
  showValue = false,
  className,
}: {
  rating: number;
  count?: number | null;
  size?: number;
  /** Prints the numeric score next to the stars. Off by default. */
  showValue?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const printed = clamped.toString().replace('.', ',');
  const label =
    typeof count === 'number'
      ? `${printed} out of 5 — ${count} reviews`
      : `${printed} out of 5`;

  return (
    <span className={`stars ${className ?? ''}`}>
      <span
        className="stars__icons"
        role="img"
        aria-label={label}
        style={{'--star-size': `${size}px`} as React.CSSProperties}
      >
        {[0, 1, 2, 3, 4].map((position) => (
          <Star
            key={position}
            fill={Math.max(0, Math.min(1, clamped - position))}
            size={size}
          />
        ))}
      </span>
      {showValue && (
        <span className="stars__value" aria-hidden="true">
          {printed}
        </span>
      )}
      {showValue && typeof count === 'number' && (
        <span className="stars__count" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}

const STAR_PATH =
  'M8 1.3l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.8l-4.12 2.2.79-4.6L1.33 6.15l4.61-.67L8 1.3z';

function Star({fill, size}: {fill: number; size: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="stars__star"
    >
      <rect width="16" height="16" className="stars__tile" />
      {fill > 0 && (
        <rect width={16 * fill} height="16" className="stars__tile-fill" />
      )}
      {/* The star at about two thirds of the tile, centred on its optical
          middle rather than its bounding box. */}
      <path
        d={STAR_PATH}
        className="stars__glyph"
        transform="translate(2.24 2.55) scale(0.72)"
      />
    </svg>
  );
}
