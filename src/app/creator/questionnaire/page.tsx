'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner (0-2 years)", description: "Just starting your AI journey" },
  { value: "INTERMEDIATE", label: "Intermediate (2-5 years)", description: "Building practical AI solutions" },
  { value: "ADVANCED", label: "Advanced (5+ years)", description: "Expert in AI development" }
];

const SPECIALIZATIONS = [
  { value: "COMPUTER_VISION", label: "Computer Vision" },
  { value: "NLP", label: "Natural Language Processing" },
  { value: "REINFORCEMENT_LEARNING", label: "Reinforcement Learning" },
  { value: "GENERATIVE_AI", label: "Generative AI" },
  { value: "OTHER", label: "Other" }
];

const AI_FRAMEWORKS = [
  { value: "PYTORCH", label: "PyTorch" },
  { value: "TENSORFLOW", label: "TensorFlow" },
  { value: "JAX", label: "JAX" },
  { value: "KERAS", label: "Keras" },
  { value: "HUGGINGFACE", label: "Hugging Face" },
  { value: "OTHER", label: "Other" }
];

const MODEL_TYPES = [
  { value: "TRANSFORMERS", label: "Transformers" },
  { value: "CNN", label: "Convolutional Neural Networks" },
  { value: "RNN", label: "Recurrent Neural Networks" },
  { value: "GAN", label: "Generative Adversarial Networks" },
  { value: "DIFFUSION", label: "Diffusion Models" },
  { value: "OTHER", label: "Other" }
];

export default function CreatorQuestionnaire() {
  const router = useRouter();
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    experienceLevel: '',
    specialization: [] as string[],
    aiFrameworks: [] as string[],
    modelTypes: [] as string[],
    developmentGoals: '',
    projectDescription: '',
    portfolioUrl: '',
    githubUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already completed the questionnaire
    async function checkQuestionnaireStatus() {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/creator/questionnaire-status');
        if (!response.ok) {
          throw new Error('Failed to check questionnaire status');
        }
        
        const data = await response.json();
        
        if (data.hasCompleted) {
          router.replace('/creator/dashboard');
        }
      } catch (err) {
        console.error('Error checking questionnaire status:', err);
      }
    }

    checkQuestionnaireStatus();
  }, [userId, router]);

  const totalSteps = 5;

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return !!formData.experienceLevel;
      case 2:
        return formData.specialization.length > 0;
      case 3:
        return formData.aiFrameworks.length > 0;
      case 4:
        return formData.modelTypes.length > 0;
      case 5:
        return !!formData.developmentGoals && !!formData.projectDescription;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
       return;
    }
    setError('');
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMultiSelect = (field: 'specialization' | 'aiFrameworks' | 'modelTypes', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v: string) => v !== value)
        : [...prev[field], value]
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all steps before submission
    if (!formData.experienceLevel ||
        formData.specialization.length === 0 ||
        formData.aiFrameworks.length === 0 ||
        formData.modelTypes.length === 0 ||
        !formData.developmentGoals ||
        !formData.projectDescription) {
       return;
    }

    setLoading(true);

    try {
      // Create a FormData instance instead of sending JSON
      const form = new FormData();
      
      // Add single values
      form.append('experienceLevel', formData.experienceLevel);
      form.append('developmentGoals', formData.developmentGoals);
      form.append('projectDescription', formData.projectDescription);
      
      // Add optional fields if they have values
      if (formData.portfolioUrl) form.append('portfolioUrl', formData.portfolioUrl);
      if (formData.githubUrl) form.append('githubUrl', formData.githubUrl);
      
      // Add array values (each value needs to be appended separately)
      formData.specialization.forEach(value => {
        form.append('specialization', value);
      });
      
      formData.aiFrameworks.forEach(value => {
        form.append('aiFrameworks', value);
      });
      
      formData.modelTypes.forEach(value => {
        form.append('modelTypes', value);
      });

      const response = await fetch('/api/creator/sign-up', {
        method: 'POST',
        // No Content-Type header needed - browser sets it automatically with boundary
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      // Redirect to creator dashboard after successful submission
      router.push('/creator/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-white/60">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2.5 mb-6">
        <div
          className="bg-gradient-to-r from-blue-500 to-violet-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">What&apos;s your experience level in AI development?</h2>
            <div className="grid gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, experienceLevel: level.value }));
                    setError('');
                  }}
                  className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                    formData.experienceLevel === level.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <h3 className="font-medium text-white">{level.label}</h3>
                  <p className="text-sm text-white/60">{level.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">What are your areas of specialization?</h2>
            <p className="text-white/60">Select all that apply</p>
            <div className="grid grid-cols-2 gap-4">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec.value}
                  onClick={() => handleMultiSelect('specialization', spec.value)}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    formData.specialization.includes(spec.value)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {spec.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Which AI frameworks do you use?</h2>
            <p className="text-white/60">Select all that apply</p>
            <div className="grid grid-cols-2 gap-4">
              {AI_FRAMEWORKS.map((framework) => (
                <button
                  key={framework.value}
                  onClick={() => handleMultiSelect('aiFrameworks', framework.value)}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    formData.aiFrameworks.includes(framework.value)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {framework.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">What types of models do you work with?</h2>
            <p className="text-white/60">Select all that apply</p>
            <div className="grid grid-cols-2 gap-4">
              {MODEL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleMultiSelect('modelTypes', type.value)}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    formData.modelTypes.includes(type.value)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 hover:border-blue-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Tell us about your goals and project</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="developmentGoals" className="block text-sm font-medium text-white/80 mb-2">
                  What are your development goals?
                </label>
                <textarea
                  id="developmentGoals"
                  value={formData.developmentGoals}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, developmentGoals: e.target.value }));
                    setError('');
                  }}
                  className="w-full rounded-md border border-white/20 bg-white/10 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                  rows={3}
                  placeholder="What do you want to achieve as an AI model creator?"
                />
              </div>
              
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-white/80 mb-2">
                  Describe your AI project
                </label>
                <textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, projectDescription: e.target.value }));
                    setError('');
                  }}
                  className="w-full rounded-md border border-white/20 bg-white/10 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                  rows={3}
                  placeholder="Tell us about the AI model/project you want to publish"
                />
              </div>

              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-white/80 mb-2">
                  Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-white/80 mb-2">
                  GitHub URL (Optional)
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 text-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="backdrop-blur-lg bg-white/10 shadow-xl border border-white/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 mb-6">
            Complete Your Creator Profile
          </h1>
          
          {renderProgressBar()}

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            {renderStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateCurrentStep()}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}