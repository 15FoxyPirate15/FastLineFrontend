import React from 'react';
import { ListTodo } from 'lucide-react';

const TasksPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <ListTodo size={64} className="text-purple-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Tasks Manager</h2>
    <p className="text-gray-400 max-w-md">Manage your project tasks efficiently. Coming soon!</p>
  </div>
);
export default TasksPage;