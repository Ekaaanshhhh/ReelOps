import { useState } from 'react';
import { Camera, Mail, Phone, User, Edit2 } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

export default function ProfileCard({ profile, onEdit }) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-accent-purple/10 flex items-center justify-center text-3xl font-bold text-accent-purple border-4 border-bg overflow-hidden">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(profile?.name || '?')
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-accent-purple hover:border-accent-purple transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold font-heading text-text mb-1">{profile?.name}</h2>
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="w-4 h-4 text-text-muted" />
                {profile?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone className="w-4 h-4 text-text-muted" />
                {profile?.phoneNumber || <span className="text-text-muted italic">No phone number added</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg border border-border text-sm font-medium hover:bg-card-hover transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
