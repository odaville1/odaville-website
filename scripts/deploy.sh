#!/bin/bash

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel@latest
fi

# Function to deploy to Vercel
deploy_to_vercel() {
    local project_type=$1
    local token=$2
    local org_id=$3
    local project_id=$4
    
    echo "Deploying $project_type..."
    
    # Pull environment information
    vercel pull --yes --environment=production --token=$token
    
    # Build and deploy
    if [ "$project_type" == "admin" ]; then
        cd frontend/admin
        npm install
        npm run build
        vercel deploy --prod --token=$token
        cd ../..
    else
        npm install
        npm run build
        vercel deploy --prod --token=$token
    fi
}

# Main deployment logic
if [ "$1" == "main" ]; then
    deploy_to_vercel "main website" $VERCEL_TOKEN $VERCEL_ORG_ID $VERCEL_PROJECT_ID
elif [ "$1" == "admin" ]; then
    deploy_to_vercel "admin panel" $VERCEL_ADMIN_TOKEN $VERCEL_ADMIN_ORG_ID $VERCEL_ADMIN_PROJECT_ID
else
    echo "Usage: ./deploy.sh [main|admin]"
    echo "Example: ./deploy.sh main"
    exit 1
fi 