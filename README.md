# Smart Bookmark App

This is a simple bookmark manager built using Next.js, Supabase, and Tailwind CSS.  
Users can log in with Google, add bookmarks, delete them, and see updates in real time.

## Live Demo

https://bookmark-manager-aastha.vercel.app/

## GitHub Repo

https://github.com/Aastharao1610/bookmarkmanager

---

## Tech Stack

- Next.js (App Router)
- Supabase (Authentication, Database, Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## Features

- Google OAuth login (no email/password)
- Add bookmark (title + URL)
- Delete bookmark
- Bookmarks are private per user
- Real-time updates across tabs
- Search bookmarks
- Favicon preview for bookmarks
- Duplicate bookmark prevention
- Responsive design

---

## How it works

After logging in with Google, each user can manage their own bookmarks.  
Bookmarks are stored in Supabase and linked to the logged-in user's ID.

Supabase Row Level Security ensures users can only access their own bookmarks.

Realtime subscriptions are used so that changes appear instantly without refreshing the page.

---

## Database Structure

Table: `bookmarks`

Columns:

- id (uuid, primary key)
- title (text)
- url (text)
- user_id (uuid)
- created_at (timestamp)

Row Level Security is enabled to protect user data.

---

## Challenges I faced and how I solved them

### 1. Authentication redirect and middleware issue

After implementing Google login, the user was not redirecting properly to the dashboard. The problem was related to handling the auth callback and cookies correctly in Next.js App Router.

I solved this by creating a proper `/auth/callback` route and using:


This allowed Supabase to correctly create the session and redirect the user.

---

### 2. Realtime updates were not working initially

When I added a bookmark in one tab, it was not appearing in another tab.

I fixed this by using Supabase realtime subscriptions:


and filtering updates using the logged-in user's ID.

I also handled cleanup to prevent duplicate subscriptions.

After this, updates started working instantly across tabs.

---


## What I focused on while building this

My main focus was:

- Correct authentication flow
- Keeping bookmarks private per user
- Implementing real-time updates properly
- Writing clean and maintainable code
- Creating a simple and clean UI
- Proper deployment setup

---

## Future Improvements

Some improvements that could be added:

- Folder/category support
- Edit bookmark feature
- Drag and drop organization
- Better mobile UI improvements

---

## Author

Aastha Rao


