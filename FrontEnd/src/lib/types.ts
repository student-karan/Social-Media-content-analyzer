export type Report = {
    engagement_score: number,
    tone: string,
    platform_fit: string,
    tags: Array<string>,
    suggestions: Array<string>
} | null