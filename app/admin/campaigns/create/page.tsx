'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Calendar, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function CreateCampaignPage() {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'email',
    segment_id: '',
    subject: '',
    message: '',
    schedule_type: 'immediate',
    scheduled_at: '',
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
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

      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('organization_id', memberships.organization_id)
        .order('name');

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error loading segments:', error);
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

      const status = formData.schedule_type === 'immediate' ? 'draft' : 'scheduled';
      const scheduledAt = formData.schedule_type === 'scheduled' ? formData.scheduled_at : null;

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          organization_id: memberships.organization_id,
          name: formData.name,
          description: formData.description,
          channel: formData.channel,
          segment_id: formData.segment_id || null,
          subject: formData.subject,
          message: formData.message,
          status,
          scheduled_at: scheduledAt,
        })
        .select()
        .single();

      if (error) throw error;

      alert('Campaign created successfully!');
      router.push('/admin/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-gray-600 mt-1">Set up a new marketing campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Festival Promotion"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the campaign goal..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Channel *</Label>
                <select
                  id="channel"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment_id">Target Audience</Label>
                <select
                  id="segment_id"
                  value={formData.segment_id}
                  onChange={(e) => setFormData({ ...formData, segment_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Customers</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.member_count} people)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {formData.channel === 'email' ? (
                <Mail className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              Message Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.channel === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Don't miss our Summer Festival!"
                  required={formData.channel === 'email'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  formData.channel === 'email'
                    ? 'Write your email content...'
                    : 'Write your SMS message...'
                }
                rows={10}
                required
              />
              <p className="text-xs text-gray-500">
                {formData.channel === 'sms' && 'SMS is limited to 160 characters'}
                {formData.channel === 'email' && 'You can use basic HTML tags'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Available Placeholders:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <code className="bg-blue-100 px-1 rounded">{'{{name}}'}</code> - Customer name</li>
                <li>• <code className="bg-blue-100 px-1 rounded">{'{{email}}'}</code> - Customer email</li>
                <li>• <code className="bg-blue-100 px-1 rounded">{'{{event_name}}'}</code> - Event name</li>
                <li>• <code className="bg-blue-100 px-1 rounded">{'{{event_date}}'}</code> - Event date</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>When to send?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="immediate"
                    name="schedule_type"
                    value="immediate"
                    checked={formData.schedule_type === 'immediate'}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_type: e.target.value })
                    }
                    className="rounded-full"
                  />
                  <Label htmlFor="immediate" className="font-normal">
                    Send immediately after review
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scheduled"
                    name="schedule_type"
                    value="scheduled"
                    checked={formData.schedule_type === 'scheduled'}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule_type: e.target.value })
                    }
                    className="rounded-full"
                  />
                  <Label htmlFor="scheduled" className="font-normal">
                    Schedule for later
                  </Label>
                </div>
              </div>
            </div>

            {formData.schedule_type === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Schedule Date & Time *</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  required={formData.schedule_type === 'scheduled'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
          <Link href="/admin/campaigns">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

