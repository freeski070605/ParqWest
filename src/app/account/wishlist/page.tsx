import { requireUser } from '@/lib/auth';
import { AccountWishlist } from '@/components/account-wishlist';

export default async function WishlistPage() {
  const user = await requireUser();
  const wishlist = Array.isArray((user as unknown as { wishlist?: string[] }).wishlist)
    ? ((user as unknown as { wishlist?: string[] }).wishlist ?? [])
    : [];

  return (
    <>
      <span className="eyebrow">Account / Wishlist</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Wishlist.</h1>
      <AccountWishlist initialItems={wishlist} />
    </>
  );
}
