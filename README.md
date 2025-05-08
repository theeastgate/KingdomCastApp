# KingdomCast

Church social media management platform built with React, Supabase, and Vite.

## Development

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your environment variables
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Git Setup

1. Initialize Git repository:
```bash
git init
```

2. Add remote repository:
```bash
git remote add origin <https://github.com/theeastgate/KingdomCast>
```

3. Stage and commit files:
```bash
git add .
git commit -m "Initial commit"
```

4. Push to GitHub:
```bash
git push -u origin main
```

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains all necessary build and redirect configurations.

### Environment Variables

Make sure to set the following environment variables in your Netlify dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FACEBOOK_APP_ID`
- `VITE_YOUTUBE_CLIENT_ID`