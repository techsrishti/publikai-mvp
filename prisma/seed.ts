import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { SourceType } from '@prisma/client'

const prisma = new PrismaClient()

// Model type to script mapping
const MODEL_TYPES = {
  "text-classification": "text-classification.py",
  "token-classification": "token-classification.py",
  "question-answering": "question-answering.py",
  "translation": "translation.py",
  "summarization": "summarization.py",
  "text-generation": "text-generation-script.py",
  "masked-language-modeling": "masked-language-modeling.py",
  "image-classification": "image-classification.py"
} as const

type ModelType = keyof typeof MODEL_TYPES

// Model descriptions
const MODEL_DESCRIPTIONS: Record<ModelType, string> = {
  "text-classification": "A model for classifying text into predefined categories",
  "token-classification": "A model for classifying individual tokens in text (e.g., NER)",
  "question-answering": "A model for answering questions based on given context",
  "translation": "A model for translating text between languages",
  "summarization": "A model for generating concise summaries of longer texts",
  "text-generation": "A model for generating new text based on input prompts",
  "masked-language-modeling": "A model for predicting masked tokens in text",
  "image-classification": "A model for classifying images into predefined categories"
}

async function main() {
  // Get the directory of the scripts
  const scriptDir = path.join(__dirname, 'scripts')

  for (const [modelType, scriptName] of Object.entries(MODEL_TYPES)) {
    const scriptPath = path.join(scriptDir, scriptName)
    
    try {
      // Read the script content
      const scriptContent = fs.readFileSync(scriptPath)
      
      // Encode the script content to base64
      const base64Content = scriptContent.toString('base64')
      
      // Check if model already exists
      const existingModel = await prisma.model.findUnique({
        where: { name: `default-${modelType}` },
        include: { script: true }
      })

      if (!existingModel) {
        // Create a model entry with its script
        await prisma.model.create({
          data: {
            name: `default-${modelType}`,
            description: MODEL_DESCRIPTIONS[modelType as ModelType],
            modelType: modelType,
            license: 'mit',
            sourceType: SourceType.UPLOAD,
            tags: ['default', modelType],
            parameters: 0.0,
            script: {
              create: {
                content: base64Content,
                modelType: modelType
              }
            }
          }
        })
        console.log(`Created model entry for ${modelType}`)
      } else {
        console.log(`Model entry for ${modelType} already exists`)
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