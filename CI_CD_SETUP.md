# 🔄 CI/CD Setup Guide (Production)

This guide explains how to set up automated deployments to **Cloudflare Pages** (Frontend) and **Google Cloud Run** (Backend).

## Overview

The CI/CD pipeline automatically:
1. Builds the React frontend
2. Deploys it to Cloudflare Pages
3. Deploys the Python backend to Google Cloud Run (Pending Configuration)

## Setup Instructions

### 1. Cloudflare Pages (Frontend)

You need two secrets in GitHub for Cloudflare deployment:

#### A. Get Cloudflare API Token
*(You likely already did this)*
1. Go to **Cloudflare Dashboard** -> **My Profile** -> **API Tokens**.
2. Click **Create Token**.
3. Use the **"Edit Cloudflare Workers"** template (or creating a Custom Token with `Account.Cloudflare Pages:Edit`).
4. Copy the token.
5. Add to GitHub Secrets as: `CLOUDFLARE_API_TOKEN`.

#### B. Get Cloudflare Account ID
*(This is what you need now)*
1. Log in to the Cloudflare Dashboard.
2. Click on **Workers & Pages** in the sidebar.
3. Look for **Account ID** on the right side of the page (in the "Account details" section).
4. Copy the ID.
5. Add to GitHub Secrets as: `CLOUDFLARE_ACCOUNT_ID`.

### 2. Google Cloud Run (Backend)

*(To be configured later)*
- Requires `GCP_SA_KEY` (Service Account Key)
- Requires `MONGO_URL`

### 3. GitHub Secrets Configuration

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these:
- `CLOUDFLARE_API_TOKEN`: Your API Token.
- `CLOUDFLARE_ACCOUNT_ID`: Your Account ID.
- `REACT_APP_API_URL`: Your backend URL (e.g., `https://rihla-backend-xyz.a.run.app/api`).

## Workflow Details

The workflow file is located at `.github/workflows/deploy-production.yml`.

### Triggers
- Push to `main` branch.
- Manual trigger (`workflow_dispatch`).

### Jobs
1. **deploy-frontend**: Builds and deploys to Cloudflare Pages.
2. **deploy-backend**: Deploys to Cloud Run (Currently disabled).
