// utils/groq.ts
import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

export interface GroqRecipe {
  title: string;
  cuisine: string[];
  skill: 'beginner' | 'intermediate' | 'advanced';
  dietaryPreferences: string[];
  cookingTime: number;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  steps: string[];
}

/**
 * Generate a recipe using Groq AI
 */
export async function generateRecipeFromPrompt(prompt: string): Promise<GroqRecipe | null> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY not set');
    return null;
  }

  try {
    const systemPrompt = `You are a professional chef and recipe developer. When asked to generate a recipe, respond with ONLY valid JSON (no markdown, no extra text) matching this exact structure:
{
  "title": "Recipe Name",
  "cuisine": ["cuisine1", "cuisine2"],
  "skill": "beginner|intermediate|advanced",
  "dietaryPreferences": ["dietary1"],
  "cookingTime": 30,
  "ingredients": [{"name": "ingredient", "amount": 1, "unit": "cup"}],
  "steps": ["step1", "step2"]
}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return null;
    }

    const data: any = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON from response (remove markdown if present)
    let jsonString = content;
    
    // Try to extract JSON if wrapped in markdown code blocks
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonString = jsonMatch[1];
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonString = jsonMatch[1];
    } else {
      // Try to find JSON object
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonString = content.substring(startIdx, endIdx + 1);
      }
    }

    // Clean up common JSON issues
    jsonString = jsonString
      .replace(/[\r\n]+/g, ' ') // Remove newlines
      .replace(/,\s*}/g, '}') // Remove trailing commas before }
      .replace(/,\s*]/g, ']') // Remove trailing commas before ]
      .trim();

    if (!jsonString.startsWith('{')) {
      console.error('No JSON object found in Groq response:', content);
      return null;
    }

    try {
      const recipe = JSON.parse(jsonString) as GroqRecipe;
      return recipe;
    } catch (parseErr) {
      console.error('Failed to parse JSON from Groq response. Response was:', jsonString);
      console.error('Parse error:', parseErr);
      return null;
    }
  } catch (err) {
    console.error('Error generating recipe from Groq:', err);
    return null;
  }
}

/**
 * Generate an AI chef chat response
 */
export async function generateChefChatResponse(conversationHistory: Array<{ role: string; content: string }>): Promise<string | null> {
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY not set');
    return null;
  }

  try {
    const systemPrompt = `You are MealMuse's AI Chef Chatbot. You are knowledgeable, friendly, and helpful. You provide cooking advice, recipe suggestions, dietary tips, and answer questions about food and cooking. Keep responses concise and helpful.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      return null;
    }

    const data: any = await response.json();
    const message = data.choices[0].message.content.trim();
    return message;
  } catch (err) {
    console.error('Error generating chef response from Groq:', err);
    return null;
  }
}
