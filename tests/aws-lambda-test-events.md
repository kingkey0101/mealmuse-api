# AWS Lambda Test Events

Copy and paste these test events into the AWS Lambda console to test each function after deploying the zipped package.

## Prerequisites
1. Generate a valid JWT token first:
   ```bash
   npm run gen-token
   ```
   Copy the `Bearer token` from the output and replace `YOUR_JWT_TOKEN` in all test events below.

2. For tests that need a recipe ID (GET, UPDATE, DELETE, favorites), first run the LIST_RECIPES test to get an actual `_id` from the response.

---

## 1. LIST RECIPES

**Function:** `listRecipes`

**Test Event Name:** `listRecipes_test`

```json
{
  "resource": "/recipes",
  "path": "/recipes",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "[{\"_id\":\"...\",\"title\":\"...\",\"cuisine\":[...],\"skill\":\"beginner\",...}]"
}
```

---

## 2. SEARCH RECIPES WITH FILTERS

**Function:** `searchRecipes`

**Test Event Name:** `searchRecipes_filter_test`

```json
{
  "resource": "/recipes/search",
  "path": "/recipes/search",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "queryStringParameters": {
    "skill": "beginner",
    "diet": "vegetarian",
    "time": "30",
    "limit": "10"
  },
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "{\"recipes\":[...],\"total\":5,\"limit\":10,\"offset\":0}"
}
```

---

## 3. GET RECIPE BY ID

**Function:** `getRecipeById`

**Test Event Name:** `getRecipeById_test`

⚠️ **IMPORTANT:** Replace `RECIPE_ID_HERE` with an actual recipe ID from LIST_RECIPES response

```json
{
  "resource": "/recipes/{id}",
  "path": "/recipes/RECIPE_ID_HERE",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "pathParameters": {
    "id": "RECIPE_ID_HERE"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "{\"_id\":\"RECIPE_ID_HERE\",\"title\":\"...\",\"cuisine\":[...]}"
}
```

---

## 4. CREATE RECIPE

**Function:** `createRecipe`

**Test Event Name:** `createRecipe_test`

```json
{
  "resource": "/recipes",
  "path": "/recipes",
  "httpMethod": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "queryStringParameters": {},
  "body": "{\"title\":\"Spaghetti Carbonara\",\"cuisine\":[\"Italian\"],\"skill\":\"intermediate\",\"dietaryPreferences\":[\"vegetarian\"],\"cookingTime\":25,\"ingredients\":[{\"name\":\"spaghetti\",\"amount\":1,\"unit\":\"box\"},{\"name\":\"eggs\",\"amount\":3,\"unit\":\"whole\"}],\"steps\":[\"Boil pasta\",\"Mix eggs with cheese\",\"Combine and serve\"],\"equipment\":[\"pot\",\"pan\"]}",
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "body": "{\"id\":\"NEW_RECIPE_ID\"}"
}
```

**Save the NEW_RECIPE_ID for UPDATE and DELETE tests**

---

## 5. UPDATE RECIPE

**Function:** `updateRecipe`

**Test Event Name:** `updateRecipe_test`

⚠️ **IMPORTANT:** Replace `NEW_RECIPE_ID` with the ID from CREATE_RECIPE response

```json
{
  "resource": "/recipes/{id}",
  "path": "/recipes/NEW_RECIPE_ID",
  "httpMethod": "PATCH",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "pathParameters": {
    "id": "NEW_RECIPE_ID"
  },
  "queryStringParameters": {},
  "body": "{\"title\":\"Spaghetti Carbonara - Updated\",\"cookingTime\":30}",
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Recipe updated successfully\"}"
}
```

---

## 6. ADD FAVORITE

**Function:** `addFavorites`

**Test Event Name:** `addFavorite_test`

⚠️ **IMPORTANT:** Replace `RECIPE_ID_HERE` with any recipe ID from LIST_RECIPES

```json
{
  "resource": "/recipes/{id}/favorite",
  "path": "/recipes/RECIPE_ID_HERE/favorite",
  "httpMethod": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "pathParameters": {
    "id": "RECIPE_ID_HERE"
  },
  "queryStringParameters": {},
  "body": "{}",
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 201,
  "body": "{\"message\":\"Added to favorites\",\"insertedId\":\"...\"}"
}
```

