import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organization(name),
      ticket_types(*)
    `)
    .eq('status', 'published')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-600">
            Discover amazing Kizomba and Semba dance events
          </p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              const ticketTypes = event.ticket_types || [];
              const minPrice = ticketTypes.length > 0
                ? Math.min(...ticketTypes.map((t: any) => Number(t.price)))
                : null;

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {event.organization?.name}
                        </CardDescription>
                      </div>
                      {event.category && (
                        <span className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full">
                          {event.category}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(event.start_datetime)}</span>
                      </div>

                      {event.venue_name && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue_name}, {event.city}</span>
                        </div>
                      )}

                      {minPrice !== null && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Ticket className="w-4 h-4" />
                          <span>From {formatCurrency(minPrice)}</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/events/${event.id}`} className="block">
                      <Button className="w-full mt-2">
                        View Details & Get Tickets
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Upcoming Events</h2>
              <p className="text-gray-600">
                Check back soon for exciting dance events!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

