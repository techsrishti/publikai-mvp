import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, KeyRound as Key, Copy, Check, Trash } from "lucide-react"
import { isUserSubscribedToModel, deleteCreatedSubscription, getApiKey, createApiKey } from "@/app/dashboard/actions"
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
  const [deleting, setDeleting] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [creatingApiKey, setCreatingApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [endpointCopied, setEndpointCopied] = useState(false)
  const [curlCopied, setCurlCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      checkSubscription()
    }
  }, [open, model.id])

  useEffect(() => {
    if (isSubscribed) {
      checkApiKey()
    }
  }, [isSubscribed])

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

  const checkApiKey = async () => {
    try {
      setApiKeyLoading(true)
      const response = await getApiKey(model.id)
      if (response.success && response.apiKey) {
        setApiKey(response.apiKey)
      } else {
        setApiKey(null)
      }
    } catch (error) {
      console.error("Error checking API key:", error)
      toast({
        title: "Error",
        description: "Failed to check API key status",
        variant: "destructive"
      })
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleCreateApiKey = async () => {
    try {
      setCreatingApiKey(true)
      const response = await createApiKey(model.id)
      if (response.success && response.apiKey) {
        setApiKey(response.apiKey)
        toast({
          title: "Success",
          description: "API key created successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create API key",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      })
    } finally {
      setCreatingApiKey(false)
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

  const copyEndpoint = () => {
    const endpoint = `${process.env.NEXT_PUBLIC_APP_URL}/api/model/${model.name}`
    navigator.clipboard.writeText(endpoint)
    setEndpointCopied(true)
    setTimeout(() => setEndpointCopied(false), 2000)
    toast({
      title: "Success",
      description: "API endpoint copied to clipboard",
    })
  }

  const copyCurl = () => {
    if (apiKey) {
      const curlCommand = `curl -X POST "${process.env.NEXT_PUBLIC_APP_URL}/api/model/${model.name}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
        {
            "content": "Your prompt here"
        }
    ]
}'`
      
      navigator.clipboard.writeText(curlCommand)
      setCurlCopied(true)
      setTimeout(() => setCurlCopied(false), 2000)
      toast({
        title: "Success",
        description: "cURL command copied to clipboard",
      })
    }
  }

  const handleDeleteSubscription = async () => {
    try {
      setDeleting(true)
      const response = await deleteCreatedSubscription()
      if (response.success) {
        toast({
          title: "Success",
          description: "Unreconciled subscription deleted successfully",
        })
        setIsSoftSuccess(false)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete subscription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
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
                  {apiKey ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2"
                      onClick={copyApiKey}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  ) : null}
                </div>
                {apiKeyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : apiKey ? (
                  <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
                    <Key className="h-4 w-4 text-gray-400" />
                    <code className="flex-1 text-sm text-gray-300">
                      {apiKey}
                    </code>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3">
                    <p className="text-sm text-gray-400">No API key generated yet</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCreateApiKey}
                      disabled={creatingApiKey}
                      className="gap-2"
                    >
                      {creatingApiKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Generate API Key
                    </Button>
                  </div>
                )}
              </div>

              {/* API Endpoint Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">API Endpoint</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={copyEndpoint}
                  >
                    {endpointCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {endpointCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3">
                  <code className="flex-1 text-sm text-gray-300">
                    {`${process.env.NEXT_PUBLIC_APP_URL}/api/models/${model.name}`}
                  </code>
                </div>
              </div>

              {/* cURL Example Section */}
              {apiKey && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Example Request</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2"
                      onClick={copyCurl}
                    >
                      {curlCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {curlCopied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-3">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      <code>{`curl -X POST "${process.env.NEXT_PUBLIC_APP_URL}/api/model/${model.name}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
        {
            "content": "Your prompt here"
        }
    ]
}'`}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Subscribe to Access</h3>
                    <p className="text-sm text-gray-400">
                      Get access to this model&apos;s API for ₹{model.price}/month
                    </p>
                    {isSoftSuccess && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm text-yellow-400">
                          Previous payment is being reconciled. Please wait...
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteSubscription}
                          disabled={deleting}
                          className="gap-2"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
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