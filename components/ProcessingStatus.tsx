import React, { useState, useEffect } from 'react';
import type { ProgressUpdate, AgentName } from '../types';
// Placeholder for legacy type
interface AgentTask {
  agent: string;
  goal: string;
  focus: string;
}
import { AGENT_SUB_TASKS } from '../constants';

interface ProcessingStatusProps {
  progress: ProgressUpdate;
}

const useTypingEffect = (text: string, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return displayedText;
};


const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ progress }) => {
  const { agentTasks, currentIteration, totalIterations, currentAgent } = progress;
  const percentage = totalIterations > 0 ? Math.round((currentIteration / totalIterations) * 100) : 0;

  const [currentSubTaskIndex, setCurrentSubTaskIndex] = useState(0);

  const subTasks = AGENT_SUB_TASKS[currentAgent] || ["Processing..."];
  
  useEffect(() => {
    setCurrentSubTaskIndex(0); // Reset for new agent
    const subTaskInterval = setInterval(() => {
        setCurrentSubTaskIndex(prevIndex => (prevIndex + 1) % subTasks.length);
    }, 2500);

    return () => clearInterval(subTaskInterval);
  }, [currentAgent, subTasks.length]);

  const displayedSubTask = useTypingEffect(subTasks[currentSubTaskIndex]);

  const getStatus = (index: number): 'completed' | 'processing' | 'pending' => {
    if (index < currentIteration - 1) return 'completed';
    if (index === currentIteration - 1) return 'processing';
    return 'pending';
  };

  const allTasks: (AgentTask & { isGenerator?: boolean })[] = [
    ...agentTasks,
    { agent: 'DocumentGeneratorAgent', goal: 'Assemble Final Documents', focus: 'All generated content', isGenerator: true }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center text-center">
      <div className="w-full flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-100">Architecting Your Project</h2>
          <p className="text-gray-400">The AI agents are collaborating to build your project plan.</p>
      </div>

       <div className="relative w-24 h-24 my-6">
         <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
          <circle
            className="text-indigo-500 transition-all duration-500"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - percentage / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
         </svg>
         <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-200">
           {percentage}%
         </span>
       </div>
      
      <div className="w-full mt-4 space-y-3">
        {allTasks.map((task, index) => {
            const status = getStatus(index);
            const isProcessing = status === 'processing';
            const isCompleted = status === 'completed';

            return (
                <div key={index} className={`flex items-start p-3 rounded-lg transition-all duration-300 ${
                    isProcessing ? 'bg-indigo-900/50' : ''
                } ${isCompleted ? 'opacity-60' : 'opacity-90'}`}>
                    <div className="w-8 h-8 flex-shrink-0 mr-4 flex items-center justify-center">
                        {isCompleted ? (
                             <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : isProcessing ? (
                             <svg className="w-6 h-6 text-indigo-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                             <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="2" stroke="currentColor"/></svg>
                        )}
                    </div>
                    <div className="text-left">
                        <p className={`font-semibold ${
                            isCompleted ? 'text-gray-400' : 'text-gray-200'
                        }`}>{task.agent}</p>
                        <p className={`text-sm h-5 ${
                            isCompleted ? 'text-gray-500' : 'text-indigo-300'
                        }`}>
                            {isProcessing ? displayedSubTask : isCompleted ? "Completed" : "Pending..."}
                        </p>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatus;
