'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  logo_url: string | null;
}

interface OrganizationSwitcherProps {
  currentOrgId?: string;
}

export default function OrganizationSwitcher({ currentOrgId }: OrganizationSwitcherProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organizations
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (membershipsError) throw membershipsError;

      // Fetch organization details
      const orgIds = memberships?.map((m) => m.organization_id) || [];
      const { data: orgs, error: orgsError } = await supabase
        .from('organization')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;

      setOrganizations(orgs || []);

      // Set current organization
      if (currentOrgId) {
        const current = (orgs || []).find((o: Organization) => o.id === currentOrgId);
        setCurrentOrg(current || (orgs || [])[0] || null);
      } else {
        setCurrentOrg((orgs || [])[0] || null);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (org: Organization) => {
    setCurrentOrg(org);
    setIsOpen(false);
    // Store current org in localStorage for persistence
    localStorage.setItem('currentOrganizationId', org.id);
    router.refresh();
  };

  if (loading || !currentOrg) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md animate-pulse">
        <Building2 className="w-5 h-5" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (organizations.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md">
        {currentOrg.logo_url ? (
          <img src={currentOrg.logo_url} alt={currentOrg.name} className="w-6 h-6 rounded" />
        ) : (
          <Building2 className="w-5 h-5 text-primary" />
        )}
        <span className="text-sm font-medium">{currentOrg.name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors w-full"
      >
        {currentOrg.logo_url ? (
          <img src={currentOrg.logo_url} alt={currentOrg.name} className="w-6 h-6 rounded" />
        ) : (
          <Building2 className="w-5 h-5 text-primary" />
        )}
        <span className="text-sm font-medium flex-1 text-left">{currentOrg.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrganization(org)}
                className={`flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-50 transition-colors ${
                  org.id === currentOrg.id ? 'bg-primary-50' : ''
                }`}
              >
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="w-6 h-6 rounded" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{org.name}</div>
                  <div className="text-xs text-gray-500">{org.subdomain}.groovegrid.com</div>
                </div>
                {org.id === currentOrg.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



