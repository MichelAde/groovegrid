'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, FileJson, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

type ImportType = 'events' | 'passes' | 'courses' | 'packages';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUploadPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleExport = async (type: ImportType) => {
    setExporting(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) throw new Error('No organization found');

      let data: any[] = [];
      let filename = '';

      switch (type) {
        case 'events':
          const { data: events } = await supabase
            .from('events')
            .select(`
              *,
              ticket_types (*)
            `)
            .eq('organization_id', membership.organization_id)
            .order('start_datetime', { ascending: false });
          
          data = events || [];
          filename = `events-export-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'passes':
          const { data: passes } = await supabase
            .from('pass_types')
            .select('*')
            .eq('organization_id', membership.organization_id)
            .order('sort_order');
          
          data = passes || [];
          filename = `passes-export-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'courses':
          const { data: courses } = await supabase
            .from('courses')
            .select('*')
            .eq('organization_id', membership.organization_id)
            .order('start_date', { ascending: false });
          
          data = courses || [];
          filename = `courses-export-${new Date().toISOString().split('T')[0]}.json`;
          break;

        case 'packages':
          const { data: packages } = await supabase
            .from('class_packages')
            .select('*')
            .eq('organization_id', membership.organization_id)
            .order('price');
          
          data = packages || [];
          filename = `packages-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      // Download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setResult({ success: data.length, failed: 0, errors: [] });
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Failed to export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>, type: ImportType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) throw new Error('No organization found');

      const text = await file.text();
      const items = JSON.parse(text);

      if (!Array.isArray(items)) {
        throw new Error('Invalid JSON format. Expected an array.');
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          // Remove ID and timestamps for import
          const { id, created_at, updated_at, ticket_types, ...cleanItem } = item;
          cleanItem.organization_id = membership.organization_id;

          let result;
          switch (type) {
            case 'events':
              result = await supabase.from('events').insert(cleanItem).select();
              
              // If event has ticket types, import them too
              if (!result.error && ticket_types && Array.isArray(ticket_types)) {
                const eventId = result.data?.[0]?.id;
                if (eventId) {
                  for (const ticket of ticket_types) {
                    const { id, created_at, updated_at, event_id, ...cleanTicket } = ticket;
                    await supabase.from('ticket_types').insert({
                      ...cleanTicket,
                      event_id: eventId
                    });
                  }
                }
              }
              break;

            case 'passes':
              result = await supabase.from('pass_types').insert(cleanItem).select();
              break;

            case 'courses':
              result = await supabase.from('courses').insert(cleanItem).select();
              break;

            case 'packages':
              result = await supabase.from('class_packages').insert(cleanItem).select();
              break;
          }

          if (result.error) throw result.error;
          success++;
        } catch (error: any) {
          failed++;
          errors.push(`Row ${success + failed}: ${error.message}`);
        }
      }

      setResult({ success, failed, errors: errors.slice(0, 10) }); // Show max 10 errors
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Failed to import: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Bulk Import/Export</h1>
          <p className="text-gray-600 mt-1">Import and export your data in JSON format</p>
        </div>
      </div>

      {result && (
        <Card className={result.failed > 0 ? 'border-yellow-300' : 'border-green-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.failed > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-green-600">Success: {result.success}</span> | 
                <span className="font-semibold text-red-600 ml-2">Failed: {result.failed}</span>
              </p>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-sm mb-2">Errors:</p>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {result.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Events
            </CardTitle>
            <CardDescription>
              Import/export events with ticket types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleExport('events')}
              disabled={exporting}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Events (JSON)
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleImport(e, 'events')}
                disabled={importing}
                className="hidden"
                id="import-events"
              />
              <label htmlFor="import-events">
                <Button
                  type="button"
                  onClick={() => document.getElementById('import-events')?.click()}
                  disabled={importing}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Import Events (JSON)'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Passes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Pass Types
            </CardTitle>
            <CardDescription>
              Import/export multi-event pass types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleExport('passes')}
              disabled={exporting}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Passes (JSON)
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleImport(e, 'passes')}
                disabled={importing}
                className="hidden"
                id="import-passes"
              />
              <label htmlFor="import-passes">
                <Button
                  type="button"
                  onClick={() => document.getElementById('import-passes')?.click()}
                  disabled={importing}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Import Passes (JSON)'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Courses
            </CardTitle>
            <CardDescription>
              Import/export dance courses and workshops
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleExport('courses')}
              disabled={exporting}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Courses (JSON)
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleImport(e, 'courses')}
                disabled={importing}
                className="hidden"
                id="import-courses"
              />
              <label htmlFor="import-courses">
                <Button
                  type="button"
                  onClick={() => document.getElementById('import-courses')?.click()}
                  disabled={importing}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Import Courses (JSON)'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Class Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Class Packages
            </CardTitle>
            <CardDescription>
              Import/export class credit packages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleExport('packages')}
              disabled={exporting}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Packages (JSON)
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => handleImport(e, 'packages')}
                disabled={importing}
                className="hidden"
                id="import-packages"
              />
              <label htmlFor="import-packages">
                <Button
                  type="button"
                  onClick={() => document.getElementById('import-packages')?.click()}
                  disabled={importing}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importing...' : 'Import Packages (JSON)'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">JSON Format</h3>
            <p className="text-sm text-gray-600">
              Files must be in JSON format with an array of objects. Export your data first to see the correct format.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Data Handling</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• IDs and timestamps will be automatically generated</li>
              <li>• Events can include nested ticket types</li>
              <li>• Duplicate data will create new records (not update existing)</li>
              <li>• Invalid data will be skipped with error messages</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Best Practices</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Export your data first as a backup before importing</li>
              <li>• Test imports with small datasets first</li>
              <li>• Verify data after import</li>
              <li>• Keep exported files as templates for future imports</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
