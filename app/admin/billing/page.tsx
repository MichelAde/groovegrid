import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Billing and subscription management will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

