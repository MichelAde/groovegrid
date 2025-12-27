'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyPassesPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPasses();
  }, []);

  async function loadPasses() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_passes')
        .select(`
          *,
          pass_types(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('purchase_date', { ascending: false });

      setPasses(data || []);
    } catch (error) {
      console.error('Error loading passes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading your passes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Passes</h1>

        {passes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Active Passes</h2>
              <p className="text-gray-600 mb-6">
                You don't have any active passes. Check out our pass options for great savings!
              </p>
              <Link href="/passes">
                <Button>Browse Passes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {passes.map((pass) => (
              <Card key={pass.id}>
                <CardHeader>
                  <CardTitle>{pass.pass_types.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">{pass.pass_types.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">
                        {pass.credits_remaining} credits remaining
                      </span>
                    </div>
                    {pass.expiry_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Expires: {new Date(pass.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      Purchased: {new Date(pass.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}












import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyPassesPage() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPasses();
  }, []);

  async function loadPasses() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_passes')
        .select(`
          *,
          pass_types(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('purchase_date', { ascending: false });

      setPasses(data || []);
    } catch (error) {
      console.error('Error loading passes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading your passes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Passes</h1>

        {passes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Active Passes</h2>
              <p className="text-gray-600 mb-6">
                You don't have any active passes. Check out our pass options for great savings!
              </p>
              <Link href="/passes">
                <Button>Browse Passes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {passes.map((pass) => (
              <Card key={pass.id}>
                <CardHeader>
                  <CardTitle>{pass.pass_types.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">{pass.pass_types.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">
                        {pass.credits_remaining} credits remaining
                      </span>
                    </div>
                    {pass.expiry_date && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Expires: {new Date(pass.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      Purchased: {new Date(pass.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}













