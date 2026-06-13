import { DEFAULT_OG_DESCRIPTION } from '@/lib/site-config';
import { ogImageJsx, pngImageResponse } from '@/lib/og-image';

export const alt = 'Hult Cohort Developer Program — Dare Mighty Things';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return pngImageResponse(
    ogImageJsx('Ship six production projects.', DEFAULT_OG_DESCRIPTION),
    size.width,
    size.height
  );
}
