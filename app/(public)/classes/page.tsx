import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function ClassesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Dance Classes</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find Kizomba and Semba dance classes near you
        </p>

        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              Class listings will be available here soon. Check back later!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

