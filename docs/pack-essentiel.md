# Pack essentiel — three pieces, the Business After Hour tee free

The customer picks a pair of jeans, a longsleeve and a tee, each in their
size. A fourth piece — the **Tshirt Business After Hour — White** — goes into
the basket with them and the code **FREEBSN** takes it off.

**The storefront never decides what anyone pays.** The reduction is a Shopify
discount; this repository chooses the pieces, says what the offer is, puts the
lines in the basket and attaches the code. Nothing here computes a price, and
nothing shows a struck-through one: no piece is being discounted, one is
given.

## The four pieces

`app/lib/packOffer.ts` is the single place the storefront's side is written.

The three **chosen** pieces come from two sources, in order:

1. **The `pack-essentiel` collection in Shopify Admin**, if it exists and
   holds at least three products. Point the discount at that same collection
   and the two can never drift — adding a product to the collection adds it to
   the page, with no deploy.
2. **Otherwise the explicit handles** in `PACK_FALLBACK_HANDLES`, kept in step
   with the discount by hand. This is what is in use today.

The **given** piece is not a slot but a named product:

```ts
export const PACK_FREE_HANDLE = 'tshirt-business-after-hour-white';
export const PACK_DISCOUNT_CODE = 'FREEBSN';
```

If that handle ever stops matching the product the discount is written for,
the customer is charged for it — the page would still show it as free.

Two things are filtered out of whatever the sources return: anything with no
variant in stock, and the pre-ordered piece, whose lines the cart refuses
outright (`app/lib/preorder.ts`).

Each product is filed under jeans / longsleeve / tee by what it is — type,
title, handle — so a product added to the collection lands in the right slot
on its own. Anything matching none of the three is left out rather than filed
under a guess.

### The product-page line

`PackNote` (the line under the price) checks `PACK_FALLBACK_HANDLES` and
nothing else: the browser has no idea what a Shopify collection contains. **If
you switch to the collection, keep these handles equal to it**, or that line
appears on the wrong products.

## Why the free tee is added to the basket

A discount takes money off a line that exists — **it does not create one**. So
the button adds four lines, not three: the three chosen pieces and the offered
tee, each at its normal price, and FREEBSN brings the tee to zero.

That is also why the page shows it as the fourth piece, with `offert` written
on the photo, rather than as a promise about checkout: what the customer sees
in the basket is exactly what the page showed them.

`PACK_ADDS_FREE_LINE = false` turns that fourth line off — only correct if the
discount is ever rewritten so that one of the three chosen pieces is itself
the free one.

## Two codes, two offers, one basket

The shop runs two coded offers, and they must never be confused:

| Offer | Code | Where |
| --- | --- | --- |
| The pack — three pieces, the tee free | `FREEBSN` | `PACK_DISCOUNT_CODE`, app/lib/packOffer.ts |
| The product page's "take two" box | `REDA1120` | `OFFER_DISCOUNT_CODE`, app/lib/offers.ts |

The pack has its own cart action, `PACK_ADD_ACTION`: it adds the four lines
**and** attaches `FREEBSN` in the same request, replacing the other offer's
code if the basket carried it. Every other line change attaches `REDA1120`,
but only to a basket that carries no offer code yet — so a pack keeps its own.

A basket therefore never holds both. Whether two of the shop's codes would
stack, fight or silently cancel each other depends on how each is set to
combine in Shopify, and the storefront does not put the question.

Check in Shopify Admin → Discounts that `FREEBSN` exists, is spelled exactly
this way, and that its conditions match what the page promises: three pieces
from the pack plus the Business After Hour tee, that tee at 100% off.

## Where the offer shows

| Where | What | Component |
| --- | --- | --- |
| Homepage, after the catalogue | "3 produits achetés = 1 offert", the pack composed and added on the spot | `PackOffer` → `PackBuilder` |
| `/pack` | the same builder, under the page's photo | `app/routes/pack.tsx` → `PackBuilder` |
| Product page of a pack piece | the offer box, in place of the "take two" one | `PackBundle` |
| Product page, under the price | one line | `PackNote` |
| Footer | "pack essentiel" under informations | `Footer` |

Both places use one component, `PackBuilder`, fed by one loader,
`loadPack` in `app/lib/packProducts.ts` — so the homepage and the pack page
can never offer two different lists. Each piece is chosen by its thumbnail
and its size by the product page's own size buttons; the button adds the
four lines through `PACK_ADD_ACTION` and opens the cart drawer, with no page
in between. The homepage section renders nothing unless every slot has a
piece in stock and the offered tee is found: an offer the button cannot
honour is not shown.

Products outside the pack keep the "take two" box (`BundleOffer`) exactly as
before.

No banner, no countdown, no struck-through price, no badge beyond the word
`offert` on the photo of the piece that is actually offered.

## Turning it off

`PACK_ENABLED = false` takes every mention off the storefront at once —
teaser, product lines and all — without touching anything in Shopify. The page
itself stays reachable; delete the route to remove it.

## The other offer still running

The tiered "2nd −20%, 3rd −30%" wording (`app/lib/tierDiscount.ts`, see
`docs/tier-discount.md`) is still displayed under every price, and whatever
applies it in Shopify still applies it. Decide whether it should coexist with
the pack before announcing either: two reductions on one basket combine only
if Shopify is told they may.
