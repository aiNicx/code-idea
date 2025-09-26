import React, { useState, useMemo } from 'react';
import type { DevelopedIdea } from '../types';

interface ResultDisplayProps {
  result: DevelopedIdea;
  onStartOver: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onStartOver }) => {
  const fileNames = useMemo(() => Object.keys(result).sort(), [result]);
  const [selectedFile, setSelectedFile] = useState<string>(
    fileNames.find(name => name.toLowerCase().includes('readme.md')) || fileNames[0]
  );

  const handleDownload = () => {
    if (!selectedFile) return;
    const content = result[selectedFile];
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.split('/').pop() || 'download.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col h-[85vh]">
      <div className="flex-shrink-0 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-200">Your Generated Project Files</h2>
        <button
          onClick={onStartOver}
          className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
          Start Over
        </button>
      </div>

      <div className="flex-grow flex flex-col md:flex-row gap-6 min-h-0">
        {/* File Explorer */}
        <div className="flex-shrink-0 md:w-1/4 lg:w-1/5 bg-gray-800 border border-gray-700 rounded-lg p-3 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Files</h3>
          <ul className="space-y-1">
            {fileNames.map(fileName => (
              <li key={fileName}>
                <button
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                    selectedFile === fileName
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {fileName}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* File Content Viewer */}
        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex-shrink-0 flex justify-between items-center mb-2">
            <h3 className="font-mono text-gray-400">{selectedFile}</h3>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Download
            </button>
          </div>
          <div className="flex-grow bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
              <code>{result[selectedFile]}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
