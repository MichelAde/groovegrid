'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Save, Building2, Users, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberships) return;

      // Load organization
      const { data: org } = await supabase
        .from('organization')
        .select('*')
        .eq('id', memberships.organization_id)
        .single();

      setOrganization(org);

      // Load team members
      const { data: members } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', memberships.organization_id);

      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organization')
        .update({
          name: organization.name,
          email: organization.email,
          phone: organization.phone,
          address: organization.address,
          city: organization.city,
          province: organization.province,
          country: organization.country,
          brand_color: organization.brand_color,
        })
        .eq('id', organization.id);

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization settings and preferences</p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>Update your organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={organization?.name || ''}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={organization?.subdomain || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={organization?.email || ''}
                onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={organization?.phone || ''}
                onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={organization?.address || ''}
              onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={organization?.city || ''}
                onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province/State</Label>
              <Input
                id="province"
                value={organization?.province || ''}
                onChange={(e) => setOrganization({ ...organization, province: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={organization?.country || ''}
                onChange={(e) => setOrganization({ ...organization, country: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandColor">Brand Color</Label>
            <div className="flex gap-2">
              <Input
                id="brandColor"
                type="color"
                value={organization?.brand_color || '#7C3AED'}
                onChange={(e) => setOrganization({ ...organization, brand_color: e.target.value })}
                className="w-20"
              />
              <Input
                value={organization?.brand_color || '#7C3AED'}
                onChange={(e) => setOrganization({ ...organization, brand_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <Button onClick={handleSaveOrganization} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>Manage your organization's team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{member.user_id.substring(0, 8)}...</p>
                  <p className="text-sm text-gray-600">Role: {member.role}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-4">
            Invite Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>Configure email and notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">New Order Notifications</h4>
                <p className="text-sm text-gray-600">Receive email when someone purchases a ticket</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Event Reminders</h4>
                <p className="text-sm text-gray-600">Get notified before your events start</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Receive weekly summary of your activities</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-gray-600">Change your password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Active Sessions</h4>
                <p className="text-sm text-gray-600">Manage your active sessions</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
