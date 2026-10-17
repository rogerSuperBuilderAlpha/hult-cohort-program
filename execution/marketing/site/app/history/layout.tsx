import { metadataForPath } from '@/lib/page-metadata';

export const metadata = metadataForPath('/history');

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
