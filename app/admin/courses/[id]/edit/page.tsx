'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          level: course.level,
          duration_weeks: course.duration_weeks,
          start_date: course.start_date,
          end_date: course.end_date,
          schedule_days: course.schedule_days,
          schedule_time: course.schedule_time,
          max_students: course.max_students,
          price: course.price,
          status: course.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId);

      if (error) throw error;
      alert('Course updated successfully!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-gray-600 mt-1">{course.title}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Update course information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={course.description || ''}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={course.instructor || ''}
                onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                value={course.level || 'Beginner'}
                onChange={(e) => setCourse({ ...course, level: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                value={course.duration_weeks}
                onChange={(e) => setCourse({ ...course, duration_weeks: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                value={course.max_students}
                onChange={(e) => setCourse({ ...course, max_students: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={course.start_date}
                onChange={(e) => setCourse({ ...course, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={course.end_date}
                onChange={(e) => setCourse({ ...course, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduleTime">Class Time</Label>
            <Input
              id="scheduleTime"
              type="time"
              value={course.schedule_time || ''}
              onChange={(e) => setCourse({ ...course, schedule_time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={course.status}
              onChange={(e) => setCourse({ ...course, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

