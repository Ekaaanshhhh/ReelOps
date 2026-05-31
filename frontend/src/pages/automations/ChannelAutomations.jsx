import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Trash2, ExternalLink, Loader2, PlayCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { automationAPI } from '../../api/automation.api';
import useChannel from '../../hooks/useChannel';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { PLATFORMS } from '../../utils/constants';
import AutomationExecutionModal from '../../components/automation/AutomationExecutionModal';

export default function ChannelAutomations() {
  const { channelId } = useParams();
  const { isOwner, activeChannel } = useChannel();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExecution, setSelectedExecution] = useState(null);

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await automationAPI.getChannelAutomations(channelId);
      setAutomations(result.automations || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this automation?')) return;
    try {
      await automationAPI.cancelAutomation(id);
      toast.success('Automation cancelled');
      fetchAutomations(); // Refresh list
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this automation record?')) return;
    try {
      await automationAPI.deleteAutomation(id);
      toast.success('Automation deleted');
      fetchAutomations(); // Refresh list
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text flex items-center gap-2">
              <Calendar className="w-6 h-6 text-accent-purple" />
              Automations
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage scheduled content for {activeChannel?.name || 'this channel'}.
            </p>
          </div>
        </div>

        {automations.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text">No Scheduled Content Yet</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              Approve a submission to create your first automation.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {automations.map((automation) => {
              const platform = PLATFORMS.find(p => p.id === automation.platform);
              const isCancelled = automation.status === 'CANCELLED';
              const isPast = new Date(automation.scheduledAt) < new Date() && !isCancelled;

              return (
                <div key={automation._id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-colors hover:border-border-light">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-40 aspect-video bg-bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative">
                    {automation.submission?.thumbnailUrl ? (
                      <img 
                        src={automation.submission.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                    {automation.submission?.videoUrl && (
                      <a 
                        href={automation.submission.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-md bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        title="View Video"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {platform && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${platform.color}15`, color: platform.color }}>
                          {platform.name}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
                        isCancelled ? 'bg-danger/10 text-danger' : 
                        automation.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        automation.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                        isPast ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-purple/10 text-accent-purple'
                      }`}>
                        {isCancelled ? 'Cancelled' : 
                         automation.status === 'COMPLETED' ? 'Published' :
                         automation.status === 'FAILED' ? 'Failed' :
                         isPast ? 'Processing' : 'Scheduled'}
                      </span>
                    </div>

                    <Link to={`/channels/${channelId}/automations/${automation._id}`} className="text-lg font-bold text-text hover:text-accent-purple transition-colors truncate block mb-1">
                      {automation.submission?.title || 'Unknown Submission'}
                    </Link>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary mb-2">
                      <span className="flex items-center gap-1.5 font-medium text-text">
                        <Clock className="w-3.5 h-3.5 text-accent-purple" />
                        {formatDateTime(automation.scheduledAt)}
                      </span>
                      <span>•</span>
                      <span>Source: {automation.scheduleSource}</span>
                      <span>•</span>
                      <span>By {automation.createdBy?.name || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <Link to={`/channels/${channelId}/automations/${automation._id}`} className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text transition-colors">
                        View Log &rarr;
                      </Link>
                      
                      {automation.latestExecution && (
                        <button 
                          onClick={() => setSelectedExecution(automation.latestExecution)}
                          className="text-xs font-medium text-accent-cyan hover:text-accent-cyan-light transition-colors"
                        >
                          Execution Details
                        </button>
                      )}

                      {automation.latestExecution?.platformVideoUrl && (
                        <a 
                          href={automation.latestExecution.platformVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#FF0000] hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View on YouTube
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner && (
                    <div className="sm:ml-auto w-full sm:w-auto flex-shrink-0 flex gap-2">
                      {!isPast && !isCancelled && (
                        <button
                          onClick={() => handleCancel(automation._id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-text-secondary bg-bg-secondary hover:bg-card-hover transition-colors flex items-center justify-center gap-2"
                        >
                          Cancel
                        </button>
                      )}
                      
                      {(isCancelled || automation.status === 'COMPLETED' || automation.status === 'FAILED') && (
                        <button
                          onClick={() => handleDelete(automation._id)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
      
      {selectedExecution && (
        <AutomationExecutionModal
          isOpen={!!selectedExecution}
          onClose={() => setSelectedExecution(null)}
          execution={selectedExecution}
        />
      )}
    </div>
  );
}
