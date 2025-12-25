# Clean Next.js build and restart dev server
# Run this if npm run dev hangs or doesn't show "Ready"

Write-Host "🧹 Cleaning Next.js build cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No .next directory found" -ForegroundColor Cyan
}

# Remove node_modules/.cache
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Green
Write-Host ""

# Start dev server
npm run dev

