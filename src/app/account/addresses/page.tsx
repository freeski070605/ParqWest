import { requireUser } from '@/lib/auth';
import { AccountAddresses } from '@/components/account-addresses';

type StoredAddress = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export default async function AddressesPage() {
  const user = await requireUser();
  const addresses = Array.isArray((user as unknown as { addresses?: StoredAddress[] }).addresses)
    ? ((user as unknown as { addresses?: StoredAddress[] }).addresses ?? []).map((address) => ({
        ...address,
        company: address.company ?? '',
        line2: address.line2 ?? '',
        country: address.country ?? 'US',
        isDefaultShipping: Boolean(address.isDefaultShipping),
        isDefaultBilling: Boolean(address.isDefaultBilling),
      }))
    : [];

  return (
    <>
      <span className="eyebrow">Account / Addresses</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Addresses.</h1>
      <AccountAddresses initialAddresses={addresses} />
    </>
  );
}
