import { UploadForm } from "@/components/upload-form"

export default function DeployModel() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-white">Deploy Hugging Face Model</h1>
          <p className="text-blue-300 mb-8">Deploy your models or use existing models from Hugging Face</p>
          <UploadForm />
        </div>
      </div>
    </main>
  )
} 