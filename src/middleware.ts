import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/creator/questionnaire(.*)',
  '/creator-dashboard(.*)'
])

const isQuestionnaireRoute = createRouteMatcher([
  '/creator/questionnaire(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  //no session and protected route so block 
  if (!userId && isProtectedRoute(req)){
    console.log('User is not authenticated')
    return redirectToSignIn()
  }

  //visiting questionnaire route and already completed onboarding so redirect to creator dashboard
  if (isQuestionnaireRoute(req) && (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete) {
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