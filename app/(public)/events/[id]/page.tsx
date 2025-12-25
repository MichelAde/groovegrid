'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, Minus, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_active: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        supabase
          .from('events')
          .select('*, organization(name, logo_url)')
          .eq('id', eventId)
          .single(),
        supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .order('sort_order'),
      ]);

      if (eventRes.error) throw eventRes.error;
      if (ticketsRes.error) throw ticketsRes.error;

      setEvent(eventRes.data);
      setTicketTypes(ticketsRes.data || []);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (ticketId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      const ticket = ticketTypes.find(t => t.id === ticketId);
      const available = ticket ? ticket.quantity_available - ticket.quantity_sold : 0;
      const finalValue = Math.min(newValue, available);
      
      if (finalValue === 0) {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ticketId]: finalValue };
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === ticketId);
      return sum + (ticket ? Number(ticket.price) * quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = async () => {
    if (!buyerInfo.name || !buyerInfo.email) {
      alert('Please provide your name and email');
      return;
    }

    if (getCartItemsCount() === 0) {
      alert('Please select at least one ticket');
      return;
    }

    setProcessing(true);

    try {
      const items = Object.entries(cart).map(([ticketId, quantity]) => {
        const ticket = ticketTypes.find(t => t.id === ticketId)!;
        return {
          ticket_type_id: ticketId,
          quantity,
          price: Number(ticket.price),
          name: ticket.name,
        };
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          event_id: eventId,
          buyer_email: buyerInfo.email,
          buyer_name: buyerInfo.name,
          purchase_type: 'ticket_purchase',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to process checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-600">This event doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    <CardDescription className="text-base">
                      By {event.organization?.name}
                    </CardDescription>
                  </div>
                  {event.category && (
                    <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div className="text-gray-600">{formatDateTime(event.start_datetime)}</div>
                  </div>
                </div>

                {event.venue_name && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{event.venue_name}</div>
                      {event.address && <div className="text-gray-600">{event.address}</div>}
                      <div className="text-gray-600">
                        {event.city}, {event.province}, {event.country}
                      </div>
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Capacity</div>
                      <div className="text-gray-600">{event.capacity} attendees</div>
                    </div>
                  </div>
                )}

                {event.description && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-2">About This Event</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ticket Types */}
            <Card>
              <CardHeader>
                <CardTitle>Select Tickets</CardTitle>
                <CardDescription>Choose your ticket type and quantity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tickets available for this event yet.
                  </div>
                ) : (
                  ticketTypes.map((ticket) => {
                    const available = ticket.quantity_available - ticket.quantity_sold;
                    const cartQty = cart[ticket.id] || 0;

                    return (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-lg">{ticket.name}</div>
                            {ticket.description && (
                              <div className="text-sm text-gray-600 mt-1">{ticket.description}</div>
                            )}
                            <div className="text-sm text-gray-500 mt-2">
                              {available} tickets remaining
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(Number(ticket.price))}
                          </div>
                        </div>

                        {available > 0 ? (
                          <div className="flex items-center gap-3">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateCart(ticket.id, -1)}
                              disabled={cartQty === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{cartQty}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => updateCart(ticket.id, 1)}
                              disabled={cartQty >= available}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-red-600 font-medium">Sold Out</div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getCartItemsCount() === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No tickets selected
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {Object.entries(cart).map(([ticketId, quantity]) => {
                        const ticket = ticketTypes.find(t => t.id === ticketId);
                        if (!ticket) return null;
                        return (
                          <div key={ticketId} className="flex justify-between text-sm">
                            <span>{quantity}x {ticket.name}</span>
                            <span>{formatCurrency(Number(ticket.price) * quantity)}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Subtotal</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        + 2% platform fee + 13% tax at checkout
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={buyerInfo.name}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={buyerInfo.email}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={processing || !buyerInfo.name || !buyerInfo.email}
                    >
                      {processing ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Secure payment powered by Stripe
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

