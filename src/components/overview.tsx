"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface Deployment {
  id: string
  modelName: string
  modelType: string
  userModelName: string
  status: string
  earnings: number
  model: {
    modelType: string
    userModelName: string
    name: string
  }
}

const Overview: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUserModels: 0,
    deployedModels: 0,
    pendingModels: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalRequests: 0
  })
  const [deployments, setDeployments] = useState<Deployment[]>([])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics')
        const data = await res.json()
        setMetrics({
          totalUserModels: data.totalUserModels || 0,
          deployedModels: data.deployedModels || 0,
          pendingModels: data.pendingModels || 0,
          totalEarnings: data.totalEarnings || 0,
          monthlyEarnings: data.monthlyEarnings || 0,
          totalRequests: data.totalRequests || 0
        })
        setDeployments(data.deployments || [])
      } catch (error) {
        console.error('Error fetching metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Models</CardTitle>
            <Image src="/icons/package.svg" alt="Package" width={16} height={16} className="text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.totalUserModels}</div>
            <p className="text-xs text-gray-400">Total user uploaded models</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.deployedModels}</div>
            <p className="text-xs text-gray-400">Deployed models</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending</CardTitle>
            <Image src="/icons/clock.svg" alt="Clock" width={16} height={16} className="text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.pendingModels}</div>
            <p className="text-xs text-gray-400">Models pending deployment</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings by Model */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Earnings by Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((dep: Deployment) => (
              <div key={dep.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-gray-200">{dep.model?.userModelName || dep.model?.name || dep.modelName}</span>
                </div>
                <span className="text-gray-200">${dep.earnings || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((dep: Deployment) => (
              <div key={dep.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-gray-200">{dep.model?.userModelName || dep.model?.name || dep.modelName}</span>
                </div>
                <span className="text-gray-200">${dep.earnings || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Overview 