import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Users, Ticket, Music } from 'lucide-react';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if user is organizer
  let isOrganizer = false;
  if (user) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    isOrganizer = !!membership;
  }

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Music className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">GrooveGrid</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </Link>
              <Link href="/classes" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                <Users className="w-4 h-4" />
                <span>Classes</span>
              </Link>
              <Link href="/passes" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                <Ticket className="w-4 h-4" />
                <span>Passes</span>
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Show Portal for all logged-in users */}
                  <Link
                    href="/portal"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    My Portal
                  </Link>
                  
                  {/* Show Organizer Dashboard only for organizers */}
                  {isOrganizer && (
                    <Link
                      href="/admin"
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
                    >
                      Organizer Dashboard
                    </Link>
                  )}
                  
                  {/* Show Sign Out */}
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="text-gray-700 hover:text-red-600 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">GrooveGrid</span>
              </div>
              <p className="text-gray-400 text-sm">
                The complete platform for dance event organizers and school owners.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Organizers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/admin/events" className="hover:text-white transition-colors">Manage Events</Link></li>
                <li><Link href="/admin/courses" className="hover:text-white transition-colors">Manage Courses</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">For Dancers</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link href="/classes" className="hover:text-white transition-colors">Find Classes</Link></li>
                <li><Link href="/portal" className="hover:text-white transition-colors">My Account</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} GrooveGrid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



