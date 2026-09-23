# Pack essentiel — three pieces, a fourth tee free

The customer picks a pair of jeans, a longsleeve and a tee, each in their
size, and Shopify gives a fourth tee.

**The storefront never decides what anyone pays.** The reduction is a native
Shopify "Buy X get Y" discount configured in the admin. This repository only
chooses the pieces, says what the offer is and puts the lines in the basket.
Nothing here computes a price, and nothing here shows a struck-through one:
there is no "before" price to strike, because no piece is being discounted —
one is given.

## The pieces, and why the list matters

The page can only promise a free tee for the products the **discount rule**
accepts. If the two lists ever differ, a customer is shown the offer, adds
three pieces and is charged full price at checkout, silently.

`app/lib/packOffer.ts` is the single place the storefront's side is written,
and it reads two sources in order:

1. **The `pack-essentiel` collection in Shopify Admin**, if it exists and
   holds at least three products. Point the Buy X get Y rule at that same
   collection and the two can never drift — adding a product to the
   collection adds it to the page, with no deploy.
2. **Otherwise the explicit handles** in `PACK_FALLBACK_HANDLES`, which have
   to be kept in step with the rule by hand.

Today there is no such collection, so the fallback is in use. **Creating it
is the recommended setup.**

Two things are filtered out of whatever the source returns: anything with no
variant in stock (a piece nobody can add is not a choice) and the pre-ordered
piece, which the cart action refuses outright (see `app/lib/preorder.ts`).

Each product is filed under jeans / longsleeve / tee by what it is — its
type, title and handle — so a product added to the collection lands in the
right slot on its own. Anything matching none of the three is left out rather
than filed under a guess.

### The product-page line

`PackNote` (the line under the price, "fait partie du pack essentiel — 1
tshirt offert") checks `PACK_FALLBACK_HANDLES` and nothing else: the browser
has no idea what a Shopify collection contains. **If you switch to the
collection, keep the handles here equal to it**, or that line will appear on
the wrong products.

## ⚠️ Does the free tee have to be in the basket?

Shopify's "Buy X get Y" **discounts a line; it does not create one**. It only
takes money off a Y that is already in the cart.

So the right setting depends on how the rule was written:

| The rule | `PACK_ADDS_FREE_LINE` |
| --- | --- |
| Buy 3 pieces, get a **fourth** tee free | `true` |
| One of the three chosen pieces is itself the free one | `false` (current) |

With the flag on, the button adds a second unit of the tee the customer
picked, at its normal price, and the discount takes it off.

This is a flag rather than a guess because getting it wrong is silent: the
basket simply charges full price and nobody finds out until a customer
complains. **Check it against the rule in Shopify Admin → Discounts before
announcing the offer.**

## Where the offer shows

| Where | What | Component |
| --- | --- | --- |
| `/pack` | the three selectors, the free tee, one button | `app/routes/pack.tsx` |
| Homepage | a paragraph between two hairlines, after the catalogue | `PackTeaser` |
| Product page of an eligible piece | one line under the price | `PackNote` |
| Footer | "pack essentiel" under informations | `Footer` |

No banner, no countdown, no badge. The offer is stated once per page in the
site's own voice, because a reduction announced loudly is what a shop does
when the reduction is the only thing worth saying about the clothes.

## Turning it off

`PACK_ENABLED = false` in `app/lib/packOffer.ts` takes every mention off the
storefront at once — teaser, product lines and all — without touching
anything in Shopify. The page itself stays reachable; delete the route to
remove it.

## Other discounts running at the same time

Three separate things can take money off this storefront today, and they are
configured in three different places:

- this pack's Buy X get Y rule;
- the tiered "2nd −20%, 3rd −30%" offer (`app/lib/tierDiscount.ts`, see
  `docs/tier-discount.md`);
- the old `REDA1130` code, still attached to every cart by
  `app/routes/cart.tsx`.

They stack or fight depending on how each is set to combine in Shopify. Decide
which ones should coexist before pushing the pack — see the warning at the end
of `docs/tier-discount.md`.
