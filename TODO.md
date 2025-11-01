# TODO: Fix Static Site Deployment for Vercel

## 1. Clean Project Setup for Static Site
- [x] Remove server-related files (index.js, app.js) as they are not needed for static deployment
- [x] Simplify package.json to remove Node.js dependencies (express, dotenv, node-fetch)
- [x] Update vercel.json to configure for static site deployment instead of Node.js

## 2. Fix CSS/JS File Paths
- [x] Ensure all CSS and JS links use relative paths (e.g., "./style.css" or "css/styles.css")
- [x] Verify all referenced files exist in the correct locations
- [x] Update any incorrect paths found in HTML files

## 3. Verify Folder Structure
- [x] Confirm all static assets (CSS, JS, images) are in correct folders
- [x] Ensure public folder contains only static files (robots.txt, sitemap.xml)
- [x] Remove any unnecessary files for static deployment

## 4. Test and Deploy
- [x] Test locally that all CSS/JS load correctly (opened index.html, about.html, contact.html, movies.html, reviews.html)
- [ ] Deploy to Vercel and verify styling loads properly
- [x] Output final corrected folder structure, vercel.json, and package.json

## Summary of Changes Made:
- ✅ Removed server files (index.js, app.js)
- ✅ Removed Node.js dependencies from package.json (express, dotenv, node-fetch)
- ✅ Removed package-lock.json and node_modules
- ✅ Updated vercel.json to serve static files directly
- ✅ Verified all CSS/JS paths use relative paths (no changes needed)
- ✅ Confirmed folder structure is correct for static deployment
