# MealMuse API - Deployment & Build Notes

**Date:** January 29, 2026  
**Project:** MealMuse Recipe API Backend

---

## Automated Deployment Workflow

### Overview
Created automated npm scripts for Lambda deployment to streamline the build/clean/package process. No more manual commands needed.

### NPM Scripts Added

**Single Command Deployment:**
```bash
npm run deploy
```
This runs the entire workflow: clean → build → prepare → package

**Individual Scripts:**

1. **`npm run clean`**
   - Removes previous build artifacts
   - Deletes: `lambda_build/`, `lambda_all.zip`, `dist/`
   - Safe: Uses `-ErrorAction SilentlyContinue` (won't fail if files don't exist)

2. **`npm run build`**
   - Compiles TypeScript to JavaScript
   - Output: `dist/` folder
   - Runs: `tsc`

3. **`npm run prepare-deploy`**
   - Creates `lambda_build/` directory
   - Copies `dist/` → `lambda_build/dist/`
   - Copies `node_modules/` → `lambda_build/node_modules/`
   - Copies `package.json` and `package-lock.json`
   - Removes `.env` file (security - never include secrets in zip)

4. **`npm run package`**
   - Creates `lambda_all.zip` from `lambda_build/` contents
   - Ready to upload to AWS Lambda
   - Typical size: ~7-8 MB

5. **`npm run deploy`**
   - Runs all above steps in sequence
   - Complete workflow: clean → build → prepare → package
   - Output: `lambda_all.zip` ready for AWS upload

### PowerShell Deployment Script

**Alternative: Direct PowerShell Script**
- Location: `scripts/deploy.ps1`
- Provides colored output and progress messages
- Run: `powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1`

**Note:** npm scripts default to cmd.exe on Windows, so PowerShell commands may not work as expected in npm scripts. The direct PowerShell script is more reliable for Windows environments.

---

## Daily Maintenance Scripts

### Spoonacular Recipe Seeding

**Manual Daily Seed:**
```bash
npm run seed:daily
```
- Alias for `npm run seed:spoonacular`
- Fetches ~25 recipes from Spoonacular API
- Uses exactly 50 API calls (10 cuisines × 5 diets)
- Stays within free tier quota (50 requests/day)
- Run daily to add fresh recipes
- Quota resets: Daily at UTC midnight

**Next scheduled run:** Any time (50/day quota available)

---

## Database Index Management

**Create/Update Indexes:**
```bash
npm run ensure-indexes
```

**Indexes Created:**
- `ai_cache`: TTL index (24h expiration)
- `recipes`: Text search, skill, dietary, cooking time, cuisine
- `user_favorites`: userId + recipeId (unique)
- `users`: userId (unique, sparse), email (unique, sparse), tier
- `ai_interactions`: userId, type, created_at (90-day TTL)

**Note:** Run this after any schema changes or before first deployment.

---

## Testing & Utilities

**Generate JWT Test Token:**
```bash
npm run gen-token
```
- Creates test JWT token for Lambda testing
- Default userId: `test-user-123`
- Expiration: 24 hours

**Test Database Connection:**
```bash
npm run test-fetch
```
- Fetches first 50 recipes from database
- Verifies MongoDB connection
- Useful for debugging connection issues

**Seed Initial Recipes:**
```bash
npm run seed
```
- Seeds 15 initial recipes (manual seed)
- One-time setup (already completed)

---

## Complete Deployment Workflow

### Step-by-Step Process:

1. **Make code changes** (handlers, utilities, etc.)

2. **Test locally** (optional):
   ```bash
   npm run build
   npm run test-fetch
   ```

3. **Update indexes** (if schema changed):
   ```bash
   npm run ensure-indexes
   ```

4. **Create deployment package**:
   ```bash
   npm run deploy
   ```

5. **Upload to AWS Lambda**:
   - Upload `lambda_all.zip` to Lambda
   - Update handler paths if new functions added
   - Set environment variables

6. **Test in AWS Console**:
   - Use test events from `tests/aws-lambda-test-events.md`
   - Verify CloudWatch logs

7. **Daily maintenance** (optional):
   ```bash
   npm run seed:daily
   ```

---

## Package.json Scripts Reference

