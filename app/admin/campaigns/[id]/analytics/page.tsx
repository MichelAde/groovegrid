import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, MousePointer, ShoppingCart, Send, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Get campaign details
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, segments(name), organization(name)')
    .eq('id', params.id)
    .single();

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  // Calculate metrics
  const openRate = campaign.recipients_count > 0
    ? ((campaign.opens_count / campaign.recipients_count) * 100).toFixed(1)
    : '0.0';
  const clickRate = campaign.recipients_count > 0
    ? ((campaign.clicks_count / campaign.recipients_count) * 100).toFixed(1)
    : '0.0';
  const conversionRate = campaign.recipients_count > 0
    ? ((campaign.conversions_count / campaign.recipients_count) * 100).toFixed(1)
    : '0.0';

  // Get campaign executions
  const { data: executions } = await supabase
    .from('campaign_executions')
    .select('*')
    .eq('campaign_id', params.id)
    .order('sent_at', { ascending: false })
    .limit(100);

  const successfulDeliveries = executions?.filter(e => e.status === 'sent').length || 0;
  const failedDeliveries = executions?.filter(e => e.status === 'failed').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/campaigns">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-gray-600 mt-1">Campaign Performance Analytics</p>
        </div>
      </div>

      {/* Campaign Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Channel</div>
              <div className="font-semibold capitalize">{campaign.channel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === 'sending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {campaign.status}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Audience</div>
              <div className="font-semibold">
                {campaign.segments?.name || 'All Customers'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sent At</div>
              <div className="font-semibold">
                {campaign.sent_at ? formatDateTime(campaign.sent_at) : 'Not sent'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.recipients_count}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{successfulDeliveries} delivered</span>
              {failedDeliveries > 0 && (
                <span className="text-red-600"> • {failedDeliveries} failed</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.opens_count} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.clicks_count} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {campaign.conversions_count} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Impact */}
      {campaign.revenue_generated > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {formatCurrency(campaign.revenue_generated)}
            </div>
            <p className="text-gray-600">
              Direct revenue attributed to this campaign
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Status */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Status</CardTitle>
          <CardDescription>Individual message delivery details</CardDescription>
        </CardHeader>
        <CardContent>
          {!executions || executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No delivery records yet
            </div>
          ) : (
            <div className="space-y-2">
              {executions.slice(0, 20).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">{execution.recipient_email}</div>
                    {execution.sent_at && (
                      <div className="text-xs text-gray-500">
                        {formatDateTime(execution.sent_at)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        execution.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : execution.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {execution.status}
                    </span>
                    {execution.opened_at && (
                      <span className="text-xs text-green-600">Opened</span>
                    )}
                    {execution.clicked_at && (
                      <span className="text-xs text-blue-600">Clicked</span>
                    )}
                  </div>
                </div>
              ))}
              {executions.length > 20 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  Showing 20 of {executions.length} deliveries
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Message */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.subject && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Subject</div>
              <div className="font-medium">{campaign.subject}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600 mb-1">Message</div>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
              {campaign.message}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

