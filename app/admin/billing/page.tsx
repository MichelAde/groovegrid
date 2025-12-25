'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    lastMonth: 0,
    transactionCount: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberships) return;

      // Load orders (transactions)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('organization_id', memberships.organization_id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(orders || []);

      // Calculate stats
      const now = new Date();
      const thisMonth = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      }) || [];

      const lastMonth = orders?.filter(o => {
        const orderDate = new Date(o.created_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return orderDate.getMonth() === lastMonthDate.getMonth() && 
               orderDate.getFullYear() === lastMonthDate.getFullYear();
      }) || [];

      setStats({
        totalRevenue: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
        thisMonth: thisMonth.reduce((sum, o) => sum + Number(o.total_amount), 0),
        lastMonth: lastMonth.reduce((sum, o) => sum + Number(o.total_amount), 0),
        transactionCount: orders?.length || 0,
      });
    } catch (error) {
      console.error('Error loading billing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Revenue</h1>
        <p className="text-gray-600 mt-1">View your revenue and transaction history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth > stats.lastMonth ? '+' : ''}
              {stats.lastMonth > 0 
                ? Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100) 
                : 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.lastMonth)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent payments and orders</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{transaction.buyer_name}</p>
                          <p className="text-sm text-gray-600">{transaction.buyer_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {transaction.event_id ? 'Event Ticket' : 
                           transaction.pass_type_id ? 'Pass Purchase' : 'Other'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {formatCurrency(transaction.total_amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Manage your payment processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Stripe Account</h4>
                <p className="text-sm text-gray-600">Connected and active</p>
              </div>
              <Button variant="outline">Manage</Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Payout Schedule</h4>
                <p className="text-sm text-gray-600">Weekly on Monday</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Tax Settings</h4>
                <p className="text-sm text-gray-600">Configure tax collection</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
