import React, { useState } from 'react';
import type { AgentName, Page } from '../types';
import AgentLibrary from './AgentLibrary';
import ConfigurationPanel from './agent-editor/ConfigurationPanel';
import WorkflowVisualizer from './agent-editor/WorkflowVisualizer';
import ToolsDashboard from './agent-editor/ToolsDashboard';
import DocumentationToolManager from './agent-editor/DocumentationToolManager';

interface AgentsPageProps {
  onNavigate: (page: Page) => void;
  selectedAgentName?: AgentName | null;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors focus:outline-none ${
            isActive
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {label}
    </button>
);


const AgentsPage: React.FC<AgentsPageProps> = ({ onNavigate, selectedAgentName }) => {
  const [key, setKey] = useState(Date.now()); // Used to force-remount library to show "EDITED"
  const [activeTab, setActiveTab] = useState<'workflow' | 'tools'>('workflow');
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);

  const handleConfigChange = () => {
    // Force a re-render of the library to show "EDITED" status
    setKey(Date.now());
  };

  return (
    <div className="w-full h-full max-w-screen-2xl mx-auto p-4 md:p-6 flex flex-col">
      <header className="flex-shrink-0 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Agent Dashboard</h1>
          <p className="mt-1 text-lg text-gray-400">
            Inspect, configure, and test the AI agents that power your application.
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to App
        </button>
      </header>

      {/* Tabs */}
      <div className="flex-shrink-0 mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton label="Workflow & Configuration" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} />
          <TabButton label="Tools Overview" isActive={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
        </nav>
      </div>

      {activeTab === 'workflow' && (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

          {/* Left Column: Agent Library - Hidden in single agent view */}
          <div className="lg:col-span-3 lg:h-full min-h-0 hidden lg:block">
             <AgentLibrary
               key={key}
               selectedAgentName={selectedAgentName}
               onSelectAgent={() => {}} // Disabled in single agent view
              />
          </div>

          {/* Center Column: Workflow Visualization */}
          <div className="lg:col-span-8 lg:h-full min-h-0">
            <WorkflowVisualizer
              selectedAgentName={selectedAgentName}
              onSelectAgent={() => {}} // Disabled in single agent view
            />
          </div>

          {/* Right Column: Configuration Panel */}
          <div className="lg:col-span-4 lg:h-full min-h-0">
             {selectedAgentName ? (
                <ConfigurationPanel
                  key={selectedAgentName}
                  agentName={selectedAgentName}
                  onConfigChange={handleConfigChange}
               />
             ) : (
               <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl h-full flex flex-col items-center justify-center text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h3 className="text-lg font-bold text-gray-300">Select an Agent</h3>
                  <p className="text-sm text-gray-500 mt-1">Choose an agent from the library to view and edit its configuration.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
         <div className="flex-grow min-h-0">
            <ToolsDashboard
                onSelectAgent={(agentName) => {
                  // Navigate back to agents overview to select agent
                  onNavigate('agents');
                }}
                onManageDocs={() => setIsDocManagerOpen(true)}
            />
         </div>
      )}

      {isDocManagerOpen && (
        <DocumentationToolManager
          isOpen={isDocManagerOpen}
          onClose={() => setIsDocManagerOpen(false)}
        />
      )}
    </div>
  );
};

export default AgentsPage;