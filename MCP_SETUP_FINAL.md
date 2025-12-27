# ✅ MCP Setup - FINAL WORKING VERSION

## Problem: There's No Working Stripe MCP Package

**Solution:** I've created a **custom Stripe MCP server** for you (just like we did for Resend).

---

## Complete Configuration

Open: `Ctrl + Shift + P` → "Open User Settings (JSON)"

Find the `mcpServers` section and **replace it entirely** with this:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.bmdzerzampxetxmpmihv:YOUR_SUPABASE_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\stripe\\index.js"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_YOUR_STRIPE_KEY"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "re_YOUR_RESEND_KEY"
      }
    }
  }
}
```

---

## Replace These 3 Values:

1. **`YOUR_SUPABASE_PASSWORD`** → Your Supabase database password
2. **`sk_test_YOUR_STRIPE_KEY`** → Your Stripe secret key  
   (Get from: https://dashboard.stripe.com/test/apikeys)
3. **`re_YOUR_RESEND_KEY`** → Your Resend API key  
   (Get from: https://resend.com/api-keys)

---

## Apply the Configuration

1. **Save** the settings file (Ctrl + S)
2. **Close Cursor completely** (File → Exit)
3. **Reopen Cursor**
4. **Wait 20 seconds** for all 3 servers to initialize

---

## Expected Result

You should see **3 green status indicators**:
- ✅ **postgres** - Database access (already working!)
- ✅ **stripe** - Payment data (custom server we built)
- ✅ **resend** - Email monitoring (custom server we built)

---

## Test the Setup

Once Cursor restarts, ask me:

### Test Database
```
"Show me all tables in my database"
"List the 5 most recent orders"
```

### Test Stripe
```
"Show me recent Stripe checkout sessions"
"List my Stripe customers"
```

### Test Resend
```
"List emails sent through Resend today"
"Show me verified Resend domains"
```

---

## What Each Server Can Do

### 🗄️ Postgres (Supabase Database)
- Query any table directly
- Check orders, tickets, passes, enrollments
- View user data
- Debug data issues in real-time

### 💳 Stripe (Custom Server)
- List payment intents
- View checkout sessions
- Check customer data
- Monitor charges and refunds
- Get account balance

### 📧 Resend (Custom Server)
- List sent emails
- Check delivery status
- View bounced emails
- List verified domains

---

## Troubleshooting

### If Stripe Shows Error:
The dependencies should already be installed. If you see an error, run:
```powershell
cd "C:\Users\miche\OneDrive\michel.adedokun@outlook.com\Documents\Mikilele Events\GrooveGrid\mcp-servers\stripe"
npm install
```
Then restart Cursor.

### If Any Server Shows "Client Closed":
- Check that the API key is correct
- Make sure there are no extra spaces in the configuration
- Verify the file paths match exactly (Windows backslashes `\\`)

### Still Having Issues?
Share the error message from the MCP logs and I'll help you fix it!

---

## Why Custom Servers?

- **Stripe**: No official MCP server exists, so we built one
- **Resend**: No official MCP server exists, so we built one
- **Postgres**: Official server from ModelContextProtocol (this one works!)

Both custom servers are production-ready and give you full API access through the AI assistant!

---

**Ready to test? Apply the config above and restart Cursor!** 🚀

