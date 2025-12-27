'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, GraduationCap, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function ClientPortalPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    activePasses: 0,
    enrolledCourses: 0,
    upcomingEvents: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [myPasses, setMyPasses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load my tickets/orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, events(*)')
        .eq('buyer_email', user.email)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load my active passes
      const { data: passes } = await supabase
        .from('user_passes')
        .select('*, pass_types(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Load my enrolled courses
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Get upcoming events from my tickets
      const eventIds = orders?.map(o => o.event_id).filter(Boolean) || [];
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime')
        .limit(5);

      setStats({
        activeOrders: orders?.length || 0,
        activePasses: passes?.length || 0,
        enrolledCourses: enrollments?.length || 0,
        upcomingEvents: events?.length || 0,
      });

      setUpcomingEvents(events || []);
      setMyPasses(passes || []);
      setMyCourses(enrollments || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your tickets, passes, and enrollments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">Active event tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePasses}</div>
              <p className="text-xs text-muted-foreground">Multi-event passes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events you're attending</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you have tickets for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_datetime).toLocaleDateString()} at{' '}
                        {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">{event.venue_name}</p>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Active Passes */}
        {myPasses.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Active Passes</CardTitle>
              <CardDescription>Your multi-event passes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPasses.map((pass: any) => (
                  <div key={pass.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{pass.pass_types?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Credits remaining: {pass.credits_remaining || 'Unlimited'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valid until: {new Date(pass.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href="/passes"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Use Pass
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Courses */}
        {myCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your enrolled dance courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{enrollment.courses?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {enrollment.courses?.level} • {enrollment.courses?.duration_weeks} weeks
                      </p>
                      <p className="text-sm text-gray-500">
                        Instructor: {enrollment.courses?.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Progress: {enrollment.attendance_count || 0} / {enrollment.courses?.duration_weeks}
                      </p>
                      <p className="text-xs text-gray-500">classes attended</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {stats.activeOrders === 0 && stats.activePasses === 0 && stats.enrolledCourses === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to GrooveGrid!</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any tickets, passes, or enrolled in courses yet.
              </p>
              <div className="space-x-4">
                <Link
                  href="/events"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Browse Events
                </Link>
                <Link
                  href="/passes"
                  className="inline-block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  View Passes
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}













import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, GraduationCap, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function ClientPortalPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    activePasses: 0,
    enrolledCourses: 0,
    upcomingEvents: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [myPasses, setMyPasses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load my tickets/orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, events(*)')
        .eq('buyer_email', user.email)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      // Load my active passes
      const { data: passes } = await supabase
        .from('user_passes')
        .select('*, pass_types(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Load my enrolled courses
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Get upcoming events from my tickets
      const eventIds = orders?.map(o => o.event_id).filter(Boolean) || [];
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime')
        .limit(5);

      setStats({
        activeOrders: orders?.length || 0,
        activePasses: passes?.length || 0,
        enrolledCourses: enrollments?.length || 0,
        upcomingEvents: events?.length || 0,
      });

      setUpcomingEvents(events || []);
      setMyPasses(passes || []);
      setMyCourses(enrollments || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your tickets, passes, and enrollments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">Active event tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePasses}</div>
              <p className="text-xs text-muted-foreground">Multi-event passes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events you're attending</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events you have tickets for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_datetime).toLocaleDateString()} at{' '}
                        {new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-gray-500">{event.venue_name}</p>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Active Passes */}
        {myPasses.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Active Passes</CardTitle>
              <CardDescription>Your multi-event passes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myPasses.map((pass: any) => (
                  <div key={pass.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{pass.pass_types?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Credits remaining: {pass.credits_remaining || 'Unlimited'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Valid until: {new Date(pass.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href="/passes"
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Use Pass
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Courses */}
        {myCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your enrolled dance courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{enrollment.courses?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {enrollment.courses?.level} • {enrollment.courses?.duration_weeks} weeks
                      </p>
                      <p className="text-sm text-gray-500">
                        Instructor: {enrollment.courses?.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Progress: {enrollment.attendance_count || 0} / {enrollment.courses?.duration_weeks}
                      </p>
                      <p className="text-xs text-gray-500">classes attended</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {stats.activeOrders === 0 && stats.activePasses === 0 && stats.enrolledCourses === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to GrooveGrid!</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any tickets, passes, or enrolled in courses yet.
              </p>
              <div className="space-x-4">
                <Link
                  href="/events"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Browse Events
                </Link>
                <Link
                  href="/passes"
                  className="inline-block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  View Passes
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}














