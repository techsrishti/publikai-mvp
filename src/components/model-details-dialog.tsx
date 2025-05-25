import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, KeyRound as Key, Copy, Check } from "lucide-react"
import { isUserSubscribedToModel } from "@/app/dashboard/actions"
import { useToast } from "@/components/ui/use-toast"
import { initiateSubscription } from "@/app/dashboard/actions"
import Script from "next/script"
import { updateSoftSuccess } from "@/app/dashboard/actions"

interface ModelDetailsDialogProps {
  model: {
    id: string
    name: string
    description: string
    modelType: string
    price: number
    parameters: number
    creator: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModelDetailsDialog({ model, open, onOpenChange }: ModelDetailsDialogProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isSoftSuccess, setIsSoftSuccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      checkSubscription()
    }
  }, [open, model.id])

  const checkSubscription = async () => {
    try {
      setLoading(true)
      const response = await isUserSubscribedToModel(model.id)
      setIsSubscribed(response.isSubscribed)
      if (response.isSoftSuccess) { 
        setIsSoftSuccess(true)
      }
    } catch (error) {
      console.error("Error checking subscription:", error)
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      setSubscribing(true)
      const response = await initiateSubscription(model.id)
      if (response.success && response.razorpaySubscriptionId) {
        // Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Set this in your .env
          subscription_id: response.razorpaySubscriptionId,
          name: "Frito AI",
          description: `Subscription for ${model.name}`,
          handler: function (paymentResponse: any) {
            console.log("Payment successful inside handler", paymentResponse)
            toast({
              title: "Success",
              description: "Subscription successful!",
            })

            updateSoftSuccess(response.razorpaySubscriptionId ?? "NA")
            setIsSubscribed(true)
          },
          theme: { color: "#7c3aed" },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          console.error("Payment failed:", response.error)
          toast({
            title: "Error",
            description: "Payment failed. Please try again.",
            variant: "destructive"
          })
        })
        rzp.open()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to initiate subscription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: "Failed to initiate subscription",
        variant: "destructive"
      })
    } finally {
      setSubscribing(false)
    }
  }

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Success",
        description: "API key copied to clipboard",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {model.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Model Details */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">{model.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Parameters: {model.parameters}B</span>
              <span>Type: {model.modelType}</span>
              <span>Creator: {model.creator.user.firstName} {model.creator.user.lastName}</span>
            </div>
          </div>

          {/* Subscription Status */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : isSubscribed ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-900/20 p-4">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-5 w-5" />
                  <span>Subscribed</span>
                </div>
              </div>

              {/* API Key Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">API Key</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={copyApiKey}
                    disabled={!apiKey}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
                  <Key className="h-4 w-4 text-gray-400" />
                  <code className="flex-1 text-sm text-gray-300">
                    {apiKey || "Loading API key..."}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Subscribe to Access</h3>
                    <p className="text-sm text-gray-400">
                      Get access to this model's API for ₹{model.price}/month
                    </p>
                    {isSoftSuccess && (
                      <p className="mt-2 text-sm text-yellow-400">
                        Previous payment is being reconciled. Please wait...
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    disabled={subscribing || isSoftSuccess === true}
                    className="gap-2"
                  >
                    {subscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </Dialog>
  )
} 