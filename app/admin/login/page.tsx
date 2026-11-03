import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Login', robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const admin = await getAdmin();
  if (admin) redirect('/admin');
  return <LoginForm />;
}
