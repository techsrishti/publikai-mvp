import { UploadForm } from "@/components/upload-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-heading font-bold mb-2 text-white">Hugging Face Model Upload</h1>
          <p className="text-blue-300 mb-6 font-body">Upload your models or use existing models from Hugging Face</p>
          <UploadForm />
        </div>
      </div>
    </main>
  )
}