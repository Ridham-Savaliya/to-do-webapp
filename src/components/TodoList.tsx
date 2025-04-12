import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Todo } from '../types';
import { toast } from 'react-hot-toast';
import '../index.css';
import { CheckCircle2, Circle, Trash2, Edit, Loader, Save, X } from 'lucide-react';

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isHtml = newTodo.trim().startsWith('<');
      const { error } = await supabase
        .from('todos')
        .insert([{ 
          title: newTodo.trim(), 
          completed: false,
          user_id: user.id,
          is_html: isHtml
        }]);

      if (error) throw error;
      setNewTodo('');
      toast.success('Todo added successfully!');
      fetchTodos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchTodos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Todo deleted successfully!');
      fetchTodos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateTodo = async (todo: Todo) => {
    if (!editValue.trim() || editValue === todo.title) {
      setEditingTodo(null);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isHtml = editValue.trim().startsWith('<');
      const { error } = await supabase
        .from('todos')
        .update({ 
          title: editValue.trim(),
          is_html: isHtml 
        })
        .eq('id', todo.id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Todo updated successfully!');
      setEditingTodo(null);
      fetchTodos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return !todo.completed; // Show only pending todos in "All" filter
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg sm:p-6 md:p-8">
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo or HTML/CSS..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 text-base sm:text-lg sm:px-6 sm:py-3"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg sm:px-6 sm:py-3"
          >
            Add Todo
          </button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-2 mb-6 overflow-x-auto">
        {['all', 'completed', 'pending'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`w-full sm:w-auto px-4 py-2 rounded-md transition-all duration-300 ${
              filter === f
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 todo-item border-l-2 border-transparent hover:border-blue-500 sm:p-4"
          >
            {editingTodo === todo.id ? (
              <div className="w-full flex flex-col items-center gap-3">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 dark:bg-gray-700 dark:border-blue-600 dark:text-white transition-all duration-300 text-base h-20 resize-y sm:h-24 sm:px-6 sm:py-4"
                  autoFocus
                />
                <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
                  <button
                    onClick={() => updateTodo(todo)}
                    className="w-full sm:w-auto p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-300 sm:p-3"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className="w-full sm:w-auto p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300 sm:p-3"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                <button onClick={() => toggleTodo(todo)} className="mb-2 sm:mb-0">
                  {todo.completed ? (
                    <CheckCircle2 className="text-green-500" size={20} sm:size={24} />
                  ) : (
                    <Circle className="text-gray-400" size={20} sm:size={24} />
                  )}
                </button>
                <div
                  className={`w-full text-base sm:text-lg ${
                    todo.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {todo.is_html ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: todo.title }}
                      className="rendered-html max-w-full overflow-x-auto break-words"
                    />
                  ) : (
                    <span>{todo.title}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditingTodo(todo.id);
                      setEditValue(todo.title);
                    }}
                    className="w-full sm:w-auto p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                  >
                    <Edit size={18} sm:size={20} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="w-full sm:w-auto p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-300"
                  >
                    <Trash2 size={18} sm:size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
