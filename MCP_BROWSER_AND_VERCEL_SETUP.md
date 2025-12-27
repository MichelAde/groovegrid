# 🚀 BROWSER & VERCEL MCP SETUP GUIDE

## 1. Browser MCP Server (Already Available!)

The browser MCP server is **built into Cursor** - you don't need to install anything!

### How to Use Browser MCP:

#### A. Start Debugging Your Site
```
"Navigate to https://groovegrid-seven.vercel.app"
"Take a snapshot of the current page"
```

#### B. Test User Flows
```
"Navigate to the events page"
"Click on the first event"
"Check for console errors"
"Take a screenshot"
```

#### C. Debug Checkout Issues
```
"Navigate to https://groovegrid-seven.vercel.app/passes"
"Click the 'Purchase Pass' button for Monthly All-Access"
"Monitor network requests"
"Check for console errors"
```

#### D. Verify Purchase Flow
```
"Navigate to the portal tickets page"
"Snapshot the page to see if tickets appear"
"Check console for any errors"
```

### Available Browser Commands:
- `browser_navigate` - Go to a URL
- `browser_snapshot` - Get page structure and content
- `browser_click` - Click elements
- `browser_type` - Fill in forms
- `browser_console_messages` - View all console logs/errors
- `browser_network_requests` - See all API calls
- `browser_take_screenshot` - Capture visual state
- `browser_wait_for` - Wait for elements or conditions

---

## 2. Vercel MCP Server

Unfortunately, there's **no official Vercel MCP server** yet. However, I can query Vercel logs and deployments using the **Vercel API** through terminal commands in our sessions.

### Alternative: Vercel CLI Integration

Instead of a dedicated MCP, I can help you with:

#### Check Deployment Status
```bash
vercel ls --prod
```

#### View Recent Logs
```bash
vercel logs groovegrid-seven --since 1h
```

#### Check Environment Variables
```bash
vercel env ls
```

### What I CAN Do for Vercel Monitoring:

**During our sessions**, just ask me:
1. "Check the latest Vercel deployment"
2. "Show me recent Vercel logs"
3. "What errors are in Vercel?"
4. "Check if the webhook is working in Vercel"

And I'll run the appropriate commands and analyze the output!

---

## 3. Custom Logging MCP (Optional)

If you want real-time Vercel monitoring, we can create a **custom logging MCP** that:
- Tails Vercel logs
- Filters for errors
- Monitors webhook execution
- Tracks performance

### Would you like me to create this?

Let me know and I can build a custom MCP server that:
1. Uses Vercel API to fetch logs
2. Streams them in real-time
3. Highlights errors and warnings
4. Filters by function (webhook, API routes, etc.)

---

## 🎯 Your Complete MCP Setup

### Currently Working:
✅ **PostgreSQL** - Direct database queries  
✅ **Stripe** - Payment data and transactions  
✅ **Resend** - Email delivery monitoring  
✅ **Browser** (built-in) - Web app debugging  

### Available on Request:
⏳ **Custom Vercel Logger** - Real-time deployment logs  
⏳ **Custom Analytics** - Usage tracking and metrics  

---

## 📝 How to Use MCP Effectively

### For Debugging Issues:

**1. Check Database First**
```
"Show me the most recent 5 orders"
"List all user_passes from the last hour"
"Query tickets table for order ID xyz"
```

**2. Verify Stripe Payments**
```
"Show recent Stripe checkout sessions"
"Get details for checkout session cs_test_..."
"Check Stripe customer info for michel.adedokun@outlook.com"
```

**3. Monitor Emails**
```
"List emails sent in the last 24 hours"
"Show email delivery status for michel.adedokun@outlook.com"
"Get details for email ID xyz"
```

**4. Debug Website Issues**
```
"Navigate to the checkout page"
"Snapshot the portal passes page"
"Check console errors on the events page"
"Monitor network requests during ticket purchase"
```

### For Development:

**Schema Changes**
```
"Show me the structure of the orders table"
"List all indexes on user_passes"
"Check RLS policies for enrollments table"
```

**Data Verification**
```
"Count total orders by status"
"Show pass types with zero purchases"
"List events with tickets sold"
```

