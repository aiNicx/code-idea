import React, { useState, useEffect } from 'react';
import type { TechStack, ProjectFeatures, Suggestion, DocumentType } from '../types';
import { 
  FRAMEWORK_OPTIONS, 
  BACKEND_OPTIONS, 
  STYLING_OPTIONS,
  UI_LIBRARY_OPTIONS,
  STATE_MANAGEMENT_OPTIONS,
  AUTH_OPTIONS,
  SUGGESTIONS,
  DOCUMENT_OPTIONS
} from '../constants';

interface IdeaFormProps {
  onSubmit: (idea: string, techStack: TechStack, selectedDocuments: DocumentType[]) => void;
  isProcessing: boolean;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ onSubmit, isProcessing }) => {
  const [idea, setIdea] = useState('');
  const [techStack, setTechStack] = useState<TechStack>({
    framework: 'React',
    backend: 'Convex',
    styling: 'Tailwind CSS',
    uiLibrary: 'Shadcn/UI',
    stateManagement: 'Zustand',
    auth: 'Convex Auth',
    features: { auth: true, crud: true, realtime: false }
  });
  
  const [selectedDocuments, setSelectedDocuments] = useState<Record<DocumentType, boolean>>(() => {
    const initialSelection: Partial<Record<DocumentType, boolean>> = {};
    DOCUMENT_OPTIONS.forEach(doc => {
        initialSelection[doc.key] = true;
    });
    return initialSelection as Record<DocumentType, boolean>;
  });

  const handleTechStackChange = (part: keyof Omit<TechStack, 'features'>, value: string) => {
    setTechStack(prev => ({ ...prev, [part]: value as any }));
  };

  const handleFeatureChange = (feature: keyof ProjectFeatures) => {
    setTechStack(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] }
    }));
  };
  
  const handleDocumentSelectionChange = (docKey: DocumentType) => {
    setSelectedDocuments(prev => ({...prev, [docKey]: !prev[docKey]}));
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setIdea(suggestion.idea);
    const newFeatures = { ...techStack.features, ...suggestion.techStack.features };
    const newTechStack = { ...techStack, ...suggestion.techStack, features: newFeatures };
    setTechStack(newTechStack);

    const newDocSelection: Partial<Record<DocumentType, boolean>> = {};
    DOCUMENT_OPTIONS.forEach(doc => {
      newDocSelection[doc.key] = suggestion.documents.includes(doc.key);
    });
    setSelectedDocuments(newDocSelection as Record<DocumentType, boolean>);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docsToGenerate = Object.keys(selectedDocuments).filter(doc => selectedDocuments[doc as DocumentType]) as DocumentType[];
    if (idea.trim() && !isProcessing && docsToGenerate.length > 0) {
      onSubmit(idea, techStack, docsToGenerate);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-10">
        
        <fieldset>
            <legend className="text-lg font-medium text-gray-300 mb-2">Need Inspiration? Try an Example</legend>
            <div className="flex flex-wrap gap-3">
                {SUGGESTIONS.map(s => (
                    <button type="button" key={s.name} onClick={() => handleSuggestionClick(s)} disabled={isProcessing} className="px-4 py-2 text-sm bg-gray-700 text-indigo-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50">
                        {s.name}
                    </button>
                ))}
            </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-medium text-gray-300 mb-2">1. Describe Your App Idea</legend>
          <textarea
            id="idea-input"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., A real-time polling app for presentations where the audience can vote from their phones..."
            className="w-full h-32 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200 resize-none"
            required
            disabled={isProcessing}
          />
        </fieldset>
        
        <fieldset>
           <legend className="text-lg font-medium text-gray-300 mb-2">2. Define Your Technology Stack</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectControl label="Framework" value={techStack.framework} options={FRAMEWORK_OPTIONS} onChange={(v) => handleTechStackChange('framework', v)} disabled={isProcessing} />
            <SelectControl label="Backend" value={techStack.backend} options={BACKEND_OPTIONS} onChange={(v) => handleTechStackChange('backend', v)} disabled={isProcessing} />
            <SelectControl label="Styling" value={techStack.styling} options={STYLING_OPTIONS} onChange={(v) => handleTechStackChange('styling', v)} disabled={isProcessing} />
            <SelectControl label="UI Library" value={techStack.uiLibrary} options={UI_LIBRARY_OPTIONS} onChange={(v) => handleTechStackChange('uiLibrary', v)} disabled={isProcessing} />
            <SelectControl label="State Management" value={techStack.stateManagement} options={STATE_MANAGEMENT_OPTIONS} onChange={(v) => handleTechStackChange('stateManagement', v)} disabled={isProcessing} />
            <SelectControl label="Authentication" value={techStack.auth} options={AUTH_OPTIONS} onChange={(v) => handleTechStackChange('auth', v)} disabled={isProcessing} />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-lg font-medium text-gray-300 mb-2">3. Select Core Project Features</legend>
          <div className="flex flex-wrap gap-4">
            <CheckboxControl label="User Authentication" checked={techStack.features.auth} onChange={() => handleFeatureChange('auth')} disabled={isProcessing} />
            <CheckboxControl label="Database CRUD" checked={techStack.features.crud} onChange={() => handleFeatureChange('crud')} disabled={isProcessing} />
            <CheckboxControl label="Real-time Features" checked={techStack.features.realtime} onChange={() => handleFeatureChange('realtime')} disabled={isProcessing} />
          </div>
        </fieldset>
        
        <fieldset>
          <legend className="text-lg font-medium text-gray-300 mb-2">4. Select Project Documents to Generate</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_OPTIONS.map(doc => (
                <CheckboxControl 
                    key={doc.key} 
                    label={doc.label} 
                    description={doc.description}
                    checked={selectedDocuments[doc.key] ?? false} 
                    onChange={() => handleDocumentSelectionChange(doc.key)} 
                    disabled={isProcessing} 
                />
            ))}
          </div>
        </fieldset>

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isProcessing || !idea.trim()}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            {isProcessing ? 'Architecting Project...' : 'Architect My Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SelectControl: React.FC<{label: string, value: string, options: readonly string[], onChange: (v: string) => void, disabled: boolean}> = 
  ({label, value, options, onChange, disabled}) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    <select 
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const CheckboxControl: React.FC<{label: string, description?: string, checked: boolean, onChange: () => void, disabled: boolean}> =
  ({label, description, checked, onChange, disabled}) => (
  <label className="flex items-start space-x-3 cursor-pointer p-3 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700/50">
    <input 
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-5 w-5 mt-0.5 flex-shrink-0 rounded bg-gray-700 border-gray-500 text-indigo-600 focus:ring-indigo-500"
    />
    <div>
        <span className="text-sm text-gray-200 font-medium">{label}</span>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  </label>
);

export default IdeaForm;
