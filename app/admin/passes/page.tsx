'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PassType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  validity_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function PassTypesPage() {
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    credits: 10,
    validity_days: 30,
  });

  const supabase = createClient();

  useEffect(() => {
    loadPassTypes();
  }, []);

  const loadPassTypes = async () => {
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
        .from('pass_types')
        .select('*')
        .eq('organization_id', memberships.organization_id)
        .order('sort_order');

      if (error) throw error;
      setPassTypes(data || []);
    } catch (error) {
      console.error('Error loading pass types:', error);
    } finally {
      setLoading(false);
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

      if (editingId) {
        const { error } = await supabase
          .from('pass_types')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            credits: formData.credits,
            validity_days: formData.validity_days,
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('Pass type updated successfully!');
      } else {
        const { error } = await supabase
          .from('pass_types')
          .insert({
            organization_id: memberships.organization_id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            credits: formData.credits,
            validity_days: formData.validity_days,
            is_active: true,
          });

        if (error) throw error;
        alert('Pass type created successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', price: 0, credits: 10, validity_days: 30 });
      loadPassTypes();
    } catch (error: any) {
      console.error('Error saving pass type:', error);
      alert(error.message || 'Failed to save pass type');
    }
  };

  const handleEdit = (passType: PassType) => {
    setEditingId(passType.id);
    setFormData({
      name: passType.name,
      description: passType.description || '',
      price: Number(passType.price),
      credits: passType.credits,
      validity_days: passType.validity_days,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pass type?')) return;

    try {
      const { error } = await supabase
        .from('pass_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPassTypes();
    } catch (error) {
      console.error('Error deleting pass type:', error);
      alert('Failed to delete pass type');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pass_types')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadPassTypes();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Event Passes</h1>
          <p className="text-gray-600 mt-1">
            Create credit-based passes that work across multiple events
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', description: '', price: 0, credits: 10, validity_days: 30 });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Pass Type
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Pass Type</CardTitle>
            <CardDescription>
              Set up a credit-based pass that customers can use for multiple events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pass Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Monthly Pass"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (CAD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this pass includes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits Included *</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Number of event entries included in this pass
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity_days">Validity Period (Days) *</Label>
                  <Input
                    id="validity_days"
                    type="number"
                    min="1"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    How long the pass remains valid after purchase
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Pass Summary</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Price per credit: {formData.credits > 0 ? formatCurrency(formData.price / formData.credits) : '$0.00'}</li>
                  <li>• Valid for: {formData.validity_days} days</li>
                  <li>• Total value: {formatCurrency(formData.price)}</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'} Pass Type
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
        {passTypes.length === 0 && !showForm ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Pass Types Yet</h2>
              <p className="text-gray-600 mb-4">
                Create your first multi-event pass to offer customers flexible pricing
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Pass Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          passTypes.map((passType) => {
            const pricePerCredit = Number(passType.price) / passType.credits;
            
            return (
              <Card key={passType.id} className={!passType.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{passType.name}</CardTitle>
                      <div className="text-2xl font-bold text-primary mt-2">
                        {formatCurrency(Number(passType.price))}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      passType.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {passType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passType.description && (
                    <p className="text-sm text-gray-600">{passType.description}</p>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Credits</span>
                      <span className="font-semibold">{passType.credits} entries</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price per Credit</span>
                      <span className="font-semibold">{formatCurrency(pricePerCredit)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid for</span>
                      <span className="font-semibold">{passType.validity_days} days</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(passType)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(passType.id, passType.is_active)}
                      className="flex-1"
                    >
                      {passType.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(passType.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {passTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Pass Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Pass sales analytics coming soon. Track which passes are most popular and revenue generated.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

