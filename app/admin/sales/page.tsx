import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Ticket, TrendingUp, Users, Calendar } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default async function SalesPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id!)
    .limit(1)
    .single();

  if (!memberships) {
    return <div>No organization found</div>;
  }

  const orgId = memberships.organization_id;

  // Get orders summary
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalSubtotal = orders?.reduce((sum, order) => sum + Number(order.subtotal), 0) || 0;
  const totalFees = orders?.reduce((sum, order) => sum + Number(order.fees), 0) || 0;
  
  // Get ticket stats
  const { data: ticketTypes } = await supabase
    .from('ticket_types')
    .select('*, events(title)')
    .eq('events.organization_id', orgId);

  const totalTicketsSold = ticketTypes?.reduce((sum, tt) => sum + tt.quantity_sold, 0) || 0;

  // Get events list
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', orgId)
    .order('start_datetime', { ascending: false })
    .limit(10);

  // Calculate this month's stats
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= firstDayOfMonth) || [];
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.total), 0);

  // Get pass stats
  const { data: passTypes } = await supabase
    .from('pass_types')
    .select('*')
    .eq('organization_id', orgId);

  const totalPassTypes = passTypes?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your revenue and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All-time gross revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyOrders.length} orders this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Where your money comes from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ticket Sales</span>
              <span className="font-semibold">{formatCurrency(totalSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform Fees (2%)</span>
              <span className="font-semibold text-red-600">-{formatCurrency(totalFees)}</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="font-semibold">Your Net Revenue</span>
              <span className="font-bold text-primary">{formatCurrency(totalSubtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Platform fees and Stripe fees are deducted from gross revenue. The net amount above is what you receive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your offerings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Total Events</span>
              </div>
              <span className="font-semibold">{events?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Pass Types</span>
              </div>
              <span className="font-semibold">{totalPassTypes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Unique Customers</span>
              </div>
              <span className="font-semibold">
                {new Set(orders?.map(o => o.buyer_email)).size}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Avg Order Value</span>
              </div>
              <span className="font-semibold">
                {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0.00'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders yet. Start selling tickets!
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{order.buyer_name}</div>
                    <div className="text-sm text-gray-600">{order.buyer_email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(order.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {formatCurrency(Number(order.total))}
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Performance</CardTitle>
          <CardDescription>Ticket sales by event</CardDescription>
        </CardHeader>
        <CardContent>
          {!ticketTypes || ticketTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events with tickets yet
            </div>
          ) : (
            <div className="space-y-3">
              {ticketTypes
                .sort((a, b) => b.quantity_sold - a.quantity_sold)
                .slice(0, 5)
                .map((tt) => {
                  const soldPercentage = (tt.quantity_sold / tt.quantity_available) * 100;
                  const revenue = Number(tt.price) * tt.quantity_sold;

                  return (
                    <div key={tt.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{tt.events?.title || 'Unknown Event'}</div>
                          <div className="text-sm text-gray-600">{tt.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(revenue)}</div>
                          <div className="text-xs text-gray-500">
                            {tt.quantity_sold} / {tt.quantity_available} sold
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

