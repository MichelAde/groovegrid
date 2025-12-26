'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GraduationCap, Calendar, Users, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  level: string;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  schedule_days: string[];
  schedule_time: string;
  max_students: number;
  price: number;
  status: string;
  organization: {
    name: string;
  };
}

export default function ClassesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentData, setEnrollmentData] = useState({ name: '', email: '' });
  const [enrolling, setEnrolling] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, organization(name)')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.level.toLowerCase() === filter;
  });

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setEnrolling(true);
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          buyer_email: enrollmentData.email,
          buyer_name: enrollmentData.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        alert('Error: ' + (data.error || 'Failed to start enrollment'));
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to start enrollment process');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dance Classes</h1>
          <p className="text-xl text-gray-600">
            Learn Semba, Kizomba & more with expert instructors
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Levels
          </Button>
          <Button
            variant={filter === 'beginner' ? 'default' : 'outline'}
            onClick={() => setFilter('beginner')}
          >
            Beginner
          </Button>
          <Button
            variant={filter === 'intermediate' ? 'default' : 'outline'}
            onClick={() => setFilter('intermediate')}
          >
            Intermediate
          </Button>
          <Button
            variant={filter === 'advanced' ? 'default' : 'outline'}
            onClick={() => setFilter('advanced')}
          >
            Advanced
          </Button>
        </div>

        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Classes Available</h2>
              <p className="text-gray-600">
                {filter !== 'all' 
                  ? `No ${filter} level classes at the moment. Try a different filter.`
                  : 'Check back soon for upcoming dance classes!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <CardDescription>{course.organization?.name}</CardDescription>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {course.level}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Instructor: {course.instructor}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Starts: {new Date(course.start_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {course.duration_weeks} weeks • {course.schedule_days?.join(', ')}s
                      </span>
                    </div>

                    {course.schedule_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(`2000-01-01T${course.schedule_time}`).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                        <span className="text-2xl font-bold">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                      <Button onClick={() => handleEnrollClick(course)}>
                        Enroll Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Benefits Section */}
        {filteredCourses.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Instructors</h3>
              <p className="text-gray-600 text-sm">
                Learn from experienced dancers with years of teaching experience
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Small Groups</h3>
              <p className="text-gray-600 text-sm">
                Limited class sizes ensure personalized attention for every student
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600 text-sm">
                Multiple class times and days to fit your busy schedule
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Complete your enrollment to secure your spot in this {selectedCourse?.duration_weeks}-week course.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEnrollment} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={enrollmentData.name}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={enrollmentData.email}
                onChange={(e) => setEnrollmentData({ ...enrollmentData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Course Fee</span>
                <span>{formatCurrency(selectedCourse?.price || 0)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Platform Fee (2%)</span>
                <span>{formatCurrency((selectedCourse?.price || 0) * 0.02)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>HST (13%)</span>
                <span>{formatCurrency((selectedCourse?.price || 0) * 1.02 * 0.13)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency((selectedCourse?.price || 0) * 1.02 * 1.13)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCourse(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={enrolling}
                className="flex-1"
              >
                {enrolling ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
