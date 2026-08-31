/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    // Optional: mirrors each pop-up phone sign-up into a Notion database.
    // Unset in every environment until docs/emails-newsletter.md's Notion
    // section is followed — see app/routes/newsletter.tsx.
    NOTION_API_KEY?: string;
    NOTION_PHONE_DATABASE_ID?: string;

    // Optional: sends the review form and each pop-up phone sign-up to
    // redastudio.fr@gmail.com by e-mail — see docs/store-notifications.md
    // and app/lib/email.ts.
    RESEND_API_KEY?: string;
  }
}
