#!/bin/bash

echo "🚀 Vercel Deployment Validation"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "error" ]; then
        echo -e "${RED}❌ $1${NC}"
    elif [ "$2" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    else
        echo -e "${BLUE}📋 $1${NC}"
    fi
}

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js $NODE_VERSION installed" "success"
else
    print_status "Node.js not found" "error"
    exit 1
fi

# Check if package.json exists and has required scripts
if [ -f "package.json" ]; then
    print_status "package.json exists" "success"
    
    # Check for required scripts
    if grep -q '"build"' package.json; then
        print_status "Build script found" "success"
    else
        print_status "Build script missing" "error"
    fi
    
    if grep -q '"vercel-build"' package.json; then
        print_status "Vercel build script found" "success"
    else
        print_status "Vercel build script missing" "warning"
    fi
else
    print_status "package.json not found" "error"
    exit 1
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    print_status "vercel.json configuration file exists" "success"
else
    print_status "vercel.json missing" "error"
fi

# Check app.js modifications for Vercel compatibility
if [ -f "app.js" ]; then
    print_status "app.js exists" "success"
    
    # Check if module.exports is present
    if grep -q "module.exports = app" app.js; then
        print_status "app.js exports module for Vercel" "success"
    else
        print_status "app.js missing module.exports" "error"
    fi
    
    # Check if conditional listen is present
    if grep -q "NODE_ENV !== 'production'" app.js; then
        print_status "Conditional server listen configured" "success"
    else
        print_status "Conditional server listen missing" "warning"
    fi
else
    print_status "app.js not found" "error"
fi

# Check environment variables setup
if [ -f ".env" ]; then
    print_status ".env file exists" "success"
    
    # Check for required Firebase variables
    REQUIRED_VARS=("FIREBASE_PROJECT_ID" "FIREBASE_PRIVATE_KEY" "FIREBASE_CLIENT_EMAIL")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" .env; then
            print_status "$var configured" "success"
        else
            print_status "$var missing from .env" "error"
        fi
    done
else
    print_status ".env file not found" "warning"
fi

# Check if .env.vercel template exists
if [ -f ".env.vercel" ]; then
    print_status "Vercel environment template exists" "success"
else
    print_status "Vercel environment template missing" "warning"
fi

# Check public directory structure
if [ -d "public" ]; then
    print_status "Public directory exists" "success"
    
    if [ -d "public/files" ]; then
        FILE_COUNT=$(find public/files -type f | wc -l)
        print_status "Challenge files directory exists ($FILE_COUNT files)" "success"
    else
        print_status "Public/files directory missing" "warning"
    fi
    
    if [ -d "public/styles" ]; then
        print_status "Styles directory exists" "success"
    else
        print_status "Public/styles directory missing" "warning"
    fi
else
    print_status "Public directory missing" "error"
fi

# Check views directory
if [ -d "views" ]; then
    print_status "Views directory exists" "success"
    
    EJS_COUNT=$(find views -name "*.ejs" | wc -l)
    print_status "EJS templates found ($EJS_COUNT files)" "success"
    
    if [ -d "views/partials" ]; then
        print_status "Partials directory exists" "success"
    else
        print_status "Views/partials directory missing" "warning"
    fi
else
    print_status "Views directory missing" "error"
fi

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    print_status "Dependencies installed" "success"
else
    print_status "Dependencies not installed - run 'npm install'" "warning"
fi

# Check git status
if [ -d ".git" ]; then
    print_status "Git repository initialized" "success"
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD --; then
        print_status "Working directory clean" "success"
    else
        print_status "Uncommitted changes present" "warning"
    fi
else
    print_status "Not a git repository" "warning"
fi

# Test local application
echo ""
echo "🧪 Testing Local Application"
echo "============================"

# Check if app is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status "Application responding on localhost:3000" "success"
    
    # Test key endpoints
    ENDPOINTS=("/" "/login" "/register" "/leaderboard" "/robots.txt")
    for endpoint in "${ENDPOINTS[@]}"; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
        if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
            print_status "Endpoint $endpoint: HTTP $STATUS" "success"
        else
            print_status "Endpoint $endpoint: HTTP $STATUS" "error"
        fi
    done
else
    print_status "Application not running locally" "warning"
    print_status "Start with: npm start" "info"
fi

echo ""
echo "📦 Vercel Deployment Readiness"
echo "==============================="

# Calculate readiness score
CHECKS_TOTAL=20
CHECKS_PASSED=0

# Count successful checks
if [ -f "vercel.json" ]; then ((CHECKS_PASSED++)); fi
if [ -f "package.json" ] && grep -q '"build"' package.json; then ((CHECKS_PASSED++)); fi
if [ -f "package.json" ] && grep -q '"vercel-build"' package.json; then ((CHECKS_PASSED++)); fi
if [ -f "app.js" ] && grep -q "module.exports = app" app.js; then ((CHECKS_PASSED++)); fi
if [ -f "app.js" ] && grep -q "NODE_ENV !== 'production'" app.js; then ((CHECKS_PASSED++)); fi
if [ -f ".env" ]; then ((CHECKS_PASSED++)); fi
if [ -f ".env" ] && grep -q "FIREBASE_PROJECT_ID" .env; then ((CHECKS_PASSED++)); fi
if [ -f ".env" ] && grep -q "FIREBASE_PRIVATE_KEY" .env; then ((CHECKS_PASSED++)); fi
if [ -f ".env" ] && grep -q "FIREBASE_CLIENT_EMAIL" .env; then ((CHECKS_PASSED++)); fi
if [ -f ".env.vercel" ]; then ((CHECKS_PASSED++)); fi
if [ -d "public" ]; then ((CHECKS_PASSED++)); fi
if [ -d "public/files" ]; then ((CHECKS_PASSED++)); fi
if [ -d "public/styles" ]; then ((CHECKS_PASSED++)); fi
if [ -d "views" ]; then ((CHECKS_PASSED++)); fi
if [ -d "views/partials" ]; then ((CHECKS_PASSED++)); fi
if [ -d "node_modules" ]; then ((CHECKS_PASSED++)); fi
if [ -d ".git" ]; then ((CHECKS_PASSED++)); fi
if curl -s http://localhost:3000 > /dev/null 2>&1; then ((CHECKS_PASSED++)); fi
if [ -f "VERCEL_DEPLOYMENT.md" ]; then ((CHECKS_PASSED++)); fi
if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then ((CHECKS_PASSED++)); fi

READINESS_PERCENTAGE=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

echo ""
if [ $READINESS_PERCENTAGE -ge 80 ]; then
    print_status "Deployment Readiness: $READINESS_PERCENTAGE% - READY TO DEPLOY! 🚀" "success"
elif [ $READINESS_PERCENTAGE -ge 60 ]; then
    print_status "Deployment Readiness: $READINESS_PERCENTAGE% - Almost ready" "warning"
else
    print_status "Deployment Readiness: $READINESS_PERCENTAGE% - Needs work" "error"
fi

echo ""
echo "📋 Next Steps for Vercel Deployment:"
echo "1. Commit all changes: git add . && git commit -m 'Prepare for Vercel'"
echo "2. Push to GitHub: git push origin main"
echo "3. Import repository to Vercel: https://vercel.com/new"
echo "4. Configure environment variables in Vercel dashboard"
echo "5. Deploy and test!"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
