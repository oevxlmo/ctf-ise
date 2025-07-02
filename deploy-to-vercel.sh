#!/bin/bash

echo "🚀 Vercel Deployment Helper"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Verify readiness
print_step "Step 1: Verifying deployment readiness..."
if [ -f "verify-vercel-ready.sh" ]; then
    ./verify-vercel-ready.sh > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Deployment verification passed"
    else
        print_warning "Deployment verification had warnings"
    fi
else
    print_warning "Verification script not found"
fi

# Step 2: Environment variables helper
print_step "Step 2: Environment variables for Vercel..."
echo ""
echo "Copy these environment variables to your Vercel project:"
echo "========================================================"
echo ""

if [ -f ".env" ]; then
    echo "# Add these in Vercel Dashboard → Settings → Environment Variables"
    echo "NODE_ENV=production"
    echo ""
    
    # Extract and display Firebase variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^[A-Z] ]]; then
            # Remove quotes from value
            clean_value=$(echo "$value" | sed 's/^"//; s/"$//')
            echo "$key=$clean_value"
        fi
    done < .env
else
    print_warning ".env file not found"
fi

echo ""
echo "========================================================"
echo ""

# Step 3: Git operations
print_step "Step 3: Preparing Git repository..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_warning "Git not initialized. Initializing..."
    git init
    print_success "Git repository initialized"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    print_step "Adding all changes to git..."
    git add .
    
    echo "Enter commit message (or press Enter for default):"
    read -r commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Prepare CTF-ISE for Vercel deployment"
    fi
    
    git commit -m "$commit_message"
    print_success "Changes committed"
else
    print_success "Working directory is clean"
fi

# Check for remote repository
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote repository configured"
    echo "Please add your GitHub repository as remote:"
    echo "git remote add origin https://github.com/yourusername/ctf-ise.git"
    echo ""
else
    print_success "Remote repository configured"
    
    echo "Push to GitHub? (y/N):"
    read -r push_confirm
    
    if [[ $push_confirm =~ ^[Yy]$ ]]; then
        git push origin main
        print_success "Pushed to GitHub"
    fi
fi

# Step 4: Vercel deployment instructions
echo ""
print_step "Step 4: Vercel deployment instructions..."
echo ""
echo "🌐 Deploy to Vercel:"
echo "1. Go to: https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Configure project settings:"
echo "   - Framework Preset: Other"
echo "   - Build Command: npm run build"
echo "   - Output Directory: (leave empty)"
echo "   - Install Command: npm install"
echo ""
echo "4. Add environment variables (shown above)"
echo "5. Deploy!"
echo ""

# Step 5: Post-deployment setup
print_step "Step 5: Post-deployment setup..."
echo ""
echo "After deployment:"
echo "1. Test your live URL"
echo "2. Register a test user"
echo "3. Try solving challenges"
echo "4. Check leaderboard functionality"
echo ""
echo "If challenges collection is empty, run:"
echo "node setup-challenges-vercel.js"
echo ""

print_success "Deployment helper complete!"
print_step "For detailed instructions, see VERCEL_DEPLOYMENT.md"

echo ""
echo "🎉 Your CTF platform is ready for Vercel deployment!"
