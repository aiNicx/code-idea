import React from 'react';

// Generic Icon Props
type IconProps = { className?: string };

export const OrchestratorIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
  </svg>
);

export const ProjectBriefIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const UserPersonaIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const UserFlowIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v18M18 3v18M3 9h3M3 15h3M9 9h6M9 15h6M18 9h3M18 15h3M6 9a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"></path>
  </svg>
);

export const DBSchemaIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

export const APIEndpointIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);

export const ComponentArchitectureIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <line x1="7.5" y1="14" x2="7.5" y2="10"></line>
    <line x1="16.5" y1="14" x2="16.5" y2="10"></line>
    <line x1="7.5" y1="3" x2="7.5" y2="7"></line>
    <line x1="16.5" y1="3" x2="16.5" y2="7"></line>
    <line x1="14" y1="7.5" x2="10" y2="7.5"></line>
    <line x1="14" y1="16.5" x2="10" y2="16.5"></line>
  </svg>
);

export const TechRationaleIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.7.7a5.4 5.4 0 0 0 0 7.65l.7.7a5.4 5.4 0 0 0 7.65 0l4.48-4.48a1.71 1.71 0 0 0 0-2.42zM3.58 19.42a5.4 5.4 0 0 0 7.65 0l.7-.7a5.4 5.4 0 0 0 0-7.65l-.7-.7a5.4 5.4 0 0 0-7.65 0l-4.48 4.48a1.71 1.71 0 0 0 0 2.42z"></path>
  </svg>
);

export const RoadmapIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v6h13l-4-6H6zM6 21v-6h13l-4 6H6zM19 9H5"></path>
  </svg>
);

export const DocumentGeneratorIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19.5v-15M5.5 10.5l-3-3 3-3M18.5 16.5l3 3-3 3"></path>
    <path d="M12 4.5l7 7-7 7M12 19.5l-7-7 7-7"></path>
  </svg>
);


// --- UI Action Icons ---

export const EditIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

export const ResetIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M7.5 2.5a.5.5 0 00-1 0v4.586L4.707 5.293a.5.5 0 00-.707.707l2.5 2.5a.5.5 0 00.707 0l2.5-2.5a.5.5 0 10-.707-.707L7.5 7.086V2.5z" />
        <path d="M3.5 9.5a.5.5 0 01.5-.5h12a.5.5 0 010 1H4a.5.5 0 01-.5-.5z" />
        <path d="M9.5 12.5a.5.5 0 00-1 0v4.586L6.707 15.293a.5.5 0 00-.707.707l2.5 2.5a.5.5 0 00.707 0l2.5-2.5a.5.5 0 00-.707-.707L9.5 17.086v-4.586z" transform="rotate(90 12 12)" />
        <path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm13 1.5H4v11h12v-11z" />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const ToolIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17a.75.75 0 01.94.32l2.5 4.5a.75.75 0 01-.44 1.13l-4.5 2.5a.75.75 0 01-1.13-.44l-2.5-4.5a.75.75 0 01.44-1.13l4.5-2.5a.75.75 0 01.19 0zM12.94 11.49a.75.75 0 01.32-.94l4.5-2.5a.75.75 0 011.13.44l2.5 4.5a.75.75 0 01-.44 1.13l-4.5 2.5a.75.75 0 01-1.13-.44l-2.5-4.5a.75.75 0 01.25-.19z" clipRule="evenodd" />
      <path d="M10 2.25a.75.75 0 00-1.06 0L3.25 7.94a.75.75 0 000 1.06l5.69 5.69a.75.75 0 001.06 0l5.69-5.69a.75.75 0 000-1.06L10 2.25z" />
    </svg>
  );
  
// --- Flow Diagram Icons ---

export const UserInputIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4" />
        <path d="M12 2v11" />
        <path d="m8 9 4 4 4-4" />
    </svg>
);

export const ExecutionIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 18a4 4 0 0 0-8 0" />
        <path d="M12 2v10" />
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M20.3 10.7a4 4 0 1 0-8.6 0" />
        <path d="M3.7 10.7a4 4 0 1 0 8.6 0" />
    </svg>
);

export const OutputIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a10 10 0 1 0-10-10" />
        <path d="M2 12h10" />
        <path d="m9 9 3 3-3 3" />
    </svg>
);
