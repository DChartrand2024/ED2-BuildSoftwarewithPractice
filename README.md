# Marquee — Movie Watchlist

A simple web app for tracking movies you want to watch and movies you've already seen. Sign up, add a movie, mark it watched, rate it out of 5 stars, search and filter your list — your list is private to your account.

**Live app:** buildsoftwarepractice.netlify.app
**Demo video:** https://youtu.be/8sn-AA2lF6g

## What it does

- Sign up and log in with email + password
- Add movies with a title, year, genre, and optional notes
- Mark a movie as "To watch" or "Watched"
- Rate watched movies from 1–5 stars
- Search by title and filter by status
- Remove movies from your list
- Each account only sees its own movies — data is scoped per-user using Supabase Row Level Security
- All data is stored in a Supabase database, so your list persists across visits and devices

## Technologies used

- HTML, CSS, and vanilla JavaScript (no framework, no build step)
- [Supabase](https://supabase.com) (Postgres database + Auth) for storage and login, accessed via the `@supabase/supabase-js` client
- [Netlify](https://netlify.com) for deployment

## Setup instructions

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier).
2. In the Supabase dashboard, open **SQL Editor** and run the contents of `supabase-setup.sql` from this repo. This creates the `movies` table.
3. Then run `supabase-add-auth.sql` in the same SQL Editor. This adds a `user_id` column and updates the security policies so each account only sees its own movies.
4. (Optional, for faster testing) In Supabase, go to **Authentication → Providers → Email** and turn off "Confirm email" so new accounts can log in immediately without clicking an email link. Leave it on if you want that extra verification step in your demo.
5. In Supabase, go to **Project Settings → API** and copy your **Project URL** and **anon/publishable key**.
6. Open `app.js` and replace the two placeholder values near the top:
   ```js
   const SUPABASE_URL = "YOUR_SUPABASE_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
   ```
7. Open `index.html` in a browser (or use a local server) to test it locally. Sign up with any email/password to create an account, then log in.

## Deploying

1. Push this repo to GitHub.
2. In [Netlify](https://netlify.com), choose **Add new site → Import an existing project**, connect your GitHub repo, and deploy. No build command is needed — this is a static site, so leave the build command blank and set the publish directory to the project root.
3. Once deployed, add your live Netlify link at the top of this README.

## Project structure

```
movie-watchlist/
├── index.html          # Page structure
├── style.css            # Styling
├── app.js                # App logic + Supabase calls + auth
├── supabase-setup.sql        # Initial database schema
├── supabase-add-auth.sql    # Adds per-user login + row security
└── README.md
```
