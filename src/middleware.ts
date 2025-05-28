import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/creator/questionnaire(.*)',
  '/creator-dashboard(.*)'
])

const isCreatorDashboardRoute = createRouteMatcher([
  '/creator-dashboard(.*)'
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/'
])

const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/clerk',
  '/api/webhooks/razorpay/subscriptions',
  '/api/webhooks/razorpay/x',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip auth for webhook routes
  if (isWebhookRoute(req)) {
    console.log('Webhook route detected:', req.url)
    return NextResponse.next()
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // Redirect authenticated users to dashboard if they're on auth pages
  if (userId && isAuthRoute(req)) {
    console.log('Authenticated user accessing auth route, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  //no session and protected route so block 
  if (!userId && isProtectedRoute(req)){
    console.log('User is not authenticated')
    return redirectToSignIn()
  }

 
    //visiting questionnaire route and already completed onboarding so redirect to creator dashboard
    if (isCreatorDashboardRoute(req) && (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete) {
      console.log('User has already completed the questionnaire')
      return NextResponse.redirect(new URL('/creator-dashboard', req.url))
    }
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}