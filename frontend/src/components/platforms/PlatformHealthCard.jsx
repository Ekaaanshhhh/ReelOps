import { Activity, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PlatformHealthCard({ healthData }) {
  if (!healthData) return null;

  const isHealthy = healthData.connected && healthData.tokenValid;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-text-muted" />
        <h4 className="text-sm font-semibold text-text">Connection Health</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-text-muted mb-1">Status</p>
          <div className="flex items-center gap-1.5">
            {isHealthy ? (
              <CheckCircle className="w-3.5 h-3.5 text-accent-cyan" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-danger" />
            )}
            <span className="text-sm font-medium text-text">
              {isHealthy ? 'Healthy' : 'Failing'}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-text-muted mb-1">Token Valid</p>
          <p className="text-sm font-medium text-text">
            {healthData.tokenValid ? 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-muted mb-1">OAuth State</p>
          <p className="text-sm font-medium text-text">{healthData.oauthStatus}</p>
        </div>

        <div>
          <p className="text-xs text-text-muted mb-1">Last Verified</p>
          <p className="text-sm font-medium text-text">Just now</p>
        </div>

        {healthData.lastSuccessfulUpload && (
          <div>
            <p className="text-xs text-text-muted mb-1">Last Successful Upload</p>
            <p className="text-sm font-medium text-accent-cyan">
              {formatDistanceToNow(new Date(healthData.lastSuccessfulUpload), { addSuffix: true })}
            </p>
          </div>
        )}

        {healthData.lastUploadError && (
          <div className="col-span-2 md:col-span-4 mt-2">
            <p className="text-xs text-text-muted mb-1">Last Upload Error</p>
            <div className="bg-danger/10 text-danger text-xs p-3 rounded-lg border border-danger/20">
              <span className="font-semibold">{formatDistanceToNow(new Date(healthData.lastUploadError.date), { addSuffix: true })}:</span> {healthData.lastUploadError.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
