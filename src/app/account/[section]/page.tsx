import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

const sectionMap: Record<string, string> = {
  wishlist: '/account/wishlist',
  addresses: '/account/addresses',
  returns: '/account/returns',
  notifications: '/account/notifications',
  settings: '/account/settings',
};

export default async function AccountSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sectionMap[section]) notFound();
  await requireUser();
  redirect(sectionMap[section]);
}
