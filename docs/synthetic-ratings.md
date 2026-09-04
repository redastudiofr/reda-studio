# Star ratings that aren't Shopify's own data

Two places on the site show a star rating that Shopify's real review
metafields (`reviews.rating` / `reviews.rating_count`) did **not** provide:
the product page's own rating, and the "you may also like" row at the
bottom of it. This is a deliberate exception, made **at the store owner's
explicit request, after being told what it means** — not a default any
future change here should assume is fine to repeat elsewhere without asking
again.

## Why this is different from the reviews carousel

The scrolling testimonial carousel (`app/data/reviews.ts`'s `REVIEW_POOL`,
shown on the homepage and every product page) is illustrative marketing copy
— free-text quotes, already agreed with the store owner as a placeholder
until a real review app is installed.

A star rating with a review **count** is a different kind of claim: it's a
number a shopper reads mechanically as a purchase signal, on the exact page
where they're deciding whether to buy — precisely the shape of claim French
consumer law (and most countries' advertising rules) treats as an unfair
commercial practice when it doesn't reflect real customer feedback. That
distinction was raised directly with the store owner before writing a line
of this; they confirmed they understood it and want it anyway.

## What actually happens

**A real rating, when Shopify has one, is never touched or overridden.**
Everywhere this shows a rating, `parseRating()` (`app/lib/rating.ts`) is
tried first; the code below only runs when that returns `null`.

**Product's own page** (`app/routes/products.$handle.tsx`, passed to
`ProductPurchase`): summarises the *same* illustrative pool the reviews
carousel below it draws from (`getRatingForSeed`, `app/data/reviews.ts`) —
an honest average of what's actually displayed further down the page, not a
separate invented number. The only change from before: how many of the pool
it draws from depends on the product's age (`reviewCountForAge`):

| Product age | Reviews summarised |
| --- | --- |
| under 7 days | none — no rating shown at all |
| 7–21 days | 3 |
| 21–45 days | 7 |
| 45+ days (or age unknown) | 12 |

A product just added to the shop no longer wears the same "4.7 from 12
reviews" as one that's been on sale for months.

**"You may also like" row** (the recommendation row at the bottom of a
product page): didn't show a rating at all before this change — the
fragment queried the metafields but nothing filled the gap when they were
empty. Now, for whichever items in a given row lack a real rating: **at
least two are shown at a plain 4.0** (varied review counts, so the two
don't look identical), and every other item gets the same age-aware summary
described above. Which two depends on the order Shopify returns
recommendations in, not on anything you can configure — it's not pinned to
specific products.

## If a real review app is installed later

Nothing here needs to change. The moment Shopify's `reviews.rating` /
`reviews.rating_count` metafields carry real data for a product,
`parseRating()` picks them up and neither of the code paths above ever
runs for it again.
