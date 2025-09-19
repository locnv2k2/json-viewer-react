#!/bin/bash

# Setup CI/CD Secrets Helper Script
# Hướng dẫn thiết lập secrets cho GitHub Actions

echo "🚀 CI/CD Secrets Setup Helper"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it first: https://cli.github.com/"
    echo "Or manually add secrets via GitHub web interface"
    exit 1
fi

# Check if user is logged in to gh
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to GitHub CLI first${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is ready${NC}"
echo ""

# Function to add secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    
    echo -e "${BLUE}📝 Setting up: $secret_name${NC}"
    echo "Description: $secret_description"
    echo ""
    
    read -p "Enter value for $secret_name (input will be hidden): " -s secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        if gh secret set "$secret_name" --body "$secret_value"; then
            echo -e "${GREEN}✅ $secret_name added successfully${NC}"
        else
            echo -e "${RED}❌ Failed to add $secret_name${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Skipped $secret_name (empty value)${NC}"
    fi
    echo ""
}

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${BLUE}📦 Repository: $REPO${NC}"
echo ""

# Setup Vercel secrets
echo -e "${YELLOW}🔧 VERCEL CONFIGURATION${NC}"
echo "----------------------------------------"
echo "1. Go to https://vercel.com/account/tokens"
echo "2. Create a new token with appropriate scope"
echo "3. Get your project info by running: vercel link"
echo ""

add_secret "VERCEL_TOKEN" "Vercel API token for deployments"
add_secret "VERCEL_ORG_ID" "Vercel organization ID (from .vercel/project.json)"
add_secret "VERCEL_PROJECT_ID" "Vercel project ID (from .vercel/project.json)"

# Setup NPM secret
echo -e "${YELLOW}📦 NPM CONFIGURATION${NC}"
echo "----------------------------------------"
echo "1. Go to https://www.npmjs.com/settings/tokens"
echo "2. Create a new token with 'Automation' type"
echo "3. Make sure you have publish permissions for @rio2k2 scope"
echo ""

add_secret "NPM_TOKEN" "NPM automation token for publishing packages"

# Summary
echo -e "${GREEN}🎉 SETUP COMPLETE${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Verify secrets are added: gh secret list"
echo "2. Test the pipeline by pushing to main branch"
echo "3. Check GitHub Actions tab for workflow runs"
echo ""
echo "Useful commands:"
echo "• View secrets: gh secret list"
echo "• Delete secret: gh secret delete SECRET_NAME"
echo "• View workflows: gh workflow list"
echo ""
echo -e "${BLUE}📚 For detailed guide, see: CI_CD_SETUP.md${NC}"