import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Ticket, Edit } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Image from 'next/image';

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id!)
    .limit(1)
    .single();

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types(*)
    `)
    .eq('organization_id', memberships?.organization_id || '')
    .order('start_datetime', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600 mt-1">Manage your events and ticket sales</p>
        </div>
        <Link href="/admin/events/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => {
            const ticketTypes = event.ticket_types || [];
            const totalSold = ticketTypes.reduce((sum: number, tt: any) => sum + (tt.quantity_sold || 0), 0);
            const totalAvailable = ticketTypes.reduce((sum: number, tt: any) => sum + (tt.quantity_available || 0), 0);

            return (
              <Card key={event.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Event Image */}
                    <div className="w-48 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          width={192}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          {event.category && (
                            <span className="text-sm text-gray-500">{event.category}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            event.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(event.start_datetime)}</span>
                        </div>
                        {event.venue_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue_name}, {event.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Stats */}
                      {ticketTypes.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium">Ticket Sales</span>
                            <span className="text-gray-600">
                              {totalSold} / {totalAvailable} sold
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(totalSold / totalAvailable) * 100}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>{ticketTypes.length} ticket types</span>
                            <span>•</span>
                            <Link
                              href={`/admin/events/${event.id}/tickets`}
                              className="text-primary hover:underline"
                            >
                              Manage Tickets
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first event to start selling tickets
            </p>
            <Link href="/admin/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



