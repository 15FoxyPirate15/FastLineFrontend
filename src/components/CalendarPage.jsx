import React from 'react';
import { CalendarDays } from 'lucide-react';

const CalendarPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <CalendarDays size={64} className="text-blue-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Calendar & Schedule</h2>
    <p className="text-gray-400 max-w-md">Plan your meetings and deadlines. Stay organized.</p>
  </div>
);
export default CalendarPage;