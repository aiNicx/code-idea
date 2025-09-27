import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import IdeaForm from './components/IdeaForm';
import ProcessingStatus from './components/ProcessingStatus';
import ResultDisplay from './components/ResultDisplay';
import AgentsPage from './components/AgentsPage';
import AgentOverviewPage from './components/AgentOverviewPage';
import { developIdea, aiService } from './src/services';
import { ProcessingState } from './types';
import type { ProgressUpdate, TechStack, DevelopedIdea, DocumentType, Page, AgentName } from './types';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [selectedAgent, setSelectedAgent] = useState<AgentName | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [progress, setProgress] = useState<ProgressUpdate>({
    agentTasks: [],
    currentIteration: 0,
    totalIterations: 1,
    currentTaskDescription: '',
    currentAgent: 'OrchestratorAgent'
  });
  const [finalResult, setFinalResult] = useState<DevelopedIdea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNavigate = useCallback((targetPage: Page) => {
    setPage(targetPage);
    // Reset selected agent when navigating away from agents page
    if (targetPage !== 'agents') {
      setSelectedAgent(null);
    }
  }, []);

  const handleProgress = useCallback((progressUpdate: ProgressUpdate) => {
    setProgress(progressUpdate);
  }, []);

  const handleSubmit = async (idea: string, techStack: TechStack, selectedDocuments: DocumentType[]) => {
    setProcessingState(ProcessingState.PROCESSING);
    setError(null);
    setFinalResult(null);
    setProgress({ 
        agentTasks: [], 
        currentIteration: 0, 
        totalIterations: 1, 
        currentTaskDescription: 'Initializing orchestration agent...',
        currentAgent: 'OrchestratorAgent'
    });

    try {
      const { finalResult, agentTasks } = await developIdea(idea, techStack, selectedDocuments, handleProgress);
      // Ensure the final progress state is set before completing
      setProgress(prev => ({
          ...prev,
          agentTasks,
          currentIteration: prev.totalIterations,
      }));
      setFinalResult(finalResult);
      setProcessingState(ProcessingState.COMPLETE);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setProcessingState(ProcessingState.ERROR);
    }
  };

  const handleStartOver = () => {
    setProcessingState(ProcessingState.IDLE);
    setFinalResult(null);
    setError(null);
    setProgress({ 
        agentTasks: [], 
        currentIteration: 0, 
        totalIterations: 1, 
        currentTaskDescription: '',
        currentAgent: 'OrchestratorAgent'
    });
    setPage('home');
  };

  const renderContent = () => {
    if (page === 'agents') {
      // Show overview if no agent selected, otherwise show configuration
      return selectedAgent ? (
        <AgentsPage onNavigate={handleNavigate} selectedAgentName={selectedAgent} />
      ) : (
        <AgentOverviewPage
          onNavigate={handleNavigate}
          onSelectAgent={setSelectedAgent}
        />
      );
    }
    
    switch (processingState) {
      case ProcessingState.PROCESSING:
        return <ProcessingStatus progress={progress} />;
      case ProcessingState.COMPLETE:
        return finalResult ? <ResultDisplay result={finalResult} onStartOver={handleStartOver} /> : null;
      case ProcessingState.ERROR:
        return (
          <div className="text-center p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-500">An Error Occurred</h2>
            <p className="mt-4 text-gray-300 bg-red-900/50 p-4 rounded-md">{error}</p>
            <button
              onClick={handleStartOver}
              className="mt-6 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case ProcessingState.IDLE:
      default:
        return <IdeaForm onSubmit={handleSubmit} isProcessing={false} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header onNavigate={handleNavigate} />
      <main className="flex-grow flex items-center justify-center p-4">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-600 border-t border-gray-800">
        Powered by Google Gemini API
      </footer>
    </div>
  );
};

export default App;
