# 🎯 MCP QUICK START (Copy & Paste This)

## 📋 Configuration to Use

Open Cursor Settings JSON: `Ctrl + Shift + P` → "Open User Settings (JSON)"

**Paste this entire block into the `mcpServers` section:**

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

## 🔑 Replace These 3 Keys

1. `YOUR_SUPABASE_PASSWORD` → Your Supabase DB password
2. `sk_test_YOUR_STRIPE_KEY` → Get from https://dashboard.stripe.com/test/apikeys
3. `re_YOUR_RESEND_KEY` → Get from https://resend.com/api-keys

---

## ✅ Apply

1. Save (Ctrl + S)
2. Close Cursor completely
3. Reopen Cursor
4. Wait 20 seconds

---

## 🧪 Test

Ask me:
- `"Show me all database tables"`
- `"List recent Stripe checkout sessions"`
- `"Show emails sent through Resend"`

---

## ❌ Troubleshooting

**If Stripe shows error:** Dependencies already installed. If still failing, run:
```powershell
cd "C:\Users\miche\OneDrive\michel.adedokun@outlook.com\Documents\Mikilele Events\GrooveGrid\mcp-servers\stripe"
npm install
```

**If Resend shows error:** Dependencies already installed. Same command but replace `stripe` with `resend`.

---

## 📚 Full Details

See `MCP_SETUP_FINAL.md` for complete documentation.

---

**That's it! 3 servers, full access to Supabase, Stripe, and Resend through AI!** 🚀

