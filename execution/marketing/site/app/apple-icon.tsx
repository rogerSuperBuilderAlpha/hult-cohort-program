import { hultMarkSvg, pngImageResponse } from '@/lib/og-image';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return pngImageResponse(hultMarkSvg(180, true), size.width, size.height);
}
