import { requireUser } from '@/lib/auth';
import { AccountPreferences } from '@/components/account-preferences';

type StoredPreferences = {
  emailMarketing?: boolean;
  smsMarketing?: boolean;
  restockAlerts?: boolean;
  orderUpdates?: boolean;
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const preferences = (user as unknown as { preferences?: StoredPreferences }).preferences ?? {
    emailMarketing: false,
    smsMarketing: false,
    restockAlerts: false,
    orderUpdates: true,
  };

  return (
    <>
      <span className="eyebrow">Account / Notifications</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Notifications.</h1>
      <AccountPreferences initialPreferences={{
        emailMarketing: Boolean(preferences.emailMarketing),
        smsMarketing: Boolean(preferences.smsMarketing),
        restockAlerts: Boolean(preferences.restockAlerts),
        orderUpdates: preferences.orderUpdates ?? true,
      }} />
    </>
  );
}
