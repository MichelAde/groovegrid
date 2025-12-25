'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, UserCheck, UserX, Award } from 'lucide-react';

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  attendance_count: number;
  enrolled_at: string;
  courses: any;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const supabase = createClient();

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberships) return;

      // Get courses for this organization first
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('organization_id', memberships.organization_id);

      if (!courses || courses.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      const courseIds = courses.map(c => c.id);

      const { data, error} = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            level,
            duration_weeks,
            instructor,
            price
          )
        `)
        .in('course_id', courseIds)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .update({ status: newStatus })
        .eq('id', enrollmentId);

      if (error) throw error;
      loadEnrollments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update enrollment status');
    }
  };

  const handleAttendanceUpdate = async (enrollmentId: string, increment: number) => {
    try {
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (!enrollment) return;

      const newCount = Math.max(0, enrollment.attendance_count + increment);

      const { error } = await supabase
        .from('course_enrollments')
        .update({ attendance_count: newCount })
        .eq('id', enrollmentId);

      if (error) throw error;
      loadEnrollments();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    cancelled: enrollments.filter(e => e.status === 'cancelled').length,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Enrollments</h1>
          <p className="text-gray-600 mt-1">Manage student enrollments and attendance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by course or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Enrollments</CardTitle>
          <CardDescription>
            {filteredEnrollments.length} enrollment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No enrollments yet. Students will appear here when they enroll in courses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {enrollment.courses?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Student: {enrollment.user_id.substring(0, 8)}... • 
                        Level: {enrollment.courses?.level} • 
                        Instructor: {enrollment.courses?.instructor}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Attendance */}
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Attendance</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAttendanceUpdate(enrollment.id, -1)}
                          >
                            -
                          </Button>
                          <span className="font-semibold">
                            {enrollment.attendance_count} / {enrollment.courses?.duration_weeks}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAttendanceUpdate(enrollment.id, 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <select
                          value={enrollment.status}
                          onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                          className={`border rounded-md px-3 py-1 text-sm font-medium ${
                            enrollment.status === 'active'
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : enrollment.status === 'completed'
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
