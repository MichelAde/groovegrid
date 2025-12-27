# ✅ Fixed MCP Configuration

## Replace Your Entire `mcpServers` Section

Open: `%APPDATA%\Cursor\User\settings.json`

**Replace the entire `mcpServers` section with this:**

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.bmdzerzampxetxmpmihv:[YOUR_SUPABASE_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "@stripe/agent-toolkit",
        "mcp"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "[YOUR_STRIPE_SECRET_KEY]"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "[YOUR_RESEND_API_KEY]"
      }
    }
  }
}
```

## What Changed?

### ❌ Removed These (They Were Causing Errors)
- `supabase` - Wrong package name
- `filesystem` - Not needed
- Any other broken configs

### ✅ Kept These (Working Correctly)
- `postgres` - This is the correct way to access Supabase! (The one that shows "1 tools, 18 resources enabled")
- `stripe` - Fixed package name
- `resend` - Custom server (now restored)

## Replace These Values

1. **`[YOUR_SUPABASE_PASSWORD]`** - Your Supabase database password
2. **`[YOUR_STRIPE_SECRET_KEY]`** - Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
3. **`[YOUR_RESEND_API_KEY]`** - Your Resend API key (starts with `re_`)

## After Updating

1. **Save** the file (`Ctrl + S`)
2. **Close Cursor completely** (File → Exit)
3. **Reopen Cursor**
4. **Wait 10-15 seconds** for MCP to initialize

## Expected Result

You should see:
- ✅ **postgres** - Green dot (1 tools, 18 resources enabled)
- ✅ **stripe** - Green dot
- ✅ **resend** - Green dot

All red error dots should be gone!

## Quick Test

Once restarted, ask me:
```
"Show me the tables in my Supabase database"
```

This will use the `postgres` MCP server to query your database directly!

---

## Why This Works

- **Postgres MCP** = Direct Supabase access (what you already see working!)
- We removed the broken "supabase" server that was trying to use a non-existent package
- Fixed Stripe to use the correct package name
- Restored the Resend custom server

The postgres server IS your Supabase connection - it's perfect! 🎉


