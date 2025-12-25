import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, Ticket, CreditCard, GraduationCap, User, LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is organizer
  let isOrganizer = false;
  const { data: membership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  isOrganizer = !!membership;

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/portal" className="text-xl font-bold text-purple-600">
                  GrooveGrid
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/portal"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-purple-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/portal/tickets"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-purple-600"
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  My Tickets
                </Link>
                <Link
                  href="/portal/passes"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-purple-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  My Passes
                </Link>
                <Link
                  href="/portal/courses"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-purple-600"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  My Courses
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {/* Show Organizer Dashboard button if user is organizer */}
              {isOrganizer && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 mr-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Organizer Dashboard
                </Link>
              )}
              
              {/* Back to Home button */}
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 mr-3 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              
              <div className="flex-shrink-0">
                <Link
                  href="/portal/profile"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </div>
              
              {/* Sign Out button */}
              <form action={handleSignOut} className="ml-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

