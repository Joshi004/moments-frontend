/**
 * Default prompts for AI moment generation.
 * 
 * This file serves as the single source of truth for default prompts
 * used in the VideoMoments frontend application.
 */

export const DEFAULT_GENERATION_PROMPT = `Analyze the following video transcript and identify the most engaging, insightful, and shareable moments. Focus on content that viewers would genuinely find valuable and want to watch.

Prioritize moments that contain:
- Surprising facts, unique insights, or "aha" moments
- Practical tips, actionable advice, or how-to explanations
- Compelling stories, personal experiences, or emotional highlights
- Key takeaways, conclusions, or important revelations
- Humor, wit, or entertaining segments
- Expert opinions or authoritative statements on the topic

IMPORTANT - Exclude the following from moments:
- Sales pitches, product promotions, or calls-to-action to buy
- Sponsor reads, advertisements, or paid endorsements
- Self-promotion (subscribe, like, follow requests)
- Generic intros/outros without substantive content
- Filler content, repetitive explanations, or tangential rambling

Each moment should:
- Have a clear, descriptive title (5-15 words) that captures its essence
- Represent a complete, self-contained thought or concept
- Be non-overlapping and well-distributed throughout the video
- Stand alone as an engaging clip without additional context`;
