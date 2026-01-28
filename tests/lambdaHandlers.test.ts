/**
 * Lambda Test Suite for MealMuse API Endpoints
 * 
 * Tests cover:
 * - Recipe CRUD operations
 * - JWT authentication
 * - Favorites management
 * - Search and filtering
 */

import { handler as listRecipesHandler } from '../lambda/listRecipes';
import { handler as getRecipeHandler } from '../lambda/getRecipeById';
import { handler as createRecipeHandler } from '../lambda/createRecipe';
import { handler as updateRecipeHandler } from '../lambda/updateRecipe';
import { handler as deleteRecipeHandler } from '../lambda/deleteRecipe';
import { handler as searchRecipesHandler } from '../lambda/searchRecipes';
import { handler as addFavoriteHandler } from '../lambda/addFavorites';
import { handler as removeFavoriteHandler } from '../lambda/removeFavorite';
import { handler as listFavoritesHandler } from '../lambda/listFavorites';
import {
  createMockGetEvent,
  createMockPostEvent,
  createMockDeleteEvent,
  generateTestToken,
} from './lambdaTestHelpers';

const TEST_USER_ID = 'test-user-lambda-123';
const TEST_TOKEN = generateTestToken(TEST_USER_ID);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  statusCode?: number;
  body?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>) {
  try {
    console.log(`\n▶ ${name}...`);
    await testFn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error });
    console.error(`✗ ${name}: ${error}`);
  }
}

// ==============
// TEST 1: LIST RECIPES
// ==============
async function testListRecipes() {
  const event = createMockGetEvent('/recipes', {}, `Bearer ${TEST_TOKEN}`);
  const response = await listRecipesHandler(event, {});

  const parsedBody = JSON.parse(response.body);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  if (!Array.isArray(parsedBody)) {
    throw new Error(`Expected array, got ${typeof parsedBody}`);
  }
  if (parsedBody.length === 0) {
    throw new Error('Expected recipes to be returned');
  }
}

// ==============
// TEST 2: SEARCH RECIPES WITH FILTERS
// ==============
async function testSearchRecipes() {
  const event = createMockGetEvent(
    '/recipes/search',
    { skill: 'beginner', limit: '10' },
    `Bearer ${TEST_TOKEN}`
  );
  const response = await searchRecipesHandler(event, {});

  const parsedBody = JSON.parse(response.body);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  if (!parsedBody.recipes || !Array.isArray(parsedBody.recipes)) {
    throw new Error('Expected recipes array in response');
  }
  if (parsedBody.recipes.length > 0 && parsedBody.recipes[0].skill !== 'beginner') {
    throw new Error('Expected filtered results for beginner skill');
  }
}

// ==============
// TEST 3: GET RECIPE BY ID
// ==============
let testRecipeId: string;
async function testGetRecipeById() {
  // First get a recipe ID
  const listEvent = createMockGetEvent('/recipes', {}, `Bearer ${TEST_TOKEN}`);
  const listResponse = await listRecipesHandler(listEvent, {});
  const recipes = JSON.parse(listResponse.body);

  if (recipes.length === 0) {
    throw new Error('No recipes available for testing');
  }

  testRecipeId = recipes[0]._id;

  // Now get the specific recipe
  const event = createMockGetEvent(
    `/recipes/${testRecipeId}`,
    {},
    `Bearer ${TEST_TOKEN}`
  );
  event.pathParameters = { id: testRecipeId };

  const response = await getRecipeHandler(event, {});
  const parsedBody = JSON.parse(response.body);

  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  if (parsedBody._id !== testRecipeId) {
    throw new Error('Expected correct recipe returned');
  }
}

// ==============
// TEST 4: CREATE RECIPE
// ==============
let createdRecipeId: string;
async function testCreateRecipe() {
  const recipeData = {
    title: 'Test Lambda Recipe',
    cuisine: ['Italian'],
    skill: 'intermediate',
    dietaryPreferences: ['vegetarian'],
    cookingTime: 30,
    ingredients: [
      { name: 'pasta', amount: 1, unit: 'box' },
      { name: 'olive oil', amount: 2, unit: 'tbsp' },
    ],
    steps: ['Boil water', 'Cook pasta', 'Drain and serve'],
    equipment: ['pot', 'strainer'],
  };

  const event = createMockPostEvent('/recipes', recipeData, `Bearer ${TEST_TOKEN}`);
  const response = await createRecipeHandler(event, {});

  const parsedBody = JSON.parse(response.body);
  if (response.statusCode !== 201) {
    throw new Error(`Expected 201, got ${response.statusCode}`);
  }
  if (!parsedBody.id) {
    throw new Error('Expected id in response');
  }

  createdRecipeId = parsedBody.id;
}

