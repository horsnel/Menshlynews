---
Task ID: 1
Agent: Main Agent
Task: Integrate Resend API for all forms (newsletter, contact, services)

Work Log:
- Installed `resend` npm package
- Added `RESEND_API_KEY` to `.env`
- Created `/src/lib/email/index.ts` — shared email utility with Resend SDK containing:
  - `sendContactNotification()` — sends styled HTML email to admin when contact form is submitted
  - `sendServiceNotification()` — sends styled HTML email to admin when services form is submitted
  - `sendWelcomeEmail()` — sends welcome email to new newsletter subscribers
  - All emails use `Menshly Wire <onboarding@resend.dev>` as FROM address (can be updated when custom domain is verified)
  - All notification emails go to `hello@menshlynews.com`
- Created `/src/app/api/contact/route.ts` — Contact form API with Zod validation, rate limiting (3 req/min), and Resend email notification
- Created `/src/app/api/services/route.ts` — Service inquiry API with Zod validation, rate limiting (3 req/min), and Resend email notification
- Updated `/src/app/api/newsletter/route.ts` — Added `sendWelcomeEmail()` call (non-blocking) when a new subscriber is added, added 'about' as valid source
- Updated `/src/app/contact/page.tsx` — Replaced fake submit with real `fetch('/api/contact')`, added loading spinner and error message display
- Updated `/src/app/services/page.tsx` — Replaced fake submit with real `fetch('/api/services')`, added loading spinner and error message display
- Updated `/src/app/about/page.tsx` — Replaced fake newsletter submit with real `fetch('/api/newsletter')` with source 'about', added loading state

Stage Summary:
- All 4 forms now work with Resend API:
  1. Newsletter Popup → saves to DB + sends welcome email (already worked, now with welcome email)
  2. Contact Page → sends notification email to admin via Resend
  3. Services Page → sends notification email to admin via Resend
  4. About Page Newsletter → saves to DB + sends welcome email (was fake, now real)
- Build compiles successfully with no errors
- Resend API key: configured in .env

---
Task ID: 2
Agent: Main Agent
Task: Migrate article data source from static data.ts to database (Prisma/SQLite)

Work Log:
- Created `/src/lib/types.ts` — shared Post and Category type definitions (previously in data.ts)
- Created `/src/app/api/posts/route.ts` — API endpoint that queries all posts from SQLite via Prisma, transforms DB rows to match Post interface (tags string → array), and computes category counts dynamically
- Created `/src/lib/posts-provider.tsx` — React context provider (PostsProvider) that fetches posts from /api/posts on mount and provides them through usePosts() hook to all client components
- Updated `/src/app/page.tsx` — Wrapped in PostsProvider, replaced `import { posts } from data` with `usePosts()` hook, added loading spinner state
- Updated `/src/components/article-reader.tsx` — Replaced `import { Post, posts } from data` with `import { Post } from types` + `usePosts()`, MidArticleSuggestions and PrevNextNavigation now use context
- Updated `/src/components/header.tsx` — Replaced data.ts import with `usePosts()` for search functionality
- Updated `/src/components/hero-section.tsx` — Replaced data.ts import with `usePosts()` for featured post
- Updated `/src/components/hero-carousel.tsx` — Moved carouselPosts computation inside component, replaced data.ts import with `usePosts()`
- Updated `/src/components/news-ticker.tsx` — Replaced data.ts import with `usePosts()` for trending posts
- Updated `/src/components/sidebar.tsx` — Replaced `import { categories, posts } from data` with `usePosts()` for both posts and categories
- Updated `/src/components/compact-post-card.tsx` — Changed Post type import from data.ts to types.ts
- Updated `/src/components/article-card.tsx` — Changed Post type import from data.ts to types.ts
- Updated `/src/lib/store.ts` — Changed Post type import from data.ts to types.ts
- Fixed Resend SDK build error — Made Resend client lazy-initialized (getResend()) to avoid missing API key error at build time

Stage Summary:
- The app now reads articles from the database (Prisma/SQLite) instead of the static data.ts file
- Cron-generated articles will now appear on the site immediately (no more data.ts sync issue)
- All 14 DB articles + the 15 data.ts articles are available (DB is the single source of truth)
- The PostsProvider context loads posts via /api/posts on the client side
- Loading spinner shown while posts are being fetched
- Build compiles successfully with no errors
