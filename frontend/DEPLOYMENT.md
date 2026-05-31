# Vercel Deployment Guide for ReelOps Frontend

This guide covers how to deploy the ReelOps React/Vite frontend to Vercel.

## Pre-Requisites
Ensure your code is pushed to a GitHub, GitLab, or Bitbucket repository.

## 1. Import Project
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your Git repository.
4. If your project is in a monorepo or subdirectory, set the **Framework Preset** to `Vite` and the **Root Directory** to `frontend`.

## 2. Build Settings
Vercel should automatically detect Vite. Confirm the settings:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 3. Environment Variables
You must configure the following environment variables in Vercel before deploying. (Do not use `localhost` in production!)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | The production URL of your backend API. | `https://api.reelops.com/api/v1` |
| `VITE_SOCKET_URL` | The production root URL of your backend (for Socket.IO). | `https://api.reelops.com` |

## 4. Single Page Application (SPA) Routing
A `vercel.json` file is included in the repository. It ensures that React Router correctly handles direct links and page refreshes (e.g., navigating directly to `/channels/:channelId`) without returning a 404 error.

## 5. Deployment Check
Once deployed, verify the following routes work correctly by opening them directly in the browser:
- `https://your-domain.vercel.app/`
- `https://your-domain.vercel.app/login`
- `https://your-domain.vercel.app/signup`
- `https://your-domain.vercel.app/channels`
- `https://your-domain.vercel.app/channels/:channelId`
- `https://your-domain.vercel.app/channels/:channelId/chat`
- `https://your-domain.vercel.app/channels/:channelId/settings/platforms`
- `https://your-domain.vercel.app/channels/:channelId/automations`

If all pages load and refresh without 404 errors, your deployment is successful!
