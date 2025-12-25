'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Edit, Trash2, Filter } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string | null;
  filters: any;
  member_count: number;
  created_at: string;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: {
      hasTickets: false,
      hasPasses: false,
      hasPackages: false,
      eventCategory: '',
      minSpent: 0,
      maxSpent: 0,
      city: '',
    },
  });

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSegmentSize = async (filters: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberships) return 0;

      // Get all orders for this organization
      const { data: orders, error } = await supabase
        .from('orders')
        .select('buyer_email, total')
        .eq('organization_id', memberships.organization_id)
        .eq('status', 'confirmed');

      if (error) throw error;

      // Get unique customers
      const customers = new Set(orders?.map(o => o.buyer_email) || []);
      
      // TODO: Apply filters to refine the count
      // For now, return all customers
      return customers.size;
    } catch (error) {
      console.error('Error calculating segment size:', error);
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const memberCount = await calculateSegmentSize(formData.filters);

      if (editingId) {
        const { error } = await supabase
          .from('segments')
          .update({
            name: formData.name,
            description: formData.description,
            filters: formData.filters,
            member_count: memberCount,
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('Segment updated successfully!');
      } else {
        const { error } = await supabase
          .from('segments')
          .insert({
            organization_id: memberships.organization_id,
            name: formData.name,
            description: formData.description,
            filters: formData.filters,
            member_count: memberCount,
          });

        if (error) throw error;
        alert('Segment created successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        filters: {
          hasTickets: false,
          hasPasses: false,
          hasPackages: false,
          eventCategory: '',
          minSpent: 0,
          maxSpent: 0,
          city: '',
        },
      });
      loadSegments();
    } catch (error: any) {
      console.error('Error saving segment:', error);
      alert(error.message || 'Failed to save segment');
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditingId(segment.id);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      filters: segment.filters || {
        hasTickets: false,
        hasPasses: false,
        hasPackages: false,
        eventCategory: '',
        minSpent: 0,
        maxSpent: 0,
        city: '',
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;

    try {
      const { error } = await supabase
        .from('segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Failed to delete segment');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audience Segments</h1>
          <p className="text-gray-600 mt-1">
            Create targeted audience groups for personalized campaigns
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              filters: {
                hasTickets: false,
                hasPasses: false,
                hasPackages: false,
                eventCategory: '',
                minSpent: 0,
                maxSpent: 0,
                city: '',
              },
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Segment
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Segment</CardTitle>
            <CardDescription>
              Define criteria to group your audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Segment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Regular Attendees"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this audience segment..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Segment Filters
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasTickets"
                        checked={formData.filters.hasTickets}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, hasTickets: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="hasTickets" className="text-sm font-normal">
                        Has purchased tickets
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasPasses"
                        checked={formData.filters.hasPasses}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, hasPasses: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="hasPasses" className="text-sm font-normal">
                        Has purchased passes
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasPackages"
                        checked={formData.filters.hasPackages}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, hasPackages: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="hasPackages" className="text-sm font-normal">
                        Has purchased packages
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.filters.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, city: e.target.value },
                          })
                        }
                        placeholder="e.g., Toronto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventCategory">Event Category</Label>
                      <Input
                        id="eventCategory"
                        value={formData.filters.eventCategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, eventCategory: e.target.value },
                          })
                        }
                        placeholder="e.g., Workshop"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minSpent">Min Amount Spent ($)</Label>
                      <Input
                        id="minSpent"
                        type="number"
                        step="0.01"
                        value={formData.filters.minSpent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, minSpent: parseFloat(e.target.value) },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxSpent">Max Amount Spent ($)</Label>
                      <Input
                        id="maxSpent"
                        type="number"
                        step="0.01"
                        value={formData.filters.maxSpent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            filters: { ...formData.filters, maxSpent: parseFloat(e.target.value) },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Segment size is calculated when you save. The filters above
                    will narrow down your audience based on purchase history and behavior.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Segment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.length === 0 && !showForm ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Segments Yet</h2>
              <p className="text-gray-600 mb-4">
                Create your first audience segment to start targeted marketing
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </CardContent>
          </Card>
        ) : (
          segments.map((segment) => (
            <Card key={segment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{segment.name}</CardTitle>
                    {segment.description && (
                      <CardDescription className="mt-2">{segment.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm text-gray-600">Audience Size</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{segment.member_count}</span>
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(segment.created_at).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(segment)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(segment.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

