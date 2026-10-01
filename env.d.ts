/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    // Required by the -15% pop-up: every phone sign-up is stored in this
    // Notion database, and the pop-up stays hidden until both are set — see
    // docs/emails-newsletter.md and app/routes/newsletter.tsx. Read on the
    // server only; never sent to the browser.
    NOTION_API_KEY?: string;
    NOTION_PHONE_DATABASE_ID?: string;

    // Optional: sends the review form and each pop-up phone sign-up to
    // redastudio.fr@gmail.com by e-mail — see docs/store-notifications.md
    // and app/lib/email.ts.
    RESEND_API_KEY?: string;

    // Test review counts (4.5 from 87–344 reviews per product) for checking
    // the interface on an Oxygen preview. Set it on the Preview environment
    // only; it is refused on redastudio.fr whatever its value — see
    // app/data/reviews.ts and docs/synthetic-ratings.md.
    DEMO_RATINGS?: string;
  }
}
