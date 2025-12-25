'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, Check, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PassType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  validity_days: number;
  organization: {
    name: string;
  };
}

export default function PassesPage() {
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<PassType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
  });
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadPassTypes();
  }, []);

  const loadPassTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('pass_types')
        .select('*, organization(name)')
        .eq('is_active', true)
        .order('price');

      if (error) throw error;
      setPassTypes(data || []);
    } catch (error) {
      console.error('Error loading pass types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (passType: PassType) => {
    if (!buyerInfo.name || !buyerInfo.email) {
      alert('Please provide your name and email');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            pass_type_id: passType.id,
            quantity,
            price: Number(passType.price),
            name: passType.name,
          }],
          event_id: null,
          buyer_email: buyerInfo.email,
          buyer_name: buyerInfo.name,
          purchase_type: 'pass_purchase',
          pass_type_id: passType.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to process checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">Loading passes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Multi-Event Passes</h1>
          <p className="text-xl text-gray-600">
            Save money with flexible credit-based passes. Use across multiple events!
          </p>
        </div>

        {passTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Passes Available</h2>
              <p className="text-gray-600">
                Check back soon for multi-event pass options!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {passTypes.map((passType) => {
                const pricePerCredit = Number(passType.price) / passType.credits;
                const savings = Math.round((1 - pricePerCredit / 35) * 100); // Assuming $35 average ticket
                
                return (
                  <Card 
                    key={passType.id}
                    className={`relative ${selectedPass?.id === passType.id ? 'ring-2 ring-primary' : ''} hover:shadow-xl transition-shadow cursor-pointer`}
                    onClick={() => setSelectedPass(passType)}
                  >
                    {selectedPass?.id === passType.id && (
                      <div className="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        Selected
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl mb-2">{passType.name}</CardTitle>
                      <div className="text-4xl font-bold text-primary">
                        {formatCurrency(Number(passType.price))}
                      </div>
                      <CardDescription className="text-xs mt-1">
                        By {passType.organization.name}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {passType.description && (
                        <p className="text-sm text-gray-600 text-center">
                          {passType.description}
                        </p>
                      )}

                      <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                          <Ticket className="w-5 h-5" />
                          <span>{passType.credits} Event Credits</span>
                        </div>
                        <div className="text-center text-sm text-gray-600">
                          {formatCurrency(pricePerCredit)} per event
                        </div>
                        {savings > 0 && (
                          <div className="text-center">
                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              Save up to {savings}%
                            </span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Use across any participating event</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Valid for {passType.validity_days} days</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Flexible and transferable</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Instant activation</span>
                        </li>
                      </ul>

                      <Button 
                        className="w-full"
                        onClick={() => setSelectedPass(passType)}
                      >
                        {selectedPass?.id === passType.id ? 'Selected' : 'Select Pass'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedPass && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Your Purchase
                  </CardTitle>
                  <CardDescription>
                    You selected: {selectedPass.name} - {formatCurrency(Number(selectedPass.price) * quantity)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">
                      Total: {formatCurrency(Number(selectedPass.price) * quantity)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={buyerInfo.name}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={buyerInfo.email}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What You Get:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {quantity * selectedPass.credits} total event credits</li>
                      <li>• Valid for {selectedPass.validity_days} days from purchase</li>
                      <li>• Instant access after payment</li>
                      <li>• Email confirmation with pass details</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handlePurchase(selectedPass)}
                    disabled={processing || !buyerInfo.name || !buyerInfo.email}
                  >
                    {processing ? 'Processing...' : `Purchase for ${formatCurrency(Number(selectedPass.price) * quantity)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    + 2% platform fee + 13% tax at checkout
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="mt-16 bg-gradient-to-r from-primary-50 to-pink-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Why Buy a Multi-Event Pass?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Save Money</h3>
              <p className="text-sm text-gray-600">
                Get more events for less. Passes offer better value than individual tickets.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Flexibility</h3>
              <p className="text-sm text-gray-600">
                Use your credits across any participating events. Your choice, your schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Priority Access</h3>
              <p className="text-sm text-gray-600">
                Pass holders get easy entry. No need to buy tickets for each event separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
