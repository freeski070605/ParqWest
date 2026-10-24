import { requireUser } from '@/lib/auth';

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <span className="eyebrow">Account / Settings</span>
      <h1 className="display" style={{ fontSize: '4rem', margin: 0 }}>Settings.</h1>
      <div className="admin-card" style={{ maxWidth: '640px', marginTop: '2rem' }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </>
  );
}
