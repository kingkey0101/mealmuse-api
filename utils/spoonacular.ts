import fetch from 'node-fetch';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = process.env.SPOONACULAR_API_KEY;

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  cuisines: string[];
  diets: string[];
  readyInMinutes: number;
  sourceUrl?: string;
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

interface SearchOptions {
  query?: string;
  cuisine?: string;
  diet?: string;
  maxReadyTime?: number;
  number?: number;
  offset?: number;
  ranking?: number; // 1 for popularity, 2 for health rating
}

export async function searchRecipes(options: SearchOptions = {}): Promise<SpoonacularRecipe[]> {
  if (!API_KEY) {
    console.error('SPOONACULAR_API_KEY not set');
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.append('apiKey', API_KEY);
    params.append('number', String(options.number || 20));
    params.append('offset', String(options.offset || 0));
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');
    params.append('addRecipeInstructions', 'true');

    if (options.query) params.append('query', options.query);
    if (options.cuisine) params.append('cuisine', options.cuisine);
    if (options.diet) params.append('diet', options.diet);
    if (options.maxReadyTime) params.append('maxReadyTime', String(options.maxReadyTime));

    const url = `${SPOONACULAR_BASE_URL}/complexSearch?${params.toString()}`;
    const response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      console.error(`Spoonacular API error: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as { results: SpoonacularRecipe[] };
    return data.results || [];
  } catch (err) {
    console.error('Error searching Spoonacular recipes:', err);
    return [];
  }
}

export async function getRecipeDetails(recipeId: number): Promise<SpoonacularRecipe | null> {
  if (!API_KEY) {
    console.error('SPOONACULAR_API_KEY not set');
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('apiKey', API_KEY);
    params.append('includeNutrition', 'false');

    const url = `${SPOONACULAR_BASE_URL}/${recipeId}/information?${params.toString()}`;
    const response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      console.error(`Spoonacular API error: ${response.status}`);
      return null;
    }

    return (await response.json()) as SpoonacularRecipe;
  } catch (err) {
    console.error('Error fetching Spoonacular recipe details:', err);
    return null;
  }
}

export async function getRandomRecipe(): Promise<SpoonacularRecipe | null> {
  if (!API_KEY) {
    console.error('SPOONACULAR_API_KEY not set');
    return null;
  }

  try {
    const params = new URLSearchParams();
    params.append('apiKey', API_KEY);
    params.append('number', '1');

    const url = `${SPOONACULAR_BASE_URL}/random?${params.toString()}`;
    const response = await fetch(url, { timeout: 10000 });

    if (!response.ok) {
      console.error(`Spoonacular API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as { recipes: SpoonacularRecipe[] };
    return data.recipes?.[0] || null;
  } catch (err) {
    console.error('Error fetching random Spoonacular recipe:', err);
    return null;
  }
}