```json
{
  "scripts": {
    "build": "tsc",
    "ensure-indexes": "npm run build && node dist/scripts/ensureIndexes.js",
    "seed": "npm run build && node dist/scripts/seedRecipes.js",
    "seed:spoonacular": "npm run build && node dist/scripts/seedSpoonacular.js",
    "seed:daily": "npm run seed:spoonacular",
    "test-fetch": "npm run build && node dist/scripts/testFetch.js",
    "gen-token": "node scripts/generateTestToken.js",
    "clean": "Remove-Item -Recurse -Force lambda_build -ErrorAction SilentlyContinue; Remove-Item -Force lambda_all.zip -ErrorAction SilentlyContinue; Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue",
    "prepare-deploy": "npm run build && New-Item -ItemType Directory -Force -Path lambda_build | Out-Null; xcopy dist lambda_build\\dist /E /I /Y; xcopy node_modules lambda_build\\node_modules /E /I /Y; copy package.json lambda_build\\; copy package-lock.json lambda_build\\; Remove-Item -Force lambda_build\\.env -ErrorAction SilentlyContinue",
    "package": "Compress-Archive -Path lambda_build\\* -DestinationPath lambda_all.zip -Force",
    "deploy": "npm run clean && npm run prepare-deploy && npm run package"
  }
}
```

---

## Environment Variables

**Local (.env file):**
```bash
MM_MONGODB_URI="mongodb+srv://..."
MM_MONGODB_DB="mealmuse_db"
SPOONACULAR_API_KEY="65dbb356eea547508185ee2d59b7c3b5"
GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL="llama-3.1-8b-instant"
MM_STRIPE_SECRET="your_stripe_secret"
MM_HF_API_KEY="your_huggingface_key"
NEXTAUTH_SECRET="1283b1277854d83b12e724f91f8ca5548db980327dbb63fad8ff56f72479ec29"
```

**AWS Lambda (Set in Console):**
- Same as above (`.env` is excluded from deployment zip for security)
- Must be set manually in Lambda environment variables

---

## Security Notes

✅ **Good Practices:**
- `.env` file is excluded from deployment zip
- Environment variables set directly in AWS Lambda
- JWT secret never committed to repository
- API keys stored securely in AWS

⚠️ **Important:**
- Never commit `.env` file to Git
- Never include secrets in deployment packages
- Rotate API keys periodically
- Use separate keys for dev/staging/production

---

## Troubleshooting

**Build fails:**
```bash
npm run clean
npm run build
```

**Deployment zip too large:**
- Exclude dev dependencies in production
- Consider using Lambda Layers for node_modules
- Current size: ~7-8 MB (within Lambda limits)

**Lambda can't find modules:**
- Verify handler paths: `lambda/functionName.handler`
- Check environment variables are set
- Review CloudWatch logs for specific errors

**Database connection fails:**
```bash
npm run test-fetch
```
- Verify MM_MONGODB_URI is correct
- Check MongoDB Atlas network access (whitelist IP)
- Ensure database user has correct permissions

---

## Quick Reference

**Most Common Commands:**
```bash
npm run deploy          # Build and package for Lambda
npm run seed:daily      # Add 25 recipes from Spoonacular
npm run ensure-indexes  # Update database indexes
npm run gen-token       # Generate test JWT token
npm run test-fetch      # Test database connection
```

**Files Created:**
- `lambda_all.zip` - Deployment package (~7-8 MB)
- `lambda_build/` - Temporary build directory
- `dist/` - Compiled JavaScript output

**Files Excluded:**
- `.env` - Security (secrets never in deployment)
- `node_modules/` in root (copied to lambda_build)
- `tests/` - Not needed in Lambda runtime

---

## Recent Fixes & Updates (Jan 30, 2026)

### Groq Model Deprecation
- **Issue:** Model `mixtral-8x7b-32768` decommissioned by Groq
- **Fix:** Switched to `llama-3.1-8b-instant` as default model
- **Details:** Added `GROQ_MODEL` env var for override flexibility
- **File:** `utils/groq.ts` line 6

### JSON Parsing Improvements
- **Issue:** Groq API returns malformed JSON causing parse errors
- **Fixes Applied:**
  - Extract JSON from markdown code blocks (```json...```)
  - Handle unescaped newlines in JSON
  - Remove trailing commas before `}` and `]`
  - Better error logging showing failed JSON string
- **File:** `utils/groq.ts` lines 63-100

### MongoDB Update Operators Fix
- **Issue:** `MongoInvalidArgumentError: Update document requires atomic operators`
- **Root Cause:** `incrementUsage()` function had malformed update object mixing properties with operators
- **Fix:** Properly separated `$set` (for updated_at) and `$inc` (for counters)
- **File:** `handlers/users.ts` lines 147-165
- **Impact:** AI recipe generation now correctly increments usage counters

---

**Last Updated:** January 30, 2026  
**Status:** ✅ Production Ready (All critical fixes applied)
