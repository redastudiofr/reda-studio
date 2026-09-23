# Volume offer — 2nd piece −20%, 3rd and beyond −30%

The whole catalogue, all the time: the first piece is full price, the second is
20% off, the third and every one after it 30% off.

A storefront cannot change a price. What the customer pays is decided by
Shopify — here by the **tiered-discount app installed in the admin**, which
evaluates the basket itself and puts the reduction in the totals. Nothing in
this repository calculates what is charged. The front end only says what the
offer is, and reports what Shopify actually took off.

## Where the figures live

`app/lib/tierDiscount.ts`, and nowhere else:

```ts
export const TIER_ENABLED = true;
export const TIER_PERCENTS = [0, 20, 30]; // 1st, 2nd, 3rd and beyond
```

If these percentages and the Shopify app ever disagree, the customer is shown
one price and charged another. **Change both together, never one alone.**
Setting `TIER_ENABLED` to `false` takes every mention of the offer off the
storefront in one go — the line under the prices, the cart messages, the pack
page's saving — without touching anything in Shopify.

## Where it shows

| Where | What it says | Component |
| --- | --- | --- |
| Product page, under the price | `2nd article −20% · 3rd article −30%` | `TierNote` in `ProductPurchase` |
| Collection pages, under the title | the same line, once at the top | `TierNote` in `collections.$handle`, `collections.all` |
| Cart and drawer | what has already come off, then what one more piece would add | `OfferNote` in `CartSummary` |
| `/pack` | the three pieces, struck total and pack price | `routes/pack.tsx` |

It is a line of text, never a banner: the offer applies to everything
permanently, so a coloured strip on every page would be the one thing on this
site that looks like a discount store.

### What the cart is allowed to claim

`OfferNote` never estimates. It sums the `discountAllocations` Shopify reports
on the lines — what was *actually* taken off — so "you save X" is a statement
about the real total. With nothing allocated it stays an invitation
("add one piece: the next one is −20%") and never claims a reduction the
customer has not got. If the app in Shopify is switched off, the cart quietly
stops saying anything was saved, on its own.

## The pack page (`/pack`)

Three real products presented together and added in one click, each in the size
the customer picks. It creates no product and invents no price: the prices are
the products' own, and the "pack price" is what the volume offer makes of those
three — the basket is what applies it.

Changing a piece is one line in `routes/pack.tsx`:

```ts
const PACK_HANDLES = {
  jean: 'kaizen-jeans-raw-denim-blue',
  longsleeve: 'reda-longsleeve-black',
  third: 'heritage-shirt-blue',
};
```

Two things to know:

- **There is no t-shirt in the catalogue** (longsleeves, jeans, hoodies,
  joggings, zips, one shirt, one short). The third piece is the Heritage Shirt
  until a tee exists; then it is one handle to change.
- `PACK_IMAGE` is a placeholder (`/images/histoire-cerisiers.webp`). Replace it
  with a photo of the three pieces worn together when there is one.

If a handle stops matching a product in Shopify, the loader logs a warning and
the page shows what it found rather than pretending a two-piece pack is a pack.

The page is linked from the footer only. Nothing else points to it, and without
that link it would exist and be unreachable.

## ⚠️ The old second-piece code, REDA1130

`app/lib/offers.ts` still holds `OFFER_DISCOUNT_CODE = 'REDA1130'`, and
`app/routes/cart.tsx` attaches it to the cart after every change. That code is
the *previous* offer (30% off the second piece) and it is **still active**.

An automatic app discount and a code for the same thing running together either
stack or fight, depending on how the discounts are set to combine in Shopify.
Once the tiered app is live, one of the two has to go. To stop the storefront
applying the old code:

```ts
// app/lib/offers.ts
export const OFFER_DISCOUNT_CODE: string = '';
```

Emptying it is enough — `withOfferDiscount` does nothing when it is empty, and
the existing cart keeps working. Deactivate the REDA1130 discount in Shopify
Admin at the same time. `SECOND_ITEM_DISCOUNT_PERCENT` in that file already
reads its figure from `tierDiscount.ts`, so the product page's "take two" block
announces the same number as the line under the price.
