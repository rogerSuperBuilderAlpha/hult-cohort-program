import { metadataForPath } from '@/lib/page-metadata';

export const metadata = metadataForPath('/dashboard');

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
