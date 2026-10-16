import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The game, the vote endpoint, and the random-question endpoint stay public so
// guests can play without signing in. Only the profile area requires auth.
const isProtectedRoute = createRouteMatcher(["/profile(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless referenced in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)"
  ]
};
