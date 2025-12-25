'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function loadEnrollments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('enrollment_date', { ascending: false });

      setEnrollments(data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Classes</h1>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Enrollments Yet</h2>
              <p className="text-gray-600 mb-6">
                You're not enrolled in any classes yet. Browse our dance classes to get started!
              </p>
              <Link href="/classes">
                <Button>Browse Classes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <CardTitle>{enrollment.courses.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600">{enrollment.courses.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>Level: {enrollment.courses.level}</span>
                    </div>
                    {enrollment.courses.instructor && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{enrollment.courses.instructor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{enrollment.courses.duration_weeks} weeks</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">
                        {enrollment.classes_attended} classes attended
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
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

