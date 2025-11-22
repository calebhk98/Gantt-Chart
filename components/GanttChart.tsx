
import React, { useMemo, useRef, useState } from 'react';
import { Task, getCategoryColor } from '../types';
import { Edit2, Trash2, CheckCircle2, Circle, UserCircle2 } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}

const DAY_WIDTH = 50; // Width of one day in pixels

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, onEditTask, onDeleteTask, onToggleComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to normalize date string to Date object (start of day)
  const parseDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const dates = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { min: today, max: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), totalDays: 30 };
    }

    let min = parseDate(tasks[0].startDate).getTime();
    let max = parseDate(tasks[0].endDate).getTime();

    tasks.forEach(t => {
      const start = parseDate(t.startDate).getTime();
      const end = parseDate(t.endDate).getTime();
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Add some buffer
    const minDate = new Date(min - 3 * 24 * 60 * 60 * 1000);
    const maxDate = new Date(max + 7 * 24 * 60 * 60 * 1000);

    const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { min: minDate, max: maxDate, totalDays };
  }, [tasks]);

  // Generate array of days for header
  const timelineDays = useMemo(() => {
    const days = [];
    for (let i = 0; i <= dates.totalDays; i++) {
      const d = new Date(dates.min.getTime() + i * 24 * 60 * 60 * 1000);
      days.push(d);
    }
    return days;
  }, [dates]);

  const getLeftOffset = (dateStr: string) => {
    const d = parseDate(dateStr);
    const diffTime = d.getTime() - dates.min.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
  };

  const getDurationWidth = (startStr: string, endStr: string) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return days * DAY_WIDTH;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Main Container: Split into Sidebar and Scrollable Timeline */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Task List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="h-[60px] border-b border-gray-200 flex items-center px-4 bg-gray-50/80 backdrop-blur-sm sticky top-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task Name</span>
          </div>
          <div className="flex-1 overflow-y-hidden hover:overflow-y-auto scrollbar-thin">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="h-[56px] border-b border-gray-100 flex items-center px-4 hover:bg-gray-50 group transition-colors"
              >
                <button 
                  onClick={() => onToggleComplete(task)}
                  className={`mr-3 transition-colors ${task.progress === 100 ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}
                >
                   {task.progress === 100 ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center">
                      <p className={`text-sm font-medium truncate ${task.progress === 100 ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                  </div>
                  <div className="flex items-center text-[10px] text-gray-400 space-x-2">
                     <span className="truncate">{task.startDate} - {task.endDate}</span>
                     {task.assignee && (
                       <span className="flex items-center text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                         <UserCircle2 size={10} className="mr-1"/>
                         {task.assignee}
                       </span>
                     )}
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-2 space-x-1">
                   <button onClick={() => onEditTask(task)} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"><Edit2 size={14}/></button>
                   <button onClick={() => onDeleteTask(task.id)} className="p-1.5 hover:bg-red-50 rounded-md text-red-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                 <p>No tasks found.</p>
                 <p className="text-xs mt-2 opacity-70">Try adjusting your filters or add a new task.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline */}
        <div 
          className="flex-1 overflow-x-auto overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          ref={containerRef}
        >
          <div 
            className="min-w-full relative"
            style={{ width: `${timelineDays.length * DAY_WIDTH}px` }}
          >
             {/* Header: Dates */}
             <div className="sticky top-0 z-10 bg-gray-50/95 border-b border-gray-200 h-[60px] flex items-end pb-2 shadow-sm backdrop-blur-sm">
                {timelineDays.map((day, i) => {
                  const isFirstOfMonth = day.getDate() === 1 || i === 0;
                  return (
                    <div 
                      key={i} 
                      className="absolute bottom-0 border-l border-gray-200 text-xs text-gray-500 flex flex-col justify-end px-1 pb-1"
                      style={{ 
                        left: i * DAY_WIDTH, 
                        width: DAY_WIDTH,
                        height: '100%' 
                      }}
                    >
                      {isFirstOfMonth && (
                         <span className="absolute top-2 left-1 font-bold text-gray-800 whitespace-nowrap">
                           {day.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                         </span>
                      )}
                      <span className={`text-center block w-full ${[0,6].includes(day.getDay()) ? 'text-gray-400 font-medium' : 'text-gray-600'}`}>
                        {day.getDate()}
                      </span>
                      <span className="text-[9px] text-center block w-full text-gray-400 uppercase font-medium">
                        {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    </div>
                  )
                })}
             </div>

             {/* Grid Background */}
             <div className="absolute top-[60px] left-0 right-0 bottom-0 -z-10">
                {timelineDays.map((day, i) => (
                  <div 
                    key={`grid-${i}`}
                    className={`absolute top-0 bottom-0 border-l ${[0,6].includes(day.getDay()) ? 'bg-gray-50/40 border-gray-100' : 'border-gray-100'}`}
                    style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                  />
                ))}
                {/* Today Line */}
                {(() => {
                   const today = new Date();
                   today.setHours(0,0,0,0);
                   const diff = today.getTime() - dates.min.getTime();
                   if (diff >= 0) {
                     const offset = Math.floor(diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
                     if (offset < timelineDays.length * DAY_WIDTH) {
                        return (
                           <div 
                             className="absolute top-0 bottom-0 border-l-2 border-red-500 z-0 pointer-events-none opacity-60"
                             style={{ left: offset + (DAY_WIDTH/2) }}
                           >
                             <div className="absolute -top-1 -left-[3px] w-[8px] h-[8px] rounded-full bg-red-500"/>
                           </div>
                        )
                     }
                   }
                   return null;
                })()}
             </div>

             {/* Task Rows (Bars) */}
             <div className="pt-0">
                {tasks.map((task, i) => {
                  const left = getLeftOffset(task.startDate);
                  const width = getDurationWidth(task.startDate, task.endDate);
                  const color = getCategoryColor(task.category);

                  return (
                    <div 
                      key={task.id}
                      className="h-[56px] border-b border-transparent flex items-center relative group"
                    >
                       {/* The Task Bar */}
                       <div 
                         className={`h-7 rounded-full shadow-sm absolute cursor-pointer flex items-center overflow-visible transition-all hover:shadow-lg hover:scale-[1.01] ${color}`}
                         style={{ left, width: Math.max(width - 10, 10) }}
                         onClick={() => onEditTask(task)}
                       >
                          {/* Progress Bar Fill */}
                          <div 
                            className="h-full bg-black/20 rounded-l-full absolute top-0 left-0"
                            style={{ 
                                width: `${task.progress}%`,
                                borderTopRightRadius: task.progress === 100 ? '9999px' : '0',
                                borderBottomRightRadius: task.progress === 100 ? '9999px' : '0'
                            }}
                          />
                          
                          {/* Label inside bar if wide enough, otherwise sticky or invisible? Just simple label for now */}
                          <div className="relative px-3 text-xs font-semibold text-white whitespace-nowrap truncate drop-shadow-sm z-10">
                             {width > 60 ? task.title : ''}
                          </div>

                          {/* Improved Tooltip / Popover */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-gray-100 z-50 flex flex-col items-center min-w-[140px]">
                             <p className="font-bold text-sm mb-1">{task.title}</p>
                             <div className="flex items-center space-x-2 text-gray-500">
                                <span>{task.progress}% done</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{task.category}</span>
                             </div>
                             {task.assignee && (
                                <div className="mt-1.5 flex items-center bg-gray-50 px-2 py-1 rounded-full text-[10px] font-medium text-gray-600">
                                  <UserCircle2 size={10} className="mr-1" /> {task.assignee}
                                </div>
                             )}
                             {/* Little Arrow */}
                             <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