// ==============
// TEST 5: UPDATE RECIPE
// ==============
async function testUpdateRecipe() {
  if (!createdRecipeId) {
    throw new Error('No recipe created in previous test');
  }

  const updates = {
    title: 'Updated Test Lambda Recipe',
    cookingTime: 45,
  };

  const event = createMockPostEvent(
    `/recipes/${createdRecipeId}`,
    updates,
    `Bearer ${TEST_TOKEN}`
  );
  event.pathParameters = { id: createdRecipeId };
  event.httpMethod = 'PATCH';

  const response = await updateRecipeHandler(event, {});

  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
}

// ==============
// TEST 6: ADD FAVORITE
// ==============
let favoriteRecipeId: string;
async function testAddFavorite() {
  if (!testRecipeId) {
    throw new Error('No recipe ID from previous test');
  }

  favoriteRecipeId = testRecipeId;

  const event = createMockPostEvent(
    `/recipes/${favoriteRecipeId}/favorite`,
    {},
    `Bearer ${TEST_TOKEN}`
  );
  event.pathParameters = { id: favoriteRecipeId };
  event.httpMethod = 'POST';

  const response = await addFavoriteHandler(event, {});
  const parsedBody = JSON.parse(response.body);

  if (response.statusCode !== 200 && response.statusCode !== 201) {
    throw new Error(`Expected 200 or 201, got ${response.statusCode}`);
  }
  if (!parsedBody.message) {
    throw new Error('Expected message in response');
  }
}

// ==============
// TEST 7: LIST FAVORITES
// ==============
async function testListFavorites() {
  const event = createMockGetEvent('/favorites', {}, `Bearer ${TEST_TOKEN}`);
  const response = await listFavoritesHandler(event, {});

  const parsedBody = JSON.parse(response.body);
  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
  if (!Array.isArray(parsedBody)) {
    throw new Error('Expected array in response');
  }
}

// ==============
// TEST 8: REMOVE FAVORITE
// ==============
async function testRemoveFavorite() {
  if (!favoriteRecipeId) {
    throw new Error('No favorite recipe ID from previous test');
  }

  const event = createMockDeleteEvent(
    `/recipes/${favoriteRecipeId}/favorite`,
    { id: favoriteRecipeId },
    `Bearer ${TEST_TOKEN}`
  );

  const response = await removeFavoriteHandler(event, {});
  const parsedBody = JSON.parse(response.body);

  if (response.statusCode !== 200 && response.statusCode !== 404) {
    throw new Error(`Expected 200 or 404, got ${response.statusCode}`);
  }
  if (!parsedBody.message) {
    throw new Error('Expected message in response');
  }
}

// ==============
// TEST 9: AUTHENTICATION REQUIRED
// ==============
async function testAuthenticationRequired() {
  const event = createMockGetEvent('/recipes', {}, 'Bearer invalid-token');
  const response = await listRecipesHandler(event, {});

  if (response.statusCode !== 401) {
    throw new Error(`Expected 401 for invalid token, got ${response.statusCode}`);
  }
}

// ==============
// TEST 10: DELETE RECIPE (CLEANUP)
// ==============
async function testDeleteRecipe() {
  if (!createdRecipeId) {
    throw new Error('No recipe created in previous test');
  }

  const event = createMockDeleteEvent(
    `/recipes/${createdRecipeId}`,
    { id: createdRecipeId },
    `Bearer ${TEST_TOKEN}`
  );

  const response = await deleteRecipeHandler(event, {});

  if (response.statusCode !== 200) {
    throw new Error(`Expected 200, got ${response.statusCode}`);
  }
}

// ==============
// RUN ALL TESTS
// ==============
async function runAllTests() {
  console.log('🧪 Starting Lambda Handler Tests...\n');

  await runTest('LIST RECIPES', testListRecipes);
  await runTest('SEARCH RECIPES WITH FILTERS', testSearchRecipes);
  await runTest('GET RECIPE BY ID', testGetRecipeById);
  await runTest('CREATE RECIPE', testCreateRecipe);
  await runTest('UPDATE RECIPE', testUpdateRecipe);
  await runTest('ADD FAVORITE', testAddFavorite);
  await runTest('LIST FAVORITES', testListFavorites);
  await runTest('REMOVE FAVORITE', testRemoveFavorite);
  await runTest('AUTHENTICATION REQUIRED', testAuthenticationRequired);
  await runTest('DELETE RECIPE', testDeleteRecipe);

  // Print summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }

  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
