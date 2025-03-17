import { defineEventHandler, sendError, readBody } from 'h3';
import OpenAI from "openai";

const openaiHandler = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt } = body

  try {
    const openAIresponse = await openaiHandler.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    
    return openAIresponse.choices[0].message.content ?? "";
  } catch (error: any) {
    return sendError(event, new Error(error.message));
  }
});