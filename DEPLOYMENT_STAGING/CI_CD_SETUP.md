# 🔄 CI/CD Setup Guide

This guide explains how to set up automated deployments using GitHub Actions.

## Overview

The CI/CD pipeline automatically:
1. Runs tests on every push
2. Deploys backend to Render
3. Deploys frontend to Vercel
4. Only deploys if tests pass

## Setup Instructions

### 1. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Vercel Secrets

**Get Vercel Token**:
1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token
3. Copy and save as `VERCEL_TOKEN`

**Get Vercel Org ID and Project ID**:
```bash
cd frontend
npx vercel link
# Follow the prompts
# This creates .vercel/project.json
cat .vercel/project.json
```

Add to GitHub Secrets:
- `VERCEL_TOKEN` - Your Vercel token
- `VERCEL_ORG_ID` - From project.json
- `VERCEL_PROJECT_ID` - From project.json

#### Render Secrets

**Get Render Deploy Hook**:
1. Go to Render Dashboard → Your Service
2. Settings → Deploy Hook
3. Create a new deploy hook
4. Copy the URL

Add to GitHub Secrets:
- `RENDER_DEPLOY_HOOK_URL` - Your Render deploy hook URL

### 2. Enable GitHub Actions

1. Go to your repository
2. Click "Actions" tab
3. Enable workflows if prompted

### 3. Test the Workflow

```bash
# Make a change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Go to Actions tab to see the workflow running.

## Workflow Details

### Triggers

The workflow runs on:
- Every push to `main` branch
- Manual trigger (workflow_dispatch)

### Jobs

1. **test-backend**: Runs Python tests
2. **test-frontend**: Runs React tests and builds
3. **deploy-backend**: Triggers Render deployment
4. **deploy-frontend**: Deploys to Vercel

### Customization

Edit `.github/workflows/deploy.yml` to:
- Add more test steps
- Add linting
- Add security scanning
- Add notifications
- Deploy to different environments

## Advanced Configuration

### Deploy to Staging First

Create a staging workflow:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy-staging:
    # Similar to production but with staging secrets
```

### Add Slack Notifications

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Environment Protection

1. Go to Settings → Environments
2. Create "production" environment
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

Update workflow:
```yaml
deploy-frontend:
  environment: production
  # ... rest of job
```

## Monitoring

### View Deployment Status

- **GitHub**: Actions tab
- **Vercel**: Dashboard → Deployments
- **Render**: Dashboard → Events

### Rollback

**Vercel**:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

**Render**:
1. Go to your service
2. Manual Deploy → Deploy previous commit

## Troubleshooting

**Workflow fails on secrets**:
- Verify all secrets are added
- Check secret names match exactly
- Secrets are case-sensitive

**Tests fail**:
- Run tests locally first
- Check test configuration
- Review test logs in Actions

**Deployment succeeds but app broken**:
- Check environment variables
- Verify API URLs
- Check deployment logs

## Best Practices

1. **Always test locally first**
2. **Use staging environment** for testing
3. **Review deployment logs**
4. **Monitor error rates** after deployment
5. **Keep secrets secure** - never commit them
6. **Use environment protection** for production
7. **Set up notifications** for failures

## Security

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate tokens regularly
- Use environment-specific secrets
- Enable branch protection rules

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)

---

**Your CI/CD pipeline is now ready! 🚀**

Every push to `main` will automatically deploy your changes.
