import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, MapPin, Phone, Mail, Save, Loader } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    jobTitle: '',
    department: '',
    organization: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setFormData(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Only send the editable profile fields, not username/email
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        jobTitle: formData.jobTitle,
        department: formData.department,
        organization: formData.organization
      };
      
      console.log('Sending profile update:', profileData);
      const response = await api.put('/users/profile', profileData);
      console.log('Profile update response:', response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update profile.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-white flex items-center justify-center h-full"><Loader className="animate-spin mr-2" /> Loading Profile...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'}`}>
            {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Personal Details Section */}
        <section className="card">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-primary-400" /> 
                Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-400 text-sm mb-1">First Name</label>
                    <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Last Name</label>
                    <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Email <span className="text-xs text-slate-600">(Read-only)</span></label>
                    <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-3 text-slate-400 cursor-not-allowed">
                        <Mail size={16} className="mr-2 opacity-50" />
                        {formData.email}
                    </div>
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Phone</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3.5 text-slate-500" />
                        <input 
                            type="text" 
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Location</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3.5 text-slate-500" />
                        <input 
                            type="text" 
                            name="location"
                            value={formData.location || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="col-span-full">
                    <label className="block text-slate-400 text-sm mb-1">Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none h-24 resize-none"
                        placeholder="Tell us a little about yourself..."
                    />
                </div>
            </div>
        </section>

        {/* Professional Details Section */}
        <section className="card">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-secondary-400" /> 
                Professional Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Job Title</label>
                    <input 
                        type="text" 
                        name="jobTitle"
                        value={formData.jobTitle || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-slate-400 text-sm mb-1">Department</label>
                    <input 
                        type="text" 
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary-500 focus:outline-none"
                    />
                </div>
                <div className="col-span-full">
                    <label className="block text-slate-400 text-sm mb-1">Organization</label>
                    <input 
                        type="text" 
                        name="organization"
                        value={formData.organization || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-secondary-500 focus:outline-none"
                    />
                </div>
            </div>
        </section>

        <div className="flex justify-end">
            <button 
                type="submit" 
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
            >
                {saving ? (
                    <>
                        <Loader className="animate-spin" size={20} />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={20} />
                        Save Changes
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
