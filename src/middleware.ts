import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const isProtectedRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname
  return (
    path.startsWith('/dashboard') ||
    path.startsWith('/creator/questionnaire') ||
    path.startsWith('/creator-dashboard')
  )
}

const isQuestionnaireRoute = (req: NextRequest) => {
  return req.nextUrl.pathname.startsWith('/creator/questionnaire')
}

const isWebhookRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname
  return (
    path.startsWith('/api/webhooks/clerk') ||
    path.startsWith('/api/webhooks/razorpay/')
  )
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // ✅ Skip auth for webhook routes
  if (isWebhookRoute(req)) {
    console.log('Bypassing auth for webhook route:', req.nextUrl.pathname)
    return NextResponse.next()
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth()

  // 🚫 Protected route without auth: redirect to sign in
  if (!userId && isProtectedRoute(req)) {
    console.log('Blocked unauthenticated access to:', req.nextUrl.pathname)
    return redirectToSignIn()
  }

  // ✅ Redirect if user has already completed questionnaire
  if (
    isQuestionnaireRoute(req) &&
    (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete
  ) {
    console.log('Redirecting completed user from questionnaire to dashboard')
    return NextResponse.redirect(new URL('/creator-dashboard', req.url))
  }

  return NextResponse.next()
})

// ✅ Updated matcher to ensure webhook routes are included explicitly
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/api/webhooks/clerk',
    '/api/webhooks/razorpay/:path*',
  ],
}