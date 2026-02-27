import React from 'react';
import { Video } from 'lucide-react';

const MeetingsPage = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-white text-center animate-message">
    <Video size={64} className="text-red-400 mb-6" />
    <h2 className="text-3xl font-bold mb-3">Saved Meetings</h2>
    <p className="text-gray-400 max-w-md">Access recordings and summaries of your meetings.</p>
  </div>
);
export default MeetingsPage;