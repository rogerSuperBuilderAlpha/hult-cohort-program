import { hultMarkSvg, pngImageResponse } from '@/lib/og-image';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return pngImageResponse(hultMarkSvg(32), size.width, size.height);
}
