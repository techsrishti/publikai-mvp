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
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getMetrics, linkBankAccountOrVpa, getLinkedBankAccountOrVpa, GetLinkedBankAccountOrVpaResponse, getAllPayouts, getCreatorPayoutStats } from "@/app/creator-dashboard/model-actions"

interface ModelEarning {
  name: string;
  earnings: string;
  percentage: number;
  trend: string;
}

interface ModelPerformance {
  name: string;
  type: string;
  requests: string;
  status: string;
  performance: number;
  avgLatency: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
}

interface ModelMetrics {
  totalModels: number;
  activeModels: number;
  pendingModels: number;
  modelEarnings: ModelEarning[];
  modelPerformance: ModelPerformance[];
}

interface ModelOverviewProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void;
}

export function ModelOverview({ addNotification }: ModelOverviewProps) {
  const [metrics, setMetrics] = useState<ModelMetrics>({
    totalModels: 0,
    activeModels: 0,
    pendingModels: 0,
    modelEarnings: [],
    modelPerformance: []
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    vpa: "",
  })

  const [isVPA, setIsVPA] = useState(false)
  const [hasLinkedAccount, setHasLinkedAccount] = useState(false)
  const [linkedAccountDetails, setLinkedAccountDetails] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(true)
  const [isLoadingPayoutStats, setIsLoadingPayoutStats] = useState(true)
  const [payoutStats, setPayoutStats] = useState({
    totalEarned: 0,
    outstandingAmount: 0,
    totalPaidAmount: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();            // <- server-action call
        if (data.success) {
          setMetrics({
            totalModels:      data.totalModels      ?? 0,
            activeModels:     data.activeModels     ?? 0,
            pendingModels:    data.pendingModels    ?? 0,
            modelEarnings:    data.modelEarnings    ?? [],
            modelPerformance: data.modelPerformance ?? [],
          });
        } else {
          addNotification("error", data.error || "Failed to load metrics");
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
        addNotification("error", "Failed to load metrics");
      }
    };

    fetchMetrics();
  }, [addNotification]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      setIsLoadingBankDetails(true)
      try {
        const response = await getLinkedBankAccountOrVpa() as GetLinkedBankAccountOrVpaResponse;
        if (response.success && response.data) {
          const data = response.data;
          if (!data) {
            return;
          }
          setHasLinkedAccount(true);
          setLinkedAccountDetails(data);
          if (data.vpa) {
            setIsVPA(true);
            setBankDetails(prev => ({ ...prev, vpa: data.vpa!.address ?? ""}));
          } else if (data.account_type === 'bank_account' && data.bank_account) {
            setIsVPA(false);
            setBankDetails(prev => ({
              ...prev,
              accountHolderName: data.bank_account!.name,
              accountNumber: data.bank_account!.account_number,
              ifsc: data.bank_account!.ifsc,
              bankName: data.bank_account!.bank_name,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching bank details:', error);
      } finally {
        setIsLoadingBankDetails(false)
      }
    };

    fetchBankDetails();
  }, []);

  useEffect(() => {
    const fetchPayoutStats = async () => {
      setIsLoadingPayoutStats(true)
      try {
        const stats = await getCreatorPayoutStats();
        if (stats.success) {
          setPayoutStats({
            totalEarned: stats.totalEarned || 0,
            outstandingAmount: stats.outstandingAmount || 0,
            totalPaidAmount: stats.totalPaidAmount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching payout stats:', error);
      } finally {
        setIsLoadingPayoutStats(false)
      }
    };

    fetchPayoutStats();
  }, []);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (isVPA) { 
        const response = await linkBankAccountOrVpa({
          vpa: bankDetails.vpa
        });
        if (response.success) {
          addNotification("success", "Bank details updated successfully!");
          setHasLinkedAccount(true);
          // Refresh bank details
          const updatedDetails = await getLinkedBankAccountOrVpa() as GetLinkedBankAccountOrVpaResponse;
          if (updatedDetails.success && updatedDetails.data) {
            setLinkedAccountDetails(updatedDetails.data);
          }
          setIsDialogOpen(false);
        } else {
          addNotification("error", response.error || "Failed to update bank details.");
        }
      } else { 
        const response = await linkBankAccountOrVpa({
          bankAccount: { 
            name: bankDetails.accountHolderName,
            bankAccountNumber: bankDetails.accountNumber,
            bankIfscCode: bankDetails.ifsc,
            bankName: bankDetails.bankName,
          }
        });
        if (response.success) {
          addNotification("success", "Bank details updated successfully!");
          setHasLinkedAccount(true);
          // Refresh bank details
          const updatedDetails = await getLinkedBankAccountOrVpa() as GetLinkedBankAccountOrVpaResponse;
          if (updatedDetails.success && updatedDetails.data) {
            setLinkedAccountDetails(updatedDetails.data);
          }
          setIsDialogOpen(false);
        } else {
          addNotification("error", response.error || "Failed to update bank details.");
        }
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      addNotification("error", "An error occurred while updating bank details.");
    } finally {
      setIsSubmitting(false);
    }
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
    
    // If we're past the 5th, get next month's date
    const settlementMonth = currentDay > 5 ? currentMonth + 1 : currentMonth
    const settlementYear = settlementMonth > 11 ? currentYear + 1 : currentYear
    
    return new Date(settlementYear, settlementMonth, 5)
  }

  const getPreviousSettlementDate = () => {
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // If we're past the 5th, use current month, otherwise use previous month
    const settlementMonth = currentDay > 5 ? currentMonth : currentMonth - 1
    const settlementYear = settlementMonth < 0 ? currentYear - 1 : currentYear
    
    return new Date(settlementYear, settlementMonth < 0 ? 11 : settlementMonth, 6)
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
              <h3 className="text-2xl font-medium text-white mt-1 font-cabinet-grotesk">{metrics.totalModels}</h3>
              <p className="text-xs text-blue-400 mt-1">{metrics.activeModels} Active, {metrics.pendingModels} Pending</p>
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
              {isLoadingPayoutStats ? (
                <div className="flex items-center gap-2 mt-1">
                  <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                  <span className="text-sm text-green-400">Loading...</span>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-medium text-white mt-1 font-cabinet-grotesk">₹{payoutStats.totalEarned.toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-green-400 mt-1">+₹{payoutStats.outstandingAmount.toLocaleString('en-IN')} this month</p>
                </>
              )}
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
              <h3 className="text-2xl font-medium text-white mt-1 font-cabinet-grotesk">42</h3>
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
              <h3 className="text-2xl font-medium text-white mt-1 font-cabinet-grotesk">{formatDate(getNextSettlementDate())}</h3>
              <p className="text-xs text-amber-400 mt-1">5th of every month</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings and Payout Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 h-[375px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-medium text-white">Earnings by Model</h2>
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
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {metrics.modelEarnings.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  No data available
                </p>
              ) : (
                metrics.modelEarnings.map((model, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-white">{model.name.toUpperCase()}</h3>
                        <p className="text-sm text-gray-400">{model.trend}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-white">{model.earnings}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <h2 className="text-xl font-medium text-white mb-6">Payout Information</h2>
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
              {isLoadingPayoutStats ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-medium text-white">₹{payoutStats.outstandingAmount.toLocaleString('en-IN')}</p>
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
                          <p className="text-sm text-gray-400">Any new model purchases before the next payout date ({formatDate(getNextSettlementDate())}) will be added to this amount</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-1">Pending since {formatDate(getPreviousSettlementDate())}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <h3 className="font-medium text-white">Bank Details</h3>
                </div>
                {!hasLinkedAccount && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add Bank Details</DialogTitle>
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
                                required
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
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber" className="text-gray-300">Account Number</Label>
                              <Input
                                id="accountNumber"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                className="bg-gray-800 border-gray-700 text-white"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ifsc" className="text-gray-300">IFSC Code</Label>
                              <Input
                                id="ifsc"
                                value={bankDetails.ifsc}
                                onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                className="bg-gray-800 border-gray-700 text-white"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bankName" className="text-gray-300">Bank Name</Label>
                              <Input
                                id="bankName"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                className="bg-gray-800 border-gray-700 text-white"
                                required
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="space-y-2">
                {isLoadingBankDetails ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  </div>
                ) : hasLinkedAccount && linkedAccountDetails ? (
                  linkedAccountDetails.account_type === 'vpa' ? (
                    <p className="text-sm text-gray-400">UPI VPA: {linkedAccountDetails.vpa?.address}</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400">Account Holder: {linkedAccountDetails.bank_account?.name}</p>
                      <p className="text-sm text-gray-400">Bank: {linkedAccountDetails.bank_account?.bank_name}</p>
                      <p className="text-sm text-gray-400">Account: **** {linkedAccountDetails.bank_account?.account_number?.slice(-4)}</p>
                      <p className="text-sm text-gray-400">IFSC: {linkedAccountDetails.bank_account?.ifsc}</p>
                    </>
                  )
                ) : (
                  <p className="text-sm text-gray-400">No bank account or UPI VPA linked</p>
                )}
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-400">Total Paid: ₹{payoutStats.totalPaidAmount.toLocaleString('en-IN')}</p>
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

      {/* Model Performance */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 h-[300px] flex flex-col">
        <h2 className="text-xl font-medium text-white mb-6">Model Performance</h2>
        
        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-4 px-4 mb-2">
          <div className="col-span-3 text-left">
            <p className="text-sm font-medium text-gray-400">Model</p>
          </div>
          <div className="col-span-2 text-left">
            <p className="text-sm font-medium text-gray-400">Status</p>
          </div>
          <div className="col-span-3 text-left">
            <p className="text-sm font-medium text-gray-400">API Calls</p>
          </div>
          <div className="col-span-2 text-left">
            <p className="text-sm font-medium text-gray-400">Avg Latency</p>
          </div>
          <div className="col-span-2 text-left">
            <p className="text-sm font-medium text-gray-400">Success Rate</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {metrics.modelPerformance.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No data available
              </p>
            ) : (
              metrics.modelPerformance.map((model, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-lg"
                >
                  {/* Model Info - 3 columns */}
                  <div className="col-span-3 text-left">
                    <h3 className="font-medium text-white">{model.name.toUpperCase()}</h3>
                    <p className="text-sm text-gray-400">
                      {model.type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join('-')}
                    </p>
                  </div>

                  {/* Status - 2 columns */}
                  <div className="col-span-2 flex items-center text-left pl-2">
                    <p className={`text-sm ${
                      model.status === 'Deployed' 
                        ? 'text-green-400' 
                        : 'text-yellow-400'
                    }`}>
                      {model.status}
                    </p>
                  </div>

                  {/* API Calls - 3 columns */}
                  <div className="col-span-3 flex items-center text-left pl-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-400">{model.successfulCalls}</span>
                      <span className="text-sm text-gray-500">|</span>
                      <span className="text-sm font-medium text-red-400">{model.failedCalls}</span>
                    </div>
                  </div>

                  {/* Latency - 2 columns */}
                  <div className="col-span-2 flex items-center text-left pl-5">
                    <p className="text-sm text-gray-400">{model.avgLatency}</p>
                  </div>

                  {/* Success Rate - 2 columns */}
                  <div className="col-span-2 flex flex-col items-end justify-center pl-6">
                    <div className="w-full">
                      <div className="h-2 rounded-full bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${model.performance}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">{model.performance}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Payout Summary Card */}
      <div className="mt-8">
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl">
          {/* Top 25% section */}
          <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-br from-blue-700/50 to-blue-900/50 backdrop-blur-sm">
            <div className="p-4">
              <p className="text-sm font-medium text-blue-200">Total Paid</p>
            </div>
          </div>
          
          {/* Bottom 75% section */}
          <div className="absolute bottom-0 left-0 w-full h-3/4 flex items-center justify-center">
            <div className="text-center">
              {isLoadingPayoutStats ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  <span className="text-sm text-blue-200">Loading...</span>
                </div>
              ) : (
                <>
                  <p className="text-4xl font-medium text-white">₹{payoutStats.totalPaidAmount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-blue-200 mt-2">Last updated: {formatDate(new Date())}</p>
                </>
              )}
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