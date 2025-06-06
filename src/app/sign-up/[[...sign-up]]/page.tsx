'use client'

import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="container mx-auto relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/5 shadow-2xl border border-white/20 rounded-2xl overflow-hidden bg-[radial-gradient(circle_at_50%_0%,theme(colors.white/10%),transparent)]">
          <div className="px-6 pt-8 pb-6 text-center">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-2">
              FritoAI
            </h2>
            <p className="text-white">
              Create a new account
            </p>
          </div>
          
          <div className="px-6 pb-8">
            <SignUp.Root routing="path" path="/sign-up">
              <SignUp.Step name="start">
                <Clerk.GlobalError className="block text-sm text-rose-400" />
                <Clerk.Field name="emailAddress" className="space-y-2">
                  <Clerk.Label className="text-sm font-medium text-white">
                    Email address
                  </Clerk.Label>
                  <Clerk.Input
                    type="email"
                    required
                    placeholder="youremail@email.com"
                    className="w-full rounded-md bg-transperent-900 px-3.5 py-2 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 hover:ring-zinc-600 focus:bg-transparent focus:ring-[1.5px] focus:ring-blue-400 data-[invalid]:ring-red-400"
                  />
                  <Clerk.FieldError className="block text-sm text-red-400" />
                </Clerk.Field>
                <Clerk.Field name="password" className="space-y-2 mt-4">
                  <Clerk.Label className="text-sm font-medium text-white">
                    Password
                  </Clerk.Label>
                  <Clerk.Input
                    type="password"
                    required
                    placeholder="Enter a unique password"
                    className="w-full rounded-md bg-transperent-900 px-3.5 py-2 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 hover:ring-zinc-600 focus:bg-transparent focus:ring-[1.5px] focus:ring-blue-400 data-[invalid]:ring-red-400"
                  />
                  <Clerk.FieldError className="block text-sm text-red-400" />
                </Clerk.Field>

                {/* Add CAPTCHA element for bot protection */}
                <div id="clerk-captcha" className="mt-4"></div>
                
                <SignUp.Action
                  submit
                  className="w-full bg-blue-500 hover:bg-blue-600 hover:border-white text-white font-medium rounded-md py-1.5 px-3.5 shadow-[0_1px_0_0_theme(colors.white/10%)_inset,0_0_0_1px_theme(colors.white/5%)] relative before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-white/5 before:opacity-0 hover:before:opacity-100 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:text-white/70 mt-6 cursor-pointer"
                >
                  Sign Up
                </SignUp.Action>
                
                <div className="relative flex py-3 items-center my-4">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-xs text-zinc-400">or sign up with</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Clerk.Connection
                    name="google"
                    className="w-full bg-transperent-900 border border-zinc-700 text-white hover:border-white hover:bg--800 transition-all duration-200 rounded-md py-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </Clerk.Connection>
                  <Clerk.Connection
                    name="github"
                    className="w-full bg-transperent-900 border border-zinc-700 text-white hover:border-white hover:bg--800 transition-all duration-200 rounded-md py-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="white" />
                    </svg>
                    Sign up with GitHub
                  </Clerk.Connection>
                </div>
                
                <p className="text-center text-sm text-zinc-400 mt-4">
                  Already have an account?{' '}
                  <Clerk.Link
                    navigate="sign-in"
                    className="font-medium text-white decoration-white/20 underline-offset-4 outline-none hover:underline focus-visible:underline cursor-pointer"
                  >
                    Sign in
                  </Clerk.Link>
                </p>
              </SignUp.Step>
              
              <SignUp.Step name="verifications">
                <header className="text-center mb-6">
                  <h2 className="text-xl font-medium text-white">
                    Verify your email
                  </h2>
                </header>
                <Clerk.GlobalError className="block text-sm text-rose-400" />
                <SignUp.Strategy name="email_code">
                  <Clerk.Field name="code" className="space-y-2">
                    <Clerk.Label className="text-sm font-medium text-white">
                      Verification code
                    </Clerk.Label>
                    <Clerk.Input
                      type="otp"
                      required
                      className="w-full rounded-md bg-transp-900 px-3.5 py-2 text-sm text-white outline-none ring-1 ring-inset ring-zinc-700 hover:ring-zinc-600 focus:bg-transparent focus:ring-[1.5px] focus:ring-blue-400 data-[invalid]:"
                    />
                    <Clerk.FieldError className="block text-sm text-red-400" />
                  </Clerk.Field>
                  <SignUp.Action
                    submit
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md py-1.5 px-3.5 shadow-[0_1px_0_0_theme(colors.white/10%)_inset,0_0_0_1px_theme(colors.white/5%)] relative before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-white/5 before:opacity-0 hover:before:opacity-100 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:text-white/70 mt-6"
                  >
                    Continue
                  </SignUp.Action>
                </SignUp.Strategy>
                <p className="text-center text-sm text-zinc-400 mt-4">
                  Already have an account?{' '}
                  <Clerk.Link
                    navigate="sign-in"
                    className="font-medium text-white decoration-white/20 underline-offset-4 outline-none hover:underline focus-visible:underline"
                  >
                    Sign in
                  </Clerk.Link>
                </p>
              </SignUp.Step>
            </SignUp.Root>
          </div>
        </div>
      </div>
    </div>
  )
}