**Security Audits**
```
"Show all RLS policies"
"List tables without RLS enabled"
"Check for orders without buyer_email"
```

---

## 🚀 Quick Test Commands

Try these now to verify your MCP setup:

### Test 1: Database
```
"Show me all tables in my database"
```

### Test 2: Stripe
```
"List my Stripe checkout sessions from today"
```

### Test 3: Resend
```
"Show recent emails sent through Resend"
```

### Test 4: Browser (most useful!)
```
"Navigate to https://groovegrid-seven.vercel.app and snapshot the homepage"
```

---

## 🔍 Browser MCP Is Your Best Debugging Tool!

The browser MCP can:
- ✅ Catch JavaScript errors in real-time
- ✅ Monitor network requests (see if API calls fail)
- ✅ Verify UI state (did the ticket appear?)
- ✅ Test user flows (can users complete checkout?)
- ✅ Screenshot issues (visual proof of bugs)
- ✅ Inspect DOM (find missing elements)

**This replaces opening Chrome DevTools manually!**

---

## 💡 Example Debugging Session

Let's say a user reports "tickets not appearing after purchase":

```
Me: "Navigate to the portal tickets page and snapshot it"
[Browser loads and shows empty state]

Me: "Check console messages"
[Shows error: "Failed to fetch tickets"]

Me: "Monitor network requests"
[Shows 400 error on /rest/v1/tickets]

Me: "Show me the tickets table schema"
[Database query reveals missing column]

Fixed!
```

All of this happens **without leaving Cursor**! 🎉

---

## 📊 Real-World Debugging Examples

### Example 1: Purchase Not Showing in Portal

**Symptoms**: User completes checkout but sees nothing in "My Tickets"

**Debug Process**:
```
Step 1: "Navigate to the portal tickets page"
Step 2: "Check console messages" → See API error
Step 3: "Show network requests" → API returns 400
Step 4: "Query orders table for buyer email" → Order exists
Step 5: "Query tickets table" → Tickets missing!
Step 6: "Check Vercel logs for webhook errors" → RLS violation found
```

**Solution**: Webhook couldn't insert due to RLS policy

---

### Example 2: Checkout Button Not Working

**Symptoms**: Nothing happens when clicking "Purchase"

**Debug Process**:
```
Step 1: "Navigate to the passes page"
Step 2: "Snapshot the page" → Button visible
Step 3: "Click the purchase button for Monthly Pass"
Step 4: "Check console messages" → JavaScript error found
Step 5: "Show network requests" → POST to /api/checkout failed
```

**Solution**: Missing environment variable in API route

---

### Example 3: Email Not Sending

**Symptoms**: Purchase complete but no confirmation email

**Debug Process**:
```
Step 1: "List recent Resend emails"
Step 2: "Get email details for order ID xyz"
Step 3: "Check Vercel logs for Resend errors"
Step 4: "Verify RESEND_API_KEY in environment"
```

**Solution**: API key expired or invalid

---

## 🛠️ Advanced Browser MCP Techniques

### Testing Login Flow
```
"Navigate to the login page"
"Type 'test@example.com' into the email field"
"Type 'password123' into the password field"
"Click the login button"
"Wait for redirect"
"Snapshot the page to verify logged in"
```

### Testing Checkout Flow
```
"Navigate to the events page"
"Click on the first event"
"Click 'Buy Tickets'"
"Select quantity 2"
"Click 'Proceed to Checkout'"
"Monitor network requests"
"Check for any console errors"
```

### Verifying Responsive Design
```
"Resize browser to 375x667" (mobile)
"Navigate to homepage"
"Take a screenshot"
"Resize browser to 1920x1080" (desktop)
"Navigate to homepage"
"Take a screenshot"
```

---

## 🔧 Vercel Monitoring Without MCP

### Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project "groovegrid-seven"
3. Click "Deployments" to see status
4. Click "Functions" to see logs
5. Filter by time range and severity

