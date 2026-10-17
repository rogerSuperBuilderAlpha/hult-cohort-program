import { OG_IMAGE_SIZE } from '@/lib/og-image-size';
import { ogImageJsx, pngImageResponse } from '@/lib/og-image';
import { OG_IMAGE_ALT, RUNS_ON_LUDWITT_LINE } from '@/lib/site-config';

export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return pngImageResponse(
    ogImageJsx('Build, deploy, and review production software.', RUNS_ON_LUDWITT_LINE),
    size.width,
    size.height
  );
}
