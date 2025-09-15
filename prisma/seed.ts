import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Model type to script mapping
const MODEL_TYPES = {
  "text-classification": "text-classification.py",
  "token-classification": "token-classification.py",
  "question-answering": "question-answering.py",
  "translation": "translation.py",
  "summarization": "summarization.py",
  "text-generation": "text-generation-script.py",
  "masked-language-modeling": "masked-language-modeling.py"
} as const

async function main() {
  // Get the directory of the scripts
  const scriptDir = path.join(__dirname, 'scripts')

  for (const [modelType, scriptName] of Object.entries(MODEL_TYPES)) {
    try {
      // Check if script already exists
      const existingScript = await prisma.modelScript.findFirst({
        where: { modelType }
      })

      if (!existingScript) {
        // Read the script content
        const scriptPath = path.join(scriptDir, scriptName)
        const scriptContent = fs.readFileSync(scriptPath)
        const base64Content = scriptContent.toString('base64')
        
        // Create a script entry
        await prisma.modelScript.create({
          data: {
            content: base64Content,
            modelType: modelType
          }
        })
        console.log(`Created script entry for ${modelType}`)
      } else {
        console.log(`Script entry for ${modelType} already exists`)
      }
    } catch (error) {
      console.error(`Error processing ${modelType}:`, error)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 