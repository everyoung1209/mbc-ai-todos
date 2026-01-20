
import React, { useState } from 'react';
import { Priority } from '../types';

interface TodoFormProps {
  onAdd: (title: string, priority: Priority, category: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, category);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 shadow-xl shadow-blue-500/5">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full text-lg px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-blue-400 bg-white shadow-inner outline-none transition-all"
        />
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Personal</option>
            <option>Work</option>
            <option>Shopping</option>
            <option>Health</option>
            <option>Finance</option>
          </select>

          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-4 py-1.5 rounded-lg capitalize transition-all text-sm font-medium ${
                  priority === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
};

export default TodoForm;
