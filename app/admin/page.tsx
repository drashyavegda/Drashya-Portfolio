import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Dashboard', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return <AdminDashboard adminEmail={admin.email} />;
}
