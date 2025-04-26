import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="container mx-auto relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/5 shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-2">
              PublikAI
            </h1>
            <p className="text-white/80">
              Sign in to your account
            </p>
          </div>
          
          <div className="px-6 pb-8">
            <SignIn 
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
              appearance={{
                variables: {
                  colorPrimary: "#6366f1",
                  colorTextOnPrimaryBackground: "#ffffff",
                  colorBackground: "transparent",
                  colorInputBackground: "rgba(255, 255, 255, 0.05)",
                  colorInputText: "#ffffff",
                  colorTextSecondary: "rgba(255, 255, 255, 0.7)",
                  colorSuccess: "#22c55e",
                  colorWarning: "#eab308",
                  colorDanger: "#ef4444",
                  borderRadius: "0.5rem",
                  fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  spacingUnit: "0.75rem"
                },
                elements: {
                  rootBox: "w-full",
                  card: {
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    width: "100%"
                  },
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: 
                    "w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 font-medium rounded-xl py-3",
                  formFieldInput: 
                    "w-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200",
                  formFieldLabel: "text-white/90 font-medium",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300 transition-colors duration-200",
                  dividerLine: "bg-white/10",
                  dividerText: "text-white/60",
                  socialButtonsBlockButton: 
                    "w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 rounded-xl",
                  socialButtonsBlockButtonText: "text-white font-medium",
                  socialButtons: "gap-3",
                  formFieldWarningText: "text-violet-300",
                  alert: "bg-white/5 border border-white/10 text-white/90 rounded-xl",
                  identityPreviewText: "text-white/90",
                  navbar: "hidden",
                  headerBackRow: "hidden",
                  main: "px-0",
                  form: "gap-4",
                  formField: "mb-4",
                  formFieldHintText: "text-white/50 text-sm",
                  identificatorText: "hidden",
                  formFieldSuccessText: "text-emerald-400",
                  formResendCodeLink: "text-indigo-400 hover:text-indigo-300",
                },
                layout: {
                  socialButtonsPlacement: "bottom"
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}