### Using Vercel CLI (I can run these for you)
```bash
# Recent logs
vercel logs groovegrid-seven --since 1h

# Webhook function logs
vercel logs groovegrid-seven --since 1h | grep webhook

# Error logs only
vercel logs groovegrid-seven --since 1h | grep ERROR

# Specific function
vercel logs groovegrid-seven --since 1h --function api/webhooks/stripe
```

### Real-Time Monitoring (Manual)
```bash
# Tail logs (requires Vercel CLI installed)
vercel logs groovegrid-seven --follow
```

---

## 📈 Performance Monitoring

### Using Browser MCP
```
"Navigate to the events page"
"Measure page load time"
"Check network waterfall"
"Identify slow requests"
```

### Using Vercel Analytics
- Go to Vercel Dashboard → Analytics
- View Core Web Vitals
- Check page load times
- Monitor error rates

---

## 🎓 Best Practices

### For Browser MCP:
1. **Always snapshot first** - Understand page state
2. **Check console early** - Catch JS errors immediately
3. **Monitor network requests** - See API failures
4. **Take screenshots** - Visual evidence of issues
5. **Test user flows** - Verify complete journeys

### For Vercel Monitoring:
1. **Check logs after each deployment**
2. **Monitor webhook execution** - Critical for purchases
3. **Set up error alerts** - Get notified immediately
4. **Review slow functions** - Optimize performance
5. **Check environment variables** - Ensure correct config

---

## 🚨 Common Issues & Solutions

### Issue: Browser can't find element
**Solution**: 
```
"Snapshot the page first"
"List all clickable elements"
"Find element by text 'Purchase'"
```

### Issue: Network request timing out
**Solution**:
```
"Wait for 5 seconds"
"Check network requests"
"Look for pending requests"
```

### Issue: Can't see console errors
**Solution**:
```
"Get all console messages"
"Filter for errors only"
"Show full error stack trace"
```

---

## 🎯 Integration with Other MCPs

### Combine Browser + Database:
```
1. "Navigate to portal and check user email"
2. "Query orders for that email address"
3. "Compare what's in DB vs what's shown"
```

### Combine Browser + Stripe:
```
1. "Get latest Stripe checkout session"
2. "Navigate to checkout success page"
3. "Verify order ID matches Stripe session"
```

### Combine Browser + Resend:
```
1. "List recent Resend emails"
2. "Navigate to email template preview"
3. "Screenshot and compare rendering"
```

---

## 📚 Quick Reference Card

| Task | Command |
|------|---------|
| **Load page** | "Navigate to [URL]" |
| **See page structure** | "Snapshot the page" |
| **Check errors** | "Check console messages" |
| **See API calls** | "Show network requests" |
| **Click element** | "Click the [description]" |
| **Fill form** | "Type [text] into [field]" |
| **Take picture** | "Take a screenshot" |
| **Wait** | "Wait for [text/time]" |
| **Go back** | "Navigate back" |
| **Resize** | "Resize to [width]x[height]" |

---

## 💼 Production Monitoring Strategy

### Daily Checks (5 minutes):
1. "Show Vercel deployment status"
2. "Check error rate in logs"
3. "List failed Resend emails"
4. "Query orders with status 'failed'"

### Weekly Reviews (30 minutes):
1. Review all Vercel error logs
2. Test critical user flows with Browser MCP
3. Verify RLS policies with database queries
4. Check Stripe for refunds/disputes
5. Analyze slow API endpoints

### After Each Deployment (10 minutes):
1. Verify deployment succeeded
2. Test checkout flow with Browser MCP
3. Make test purchase
4. Verify webhook processed correctly
5. Check all portal pages load

---

## 🎉 You're Ready!

**Your MCP Toolkit:**
- ✅ PostgreSQL for database queries
- ✅ Stripe for payment data
- ✅ Resend for email monitoring
- ✅ Browser for live debugging
- ✅ Vercel via CLI commands

**Next Steps:**
1. Test each MCP with the quick commands above
2. Try debugging a real issue with Browser MCP
3. Set up Vercel CLI for log access
4. Consider building custom Vercel MCP if needed

**Remember**: Browser MCP is your most powerful tool for debugging user-facing issues!

---

**Ready to debug? Just ask me to navigate to your site and let's find some bugs! 🐛🔍**

