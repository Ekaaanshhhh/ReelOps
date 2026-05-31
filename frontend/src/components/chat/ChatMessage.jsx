import { getInitials } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';

export default function ChatMessage({ message }) {
  const { user } = useAuth();
  const isOwnMessage = message.sender._id === user._id;

  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[85%] lg:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-auto mb-1">
          {message.sender.profilePicture ? (
            <img
              src={message.sender.profilePicture}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white
              ${isOwnMessage ? 'bg-accent-purple' : 'bg-surface-elevated border border-border text-text'}`}>
              {getInitials(message.sender.name)}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-sm font-medium text-text">{isOwnMessage ? 'You' : message.sender.name}</span>
            <span className="text-[10px] text-text-muted">{timeString}</span>
          </div>
          <div
            className={`px-4 py-2 rounded-2xl whitespace-pre-wrap break-words text-sm
              ${isOwnMessage
                ? 'bg-accent-purple text-white rounded-br-none'
                : 'bg-surface-elevated border border-border text-text rounded-bl-none'
              }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
