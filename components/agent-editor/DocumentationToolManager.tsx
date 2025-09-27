import React, { useState, useEffect, useCallback } from 'react';
import type { DocumentationSource } from '../../types';
import { getDocumentationSources, saveDocumentationSource, deleteDocumentationSource } from '../../src/services/documentationService';

interface DocumentationToolManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const DocumentationToolManager: React.FC<DocumentationToolManagerProps> = ({ isOpen, onClose }) => {
    const [docs, setDocs] = useState<DocumentationSource[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentationSource | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const refreshDocs = useCallback(() => {
        setDocs(getDocumentationSources());
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshDocs();
        }
    }, [isOpen, refreshDocs]);

    const handleSelectDoc = (doc: DocumentationSource) => {
        setSelectedDoc(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setIsEditing(true);
    };

    const handleNewDoc = () => {
        setSelectedDoc(null);
        setTitle('');
        setContent('');
        setIsEditing(true);
    };

    const handleCancel = () => {
        setSelectedDoc(null);
        setTitle('');
        setContent('');
        setIsEditing(false);
    };

    const handleSave = () => {
        if (title.trim() === '' || content.trim() === '') return;
        
        const docToSave = {
            id: selectedDoc?.id,
            title: title.trim(),
            content: content.trim()
        };
        
        saveDocumentationSource(docToSave);
        refreshDocs();
        handleCancel();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            deleteDocumentationSource(id);
            refreshDocs();
            if (selectedDoc?.id === id) {
                handleCancel();
            }
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 border border-gray-600 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Custom Documentation Manager</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <div className="flex-grow flex min-h-0">
                    {/* Sidebar */}
                    <aside className="w-1/3 border-r border-gray-700 flex flex-col">
                        <div className="p-3 flex-shrink-0">
                            <button onClick={handleNewDoc} className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                                + New Document
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {docs.map(doc => (
                                <button 
                                    key={doc.id}
                                    onClick={() => handleSelectDoc(doc)}
                                    className={`w-full text-left p-3 rounded-md mb-1 ${selectedDoc?.id === doc.id ? 'bg-indigo-600/30' : 'hover:bg-gray-700/50'}`}
                                >
                                    <h4 className="font-semibold text-gray-200 truncate">{doc.title}</h4>
                                    <p className="text-xs text-gray-500">
                                        Modified: {new Date(doc.lastModified).toLocaleString()}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </aside>
                    
                    {/* Editor */}
                    <main className="w-2/3 flex flex-col">
                        {isEditing ? (
                            <>
                                <div className="p-3 flex-shrink-0">
                                    <input 
                                        type="text"
                                        placeholder="Document Title"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="p-3 flex-grow min-h-0">
                                    <textarea
                                        placeholder="Enter your documentation content here (Markdown supported)..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full h-full p-3 bg-gray-900 border border-gray-600 rounded-md text-sm font-mono text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <footer className="p-3 flex-shrink-0 flex justify-between items-center border-t border-gray-700">
                                    <div>
                                        {selectedDoc && (
                                            <button onClick={() => handleDelete(selectedDoc.id)} className="px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors">
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleSave} disabled={!title.trim() || !content.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 transition-colors">
                                            Save Document
                                        </button>
                                    </div>
                                </footer>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <h3 className="text-lg font-bold text-gray-400">Select a document to edit</h3>
                                <p>...or create a new one to get started.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentationToolManager;