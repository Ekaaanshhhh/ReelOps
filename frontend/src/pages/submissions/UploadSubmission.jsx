import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadDropzone from '../../components/submissions/UploadDropzone';
import { submissionAPI } from '../../api/submission.api';
import { aiAPI } from '../../api/ai.api';
import { PLATFORMS } from '../../utils/constants';
import useChannel from '../../hooks/useChannel';
import { getErrorMessage } from '../../utils/helpers';
import GenerateAIButton from '../../components/ai/GenerateAIButton';
import AICaptionPanel from '../../components/ai/AICaptionPanel';

/**
 * UploadSubmission — upload a video to a specific channel.
 * Includes drag-and-drop, metadata form, and AI metadata generation.
 */
export default function UploadSubmission() {
  const { channelId } = useParams();
  const { activeChannel } = useChannel();
  const navigate = useNavigate();

  // Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('');
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiData, setAiData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !platform) return;

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('platform', platform);

      await submissionAPI.uploadSubmission(channelId, formData, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(pct);
      });

      toast.success('Submission uploaded successfully!');
      navigate(`/channels/${channelId}/submissions`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      setUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!title || !platform) {
      toast.error('Please enter a title and select a platform first.');
      setAiError('Please enter a title and select a platform first.');
      return;
    }

    setAiError('');
    setAiLoading(true);

    try {
      const result = await aiAPI.generateMetadata({
        title,
        description,
        platform
      });
      setAiData(result.data);
    } catch (err) {
      setAiError(getErrorMessage(err));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectCaption = (selectedCaption) => {
    setTitle(selectedCaption); // REPLACES the title
  };

  const handleSelectDescription = (selectedDescription) => {
    setDescription(selectedDescription); // REPLACES the description
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/channels/${channelId}`)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {activeChannel?.name || 'channel'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Upload Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h1 className="text-xl font-bold font-heading text-text mb-1">Upload Submission</h1>
            <p className="text-sm text-text-muted mb-6">
              Upload a video to <span className="text-text font-medium">{activeChannel?.name || 'this channel'}</span>
            </p>

            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Video File</label>
                <UploadDropzone
                  file={file}
                  onFileSelect={setFile}
                  onClear={() => setFile(null)}
                  uploading={uploading}
                  progress={progress}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Title / Caption</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video a title or caption"
                  required
                  minLength={3}
                  maxLength={150}
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Description <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description, hashtags, or extra context…"
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl text-text text-sm
                             placeholder:text-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/30
                             resize-none"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Platform</label>
                <div className="flex gap-3">
                  {PLATFORMS.map((p) => {
                    const isInstagram = p.id === 'INSTAGRAM';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={isInstagram}
                        onClick={() => setPlatform(p.id)}
                        className={`relative flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-center
                          ${platform === p.id
                            ? 'border-accent-purple bg-accent-purple/10 text-accent-purple-light'
                            : 'border-border bg-bg-secondary text-text-secondary hover:border-border-light hover:text-text'
                          }
                          ${isInstagram ? 'opacity-60 cursor-not-allowed hover:border-border hover:text-text-secondary' : ''}
                        `}
                      >
                        <span className={isInstagram ? 'blur-[1px] opacity-80' : ''}>
                          {p.name}
                        </span>
                        {isInstagram && (
                          <span className="absolute top-1.5 right-1.5 text-[8px] font-bold uppercase tracking-wider text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded shadow-sm border border-accent-purple/20">
                            Coming Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-2 flex flex-col gap-3 border-t border-border mt-4">
                {/* Generate AI Button */}
                <GenerateAIButton 
                  onClick={handleGenerateAI}
                  loading={aiLoading}
                  disabled={uploading || !title || !platform}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={uploading || !file || !title || !platform}
                  className="w-full py-3 rounded-xl font-medium text-sm text-white gradient-bg
                             hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-opacity flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading… {Math.round(progress)}%
                    </>
                  ) : (
                    'Upload Submission'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: AI Panel */}
          <div className="h-full">
             <AICaptionPanel 
                loading={aiLoading}
                error={aiError}
                aiData={aiData}
                onSelectCaption={handleSelectCaption}
                onSelectDescription={handleSelectDescription}
                onRegenerate={handleGenerateAI}
             />
          </div>

        </div>
      </motion.div>
    </div>
  );
}
