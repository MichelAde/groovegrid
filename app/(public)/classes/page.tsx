'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                      <Button>
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
    </div>
  );
}
