# MCP Server Setup Guide for GrooveGrid

## What is MCP (Model Context Protocol)?

MCP allows Cursor's AI to directly interact with your external services (databases, APIs, etc.) instead of just reading code. This means I can:
- Query your Supabase database directly
- Check Stripe payment status in real-time
- View/send emails through Resend
- And more!

## Quick Start Checklist

- [ ] 1. Gather all API keys (see below)
- [ ] 2. Update Cursor MCP settings (see Configuration section)
- [ ] 3. Restart Cursor
- [ ] 4. Test the connection

---

## 1. Gather Your API Keys

### Supabase Connection String
1. Go to https://supabase.com/dashboard/project/_/settings/database
2. Find your **Connection String** (Direct Connection or Pooler)
3. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
4. Replace `[PASSWORD]` with your database password

### Stripe Secret Key
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_` for test mode)
3. For production: use `sk_live_` key from Live mode

### Resend API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Copy the key (starts with `re_`)

---

## 2. Configure Cursor MCP Settings

### Step A: Open Cursor Settings
1. Press `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
2. Type "Preferences: Open User Settings (JSON)"
3. OR manually edit: `%APPDATA%\Cursor\User\settings.json` (Windows)

### Step B: Add MCP Configuration

Add this to your `settings.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "stripe-mcp-server"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_YOUR_KEY_HERE"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "re_YOUR_KEY_HERE"
      }
    }
  }
}
```

### Step C: Replace Placeholders

Replace these values with your actual keys:
- `[YOUR-PROJECT-REF]` - Your Supabase project reference (e.g., `bmdzerzampxetxmpmihv`)
- `[YOUR-PASSWORD]` - Your Supabase database password
- `sk_test_YOUR_KEY_HERE` - Your Stripe secret key
- `re_YOUR_KEY_HERE` - Your Resend API key

---

## 3. Restart Cursor

After saving the settings:
1. Close Cursor completely
2. Reopen Cursor
3. Wait for MCP servers to initialize (you may see a notification)

---

## 4. Test the MCP Connection

Once Cursor restarts, you can ask me to:

### Test Supabase
```
"Show me the 5 most recent orders from the database"
"How many users are registered?"
"What events are happening next week?"
```

### Test Stripe
```
"What are my recent Stripe payments?"
"Show me failed payment attempts"
"What's my Stripe balance?"
```

### Test Resend
```
"List the recent emails sent through Resend"
"Show me all verified domains in Resend"
"What's the status of email deliveries today?"
```

---

## Troubleshooting

### MCP Server Won't Start

**Error: "RESEND_API_KEY environment variable is required"**
- Check that your API key is correctly set in the MCP settings
- Ensure no extra spaces or quotes around the key

**Error: "Connection refused" (Supabase)**
- Verify your connection string is correct
- Check that your IP is allowed in Supabase (Settings > Database > Connection Pooling)
- Ensure your database password is correct

**Error: "Invalid API key" (Stripe)**
- Make sure you're using the correct key for your environment (test vs live)
- Check that the key hasn't been deleted or revoked

### MCP Not Appearing in Cursor

1. Check Cursor version (needs v0.40+ for MCP support)
2. Verify `settings.json` syntax (use a JSON validator)
3. Check Cursor's output logs:
   - Windows: `%APPDATA%\Cursor\logs`
   - Mac: `~/Library/Logs/Cursor`

### Node.js Not Found

If you get "node: command not found":
1. Install Node.js from https://nodejs.org/ (LTS version)
2. Restart Cursor
3. Verify installation: Open terminal and run `node --version`

---

## Security Best Practices

### ⚠️ NEVER commit API keys to Git!

1. **Keep keys in settings.json only** - This file is not tracked by Git
2. **Use environment variables** for production deployments
3. **Rotate keys regularly** (every 3-6 months)
4. **Use test keys** for development
5. **Revoke unused keys** immediately

### Recommended: Use .env File (Alternative)

If you prefer, you can store keys in `.env.local`:

```bash
# Database
SUPABASE_CONNECTION_STRING="postgresql://..."

# APIs
STRIPE_SECRET_KEY="sk_test_..."
RESEND_API_KEY="re_..."
```

Then reference them in settings.json:
```json
{
  "env": {
    "STRIPE_SECRET_KEY": "${env:STRIPE_SECRET_KEY}"
  }
}
```

---

## What Can You Do With MCP?

### Real-Time Debugging
- "Show me the last order that failed in the database"
- "What error did customer X encounter?"

### Data Analysis
- "How many tickets were sold this week?"
- "What's our conversion rate from checkout to completed orders?"

### Testing & Verification
- "Did the webhook create an order for checkout session cs_test_abc123?"
- "Show me all passes that expire next month"

### Customer Support
- "Find all orders for email michel.adedokun@outlook.com"
- "Show me the enrollment status for user X"

### Monitoring
- "Are there any failed Stripe payments in the last 24 hours?"
- "What emails bounced today?"

---

## Next Steps

1. ✅ Set up MCP servers (you've completed this!)
2. 🔜 Test each connection
3. 🔜 Start using AI-powered database queries
4. 🔜 Monitor your app in real-time through Cursor

**Ready to test?** Just ask me something like:
- "Show me the database schema"
- "List my Stripe customers"
- "What emails were sent today?"

And I'll query your actual data directly! 🚀






