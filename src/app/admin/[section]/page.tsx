import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

const sectionMap: Record<string, string> = {
  categories: '/admin/categories',
  collections: '/admin/collections',
  inventory: '/admin/inventory',
  products: '/admin/products',
  customers: '/admin/customers',
  orders: '/admin/orders',
  returns: '/admin/returns',
  content: '/admin/content',
  campaigns: '/admin/campaigns',
  media: '/admin/media',
  analytics: '/admin/analytics',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sectionMap[section]) notFound();
  await requireAdmin(section);
  redirect(sectionMap[section]);
}
