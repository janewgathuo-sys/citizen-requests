# Citizen Service Request System

A small web app where citizens report problems like broken streetlights, water issues and garbage collection, and an admin tracks them until they are resolved.

Live site: https://citizen-requests.vercel.app

## Features

- Citizen register and login
- Submit a request (category, location, description, optional image)
- Citizens see their own requests and status
- Admin dashboard with filters by status and category
- Status tracking: Pending, In Progress, Resolved
- Basic analytics: total, open, in progress and resolved

## Admin login

- Email: admin@citizenrequests.com
- Password: Admin12345

## Tools

Next.js, Tailwind CSS, Supabase, Vercel

## Run locally

1. Run `npm install`
2. Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `npm run dev`
4. Open http://localhost:3000