"use client"

import { Card } from "@/components/ui/card"
import {  Layers, Users, Calendar, CreditCard, Pencil, Info, RefreshCw, CalendarDays } from "lucide-react"
import { IndianRupee } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ModelOverview() {
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "John Doe",
    accountNumber: "4567",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    vpa: "",
  })

  const [isVPA, setIsVPA] = useState(false)

  const handleBankDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to update the bank details
    console.log("Updated bank details:", bankDetails)
  }

  const handleRefresh = () => {
    // Here you would typically make an API call to refresh the outstanding amount
    console.log("Refreshing outstanding amount...")
  }

  const getNextSettlementDate = () => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // If we're past the 24th, get next month's date
    const settlementMonth = currentDay > 24 ? currentMonth + 1 : currentMonth
    const settlementYear = settlementMonth > 11 ? currentYear + 1 : currentYear
    
    return new Date(settlementYear, settlementMonth, 24)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-800/50 hover:border-blue-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300 font-cabinet-grotesk">Total Models</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-cabinet-grotesk">3</h3>
              <p className="text-xs text-blue-400 mt-1">2 Active, 1 Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600/10 to-green-800/10 border-green-800/50 hover:border-green-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <IndianRupee className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-300 font-cabinet-grotesk">Total Earnings</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-cabinet-grotesk">₹2,45,000</h3>
              <p className="text-xs text-green-400 mt-1">+₹32,000 this month</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-800/50 hover:border-purple-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-300 font-cabinet-grotesk">Paid Users</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-cabinet-grotesk">42</h3>
              <p className="text-xs text-purple-400 mt-1">+5 this week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-600/10 to-amber-800/10 border-amber-800/50 hover:border-amber-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <CalendarDays className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300 font-cabinet-grotesk">Next Settlement</p>
              <h3 className="text-2xl font-bold text-white mt-1 font-cabinet-grotesk">{formatDate(getNextSettlementDate())}</h3>
              <p className="text-xs text-amber-400 mt-1">24th of every month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings and Payout Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Earnings by Model</h2>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-500 hover:text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="bg-gray-800 border-gray-700 text-gray-300 p-3 shadow-lg z-50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">Model Earnings Information</p>
                      <p className="text-sm">Shows total earnings per model including:</p>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        <li>Current billing cycle earnings</li>
                        <li>Future earnings from active subscriptions</li>
                        <li>Pending earnings from recent purchases</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                name: "BERT-base-uncased",
                earnings: "₹1,24,500",
                percentage: 85,
                trend: "+12%",
              },
              {
                name: "ResNet50",
                earnings: "₹87,600",
                percentage: 65,
                trend: "+8%",
              },
              {
                name: "GPT-2-small",
                earnings: "₹32,900",
                percentage: 45,
                trend: "+5%",
              },
            ].map((model, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-white">{model.name}</h3>
                    <p className="text-sm text-gray-400">{model.trend}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{model.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Payout Information</h2>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="font-medium text-white">Outstanding Payout</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">₹1,85,000</p>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-gray-500 hover:text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-gray-800 border-gray-700 text-gray-300 p-3 shadow-lg z-50"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">Dynamic Outstanding Amount</p>
                        <p className="text-sm">This amount includes all earnings until today</p>
                        <p className="text-sm text-gray-400">Any new model purchases before the next payout date (March 31, 2024) will be added to this amount</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-gray-400 mt-1">Pending since March 1, 2024</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <h3 className="font-medium text-white">Bank Details</h3>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit Bank Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBankDetailsSubmit} className="space-y-4 mt-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="useVPA"
                          checked={isVPA}
                          onChange={(e) => setIsVPA(e.target.checked)}
                          className="rounded border-gray-600 bg-gray-800"
                        />
                        <Label htmlFor="useVPA" className="text-gray-300">Use UPI VPA instead</Label>
                      </div>

                      {isVPA ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="vpa" className="text-gray-300">UPI VPA Address</Label>
                            <Input
                              id="vpa"
                              value={bankDetails.vpa}
                              onChange={(e) => setBankDetails({ ...bankDetails, vpa: e.target.value })}
                              placeholder="example@upi"
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountHolderName" className="text-gray-300">Account Holder Name</Label>
                            <Input
                              id="accountHolderName"
                              value={bankDetails.accountHolderName}
                              onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="text-gray-300">Account Number</Label>
                            <Input
                              id="accountNumber"
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ifsc" className="text-gray-300">IFSC Code</Label>
                            <Input
                              id="ifsc"
                              value={bankDetails.ifsc}
                              onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankName" className="text-gray-300">Bank Name</Label>
                            <Input
                              id="bankName"
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                              className="bg-gray-800 border-gray-700 text-white"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {isVPA ? (
                  <p className="text-sm text-gray-400">UPI VPA: {bankDetails.vpa || "Not set"}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">Account Holder: {bankDetails.accountHolderName}</p>
                    <p className="text-sm text-gray-400">Bank: {bankDetails.bankName}</p>
                    <p className="text-sm text-gray-400">Account: **** {bankDetails.accountNumber}</p>
                    <p className="text-sm text-gray-400">IFSC: {bankDetails.ifsc}</p>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400">Total Payouts: ₹4,85,000</p>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-gray-500 hover:text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        className="bg-gray-800 border-gray-700 text-gray-300 p-3 shadow-lg z-50"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">Payout Information</p>
                          <p className="text-sm">Includes all payouts until the last billing cycle (Feb 28, 2024)</p>
                          <p className="text-sm text-gray-400">Next billing cycle: March 31, 2024</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Models List */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Model Performance</h2>
        <div className="space-y-4">
          {[
            {
              name: "BERT-base-uncased",
              type: "NLP",
              requests: "1245 requests",
              status: "Deployed",
              performance: 85,
              earnings: "₹1,24,500",
            },
            {
              name: "ResNet50",
              type: "Computer Vision",
              requests: "876 requests",
              status: "Deployed",
              performance: 92,
              earnings: "₹87,600",
            },
            {
              name: "GPT-2-small",
              type: "Text Generation",
              requests: "0 requests",
              status: "Pending",
              performance: 0,
              earnings: "₹0",
            },
          ].map((model, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-lg"
            >
              <div className="space-y-1">
                <h3 className="font-medium text-white">{model.name}</h3>
                <p className="text-sm text-gray-400">{model.type}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300">{model.requests}</p>
                  <p className="text-sm text-gray-500">{model.status}</p>
                  <p className="text-sm text-green-400">{model.earnings}</p>
                </div>
                <div className="w-24">
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${model.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payout Summary Card */}
      <div className="mt-8">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl">
          {/* Top 25% section */}
          <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-br from-blue-700/50 to-blue-900/50 backdrop-blur-sm">
            <div className="p-4">
              <p className="text-sm font-medium text-blue-200">Total Payout</p>
            </div>
          </div>
          
          {/* Bottom 75% section */}
          <div className="absolute bottom-0 left-0 w-full h-3/4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-bold text-white">₹4,85,000</p>
              <p className="text-sm text-blue-200 mt-2">Last updated: {formatDate(new Date())}</p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}