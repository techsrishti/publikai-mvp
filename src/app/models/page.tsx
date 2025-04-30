'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tag {
  id: string;
  tag: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  modelType: string;
  license: string;
  sourceType: 'URL' | 'UPLOAD';
  url: string | null;
  createdAt: string;
  tags: Tag[];
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch models');
        }

        setModels(data.models);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Models</h1>
        <Link
          href="/models/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Model
        </Link>
      </div>

      {models.length === 0 ? (
        <div className="text-center text-gray-500">No models found</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{model.name}</h2>
              <p className="text-gray-600 mb-4">{model.description}</p>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Type:</span> {model.modelType}
                </p>
                <p>
                  <span className="font-medium">License:</span> {model.license}
                </p>
                <p>
                  <span className="font-medium">Source:</span>{' '}
                  {model.sourceType === 'URL' ? (
                    <a
                      href={model.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {model.url}
                    </a>
                  ) : (
                    'File Upload'
                  )}
                </p>
                {model.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>{' '}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {model.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Created: {new Date(model.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 