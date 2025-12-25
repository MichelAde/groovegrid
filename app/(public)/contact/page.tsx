import { Card, CardContent } from '@/components/ui/card';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">support@groovegrid.com</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-gray-600">Coming Soon</p>
                  <p className="text-sm text-gray-500 mt-1">
                    For urgent matters, please email us
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions about GrooveGrid? Want to learn more about how we can help 
              your dance organization? We'd love to hear from you!
            </p>
            <p className="text-gray-700 mb-4">
              Whether you're interested in our platform, need technical support, or 
              have feedback to share, our team is here to help.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold mb-2">Business Hours</h3>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
              <p className="text-gray-600">Saturday - Sunday: Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

