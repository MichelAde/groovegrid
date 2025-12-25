import { NextRequest, NextResponse } from 'next/server';
import { generateCourseCurriculum } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, level, durationWeeks, danceStyle } = body;

    if (!title || !level || !durationWeeks) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const curriculum = await generateCourseCurriculum({
      title,
      level,
      durationWeeks: parseInt(durationWeeks),
      danceStyle,
    });

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error('Error generating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to generate curriculum' },
      { status: 500 }
    );
  }
}



