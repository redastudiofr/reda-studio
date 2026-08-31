# Legal pages and order tracking

## Where the legal text lives

The five documents are written in `app/data/legal.ts` and rendered by
`app/routes/legal.$handle.tsx`:

| Page | URL |
| --- | --- |
| Terms & Conditions | `/legal/terms` |
| Shipping Policy | `/legal/shipping` |
| Return & Refund Policy | `/legal/returns` |
| Privacy Policy | `/legal/privacy` |
| Legal Notice | `/legal/legal-notice` |

They live in the repo rather than in Shopify Admin's policy editor for two
reasons: they are versioned with the code and reviewable in a diff, and Shopify
has no slot at all for a French *mentions légales*, which a site selling into
France is required to publish.

## The Legal Notice (`/legal/legal-notice`) is in French, not English

Unlike the other four documents. "Mentions légales" is a specific French legal
filing (LCEN article 6-III), not a genre that translates, and every field it
requires — SIREN, SIRET, TVA intracommunautaire — is a French concept with no
English equivalent worth inventing. Its own `title`/`navLabel`/`intro` in
`app/data/legal.ts` are French for the same reason; the shared page chrome
around it (the "documents" sidebar, "last updated") stays English, same as on
every other legal page.

## ⚠ What is still missing, and how it's marked

The Legal Notice's **éditeur du site** and **nous contacter** sections read as
a form (`fields` on a `LegalSection` — see the type in `app/data/legal.ts`),
one row per fact. Every row that could be verified from this codebase is
filled in for real; every row that could not was left as a bracketed
placeholder, `[à compléter]`, rather than guessed. The renderer
(`app/routes/legal.$handle.tsx`) detects that bracket and gives it a visibly
different style — dashed underline, muted, italic — so it can never be
mistaken for a real answer at a glance. Still to complete:

- **Nom / raison sociale** — the registered company name
- **Forme juridique** — SASU, SARL, EI, etc.
- **Siège social** — the registered address
- **SIREN** and **SIRET**
- **Numéro de TVA intracommunautaire** — if the company charges VAT
- **Représentant légal** — the legal representative's name
- **Directeur de la publication** — who's responsible for what's published
- **Téléphone** — appears twice (éditeur du site, nous contacter)
- **Adresse** (nous contacter) — the same siège social, or a different
  service address if there is one

Already real, not placeholders: **Nom commercial** (Reda Studio) and
**Contact / Email** (redastudio.fr@gmail.com, also now the one linked from the
footer — see `STORE_NOTIFICATION_EMAIL` in `app/lib/email.ts`, the same
address the review form and the pop-up's phone sign-ups already mail to).

To fill in a blank: open `app/data/legal.ts`, find the `fields` array under
`heading: 'éditeur du site'` or `heading: 'nous contacter'`, and replace the
`[à compléter]` string with the real value. Nothing else needs to change — the
dashed placeholder styling only applies to strings shaped like `[...]`, so a
real value renders as ordinary text automatically.

**One sentence was shortened**, in Terms & Conditions § *who we are*. It used
to open by naming the operating company, its address, its registration and its
VAT number before defining "we" and "you". It now only defines the terms.

**One sentence in Privacy Policy § *who is responsible*** says "the company
operating this store" rather than naming it, and now points to the Legal
Notice for the full identity — which is accurate today (a page that says so
honestly) and becomes fully accurate the moment the Legal Notice's blanks are
filled, with nothing further to change here.

**Five places used to give a support email address** and now send the customer
to the contact page instead — Terms § *complaints and disputes*, Shipping §
*wrong address, failed delivery*, Returns § *how to return*, and Privacy in both
*who is responsible* and *your rights*. Those read perfectly well as they are;
change them back only if you would rather publish an address than a form.

**The cookies sections (Privacy, and the Legal Notice) were checked against
what the site actually loads**, not assumed: this storefront runs Shopify
Hydrogen's own built-in `Analytics.Provider` (first-party, reports to this
store's own Shopify Admin) and nothing else — no Google Analytics, no Meta
Pixel, no TikTok Pixel, verified by grep across `app/`. Both documents say so
plainly, and neither claims cookies are gated behind a consent banner, because
none is implemented (`withPrivacyBanner: false` in `app/root.tsx`) — a
consent banner is a real feature to build, not a sentence to write.

While you are there, read the documents. They are written from how this store
actually operates — 1 to 3 business days to ship, 48 hours in France, 30 days
to return, free shipping over €150. **If any of that changes, the text has to
change with it.** A shipping policy that does not describe your shipping is
worse than none.

## Shopify's own policies still exist

Shopify Admin → Settings → Policies holds a separate set of documents, and
Shopify's hosted checkout links to *those*, not to these. The `/policies/*`
routes still render them.

So: paste the same text into the Admin policies once the blanks are filled.
Otherwise a customer sees one set of terms on the storefront and another at
checkout — which, on the terms that govern the sale, is a real problem rather
than an untidy one.

## Order tracking

`/order-tracking` takes an order number and an email address and shows the
status, carrier, tracking number, dispatch date, delivery estimate and the full
event history for each parcel.

### Why it asks the customer to confirm their email

Shopify does not expose order data to an unauthenticated caller, and that is
the right design: an order number is a small sequential integer, so a number
plus a guessed email would let anyone walk other people's addresses and
purchase history.

The lookup therefore runs against the **Customer Account API**. A visitor who
has not been identified yet is sent to `/account/login` with two parameters:

- `login_hint` — the address they just typed, so Shopify prefills it
- `return_to=/order-tracking` — read by Hydrogen when the authorisation comes
  back, which is what returns them to the tracking page instead of the account
  dashboard

Shopify emails them a one-time code. There is no password to create, so it
costs the customer one extra click and an email — not an account.

Once identified, the email field is still checked, against the address on the
order itself.

### What it needs to work

Nothing beyond what the store already has: the Customer Account API is the same
one `/account` uses. If `/account/login` works, tracking works.

An order with no fulfilment yet shows "confirmed and being prepared" rather
than an empty table — which is the honest answer for the first one to three
days.
