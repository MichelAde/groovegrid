'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    startDatetime: '',
    endDatetime: '',
    venueName: '',
    address: '',
    city: '',
    province: 'Ontario',
    country: 'Canada',
    capacity: 100,
    status: 'draft',
  });

  const router = useRouter();
  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberships) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('events')
        .insert({
          organization_id: memberships.organization_id,
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          category: formData.category,
          start_datetime: formData.startDatetime,
          end_datetime: formData.endDatetime || null,
          venue_name: formData.venueName,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          capacity: formData.capacity,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;

      alert('Event created successfully!');
      router.push(`/admin/events/${data.id}/edit`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-gray-600 mt-1">Set up a new event with tickets and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Basic information about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Kizomba Friday Social"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your event..."
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Social">Social Dance</option>
                  <option value="Festival">Festival</option>
                  <option value="Class">Class</option>
                  <option value="Concert">Concert</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Event Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="Preview" className="w-full max-w-md h-48 object-cover rounded-md" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDatetime">Start Date & Time *</Label>
                <Input
                  id="startDatetime"
                  type="datetime-local"
                  value={formData.startDatetime}
                  onChange={(e) => setFormData({ ...formData, startDatetime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDatetime">End Date & Time</Label>
                <Input
                  id="endDatetime"
                  type="datetime-local"
                  value={formData.endDatetime}
                  onChange={(e) => setFormData({ ...formData, endDatetime: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Venue Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venueName">Venue Name</Label>
              <Input
                id="venueName"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                placeholder="e.g., Dance Studio Downtown"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Toronto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <select
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Alberta">Alberta</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="New Brunswick">New Brunswick</option>
                  <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Prince Edward Island">Prince Edward Island</option>
                  <option value="Quebec">Quebec</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft (not visible to public)</option>
                <option value="published">Published (visible to public)</option>
              </select>
              <p className="text-sm text-gray-500">
                Save as draft to add ticket types before publishing
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
          <Link href="/admin/events">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

