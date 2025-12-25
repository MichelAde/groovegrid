import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Ticket,
  Users,
  Mail,
  BarChart3,
  Plus,
  GraduationCap,
  CreditCard,
  Upload,
  TrendingUp,
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's current organization
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id!)
    .limit(1)
    .single();

  // Fetch organization details separately
  const { data: organization } = await supabase
    .from('organization')
    .select('*')
    .eq('id', memberships?.organization_id || '')
    .single();

  // Quick stats
  const [eventsCount, coursesCount, passesCount] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization?.id || ''),
    supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization?.id || ''),
    supabase
      .from('pass_types')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization?.id || ''),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back to {organization?.name || 'your organization'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Courses available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Types</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passesCount.count || 0}</div>
            <p className="text-xs text-muted-foreground">Pass types created</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/events/create">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Create Event</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set up a new event with tickets and manage sales
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/campaigns/create">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">New Campaign</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Launch email, SMS, or WhatsApp marketing campaigns
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/sales">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">View Sales</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track revenue, tickets sold, and analytics
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/courses/create">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Create Course</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use AI to generate curriculum for dance classes
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/events">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Manage Tickets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View and edit ticket types for your events
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bulk-upload">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Bulk Upload</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload multiple event images at once
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      {(eventsCount.count === 0 && coursesCount.count === 0) && (
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <CardHeader>
            <CardTitle className="text-xl">🎉 Welcome to GrooveGrid!</CardTitle>
            <CardDescription>
              Get started by creating your first event or course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Quick Start Guide:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span>Create your first event and set up ticket types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span>Add class packages for your dance school</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span>Set up multi-event passes to build loyalty</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span>Launch your first marketing campaign</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/events/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Event
                </Button>
              </Link>
              <Link href="/admin/courses/create">
                <Button variant="outline">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Create First Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



