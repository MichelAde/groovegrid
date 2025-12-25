import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload</h1>
        <p className="text-gray-600 mt-1">Upload multiple event images at once</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Bulk image upload tool will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