---

## 7. LIST FAVORITES

**Function:** `listFavorites`

**Test Event Name:** `listFavorites_test`

```json
{
  "resource": "/favorites",
  "path": "/favorites",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "[{\"recipeId\":\"...\",\"created_at\":\"2026-01-28T...\",\"recipe\":{...}}]"
}
```

---

## 8. REMOVE FAVORITE

**Function:** `removeFavorite`

**Test Event Name:** `removeFavorite_test`

⚠️ **IMPORTANT:** Replace `RECIPE_ID_HERE` with a recipe you just favorited

```json
{
  "resource": "/recipes/{id}/favorite",
  "path": "/recipes/RECIPE_ID_HERE/favorite",
  "httpMethod": "DELETE",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "pathParameters": {
    "id": "RECIPE_ID_HERE"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Removed from favorites\"}"
}
```

---

## 9. DELETE RECIPE

**Function:** `deleteRecipe`

**Test Event Name:** `deleteRecipe_test`

⚠️ **IMPORTANT:** Replace `NEW_RECIPE_ID` with the ID from CREATE_RECIPE response (cleanup test)

```json
{
  "resource": "/recipes/{id}",
  "path": "/recipes/NEW_RECIPE_ID",
  "httpMethod": "DELETE",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json"
  },
  "pathParameters": {
    "id": "NEW_RECIPE_ID"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Recipe deleted successfully\"}"
}
```

---

## 10. AUTHENTICATION ERROR TEST

**Function:** Any Lambda function (e.g., `listRecipes`)

**Test Event Name:** `auth_error_test`

```json
{
  "resource": "/recipes",
  "path": "/recipes",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer INVALID_TOKEN",
    "Content-Type": "application/json"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "body": "{\"error\":\"Unauthorized: Invalid token\"}"
}
```

---

## 11. MISSING AUTH HEADER TEST

**Function:** Any Lambda function (e.g., `listRecipes`)

**Test Event Name:** `missing_auth_test`

```json
{
  "resource": "/recipes",
  "path": "/recipes",
  "httpMethod": "GET",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryStringParameters": {},
  "body": null,
  "isBase64Encoded": false
}
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "body": "{\"error\":\"Unauthorized\"}"
}
```

---

## Testing Checklist

After uploading the zipped package to AWS Lambda, test in this order:

- [ ] 1. Run `listRecipes_test` - Get list of recipes
- [ ] 2. Copy a recipe `_id` from response
- [ ] 3. Run `getRecipeById_test` with that ID
- [ ] 4. Run `searchRecipes_filter_test` - Test filtering
- [ ] 5. Run `createRecipe_test` - Create a test recipe
- [ ] 6. Copy the returned `NEW_RECIPE_ID`
- [ ] 7. Run `updateRecipe_test` with that ID
- [ ] 8. Run `addFavorite_test` with any recipe ID
- [ ] 9. Run `listFavorites_test` - See favorited recipes
- [ ] 10. Run `removeFavorite_test` with that recipe ID
- [ ] 11. Run `deleteRecipe_test` with the NEW_RECIPE_ID (cleanup)
- [ ] 12. Run `auth_error_test` - Verify auth fails
- [ ] 13. Run `missing_auth_test` - Verify missing auth fails

## Environment Variables Required in Lambda

Make sure these are set in AWS Lambda environment variables:

```
MM_MONGODB_URI=mongodb+srv://...
MM_MONGODB_DB=mealmuse_db
NEXTAUTH_SECRET=1283b1277854d83b12e724f91f8ca5548db980327dbb63fad8ff56f72479ec29
SPOONACULAR_API_KEY=65dbb356eea547508185ee2d59b7c3b5
```

## Troubleshooting

**401 Unauthorized errors:**
- Generate a fresh token: `npm run gen-token`
- Copy the exact Bearer token (no extra spaces)

**404 Not Found errors:**
- Make sure you're using actual recipe IDs from your database
- Verify MongoDB connection is working

**500 Internal Server Error:**
- Check CloudWatch logs in AWS Lambda console
- Verify environment variables are set
- Check MongoDB connection string is correct
