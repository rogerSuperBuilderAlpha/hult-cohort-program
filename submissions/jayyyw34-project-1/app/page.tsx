'use client';

import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  status: 'Todo' | 'In Progress' | 'Shipped';
}

export default function Home() {
  const teamMembers = ['Jayden', 'Alex', 'Sarah'];
  const projects = ['Phase 1 Core API', 'Marketing Page', 'Auth Integration'];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [selectedAssignee, setSelectedAssignee] = useState(teamMembers[0]);

  // Gamification states for reward signals
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Failed loading tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const totalTasks = tasks.length;
  const shippedTasks = tasks.filter(t => t.status === 'Shipped').length;
  const completionPercentage = totalTasks > 0 ? Math.round((shippedTasks / totalTasks) * 100) : 0;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      project: selectedProject,
      assignee: selectedAssignee,
      status: 'Todo',
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD', task }),
      });
      if (res.ok) {
        setTasks([...tasks, task]);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const advanceStatus = async (taskId: string, currentStatus: Task['status']) => {
    const nextStatusMap: Record<Task['status'], Task['status']> = {
      'Todo': 'In Progress',
      'In Progress': 'Shipped',
      'Shipped': 'Todo'
    };
    const nextStatus = nextStatusMap[currentStatus];

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', id: taskId, status: nextStatus }),
      });
      if (res.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: nextStatus } : task
        ));

        // Trigger visual reward signal if a task was successfully Shipped!
        if (nextStatus === 'Shipped') {
          const motivations = [
            '🔥 Incredible work! Keep that momentum going!',
            '🚀 Another milestone cleared! You are crushing this phase!',
            '⚡ Dopamine hit unlocked! High-five your squad!',
            '🏆 Boom! Task shipped successfully!'
          ];
          setCelebrationMessage(motivations[Math.floor(Math.random() * motivations.length)]);
          setShowCelebration(true);
          
          // Auto-hide celebration banner after 3.5 seconds
          setTimeout(() => setShowCelebration(false), 3500);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12 relative overflow-x-hidden">
      
      {/* Dynamic Celebration Reward Signal Banner */}
      {showCelebration && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-2xl border border-emerald-400 text-white flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-spin">✨</span>
            <div>
              <h4 className="font-bold text-sm">MISSION ACCOMPLISHED</h4>
              <p className="text-xs text-emerald-50 opacity-90">{celebrationMessage}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCelebration(false)} 
            className="text-white hover:text-emerald-200 font-bold px-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-2">
            🚀 ShipStation <span className="text-xs bg-indigo-500/20 text-indigo-400 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">v1.1</span>
          </h1>
          <p className="text-slate-400">Welcome back, team! Let's hit our phase milestones.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">Active:</span>
          <div className="flex gap-1.5">
            {teamMembers.map(member => (
              <span key={member} className={`text-xs font-medium px-2.5 py-1 rounded-md ${member === 'Jayden' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {member}
              </span>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="max-w-6xl mx-auto text-center py-20 text-slate-400 font-medium">
          📡 Establishing data stream...
        </div>
      ) : (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls & Metrics */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 p-6 rounded-2xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
              {showCelebration && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
              )}
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                🔥 Cohort Momentum
              </h2>
              <p className="text-xs text-indigo-200/70 mb-4">Keep shipping to trigger dopamine signals.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-300">Total Completion</span>
                  <span className="text-indigo-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/30">
                    <div className="text-xl font-bold text-emerald-400">{shippedTasks}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Shipped</div>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/30">
                    <div className="text-xl font-bold text-amber-400">{totalTasks - shippedTasks}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h2 className="text-base font-bold text-white mb-4">Deploy New Objective</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Task Objective</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Implement dark mode toggle" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project</label>
                    <select 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-slate-300 focus:outline-none"
                    >
                      {projects.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Assign To</label>
                    <select 
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-slate-300 focus:outline-none"
                    >
                      {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition shadow-lg shadow-indigo-600/10 mt-2"
                >
                  + Initialize Task
                </button>
              </form>
            </div>
          </div>

          {/* Kanban Boards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {(['Todo', 'In Progress', 'Shipped'] as const).map(columnStatus => {
              const columnTasks = tasks.filter(t => t.status === columnStatus);
              
              return (
                <div key={columnStatus} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 min-h-[400px]">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      columnStatus === 'Todo' ? 'text-slate-400 bg-slate-800' :
                      columnStatus === 'In Progress' ? 'text-amber-400 bg-amber-500/10' :
                      'text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {columnStatus}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{columnTasks.length}</span>
                  </div>

                  <div className="space-y-3">
                    {columnTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 group relative ${
                          task.status === 'Shipped' 
                            ? 'bg-slate-800/20 border-emerald-500/20 opacity-70 hover:opacity-100' 
                            : 'bg-slate-800 border-slate-700/60 hover:border-slate-600 shadow-md'
                        }`}
                        onClick={() => advanceStatus(task.id, task.status)}
                      >
                        <p className={`text-sm font-semibold mb-2 text-slate-100 ${task.status === 'Shipped' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800 max-w-[120px] truncate">
                            {task.project}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md ${task.assignee === 'Jayden' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' : 'bg-slate-900 text-slate-400'}`}>
                            👤 {task.assignee}
                          </span>
                        </div>

                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 text-[10px] font-bold text-indigo-400 transition-opacity">
                          {task.status === 'Todo' && 'Start ➔'}
                          {task.status === 'In Progress' && 'Ship 🚀'}
                          {task.status === 'Shipped' && 'Reopen ↺'}
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-600 italic border border-dashed border-slate-800 rounded-xl">
                        Empty Segment
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}