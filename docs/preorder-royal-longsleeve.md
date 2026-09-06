# "Royal Longsleeve — White" — pre-order waitlist

This one product is not for sale yet. Its product page shows a single
**pre-order** button instead of add-to-cart/buy-now; clicking it opens a
form asking for an email and/or phone number, which joins a waitlist —
no order is created.

Every other product on the site is completely unaffected — see "Where the
gate lives" below for exactly how narrow this is.

## Where the gate lives

Everything that scopes this to one product is in **`app/lib/preorder.ts`**:

- `PREORDER_PRODUCT_HANDLE` — the product's handle (`royal-longsleeve-white`).
  `app/routes/products.$handle.tsx` checks the current product's handle
  against this and passes the result down as a `preorder` prop; nothing
  else about that route changes for any other handle.
- `PREORDER_BLOCKED_VARIANT_IDS` — that product's variant ids, checked in
  `app/routes/cart.tsx` so a request crafted straight against the cart
  action (bypassing the buy box, which never renders an add-to-cart control
  for this product) still can't add it. **If a size is ever added to this
  product while the pre-order is active, add its variant id here too** —
  Shopify Admin → Products → this product → the new variant → copy the
  numeric id from its URL.

To move the pre-order to a different product later, change
`PREORDER_PRODUCT_HANDLE` and replace the ids in
`PREORDER_BLOCKED_VARIANT_IDS` with the new product's own. To turn it off
entirely (this product going on sale normally), delete both — the buy box
and cart both fall back to their normal behaviour with no other change.

## What happens on sign-up

`app/components/PreorderForm.tsx` is the button + the dialog (visually
built from the same `.popup*` styles as the newsletter pop-up — see
`app/styles/app.css` — so it reads as part of the same site, not a bolted-on
widget). Submitting posts to `app/routes/preorder.tsx`, which forwards the
email or phone straight to the store's native customer form — the exact
same mechanism `app/routes/newsletter.tsx` already uses, and for the same
reason: Shopify already owns consent, unsubscribe and deletion, so nothing
here keeps a second copy of anyone's contact details. **No order is
created** — the product isn't for sale, so nothing is added to any cart.

Each sign-up lands in Shopify Admin → Customers, tagged `preorder` and
`preorder-royal-longsleeve-white`. Duplicate sign-ups don't create a second
customer record: Shopify's native form matches on the email or phone given
and updates the existing customer's tags instead, exactly like the
newsletter sign-ups already rely on (see `docs/emails-newsletter.md`).

### Finding the list

1. **admin.shopify.com** → the store → **Customers**.
2. **Filter** → **Tag** → `preorder-royal-longsleeve-white`.
3. Optionally, **Save as segment** so it's one click from then on (same
   steps as `docs/emails-newsletter.md`'s newsletter segment).

## The launch offer

`PREORDER_LAUNCH_PROMO_CODE` in `app/lib/preorder.ts` is the discount
promised to the waitlist. **Nothing in the code sends it automatically** —
by design, per the brief this was built against: the offer only goes out
once the product actually launches, by hand, so it can't fire early by
accident.

To run it when the piece is ready:

1. **Create the discount code** in Shopify Admin → **Discounts**, using the
   same code as `PREORDER_LAUNCH_PROMO_CODE` (change the constant first if
   you'd rather pick a different code — it's just a string, referenced
   nowhere else).
2. **Marketing** → **Create campaign** → *Shopify Email*, audience = the
   `preorder-royal-longsleeve-white` segment saved above.
3. Write the announcement — the brief's own example:

   > YOUR EARLY ACCESS IS HERE.
   > The Royal Longsleeve — White is officially available.
   > As a member of the waitlist, you receive an exclusive discount.

   with the discount code from step 1.

## Why not a custom database

Same reasoning as the newsletter feature (`docs/emails-newsletter.md`,
"Pourquoi pas une page « admin » sur le site ?"): the Storefront API this
site runs on has no access to the customer list at all, and a public
page listing sign-ups would expose them to any visitor. Shopify Admin →
Customers is the tool already built for this, already behind the store's
own login.
