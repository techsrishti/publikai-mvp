'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'react-hot-toast';

interface ModelFormProps {
  onSuccess?: () => void;
}

export default function ModelForm({ onSuccess }: ModelFormProps) {
  const [sourceType, setSourceType] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('sourceType', sourceType);

      const response = await fetch('/api/models/update', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create model');
      }

      toast.success('Model created successfully!');
      onSuccess?.();
      e.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create model');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="modelType" className="block text-sm font-medium text-gray-700">
          Model Type
        </label>
        <select
          id="modelType"
          name="modelType"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="text-classification">Text Classification</option>
          <option value="text-generation">Text Generation</option>
          <option value="image-classification">Image Classification</option>
          <option value="object-detection">Object Detection</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="license" className="block text-sm font-medium text-gray-700">
          License
        </label>
        <input
          type="text"
          id="license"
          name="license"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="e.g., nlp, bert, classification"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Source Type</label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="sourceType"
              value="url"
              checked={sourceType === 'url'}
              onChange={() => setSourceType('url')}
              className="form-radio"
            />
            <span className="ml-2">Hugging Face URL</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="sourceType"
              value="upload"
              checked={sourceType === 'upload'}
              onChange={() => setSourceType('upload')}
              className="form-radio"
            />
            <span className="ml-2">Upload File</span>
          </label>
        </div>
      </div>

      {sourceType === 'url' ? (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            Hugging Face Model URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            required
            placeholder="https://huggingface.co/..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Model File
          </label>
          <input
            type="file"
            id="file"
            name="file"
            required
            className="mt-1 block w-full"
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Model'}
        </button>
      </div>
    </form>
  );
} 