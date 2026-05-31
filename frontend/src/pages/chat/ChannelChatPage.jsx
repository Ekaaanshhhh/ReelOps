import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChannel from '../../hooks/useChannel';
import { connectSocket, getSocket } from '../../socket/socket';
import { getChannelMessages } from '../../api/chat.api';
import ChatWindow from '../../components/chat/ChatWindow';

export default function ChannelChatPage() {
  const { channelId } = useParams();
  const { activeChannel, channelMembers } = useChannel();
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let socket;
    let isMounted = true;
    
    const initializeChat = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Fetch historical messages via REST
        const response = await getChannelMessages(channelId, 1, 50);
        // Reverse because REST returns newest first, but UI needs newest at bottom
        setMessages(response.messages.reverse());
        
        if (!isMounted) return;
        
        // 2. Connect to Socket.IO
        const token = localStorage.getItem('reelops_token');
        socket = connectSocket(token);
        
        if (socket) {
          // Listeners
          const onConnect = () => setIsConnected(true);
          const onDisconnect = () => setIsConnected(false);
          const onMessageReceived = (newMessage) => {
            setMessages((prev) => {
              // Prevent duplicate messages if listener fires multiple times
              if (prev.some((msg) => msg._id === newMessage._id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          };

          // Always clean up old listeners before adding new ones to prevent duplicates
          socket.off('connect');
          socket.off('disconnect');
          socket.off('message_received');

          socket.on('connect', onConnect);
          socket.on('disconnect', onDisconnect);
          socket.on('message_received', onMessageReceived);
          
          // Join the specific channel room
          socket.emit('join_channel', { channelId }, (res) => {
            if (!res.success) {
              setError(res.error);
            }
          });
          
          // If already connected when effect runs
          if (socket.connected) {
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (channelId) {
      initializeChat();
    }

    // Cleanup on unmount or channel change
    return () => {
      isMounted = false;
      const s = socket || getSocket();
      if (s) {
        s.off('connect');
        s.off('disconnect');
        s.off('message_received');
      }
    };
  }, [channelId]);

  const handleSendMessage = (content) => {
    const socket = getSocket();
    if (socket && isConnected) {
      socket.emit('send_message', { channelId, content }, (res) => {
        if (!res.success) {
          console.error("Failed to send message:", res.error);
        }
      });
    }
  };

  return (
    <div className="h-full">
      {error && (
        <div className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
          {error}
        </div>
      )}
      
      <ChatWindow
        channelName={activeChannel?.name}
        memberCount={channelMembers?.length}
        messages={messages}
        isLoading={isLoading}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
