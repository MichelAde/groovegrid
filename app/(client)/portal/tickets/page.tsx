'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get tickets from orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            ticket_types(
              *,
              events(*)
            )
          )
        `)
        .eq('buyer_email', user.email)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const allTickets: any[] = [];
      orders?.forEach((order: any) => {
        order.order_items?.forEach((item: any) => {
          if (item.ticket_types && item.ticket_types.events) {
            for (let i = 0; i < item.quantity; i++) {
              allTickets.push({
                orderId: order.id,
                orderNumber: order.order_number,
                ticketType: item.ticket_types.name,
                event: item.ticket_types.events,
                purchaseDate: order.created_at,
              });
            }
          }
        });
      });

      setTickets(allTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Tickets Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't purchased any tickets yet. Browse upcoming events to get started!
              </p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{ticket.event.title}</span>
                    <span className="text-sm font-normal text-gray-500">
                      Order #{ticket.orderNumber}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Ticket className="w-4 h-4" />
                    <span>{ticket.ticketType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(ticket.event.start_datetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{ticket.event.venue_name}, {ticket.event.city}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

