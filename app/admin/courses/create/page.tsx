'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Calendar, Users } from 'lucide-react';

export default function CreateCoursePage() {
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [formData, setFormData] = useState({
    title: '',
    level: 'beginner',
    durationWeeks: 8,
    danceStyle: 'Kizomba',
    instructor: '',
    maxStudents: 20,
    price: 200,
    startDate: '',
    scheduleDays: [] as string[],
    scheduleTime: '19:00',
  });
  const [generatedCurriculum, setGeneratedCurriculum] = useState<any>(null);
  const [editableDescription, setEditableDescription] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleGenerateCurriculum = async () => {
    setStep('generating');
    
    try {
      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          level: formData.level,
          durationWeeks: formData.durationWeeks,
          danceStyle: formData.danceStyle,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate curriculum');

      const data = await response.json();
      setGeneratedCurriculum(data);
      setEditableDescription(data.description);
      setStep('review');
    } catch (error) {
      console.error('Error generating curriculum:', error);
      alert('Failed to generate curriculum. Please try again.');
      setStep('input');
    }
  };

  const handleCreateCourse = async () => {
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

      const { data, error } = await supabase
        .from('courses')
        .insert({
          organization_id: memberships.organization_id,
          title: formData.title,
          description: editableDescription,
          instructor: formData.instructor,
          level: formData.level,
          duration_weeks: formData.durationWeeks,
          start_date: formData.startDate,
          schedule_days: formData.scheduleDays,
          schedule_time: formData.scheduleTime,
          max_students: formData.maxStudents,
          price: formData.price,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      alert('Course created successfully!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Course</h1>
        <p className="text-gray-600 mt-1">Use AI to generate a comprehensive curriculum</p>
      </div>

      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Course Details
            </CardTitle>
            <CardDescription>
              Provide basic information and we'll generate a full curriculum using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Beginner Kizomba Fundamentals"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="danceStyle">Dance Style</Label>
                <select
                  id="danceStyle"
                  value={formData.danceStyle}
                  onChange={(e) => setFormData({ ...formData, danceStyle: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Kizomba">Kizomba</option>
                  <option value="Semba">Semba</option>
                  <option value="Urban Kiz">Urban Kiz</option>
                  <option value="Tarraxinha">Tarraxinha</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (Weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  value={formData.durationWeeks}
                  onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) })}
                  min="4"
                  max="16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor Name</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  min="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (CAD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduleTime">Class Time</Label>
                <Input
                  id="scheduleTime"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateCurriculum}
              className="w-full"
              disabled={!formData.title || !formData.level || !formData.durationWeeks}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Curriculum with AI
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'generating' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Your Curriculum</h3>
            <p className="text-gray-600">
              AI is creating a comprehensive {formData.durationWeeks}-week curriculum for your {formData.level} level course...
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'review' && generatedCurriculum && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review & Edit Curriculum</CardTitle>
              <CardDescription>
                Edit the AI-generated curriculum as needed before creating the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {generatedCurriculum.objectives && (
                <div>
                  <h3 className="font-semibold mb-2">Learning Objectives</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedCurriculum.objectives.map((obj: string, i: number) => (
                      <li key={i} className="text-gray-700">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedCurriculum.prerequisites && generatedCurriculum.prerequisites.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {generatedCurriculum.prerequisites.map((prereq: string, i: number) => (
                      <li key={i} className="text-gray-700">{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {generatedCurriculum.weeklyPlans && (
                <div>
                  <h3 className="font-semibold mb-3">Weekly Plan</h3>
                  <div className="space-y-4">
                    {generatedCurriculum.weeklyPlans.map((week: any, i: number) => (
                      <Card key={i}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Week {week.week}: {week.theme}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {week.concepts && (
                            <div>
                              <strong>Concepts:</strong> {week.concepts.join(', ')}
                            </div>
                          )}
                          {week.skills && (
                            <div>
                              <strong>Skills:</strong> {week.skills.join(', ')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateCourse} className="flex-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
                <Button variant="outline" onClick={() => setStep('input')}>
                  Back to Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



