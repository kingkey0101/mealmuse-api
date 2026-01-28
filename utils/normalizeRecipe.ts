import type { SpoonacularRecipe } from './spoonacular';

export interface NormalizedRecipe {
  title: string;
  cuisine: string[];
  skill: 'beginner' | 'intermediate' | 'advanced';
  dietaryPreferences: string[];
  cookingTime: number;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  steps: string[];
  image?: string;
  sourceUrl?: string;
  source: 'spoonacular' | 'user';
  spoonacularId?: number;
  cachedAt?: Date;
}

/**
 * Map Spoonacular diet names to standardized format
 */
function mapDiets(spoonacularDiets: string[]): string[] {
  const dietMap: { [key: string]: string } = {
    'gluten free': 'gluten-free',
    'dairy free': 'dairy-free',
    'ketogenic': 'keto-friendly',
    'paleo': 'paleo',
    'vegan': 'vegan',
    'vegetarian': 'vegetarian',
    'pescatarian': 'pescatarian',
  };

  return (spoonacularDiets || [])
    .map(d => dietMap[d.toLowerCase()] || d.toLowerCase())
    .filter(Boolean);
}

/**
 * Determine skill level from readyInMinutes
 * Can be enhanced with recipe complexity data
 */
function getSkillLevel(readyInMinutes: number): 'beginner' | 'intermediate' | 'advanced' {
  if (readyInMinutes <= 20) return 'beginner';
  if (readyInMinutes <= 45) return 'intermediate';
  return 'advanced';
}

/**
 * Normalize Spoonacular recipe to MongoDB schema
 */
export function normalizeSpoonacularRecipe(spoonRecipe: SpoonacularRecipe): NormalizedRecipe {
  const ingredients = (spoonRecipe.extendedIngredients || []).map(ing => ({
    name: ing.name || ing.original || 'Unknown ingredient',
    amount: ing.amount || 0,
    unit: ing.unit || '',
  }));

  const steps = spoonRecipe.analyzedInstructions?.[0]?.steps
    ?.map(s => s.step || '')
    .filter(Boolean) || [
    'Recipe from Spoonacular. Visit the source URL for detailed instructions.',
  ];

  const cuisines = spoonRecipe.cuisines || ['International'];

  return {
    title: spoonRecipe.title || 'Unknown Recipe',
    cuisine: cuisines,
    skill: getSkillLevel(spoonRecipe.readyInMinutes || 30),
    dietaryPreferences: mapDiets(spoonRecipe.diets || []),
    cookingTime: spoonRecipe.readyInMinutes || 30,
    ingredients,
    steps,
    image: spoonRecipe.image,
    sourceUrl: spoonRecipe.sourceUrl,
    source: 'spoonacular',
    spoonacularId: spoonRecipe.id,
    cachedAt: new Date(),
  };
}
