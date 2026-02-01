#!/bin/bash
source .env.local

if [ -z "$BROWSERBASE_API_KEY" ]; then
  echo "❌ BROWSERBASE_API_KEY not set"
  exit 1
fi

echo "🔑 Testing API Key: ${BROWSERBASE_API_KEY:0:10}..."

# Try to list sessions (validates key)
response=$(curl -s -o /dev/null -w "%{http_code}" -H "X-BB-API-Key: $BROWSERBASE_API_KEY" https://api.browserbase.com/v1/sessions)

if [ "$response" -eq 200 ]; then
  echo "✅ API Key is VALID (HTTP 200)"
else
  echo "❌ API Key Verification FAILED (HTTP $response)"
fi
