import React, { useState, useEffect } from 'react';
import { Timer, Bell, CheckCircle2, ListTodo, Moon, Sun, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Stats {
  completedSessions: number;
  totalStudyTime: number;
}

function App() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState('');
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('stats');
    return saved ? JSON.parse(saved) : { completedSessions: 0, totalStudyTime: 0 };
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
      if (!isBreak) {
        setStats(prev => ({
          completedSessions: prev.completedSessions + 1,
          totalStudyTime: prev.totalStudyTime + 25
        }));
        setIsBreak(true);
        setTime(5 * 60); // 5 minute break
      } else {
        setIsBreak(false);
        setTime(25 * 60); // Back to 25 minutes
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, time, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(isBreak ? 5 * 60 : 25 * 60);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 dark:text-white">
            <Timer className="w-8 h-8" />
            Smart Study Buddy
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-700" />}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-center">
                <h2 className="text-6xl font-mono font-bold mb-4 dark:text-white">
                  {formatTime(time)}
                </h2>
                <p className="text-lg mb-4 text-gray-600 dark:text-gray-300">
                  {isBreak ? 'Break Time!' : 'Focus Session'}
                </p>
                <div className="space-x-4">
                  <button
                    onClick={toggleTimer}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isActive ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-6 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <CheckCircle2 className="w-5 h-5" />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Completed Sessions</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.completedSessions}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalStudyTime} min</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <ListTodo className="w-5 h-5" />
              Tasks
            </h3>
            <form onSubmit={addTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span
                    className={`flex-1 dark:text-white ${
                      task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;