"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

interface ModelManagementProps {
  addNotification: (type: "success" | "error" | "info", message: string) => void
}

export function ModelManagement({addNotification}: ModelManagementProps) {
  const [models, setModels] = useState([
    { id: "1", name: "BERT-base-uncased", version: "1.0", status: "Deployed" },
    { id: "2", name: "ResNet50", version: "1.2", status: "Active" },
    { id: "3", name: "GPT-2-small", version: "0.8", status: "Pending" },
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Model Management</h2>

      <Card className="card-bg border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Manage Your Models</CardTitle>
          <CardDescription>View, update, and manage your deployed models</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your deployed models.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.id}</TableCell>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>{model.version}</TableCell>
                  <TableCell>{model.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 