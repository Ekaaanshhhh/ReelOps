import { useState, useEffect } from 'react';
import useProfile from '../../hooks/useProfile';
import ProfileCard from '../../components/profile/ProfileCard';
import ProfileForm from '../../components/profile/ProfileForm';
import ConnectedPlatformsSection from '../../components/profile/ConnectedPlatformsSection';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, loading, fetchProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading && !profile) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-text mb-2">Profile & Settings</h1>
        <p className="text-text-secondary">Manage your personal information and connected accounts.</p>
      </div>

      <div className="space-y-12">
        {/* Section 1: User Profile */}
        <section>
          {isEditing ? (
            <ProfileForm profile={profile} onCancel={() => setIsEditing(false)} />
          ) : (
            <ProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
          )}
        </section>

        {/* Section 2: Connected Platforms */}
        <section>
          <ConnectedPlatformsSection />
        </section>
      </div>
    </div>
  );
}
