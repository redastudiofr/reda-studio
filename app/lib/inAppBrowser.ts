import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

/**
 * Is this page being viewed inside a social app's own browser?
 *
 * It matters for one reason: video. TikTok's in-app browser (and Instagram's,
 * and Facebook's) does not honour `playsinline` reliably — it hands muted,
 * decorative background clips to the system player, which throws them full
 * screen over the shop on its own. There is no attribute that reliably stops
 * it from the page's side, so the site simply doesn't play video there.
 *
 * Detected on the server from the User-Agent, not in the browser: the markup
 * then arrives already correct, with no flash of a video that is removed a
 * moment later and no hydration mismatch.
 *
 * User-Agent sniffing is normally a last resort, and this is one of the cases
 * it exists for — the behaviour being worked around belongs to a specific set
 * of embedded browsers and is not detectable by feature.
 */
const IN_APP_PATTERNS = [
  // TikTok: "BytedanceWebview" on Android, "musical_ly"/"Trill" on iOS.
  /BytedanceWebview/i,
  /musical_ly/i,
  /\bTrill\b/i,
  /\bTikTok\b/i,
  // Meta apps.
  /Instagram/i,
  /\bFB(AN|AV|_IAB|IOS|BV)\b/i,
  // Others whose in-app browsers behave the same way with video.
  /Snapchat/i,
  /MicroMessenger/i,
  /\bLine\//i,
  /Pinterest/i,
];

export function isInAppBrowser(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return IN_APP_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * The flag the root loader worked out for this request. Read straight from
 * root rather than threaded through every component in between — the same
 * pattern CartSuggestions uses.
 */
export function useInAppBrowser(): boolean {
  const rootData = useRouteLoaderData<RootLoader>('root');
  return Boolean(rootData?.inAppBrowser);
}
