import { generateRecipeFromPrompt, GroqRecipe } from '../utils/groq';
import { verifyJwtFromHeader } from '../utils/verifyJwt';
import { createRecipe } from '../handlers/recipes';
import { checkLimit, incrementUsage, getUserProfile } from '../handlers/users';
import { getDb } from '../utils/mongo';

interface AiInteraction {
  userId: string;
  type: 'recipe_generation';
  generatedRecipe?: GroqRecipe;
  prompt: string;
  model: string;
  tokensUsed?: number;
  cost?: number;
  created_at: Date;
  savedToRecipes?: boolean;
  recipeId?: string;
}

export const handler = async (event: any) => {
  try {
    const auth = event.headers?.authorization ||
      event.headers?.Authorization ||
      event.headers?.AUTHORIZATION;

    const decoded = verifyJwtFromHeader(auth);
    if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Unauthorized: Invalid token' }),
      };
    }

    const userId = String((decoded as any).userId);

    // Check tier and limits
    const canGenerate = await checkLimit(userId, 'recipeGen');
    if (!canGenerate) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({
          error: 'Recipe generation limit reached. Upgrade to premium for unlimited generations.',
        }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Get user for email
    const user = await getUserProfile(userId);

    // Generate recipe from Groq
    const generatedRecipe = await generateRecipeFromPrompt(prompt);

    if (!generatedRecipe) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Failed to generate recipe' }),
      };
    }

    // Save to recipes collection
    const recipeData = {
      ...generatedRecipe,
      userId,
      source: 'ai_generated',
      generatedByAI: {
        prompt,
        model: 'mixtral-8x7b-32768',
      },
      created_at: new Date(),
    };

    const recipeId = await createRecipe(recipeData);

    // Log AI interaction
    const db = await getDb();
    const interaction: AiInteraction = {
      userId,
      type: 'recipe_generation',
      generatedRecipe,
      prompt,
      model: 'mixtral-8x7b-32768',
      created_at: new Date(),
      savedToRecipes: true,
      recipeId: String(recipeId),
    };

    await db.collection('ai_interactions').insertOne(interaction);

    // Increment usage
    await incrementUsage(userId, 'recipeGen');

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': 'https://mymealmuse.com',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        recipe: generatedRecipe,
        recipeId: String(recipeId),
        message: 'Recipe generated and saved successfully',
      }),
    };
  } catch (err) {
    console.error('Error in generateRecipe handler:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://mymealmuse.com',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
