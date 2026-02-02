// lambda/chatWithChef.ts
import { verifyJwtFromHeader } from '../utils/verifyJwt';
import { generateChefChatResponse } from '../utils/groq';
import { getDb } from '../utils/mongo';
import { checkLimit, incrementUsage } from '../handlers/users';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  conversationHistory: ConversationMessage[];
  topic?: string;
}

interface ChatResponse {
  statusCode: number;
  headers?: {
    [key: string]: string;
  };
  body: string;
}

export const handler = async (event: any): Promise<ChatResponse> => {
  try {
    // Verify JWT
    const auth = event.headers?.authorization ||
      event.headers?.Authorization ||
      event.headers?.AUTHORIZATION;
    
    const decoded = verifyJwtFromHeader(auth);
    if (!decoded || typeof decoded === 'string' || !('userId' in decoded)) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': 'https://mymealmuse.com',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Unauthorized: Invalid token' }),
      };
    }

    const userId = String((decoded as any).userId);

    // Parse request
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { conversationHistory, topic } = body as ChatRequest;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://mymealmuse.com',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Missing or invalid conversationHistory' }),
      };
    }

    // Check daily limit (aiChat limit)
    const canChat = await checkLimit(userId, 'aiChat');
    if (!canChat) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': 'https://mymealmuse.com',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({
          error: 'Daily AI chat limit reached. Upgrade to premium for unlimited chats.',
        }),
      };
    }

    // Call Groq API for response
    const aiResponse = await generateChefChatResponse(conversationHistory);

    if (!aiResponse) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://mymealmuse.com',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Failed to generate chef response' }),
      };
    }

    // Extract user query (last user message)
    const userQuery = conversationHistory
      .filter(m => m.role === 'user')
      .pop()?.content || '';

    // Extract keywords from query and response
    const extractedKeywords = extractKeywords([userQuery, aiResponse]);

    // Save to ai_interactions collection
    const db = await getDb();
    const interactionsCollection = db.collection('ai_interactions');

    const interaction = {
      userId,
      type: 'chef_chat',
      userQuery,
      aiResponse,
      conversationHistory,
      topic: topic || extractTopic(userQuery),
      extractedKeywords,
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      created_at: new Date(),
      feedbackScore: null,
      userRatedHelpful: false,
    };

    const result = await interactionsCollection.insertOne(interaction);

    // Increment usage counter
    await incrementUsage(userId, 'aiChat');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mymealmuse.com',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        response: aiResponse,
        interactionId: result.insertedId,
        topic: interaction.topic,
        keywords: extractedKeywords,
        message: 'Chef response generated and saved successfully',
      }),
    };
  } catch (err) {
    console.error('Error in chatWithChef handler:', err);
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

/**
 * Extract keywords from text using simple regex patterns
 */
function extractKeywords(texts: string[]): string[] {
  const keywords = new Set<string>();
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'does', 'did', 'will',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'how', 'why', 'can', 'could',
    'would', 'should', 'may', 'might', 'must', 'shall'
  ]);

  texts.forEach(text => {
    // Extract words 3+ characters
    const words = text.toLowerCase().match(/\b\w{3,}\b/g) || [];
    words.forEach(word => {
      if (!stopwords.has(word)) {
        keywords.add(word);
      }
    });
  });

  return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
}

/**
 * Extract main topic from user query
 */
function extractTopic(query: string): string {
  const query_lower = query.toLowerCase();

  if (query_lower.includes('ingredient') || query_lower.includes('substitute')) return 'ingredient_substitution';
  if (query_lower.includes('technique') || query_lower.includes('how to')) return 'cooking_technique';
  if (query_lower.includes('nutrition') || query_lower.includes('calorie')) return 'nutrition';
  if (query_lower.includes('pairing') || query_lower.includes('wine') || query_lower.includes('side')) return 'food_pairing';
  if (query_lower.includes('diet') || query_lower.includes('vegan') || query_lower.includes('gluten')) return 'dietary_restriction';
  if (query_lower.includes('recipe') || query_lower.includes('make')) return 'recipe_help';
  if (query_lower.includes('storage') || query_lower.includes('preserve')) return 'storage_preservation';

  return 'general_cooking_advice';
}
