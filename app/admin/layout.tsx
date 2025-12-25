import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrganizationSwitcher from '@/components/OrganizationSwitcher';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  GraduationCap,
  Users,
  CreditCard,
  BarChart3,
  Mail,
  LogOut,
  Settings,
} from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-primary">GrooveGrid</span>
          </Link>
          <OrganizationSwitcher />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/events"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Events</span>
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Courses</span>
          </Link>

          <Link
            href="/admin/passes"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <Ticket className="w-5 h-5" />
            <span>Passes</span>
          </Link>

          <Link
            href="/admin/enrollments"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Enrollments</span>
          </Link>

          <Link
            href="/admin/campaigns"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Campaigns</span>
          </Link>

          <Link
            href="/admin/sales"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Sales</span>
          </Link>

          <Link
            href="/admin/billing"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span>Billing</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary rounded-md transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.email}</div>
            </div>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}



