# GitHub Pages Deployment Setup

## Overview
This guide will help you deploy the Universal Payslip Platform to GitHub Pages using GitHub Actions.

## Prerequisites
- GitHub repository with the code
- Supabase project with valid credentials

## Setup Steps

### 1. Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 2. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Save the settings

### 3. Deploy
1. Push your code to the `finalone` branch
2. The GitHub Action will automatically:
   - Install dependencies
   - Build the React app
   - Deploy to GitHub Pages

### 4. Access Your Site
Your site will be available at:
`https://tajking10.github.io/newexceltoweb/`

## Files Created/Modified

### Modified Files:
- `payslip-web/package.json` - Added homepage field for GitHub Pages

### New Files:
- `.github/workflows/pages.yml` - GitHub Actions workflow for deployment
- `DEPLOYMENT.md` - This deployment guide

## Important Notes

1. **Environment Variables**: Make sure to add your Supabase credentials as GitHub Secrets
2. **Branch**: The workflow triggers on pushes to the `finalone` branch
3. **Build Output**: Create React App builds to `build/` directory (not `dist/`)
4. **SPA Routing**: The workflow creates a 404.html fallback for client-side routing

## Troubleshooting

### Build Fails
- Check that all environment variables are set as GitHub Secrets
- Verify the Supabase credentials are correct
- Check the Actions tab for detailed error logs

### Site Not Loading
- Ensure GitHub Pages is set to use "GitHub Actions" as source
- Check that the homepage URL in package.json matches your repository name
- Verify the deployment completed successfully in the Actions tab

### Authentication Issues
- Make sure Supabase environment variables are correctly set
- Check that your Supabase project allows the GitHub Pages domain

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. Build locally:
   ```bash
   cd payslip-web
   npm run build
   ```

2. Deploy the `build/` folder contents to your web server

## Next Steps

After successful deployment:
1. Test all functionality on the live site
2. Update any hardcoded localhost URLs
3. Configure Supabase to allow your GitHub Pages domain
4. Set up custom domain (optional)