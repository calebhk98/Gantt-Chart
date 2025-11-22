
import React, { useState, useMemo, useEffect } from 'react';
import { Task, getCategoryColor } from './types';
import { GanttChart } from './components/GanttChart';
import { Plus, BarChart3, Calendar as CalendarIcon, X, Search, Filter, User, Tag } from 'lucide-react';

function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  // --- Helpers ---
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Initialize with some sample data if empty
  useEffect(() => {
    if (tasks.length === 0) {
        setTasks([
          {
            id: '1',
            title: 'Project Setup',
            startDate: formatDate(new Date()),
            endDate: formatDate(new Date(Date.now() + 3 * 86400000)),
            progress: 100,
            category: 'Planning',
            assignee: 'Alex'
          },
          {
            id: '2',
            title: 'UI Design',
            startDate: formatDate(new Date(Date.now() + 2 * 86400000)),
            endDate: formatDate(new Date(Date.now() + 7 * 86400000)),
            progress: 45,
            category: 'Design',
            assignee: 'Sarah'
          }
        ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Computed Data ---
  const uniqueCategories = useMemo(() => {
    const cats = new Set(tasks.map(t => t.category));
    return ['All', ...Array.from(cats).sort()];
  }, [tasks]);

  const uniqueUsers = useMemo(() => {
    const users = new Set(tasks.map(t => t.assignee || 'Unassigned'));
    return ['All', ...Array.from(users).sort()];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
      const matchesUser = userFilter === 'All' || (task.assignee || 'Unassigned') === userFilter;
      
      return matchesSearch && matchesCategory && matchesUser;
    });
  }, [tasks, searchQuery, categoryFilter, userFilter]);

  // --- Handlers ---

  const handleAddManualTask = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 5);

    setCurrentTask({
      id: '', // Empty ID signals new task
      title: '',
      startDate: formatDate(today),
      endDate: formatDate(nextWeek),
      progress: 0,
      category: 'Development',
      assignee: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask({ ...task });
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleComplete = (task: Task) => {
    const newProgress = task.progress === 100 ? 0 : 100;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: newProgress } : t));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    if (!currentTask.id) {
      // Create
      setTasks(prev => [...prev, { ...currentTask, id: generateId() }]);
    } else {
      // Update
      setTasks(prev => prev.map(t => t.id === currentTask.id ? currentTask : t));
    }
    setIsEditModalOpen(false);
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-30 flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-indigo-200 shadow-lg">
             <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">GenGantt</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Interactive Planner</p>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-1 max-w-3xl mx-4 space-x-2">
            <div className="relative flex-1 group">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search tasks..." 
                 className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            
            <div className="relative min-w-[140px]">
               <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <select 
                 className="w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50"
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
               >
                 {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400"></div>
               </div>
            </div>

            <div className="relative min-w-[140px]">
               <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <select 
                 className="w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:bg-gray-50"
                 value={userFilter}
                 onChange={(e) => setUserFilter(e.target.value)}
               >
                 {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
               </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400"></div>
               </div>
            </div>
        </div>

        <div className="flex items-center">
          <button 
            onClick={handleAddManualTask}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-gray-200"
          >
             <Plus size={16} />
             <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6">
        <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <GanttChart 
            tasks={filteredTasks} 
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </main>

      {/* Edit/Create Task Modal */}
      {isEditModalOpen && currentTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 transition-all">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <h3 className="font-bold text-lg text-gray-800">
                  {currentTask.id ? 'Edit Task' : 'Create Task'}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveTask} className="p-6 space-y-5">
                 {/* Title */}
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Task Name</label>
                   <input 
                     type="text" 
                     required
                     placeholder="e.g., Redesign Homepage"
                     className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
                     value={currentTask.title}
                     onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                   />
                 </div>
                 
                 {/* Dates */}
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                     <div className="relative">
                       <CalendarIcon size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                       <input 
                         type="date" 
                         required
                         className="w-full border border-gray-200 rounded-lg p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-600"
                         value={currentTask.startDate}
                         onChange={(e) => setCurrentTask({...currentTask, startDate: e.target.value})}
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                     <div className="relative">
                       <CalendarIcon size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                       <input 
                         type="date" 
                         required
                         className="w-full border border-gray-200 rounded-lg p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-600"
                         value={currentTask.endDate}
                         min={currentTask.startDate}
                         onChange={(e) => setCurrentTask({...currentTask, endDate: e.target.value})}
                       />
                     </div>
                   </div>
                 </div>

                 {/* Category & Assignee */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                       <div className="relative">
                          <input 
                            list="categories"
                            type="text"
                            className="w-full border border-gray-200 rounded-lg p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                            value={currentTask.category}
                            placeholder="Type or Select..."
                            onChange={(e) => setCurrentTask({...currentTask, category: e.target.value})}
                          />
                          <Tag size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                          <datalist id="categories">
                             {uniqueCategories.filter(c => c !== 'All').map(c => (
                               <option key={c} value={c} />
                             ))}
                             <option value="Development" />
                             <option value="Design" />
                             <option value="Marketing" />
                          </datalist>
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assignee</label>
                       <div className="relative">
                         <User size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                         <input 
                           type="text"
                           className="w-full border border-gray-200 rounded-lg p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                           value={currentTask.assignee || ''}
                           placeholder="Assign to..."
                           onChange={(e) => setCurrentTask({...currentTask, assignee: e.target.value})}
                         />
                       </div>
                    </div>
                 </div>
                 
                 {/* Progress */}
                 <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</label>
                      <span className="text-xs font-bold text-indigo-600">{currentTask.progress}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={currentTask.progress}
                      onChange={(e) => setCurrentTask({...currentTask, progress: parseInt(e.target.value)})}
                    />
                 </div>

                 <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-200 transition-all hover:shadow-lg"
                    >
                      Save Task
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
