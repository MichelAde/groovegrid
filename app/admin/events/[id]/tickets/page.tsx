'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function EventTicketsPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadEventData();
  }, [params.id]);

  async function loadEventData() {
    try {
      // Load event details
      const { data: eventData } = await supabase
        .from('events')
        .select('*, organization(*)')
        .eq('id', params.id)
        .single();

      setEvent(eventData);

      // Load orders for this event
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            ticket_types(*)
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Filter orders that have tickets for this event
      const eventOrders = orderData?.filter((order: any) =>
        order.order_items?.some((item: any) => 
          item.ticket_types?.event_id === params.id
        )
      ) || [];

      setOrders(eventOrders);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Event not found</div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const totalTickets = orders.reduce((sum, order) => {
    return sum + order.order_items
      .filter((item: any) => item.ticket_types?.event_id === params.id)
      .reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600">Ticket Sales & Orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders yet for this event
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const eventItems = order.order_items.filter(
                  (item: any) => item.ticket_types?.event_id === params.id
                );
                
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">Order #{order.order_number}</div>
                        <div className="text-sm text-gray-600">{order.buyer_name}</div>
                        <div className="text-sm text-gray-600">{order.buyer_email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${parseFloat(order.total).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      {eventItems.map((item: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.ticket_types.name} - ${parseFloat(item.unit_price).toFixed(2)} each
                        </div>
                      ))}
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












import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function EventTicketsPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadEventData();
  }, [params.id]);

  async function loadEventData() {
    try {
      // Load event details
      const { data: eventData } = await supabase
        .from('events')
        .select('*, organization(*)')
        .eq('id', params.id)
        .single();

      setEvent(eventData);

      // Load orders for this event
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            ticket_types(*)
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      // Filter orders that have tickets for this event
      const eventOrders = orderData?.filter((order: any) =>
        order.order_items?.some((item: any) => 
          item.ticket_types?.event_id === params.id
        )
      ) || [];

      setOrders(eventOrders);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Event not found</div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const totalTickets = orders.reduce((sum, order) => {
    return sum + order.order_items
      .filter((item: any) => item.ticket_types?.event_id === params.id)
      .reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/admin/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600">Ticket Sales & Orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders yet for this event
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const eventItems = order.order_items.filter(
                  (item: any) => item.ticket_types?.event_id === params.id
                );
                
                return (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">Order #{order.order_number}</div>
                        <div className="text-sm text-gray-600">{order.buyer_name}</div>
                        <div className="text-sm text-gray-600">{order.buyer_email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${parseFloat(order.total).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      {eventItems.map((item: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.ticket_types.name} - ${parseFloat(item.unit_price).toFixed(2)} each
                        </div>
                      ))}
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












