'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Ticket, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  is_active: boolean;
}

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [ticketFormData, setTicketFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity_available: 50,
  });
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadEvent();
    loadTicketTypes();
  }, [eventId]);

  useEffect(() => {
    if (event?.image_url) {
      setImageUrl(event.image_url);
    }
  }, [event]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      alert('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order');

      if (error) throw error;
      setTicketTypes(data || []);
    } catch (error) {
      console.error('Error loading ticket types:', error);
    }
  };

  const handleSaveEvent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          category: event.category,
          start_datetime: event.start_datetime,
          end_datetime: event.end_datetime,
          venue_name: event.venue_name,
          address: event.address,
          city: event.city,
          province: event.province,
          country: event.country,
          capacity: event.capacity,
          status: event.status,
          image_url: imageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setEvent({ ...event, image_url: publicUrl });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTicket) {
        const { error } = await supabase
          .from('ticket_types')
          .update({
            name: ticketFormData.name,
            description: ticketFormData.description,
            price: ticketFormData.price,
            quantity_available: ticketFormData.quantity_available,
          })
          .eq('id', editingTicket);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ticket_types')
          .insert({
            event_id: eventId,
            name: ticketFormData.name,
            description: ticketFormData.description,
            price: ticketFormData.price,
            quantity_available: ticketFormData.quantity_available,
            quantity_sold: 0,
            is_active: true,
            is_available: true,
          });

        if (error) throw error;
      }

      setShowTicketForm(false);
      setEditingTicket(null);
      setTicketFormData({ name: '', description: '', price: 0, quantity_available: 50 });
      loadTicketTypes();
    } catch (error) {
      console.error('Error saving ticket type:', error);
      alert('Failed to save ticket type');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;

    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
      loadTicketTypes();
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      alert('Failed to delete ticket type');
    }
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicket(ticket.id);
    setTicketFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: Number(ticket.price),
      quantity_available: ticket.quantity_available,
    });
    setShowTicketForm(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-gray-600 mt-1">Edit event details and manage tickets</p>
          </div>
        </div>
        <Button onClick={handleSaveEvent} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={event.description || ''}
                  onChange={(e) => setEvent({ ...event, description: e.target.value })}
                  rows={5}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Event Poster / Image</Label>
                <div className="space-y-3">
                  {imageUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img 
                        src={imageUrl} 
                        alt="Event poster" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          type="button"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          disabled={uploading}
                          variant="outline"
                          className="w-full"
                        >
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </label>
                    </div>
                    
                    <Input
                      placeholder="Or paste image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload an image or paste a URL. Max 5MB. Recommended: 1200x630px
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={event.category || ''}
                  onChange={(e) => setEvent({ ...event, category: e.target.value })}
                  placeholder="e.g., Social Dance, Workshop, Concert"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDatetime">Start Date & Time</Label>
                  <Input
                    id="startDatetime"
                    type="datetime-local"
                    value={event.start_datetime?.slice(0, 16)}
                    onChange={(e) => setEvent({ ...event, start_datetime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={event.status}
                    onChange={(e) => setEvent({ ...event, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Ticket Types
                  </CardTitle>
                  <CardDescription>Manage pricing and availability</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowTicketForm(true);
                    setEditingTicket(null);
                    setTicketFormData({ name: '', description: '', price: 0, quantity_available: 50 });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showTicketForm && (
                <form onSubmit={handleSaveTicket} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ticket Name</Label>
                      <Input
                        value={ticketFormData.name}
                        onChange={(e) => setTicketFormData({ ...ticketFormData, name: e.target.value })}
                        placeholder="e.g., Early Bird"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price (CAD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ticketFormData.price}
                        onChange={(e) => setTicketFormData({ ...ticketFormData, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={ticketFormData.description}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity Available</Label>
                    <Input
                      type="number"
                      value={ticketFormData.quantity_available}
                      onChange={(e) => setTicketFormData({ ...ticketFormData, quantity_available: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      {editingTicket ? 'Update' : 'Create'} Ticket
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowTicketForm(false);
                        setEditingTicket(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {ticketTypes.length === 0 && !showTicketForm ? (
                <div className="text-center py-8 text-gray-500">
                  No ticket types yet. Add your first ticket type to start selling.
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketTypes.map((ticket) => {
                    const soldPercentage = (ticket.quantity_sold / ticket.quantity_available) * 100;
                    return (
                      <div key={ticket.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{ticket.name}</h4>
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(Number(ticket.price))}
                              </span>
                            </div>
                            {ticket.description && (
                              <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditTicket(ticket)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteTicket(ticket.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {ticket.quantity_sold} / {ticket.quantity_available} sold
                            </span>
                            <span className="font-medium">{soldPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Total Tickets</div>
                <div className="text-2xl font-bold">
                  {ticketTypes.reduce((sum, t) => sum + t.quantity_sold, 0)} /
                  {ticketTypes.reduce((sum, t) => sum + t.quantity_available, 0)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Ticket Types</div>
                <div className="text-2xl font-bold">{ticketTypes.length}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Event Status</div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  event.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/events/${eventId}`} target="_blank">
                <Button variant="outline" className="w-full">
                  View Public Page
                </Button>
              </Link>
              <Button variant="outline" className="w-full" disabled>
                View Orders
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Check-in QR Scanner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

