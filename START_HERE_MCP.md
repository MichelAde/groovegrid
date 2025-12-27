# 🚀 MCP Setup - 5 Minute Checklist

## ✅ What's Already Done

- ✅ Resend MCP Server created (`mcp-servers/resend/`)
- ✅ Dependencies installed (89 packages)
- ✅ Documentation ready
- ✅ Code committed to GitHub

---

## 📋 Your To-Do List (5 Minutes)

### [ ] Step 1: Get Your API Keys (2 minutes)

**Supabase Password:**
- Dashboard: https://supabase.com/dashboard/project/bmdzerzampxetxmpmihv/settings/database
- You need your database password (the one you set when creating the project)

**Stripe Secret Key:**
- Dashboard: https://dashboard.stripe.com/test/apikeys
- Copy the "Secret key" (starts with `sk_test_`)

**Resend API Key:**
- Dashboard: https://resend.com/api-keys
- Click "Create API Key"
- Copy it (starts with `re_`)

### [ ] Step 2: Update Cursor Settings (2 minutes)

1. Open Cursor
2. Press: `Ctrl + Shift + P`
3. Type: `Preferences: Open User Settings (JSON)`
4. Paste this configuration (replace the placeholders):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.bmdzerzampxetxmpmihv:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "stripe-mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_YOUR_KEY"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "re_YOUR_KEY"
      }
    }
  }
}
```

5. Save the file (`Ctrl + S`)

### [ ] Step 3: Restart Cursor (30 seconds)

1. Close Cursor completely (File → Exit)
2. Reopen Cursor
3. Wait 10-15 seconds for MCP servers to initialize

### [ ] Step 4: Test It! (30 seconds)

Open the chat and ask me:

```
"Show me the 5 most recent orders from the database"
```

If it works, you'll see real data from your Supabase database! 🎉

---

## 🎯 Quick Test Commands

Once setup is complete, try these:

**Database Queries:**
- "Show me all events happening next week"
- "How many users are registered?"
- "List tickets for event [event_name]"
- "Find orders by email michel.adedokun@outlook.com"

**Stripe Queries:**
- "Show me today's Stripe payments"
- "List failed payment attempts"
- "What's my Stripe balance?"

**Email Queries:**
- "List emails sent through Resend today"
- "Show me all verified domains"
- "What emails bounced this week?"

---

## ❓ Troubleshooting

### MCP Not Working?

**Check 1: Is Node.js installed?**
```powershell
node --version
```
Should show v18 or higher. If not, install from https://nodejs.org/

**Check 2: Are the settings correct?**
- Open settings.json again
- Check for typos in API keys
- Ensure no extra spaces or quotes
- Verify the file path for Resend MCP is correct

**Check 3: Restart again**
- Sometimes MCP needs a second restart
- Close Cursor completely
- Wait 5 seconds
- Reopen

**Still stuck?**
Come back and ask: "Help troubleshooting MCP setup"

---

## 🎉 What This Unlocks

### Before MCP:
You: "Can you check if the order was created?"
AI: "I can't access your database, but you can check Supabase..."

### After MCP:
You: "Can you check if the order was created?"
AI: *queries database directly* "Yes! Order #abc123 was created at 3:45 PM with 2 tickets for event 'Summer Festival'"

### Real Examples:

**Debugging:**
- "Show me all orders with status 'pending' from the last 24 hours"
- "Did the webhook create an order for checkout session cs_test_xyz?"
- "What errors occurred in the last 10 failed orders?"

**Customer Support:**
- "Find all tickets for michel.adedokun@outlook.com"
- "Show me the enrollment status for user X"
- "List all passes that expire next month"

**Business Intelligence:**
- "How many tickets were sold this week?"
- "What's our revenue from passes vs tickets this month?"
- "Which events have the most enrollments?"

**Monitoring:**
- "Are there any failed Stripe payments?"
- "Show me bounced emails from today"
- "List orders that didn't send confirmation emails"

---

## 📚 Documentation

- **Complete Guide**: `MCP_SETUP_GUIDE.md`
- **Quick Reference**: `MCP_QUICK_REFERENCE.md`
- **This Checklist**: `MCP_SETUP_COMPLETE.md`

---

## ✅ Checklist Summary

- [ ] Got Supabase password
- [ ] Got Stripe secret key
- [ ] Got Resend API key
- [ ] Updated Cursor settings.json
- [ ] Restarted Cursor
- [ ] Tested with a database query

**Time estimate: 5 minutes**

Once all checked, you're ready to use AI-powered direct database and API access! 🚀

---

**Questions?** Just ask me anything - I'm here to help!





