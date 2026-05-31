import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Share2, Shield, Info } from 'lucide-react';
import useChannel from '../../hooks/useChannel';
import ChannelPlatformsView from './ChannelPlatformsView';

export default function ChannelSettingsPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeChannel } = useChannel();
  
  const [activeTab, setActiveTab] = useState('general');

  // Parse tab from URL hash if present
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['general', 'platforms', 'roles'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/channels/${channelId}/settings#${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'platforms', label: 'Platforms', icon: Share2 },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-text">Channel Settings</h1>
            <p className="text-sm text-text-muted">
              Manage configuration and integrations for {activeChannel?.name || 'this channel'}.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar / Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-left
                    ${isActive 
                      ? 'bg-card border border-border/50 text-text shadow-sm' 
                      : 'text-text-secondary hover:text-text hover:bg-card-hover'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-purple' : ''}`} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card border border-border/50 rounded-2xl p-6 lg:p-8">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-1">General Settings</h3>
                  <p className="text-sm text-text-muted">Manage basic channel information.</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-secondary border border-border/50">
                  <p className="text-sm text-text-secondary">General settings are currently under development.</p>
                </div>
              </div>
            )}

            {activeTab === 'platforms' && (
              <ChannelPlatformsView />
            )}

            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-1">Roles & Permissions</h3>
                  <p className="text-sm text-text-muted">Manage who can do what in this channel.</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-secondary border border-border/50">
                  <p className="text-sm text-text-secondary">Role management is currently under development.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
