import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Plus, TrendingUp, Send, Users, Eye, MousePointer } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

export default async function CampaignsPage() {
  const supabase = await createClient();

  // Get user's organization
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id!)
    .limit(1)
    .single();

  if (!memberships) {
    return <div>No organization found</div>;
  }

  const orgId = memberships.organization_id;

  // Get campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, segments(name)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  // Get campaign stats
  const totalCampaigns = campaigns?.length || 0;
  const scheduledCampaigns = campaigns?.filter(c => c.status === 'scheduled').length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;

  // Calculate aggregate stats
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.recipients_count || 0), 0) || 0;
  const totalOpens = campaigns?.reduce((sum, c) => sum + (c.opens_count || 0), 0) || 0;
  const totalClicks = campaigns?.reduce((sum, c) => sum + (c.clicks_count || 0), 0) || 0;

  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0.0';
  const avgClickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Create and manage email and SMS campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/campaigns/segments">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Segments
            </Button>
          </Link>
          <Link href="/admin/campaigns/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {completedCampaigns} completed, {scheduledCampaigns} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Messages delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalOpens} total opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalClicks} total clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>View and manage your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Campaigns Yet</h2>
              <p className="text-gray-600 mb-6">
                Create your first campaign to engage your audience
              </p>
              <Link href="/admin/campaigns/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const openRate = campaign.recipients_count > 0
                  ? ((campaign.opens_count / campaign.recipients_count) * 100).toFixed(1)
                  : '0.0';
                const clickRate = campaign.recipients_count > 0
                  ? ((campaign.clicks_count / campaign.recipients_count) * 100).toFixed(1)
                  : '0.0';

                return (
                  <div
                    key={campaign.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : campaign.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : campaign.status === 'sending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : campaign.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {campaign.status}
                          </span>
                          <span className="px-2 py-1 bg-primary-100 text-primary rounded-full text-xs font-medium">
                            {campaign.channel}
                          </span>
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Target: {campaign.segments?.name || 'All customers'}</span>
                          {campaign.scheduled_at && (
                            <span>Scheduled: {formatDateTime(campaign.scheduled_at)}</span>
                          )}
                          {campaign.sent_at && (
                            <span>Sent: {formatDateTime(campaign.sent_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {campaign.status === 'completed' && (
                      <div className="grid grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-gray-600">Sent</div>
                          <div className="text-lg font-semibold">{campaign.recipients_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Opens</div>
                          <div className="text-lg font-semibold">
                            {campaign.opens_count}{' '}
                            <span className="text-sm text-gray-500">({openRate}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Clicks</div>
                          <div className="text-lg font-semibold">
                            {campaign.clicks_count}{' '}
                            <span className="text-sm text-gray-500">({clickRate}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Conversions</div>
                          <div className="text-lg font-semibold">{campaign.conversions_count}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Link href={`/admin/campaigns/${campaign.id}/analytics`}>
                        <Button size="sm" variant="outline">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          View Analytics
                        </Button>
                      </Link>
                      {campaign.status === 'draft' && (
                        <>
                          <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm">
                            <Send className="w-3 h-3 mr-1" />
                            Send Now
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

