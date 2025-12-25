'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClassPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price: number;
  validity_days: number | null;
  is_active: boolean;
  created_at: string;
}

export default function ClassPackagesPage() {
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: 5,
    price: 50,
    validity_days: 90,
  });
  const supabase = createClient();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
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
        .from('class_packages')
        .select('*')
        .eq('organization_id', memberships.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      if (editingId) {
        const { error } = await supabase
          .from('class_packages')
          .update({
            name: formData.name,
            description: formData.description,
            credits: formData.credits,
            price: formData.price,
            validity_days: formData.validity_days,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('class_packages')
          .insert({
            organization_id: memberships.organization_id,
            name: formData.name,
            description: formData.description,
            credits: formData.credits,
            price: formData.price,
            validity_days: formData.validity_days,
          });

        if (error) throw error;
      }

      setFormData({ name: '', description: '', credits: 5, price: 50, validity_days: 90 });
      setShowForm(false);
      setEditingId(null);
      loadPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    }
  };

  const handleEdit = (pkg: ClassPackage) => {
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      credits: pkg.credits,
      price: Number(pkg.price),
      validity_days: pkg.validity_days || 90,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('class_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('class_packages')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      loadPackages();
    } catch (error) {
      console.error('Error toggling package:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Packages</h1>
          <p className="text-gray-600 mt-1">Manage credit-based packages for your dance classes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Package
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Create'} Class Package</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 10-Class Pack"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Package details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (CAD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity">Validity (Days)</Label>
                  <Input
                    id="validity"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Create'} Package
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', credits: 5, price: 50, validity_days: 90 });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={!pkg.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {pkg.credits} classes • {formatCurrency(Number(pkg.price))}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pkg.description && (
                <p className="text-sm text-gray-600">{pkg.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valid for:</span>
                <span className="font-medium">{pkg.validity_days} days</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price per class:</span>
                <span className="font-medium">
                  {formatCurrency(Number(pkg.price) / pkg.credits)}
                </span>
              </div>
              <Button
                variant={pkg.is_active ? 'outline' : 'default'}
                size="sm"
                className="w-full"
                onClick={() => toggleActive(pkg.id, pkg.is_active)}
              >
                {pkg.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No class packages yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



