import { useState } from 'react';
import { Camera, Mail, Phone, User, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useProfile from '../../hooks/useProfile';
import { getInitials } from '../../utils/helpers';

export default function ProfileForm({ profile, onCancel }) {
  const { updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phoneNumber: profile?.phoneNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateProfile(formData);
      toast.success('Profile updated!');
      onCancel(); // Close form on success
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text">Edit Profile</h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start gap-8">
          {/* Avatar Edit */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-accent-purple/10 flex items-center justify-center text-3xl font-bold text-accent-purple border-4 border-bg overflow-hidden">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(profile?.name || '?')
              )}
            </div>
            <button 
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent-purple text-white border-2 border-bg flex items-center justify-center hover:bg-accent-purple-light transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent-purple transition-colors"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative opacity-60 cursor-not-allowed">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-text"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent-purple transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
