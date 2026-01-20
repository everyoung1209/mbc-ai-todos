
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { Todo, Priority } from './types';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        // Handle missing table error
        if (supabaseError.code === 'PGRST116' || supabaseError.message.includes('relation "todos" does not exist')) {
          setShowSetup(true);
          throw new Error("Supabase에 'todos' 테이블이 없습니다.");
        }
        throw supabaseError;
      }
      setTodos(data || []);
      setShowSetup(false);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
      
      // Fallback: show mock data if not in setup mode
      if (!showSetup) {
        setTodos([
          { id: '1', title: 'Supabase SQL 실행하기', is_completed: false, priority: 'high', category: 'Dev', created_at: new Date().toISOString() },
          { id: '2', title: 'Gemini AI로 할일 관리하기', is_completed: true, priority: 'medium', category: 'AI', created_at: new Date().toISOString() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [showSetup]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (title: string, priority: Priority, category: string) => {
    const newTodo = {
      title,
      priority,
      category,
      is_completed: false,
    };

    try {
      const { data, error } = await supabase.from('todos').insert([newTodo]).select();
      if (error) throw error;
      if (data) setTodos([data[0], ...todos]);
    } catch (err: any) {
      console.warn("Local update used:", err.message);
      const mockTodo: Todo = { ...newTodo, id: Math.random().toString(), created_at: new Date().toISOString() };
      setTodos([mockTodo, ...todos]);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    } catch (err) {
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[#f8fafc] text-slate-900">
      <div className="max-w-2xl w-full">
        <header className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            SmartTodo AI
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Supabase와 Gemini AI가 만난 차세대 할일 관리
          </p>
        </header>

        <main className="space-y-8">
          {showSetup && (
            <section className="bg-white border-2 border-amber-200 rounded-[2rem] p-8 shadow-2xl shadow-amber-100/50 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">초기 설정이 필요합니다</h3>
              </div>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Supabase 대시보드의 <strong>SQL Editor</strong>에 접속하여 아래 스크립트를 실행해주세요. 테이블이 생성되어야 앱이 정상 작동합니다.
              </p>
              
              <div className="relative group">
                <pre className="bg-slate-900 text-slate-300 p-5 rounded-2xl text-sm overflow-x-auto font-mono leading-relaxed shadow-inner">
{`CREATE TABLE todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  priority text DEFAULT 'medium',
  category text DEFAULT 'Personal'
);
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public" ON todos FOR ALL USING (true);`}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`CREATE TABLE todos (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamptz DEFAULT now(), title text NOT NULL, is_completed boolean DEFAULT false, priority text DEFAULT 'medium', category text DEFAULT 'Personal'); ALTER TABLE todos ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public" ON todos FOR ALL USING (true);`);
                    alert("SQL이 클립보드에 복사되었습니다!");
                  }}
                  className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>

              <button 
                onClick={() => fetchTodos()}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                테이블 생성 후 여기를 눌러 새로고침
              </button>
            </section>
          )}

          <TodoForm onAdd={addTodo} />
          
          <div className="glass rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">진행 중인 할일</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-400">Total {todos.length}</span>
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-blue-100">
                  {todos.filter(t => !t.is_completed).length} Pending
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 font-medium animate-pulse">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <TodoList 
                todos={todos} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            )}
            
            {!loading && todos.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                   <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-400 mb-1">할 일이 없습니다</h3>
                <p className="text-slate-300 text-sm">새로운 목표를 세우고 AI의 도움을 받아보세요!</p>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-20 mb-10 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2024 SmartTodo AI • Built with Supabase & Gemini Flash 3
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
