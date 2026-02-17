import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import * as zod from "zod";
import "dotenv/config";
import type { prompt } from "./types.js";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

const instruction = "You are a social media expert that analyzes social media content and provides insights based on the content. You will be given a prompt containing the content, line count, and language of the content. Based on this information, you will provide insights and analysis of the content.";

async function fetchGeminiResponse(prompt: prompt) {
    try {
        const res = await generateText({
            model: google("gemini-2.0-flash"),
            system: instruction,
            abortSignal: AbortSignal.timeout(60000),
            output: Output.object({
                schema: zod.object({
                    engagement_score: zod.number(),
                    tone: zod.string(),
                    platform_fit: zod.string(),
                    tags: zod.array(zod.string()),
                    suggestions: zod.array(zod.string())
                }),
            }),
            prompt: JSON.stringify(prompt)
        });
        return res.output;
    } catch (err) {
        throw err;
    }
}

export default fetchGeminiResponse;
