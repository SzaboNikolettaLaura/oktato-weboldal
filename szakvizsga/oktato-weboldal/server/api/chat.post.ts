import { defineEventHandler, sendError, readBody } from 'h3';
import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Lecture {
  title: string;
  content?: string;
}

interface Context {
  title?: string;
  lectures?: Lecture[];
  currentCode?: string;
  page?: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, context, token, action, selectionContext }: { 
    message: string; 
    context?: Context; 
    token: string; 
    action?: string; 
    selectionContext?: string; 
  } = body;

  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    return sendError(event, new Error('Unauthorized'));
  }

  // Build context-aware prompt in Hungarian based on action
  let prompt = '';
  
  if (action === 'explain') {
    prompt = `Te egy mesterséges intelligencia tanársegéd vagy. A diák kiválasztott egy szöveget és magyarázatot kér róla.`;
    
    if (context && context.title) {
      prompt += `\n\nJelenlegi kurzus: "${context.title}"`;
    }
    
    if (selectionContext) {
      prompt += `\n\nKörnyező szöveg: "${selectionContext}"`;
    }
    
    prompt += `\n\nKiválasztott szöveg: "${message}"`;
    prompt += `\n\nKérlek, magyarázd el részletesen és érthetően ezt a szöveget magyarul. Adj példákat ha szükséges, és kapcsold össze a kurzus tartalmával ha releváns.`;
    
  } else if (action === 'generate_test') {
    prompt = `Te egy mesterséges intelligencia tanársegéd vagy. A diák kiválasztott egy szöveget vagy teszt kérdést, és hasonló tesztet szeretne generálni.`;
    
    if (context && context.title) {
      prompt += `\n\nJelenlegi kurzus: "${context.title}"`;
    }
    
    if (selectionContext) {
      prompt += `\n\nKörnyező szöveg: "${selectionContext}"`;
    }
    
    prompt += `\n\nKiválasztott szöveg/teszt: "${message}"`;
    prompt += `\n\nKérlek, generálj 3-5 hasonló teszt kérdést magyar nyelven, amely hasonló témát vagy nehézségi szintet fed le. Minden kérdéshez adj 4 válaszlehetőséget (A, B, C, D) és jelöld meg a helyes választ. Formázd szépen HTML-ben a választ.`;
    
  } else {
    // Default chat behavior
    prompt = `Te egy mesterséges intelligencia tanársegéd vagy egy online oktatási platformon. Segítesz a diákoknak megérteni a tananyagot és válaszolsz a kérdéseikre. Mindig magyarul válaszolj.`;
    
    if (context && context.title) {
      prompt += `\n\nJelenlegi kurzus: "${context.title}"`;
      
      if (context.lectures && context.lectures.length > 0) {
        prompt += `\n\nKurzus tartalma:`;
        context.lectures.forEach((lecture: Lecture, index: number) => {
          prompt += `\n\n${index + 1}. előadás: ${lecture.title}`;
          if (lecture.content) {
            prompt += `\nTartalom: ${lecture.content.substring(0, 500)}...`;
          }
        });
      }
    }
    
    prompt += `\n\nDiák kérdése: ${message}`;
    prompt += `\n\nKérlek, adj egy hasznos, oktató jellegű választ magyarul. Ha a kérdés kapcsolódik a kurzus tartalmához, hivatkozz a releváns részekre. Tartsd a választ tömörnek, de informatívnak.`;
  }

  try {
    const result = await model.generateContent([prompt]);
    const response = result.response.text();
    
    return {
      response: response
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return sendError(event, new Error('Failed to generate response'));
  }
}); 