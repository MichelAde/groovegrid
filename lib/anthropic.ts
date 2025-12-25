import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCourseCurriculum(params: {
  title: string;
  level: string;
  durationWeeks: number;
  danceStyle?: string;
}) {
  const { title, level, durationWeeks, danceStyle = 'Kizomba/Semba' } = params;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Generate a comprehensive course curriculum for a ${danceStyle} dance course with the following details:

Title: ${title}
Level: ${level}
Duration: ${durationWeeks} weeks

Please provide:
1. A detailed course description (2-3 paragraphs)
2. Learning objectives (4-6 specific goals)
3. Prerequisites (if any)
4. Weekly lesson plans for all ${durationWeeks} weeks, each including:
   - Week number and theme
   - Key concepts to teach
   - Practice exercises
   - Skills to master

Format the response as JSON with this structure:
{
  "description": "...",
  "objectives": ["...", "..."],
  "prerequisites": ["...", "..."],
  "weeklyPlans": [
    {
      "week": 1,
      "theme": "...",
      "concepts": ["...", "..."],
      "exercises": ["...", "..."],
      "skills": ["...", "..."]
    }
  ]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    // Extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to generate curriculum');
}



