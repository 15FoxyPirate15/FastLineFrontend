import React from 'react';
import { PhoneCall } from 'lucide-react';

const CallsPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <PhoneCall size={64} className="text-green-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Scheduled Calls</h2>
    <p className="text-gray-400 max-w-md">Review upcoming and past voice/video calls.</p>
  </div>
);
export default CallsPage;