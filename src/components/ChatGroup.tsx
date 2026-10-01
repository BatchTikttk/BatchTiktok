import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Send, MessageSquare, X, User, Loader2, LogIn, Smile, CheckCircle2 } from 'lucide-react';

interface ChatGroupProps {
  currentUser: string | null;
  setShowLoginModal: () => void;
}

interface Message {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_admin: boolean;
}

// Map Emoticon 3D WebP Bergerak (Google Noto 3D)
const EMOJI_MAP: Record<string, string> = {
  '😀': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp',
  '😂': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.webp',
  '🥰': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp',
  '😎': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.webp',
  '🥺': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f97a/512.webp',
  '😭': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/512.webp',
  '😡': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/512.webp',
  '👍': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp',
  '🙏': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f/512.webp',
  '✨': 'https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.webp',
  '🔥': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp',
  '🎉': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.webp',
  '👋': 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp',
};

const EMOJI_LIST = Object.entries(EMOJI_MAP).map(([char, src]) => ({ char, src }));

export default function ChatGroup({ currentUser, setShowLoginModal }: ChatGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch profiles data
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin');
    if (!error && data) {
      setProfiles(data);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
    scrollToBottom();
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      fetchMessages();
    }
  }, [isOpen]);

  // Combined Realtime Subscription
  useEffect(() => {
    if (!isOpen) return;

    const channelName = `group-chat-room-${Date.now()}`;
    const chatChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!currentUser) {
      setShowLoginModal();
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { error } = await supabase.from('group_messages').insert([
      {
        user_id: userId,
        username: currentUser,
        message: messageText,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const onEmojiClick = (emojiChar: string) => {
    setNewMessage((prev) => prev + emojiChar);
    setShowEmojiPicker(false);
  };

  // Parser pikeun ngarobah emoji teks jadi gambar WebP 3D nu bergerak di jero gelembung chat
  const renderMessageWith3DEmojis = (text: string) => {
    const emojiRegex = new RegExp(`(${Object.keys(EMOJI_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const parts = text.split(emojiRegex);

    return parts.map((part, index) => {
      if (EMOJI_MAP[part]) {
        return (
          <img
            key={index}
            src={EMOJI_MAP[part]}
            alt={part}
            className="w-6 h-6 inline-block mx-0.5 align-middle object-contain"
          />
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold"
        >
          <MessageSquare size={20} className="fill-current" />
          <span>Global Chat</span>
        </button>
      )}

      {/* Chat Box (Light Theme) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 relative">
                <MessageSquare size={18} className="fill-current opacity-20 absolute" />
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Global Group Chat</h3>
                <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime Sync
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-sm font-medium">
                <Loader2 size={18} className="animate-spin text-emerald-500" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                {/* 3D Animated Waving Hand WebP */}
                <img
                  src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp"
                  alt="3D Animated Waving Hand"
                  className="w-20 h-20 mb-3 object-contain drop-shadow-md select-none pointer-events-none"
                />
                <h4 className="text-sm font-bold text-slate-700 mb-1">No messages yet</h4>
                <p className="text-[11.5px] text-slate-500 font-medium">Send the first message to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && msg.username.toLowerCase() === currentUser.toLowerCase();
                const senderProfile = profiles.find((p) => p.id === msg.user_id);

                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1">
                      {senderProfile?.avatar_url ? (
                        <img
                          src={senderProfile.avatar_url}
                          alt={msg.username}
                          className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 shadow-sm">
                          <User size={14} />
                        </div>
                      )}
                    </div>

                    {/* Bubble Message */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      
                      {/* Name & Admin Badge */}
                      <div className="flex items-center gap-1 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-600">
                          {isMe ? 'You' : senderProfile?.username || msg.username}
                        </span>
                        {senderProfile?.is_admin && (
                          <span title="Admin Verified" className="inline-flex items-center">
                            <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-50" />
                          </span>
                        )}
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-500/20'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {renderMessageWith3DEmojis(msg.message)}
                      </div>

                      <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-100 relative">
            
            {/* Popover Emoji Picker 3D WebP */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-4 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 grid grid-cols-6 gap-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                {EMOJI_LIST.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onEmojiClick(item.char)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center"
                  >
                    <img src={item.src} alt={item.char} className="w-7 h-7 object-contain hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            )}

            {!currentUser ? (
              <button
                onClick={setShowLoginModal}
                className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
              >
                <LogIn size={16} />
                Login with Google to chat
              </button>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  <Smile size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 text-[13px] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 border border-slate-200 font-medium transition-all"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            )}
          </div>

        </div>
      )}
    </div>
  );
}