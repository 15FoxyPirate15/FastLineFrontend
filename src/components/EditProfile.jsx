import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, Briefcase, Hash, Save } from 'lucide-react';

const EditProfile = ({ onBack, currentUser, onSave }) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    age: currentUser?.age || '',
    dob: currentUser?.dob || '',
    job: currentUser?.job || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-r from-[#373185] to-[#171d40] text-white overflow-y-auto custom-scrollbar">
      
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#11111e]/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
            <button 
                onClick={onBack} 
                className="p-2 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <h2 className="font-bold text-lg">Edit Profile</h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#1e1b2e] border border-white/5 rounded-3xl p-8 shadow-2xl">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg border-4 border-[#2d346a]">
                {formData.name?.[0] || 'U'}
            </div>
            <h3 className="text-xl font-semibold">{formData.name || 'User Name'}</h3>
            <p className="text-purple-400 text-sm">{formData.job || 'Position'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
                <label className="text-sm text-gray-400 ml-1">Full Name</label>
                <div className="flex items-center bg-[#131320] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-colors">
                    <User size={18} className="text-gray-500 mr-3" />
                    <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="bg-transparent outline-none flex-1 text-white text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Age</label>
                    <div className="flex items-center bg-[#131320] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-colors">
                        <Hash size={18} className="text-gray-500 mr-3" />
                        <input 
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="25"
                            className="bg-transparent outline-none flex-1 text-white text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Date of Birth</label>
                    <div className="flex items-center bg-[#131320] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-colors">
                        <Calendar size={18} className="text-gray-500 mr-3" />
                        <input 
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="bg-transparent outline-none flex-1 text-white text-sm [color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400 ml-1">Position</label>
                <div className="flex items-center bg-[#131320] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-colors">
                    <Briefcase size={18} className="text-gray-500 mr-3" />
                    <input 
                        type="text"
                        name="job"
                        value={formData.job}
                        onChange={handleChange}
                        placeholder="e.g. Frontend Developer"
                        className="bg-transparent outline-none flex-1 text-white text-sm"
                    />
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-6"
            >
                <Save size={18} />
                Save Changes
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;