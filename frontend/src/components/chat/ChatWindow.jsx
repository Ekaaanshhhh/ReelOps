import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatWindow({
  channelName,
  memberCount,
  messages,
  isLoading,
  onSendMessage,
  isConnected
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] bg-bg border border-border rounded-xl overflow-hidden shadow-sm">
      <ChatHeader channelName={channelName} memberCount={memberCount} />
      
      {/* If socket disconnected unexpectedly, show a small warning banner */}
      {!isConnected && !isLoading && (
        <div className="bg-danger/10 border-b border-danger/20 text-danger px-4 py-2 text-xs text-center font-medium">
          Disconnected from chat server. Reconnecting...
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      
      <ChatInput onSendMessage={onSendMessage} disabled={!isConnected} />
    </div>
  );
}
