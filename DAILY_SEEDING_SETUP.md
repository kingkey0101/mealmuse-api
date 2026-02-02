# Daily Spoonacular Seeding Setup

**Goal:** Run `npm run seed:spoonacular` once per day automatically without duplicates.

## Setup Steps

### 1. Build & Deploy New Lambda Function

```powershell
# Build
npm run build

# Upload lambda_all.zip to AWS Lambda (includes new dailySeedSpoonacular function)
```

### 2. Create New Lambda Function in AWS

**Function Name:** `mealmuse-daily-seed-spoonacular`

**Configuration:**
- Runtime: Node.js 20.x
- Handler: `dist/lambda/dailySeedSpoonacular.handler`
- Memory: 128 MB
- Timeout: 300 seconds (5 minutes for API calls)
- Environment Variables:
  ```
  MM_MONGODB_URI=mongodb+srv://...
  MM_MONGODB_DB=mealmuse_prod
  SPOONACULAR_API_KEY=your_key_here
  GROQ_MODEL=llama-3.1-8b-instant
  ```

### 3. Create EventBridge Rule

**In AWS Console:**

1. Go to **EventBridge** → **Rules**
2. Click **Create rule**

**Rule Details:**
- **Name:** `mealmuse-daily-seed-rule`
- **Description:** Daily Spoonacular recipe seeding at 2 AM UTC
- **Schedule:** `cron(0 2 * * ? *)`  (Daily at 2 AM UTC = 9 PM EST)

**Target:**
- **Type:** AWS Lambda function
- **Function:** `mealmuse-daily-seed-spoonacular`
- **Role:** Create new service role

**Alternative Times:**
- `cron(0 3 * * ? *)` = 3 AM UTC (10 PM EST)
- `cron(0 4 * * ? *)` = 4 AM UTC (11 PM EST)
- `cron(0 0 * * ? *)` = Midnight UTC (7 PM EST)

### 4. Duplicate Prevention

✅ **Already built-in:**
- Checks `spoonacularId` before inserting
- Skips recipes that already exist
- Logs saved vs skipped count

Example output:
```
✅ Daily seeding complete. Saved: 23, Skipped (duplicates): 27
```

### 5. Monitor Execution

**CloudWatch Logs:**
1. Go to **Lambda** → `mealmuse-daily-seed-spoonacular`
2. Click **Monitor** → **Logs**
3. View execution details and seed counts

**EventBridge Rule History:**
1. Go to **EventBridge** → Rules
2. Click `mealmuse-daily-seed-rule`
3. View Target details

---

## Local Testing

Test the Lambda function locally before scheduling:

```powershell
# Set environment
$env:MM_MONGODB_DB="mealmuse_prod"

# Run once
npm run seed:spoonacular

# Check logs
Write-Host "Check MongoDB for new recipes"
```

---

## What Gets Seeded

**API Requests:** 10 cuisines × 5 diets = 50 requests (exactly at daily limit)

**Cuisines:** Italian, Mexican, Chinese, Japanese, Indian, Thai, French, American, Mediterranean, Korean

**Diets:** Vegetarian, Vegan, Gluten Free, Dairy Free, Ketogenic

**Per Request:** Up to 10 recipes (potential max: 500 recipes/day, but duplicates are skipped)

---

## Troubleshooting

**Issue:** Lambda times out (300s)
- **Solution:** Reduce cuisines or diets list, or increase timeout to 600s

**Issue:** No recipes saved
- **Solution:** Check CloudWatch logs, verify `SPOONACULAR_API_KEY` is valid

**Issue:** Only duplicates skipped, nothing new saved
- **Solution:** Database already has most recipes from this Spoonacular search

**Issue:** Rate limit hit (429 from Spoonacular)
- **Solution:** Spoonacular free tier = 50/day. Schedule only once daily.

---

## Cost Impact

- **Lambda:** ~0.02 cents/day (negligible)
- **MongoDB:** No additional cost (just inserting documents)
- **Spoonacular:** FREE tier = 50 API calls/day (exactly what we use)

✅ **Total: FREE**

---

## Disable/Modify Later

To stop daily seeding:
1. Go to **EventBridge** → **Rules**
2. Click `mealmuse-daily-seed-rule`
3. Click **Disable** (keeps configuration)

To change schedule:
1. Edit the cron expression
2. Save

To check if running:
1. CloudWatch Logs → Recent executions
2. Check timestamp and saved count
