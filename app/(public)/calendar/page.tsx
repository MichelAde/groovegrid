import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, MapPin, Ticket, Building2, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default async function CommunityCalendarPage() {
  const supabase = await createClient();

  // Get all published events from all organizations
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organization(name, logo_url),
      ticket_types(*)
    `)
    .eq('status', 'published')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(100);

  // Group events by month
  const eventsByMonth: { [key: string]: any[] } = {};
  
  events?.forEach((event) => {
    const date = new Date(event.start_datetime);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });

  // Get unique cities and organizers for filtering (future enhancement)
  const cities = new Set(events?.map(e => e.city).filter(Boolean));
  const organizers = new Set(events?.map(e => e.organization?.name).filter(Boolean));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Event Calendar
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover all upcoming Kizomba and Semba events across Canada
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-primary-50 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">
                {events?.length || 0} Upcoming Events
              </span>
            </div>
            <div className="bg-primary-50 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">
                {cities.size} Cities
              </span>
            </div>
            <div className="bg-primary-50 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">
                {organizers.size} Organizers
              </span>
            </div>
          </div>
        </div>

        {/* Filters (Placeholder for future) */}
        <Card className="mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters:</span>
                <span className="text-sm">All Cities • All Organizers • All Types</span>
              </div>
              <Button variant="outline" size="sm" disabled>
                Customize Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events by Month */}
        {Object.keys(eventsByMonth).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Upcoming Events</h2>
              <p className="text-gray-600 mb-6">
                Check back soon for new events from the community!
              </p>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-6">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">{month}</h2>
                  <span className="text-gray-500">({monthEvents.length} events)</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {monthEvents.map((event: any) => {
                    const ticketTypes = event.ticket_types || [];
                    const minPrice = ticketTypes.length > 0
                      ? Math.min(...ticketTypes.map((t: any) => Number(t.price)))
                      : null;

                    return (
                      <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row">
                          {/* Event Image */}
                          {event.image_url && (
                            <div className="relative w-full md:w-64 h-48 flex-shrink-0">
                              <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Event Details */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {event.organization?.logo_url && (
                                    <img
                                      src={event.organization.logo_url}
                                      alt={event.organization.name}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building2 className="w-4 h-4" />
                                    <span>{event.organization?.name}</span>
                                  </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                                {event.description && (
                                  <p className="text-gray-600 line-clamp-2 mb-3">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              {event.category && (
                                <span className="px-3 py-1 bg-primary-100 text-primary text-sm rounded-full font-medium">
                                  {event.category}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">
                                  {formatDateTime(event.start_datetime)}
                                </span>
                              </div>

                              {event.venue_name && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span className="text-sm">
                                    {event.venue_name}, {event.city}
                                  </span>
                                </div>
                              )}

                              {minPrice !== null && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Ticket className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    From {formatCurrency(minPrice)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <Link href={`/events/${event.id}`}>
                              <Button className="w-full sm:w-auto">
                                View Details & Get Tickets
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="mt-12 bg-gradient-to-r from-primary to-pink-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Never Miss an Event</CardTitle>
            <CardDescription className="text-white/90 text-base">
              Subscribe to our community newsletter for weekly event updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-md text-gray-900"
                disabled
              />
              <Button variant="secondary" disabled>
                Subscribe
              </Button>
            </form>
            <p className="text-center text-xs text-white/70 mt-3">
              Newsletter feature coming soon
            </p>
          </CardContent>
        </Card>

        {/* About Community Calendar */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">About the Community Calendar</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The GrooveGrid Community Calendar brings together events from all organizers across Canada.
            Whether you're looking for beginner workshops, social dances, or major festivals,
            find everything in one place and plan your dance journey!
          </p>
        </div>
      </div>
    </div>
  );
}

