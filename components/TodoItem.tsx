
import React, { useState } from 'react';
import { Todo, AIAnalysis } from '../types';
import { analyzeTask } from '../services/geminiService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const [aiData, setAiData] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const handleMagicClick = async () => {
    if (aiData) {
      setShowAi(!showAi);
      return;
    }
    
    setAnalyzing(true);
    try {
      const data = await analyzeTask(todo.title);
      setAiData(data);
      setShowAi(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-600',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-rose-100 text-rose-600',
  };

  return (
    <li className={`group bg-white rounded-2xl p-4 border border-gray-100 transition-all hover:shadow-md ${todo.is_completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(todo.id, todo.is_completed)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.is_completed 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'border-gray-200 hover:border-blue-400'
          }`}
        >
          {todo.is_completed && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {todo.category}
            </span>
          </div>
          <h3 className={`text-gray-800 font-medium truncate ${todo.is_completed ? 'line-through' : ''}`}>
            {todo.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleMagicClick}
            disabled={analyzing}
            className="p-2 text-purple-500 hover:bg-purple-50 rounded-xl transition-all"
            title="AI Smart Breakdown"
          >
            {analyzing ? (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showAi && aiData && (
        <div className="mt-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-purple-600 uppercase">AI Breakdown</span>
              <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {aiData.estimatedTime}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {aiData.subtasks.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                  {step}
                </li>
              ))}
            </ul>
            <div className="bg-white/60 p-2 rounded-lg border border-purple-100">
              <p className="text-xs text-purple-700 italic">
                <span className="font-bold not-italic mr-1">💡 Tip:</span>
                {aiData.tips}
              </p>
            </div>
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;
