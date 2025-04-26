import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/creator/questionnaire(.*)',
  '/creator/dashboard(.*)'
])

const isQuestionnaireRoute = createRouteMatcher([
  '/creator/questionnaire(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()

  // Check if user is trying to access questionnaire and has already completed it
  if (isQuestionnaireRoute(req)) {
    try {
      // Use auth.protect to ensure the user is authenticated
      await auth.protect();
      
      // Since the auth object doesn't expose userId directly, we can get it 
      // from the request headers once auth is verified
      const response = await fetch(`${new URL(req.url).origin}/api/creator/questionnaire-status`, {
        headers: {
          'Cookie': req.headers.get('cookie') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // If user has a creator profile, redirect to dashboard
        if (data.hasCompleted) {
          const url = new URL('/dashboard', req.url);
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error('Error checking user status in middleware:', error);
      // If auth.protect() fails, it means user is not authenticated
      // Just continue and let them access the page
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}