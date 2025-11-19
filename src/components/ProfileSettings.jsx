import React, { useState } from 'react';
import { User, Briefcase, AtSign, Save } from 'lucide-react';

const ProfileSettings = ({ currentUser, updateProfile }) => {
  const [formData, setFormData] = useState(currentUser);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-8 animate-message">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
        
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-xs text-gray-400 ml-1 mb-1 block">Display Name</label>
            <div className="flex items-center bg-black/30 rounded-xl p-3 border border-white/5">
              <User size={18} className="text-gray-500 mr-3"/>
              <input name="name" value={formData.name} onChange={handleChange} className="bg-transparent w-full outline-none text-sm"/>
            </div>
          </div>

          {/* Job Input */}
          <div>
            <label className="text-xs text-gray-400 ml-1 mb-1 block">Job Title</label>
            <div className="flex items-center bg-black/30 rounded-xl p-3 border border-white/5">
              <Briefcase size={18} className="text-gray-500 mr-3"/>
              <input name="job" value={formData.job} onChange={handleChange} className="bg-transparent w-full outline-none text-sm"/>
            </div>
          </div>

          {/* Handle Input */}
          <div>
             <label className="text-xs text-gray-400 ml-1 mb-1 block">Username (@)</label>
            <div className="flex items-center bg-black/30 rounded-xl p-3 border border-white/5">
              <AtSign size={18} className="text-gray-500 mr-3"/>
              <input name="handle" value={formData.handle} onChange={handleChange} className="bg-transparent w-full outline-none text-sm"/>
            </div>
          </div>

           <button 
             onClick={() => updateProfile(formData)}
             className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-4 transition"
           >
             <Save size={18}/> Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;