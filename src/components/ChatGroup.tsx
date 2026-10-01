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

const EMOJI_LIST = ['😀', '😂', '🥰', '😎', '🥺', '😭', '😡', '👍', '🙏', '✨', '🔥', '🎉'];

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

  // Fetch data profil (untuk mendapatkan avatar & is_admin)
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin');
    if (!error && data) {
      setProfiles(data);
    }
  };

  // Fetch riwayat pesan
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

  // Dijalankan saat widget dibuka
  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      fetchMessages();
    }
  }, [isOpen]);

  // Realtime Sync untuk Pesan & Profil
  useEffect(() => {
    if (!isOpen) return;

    // Listen untuk pesan baru
    const messageChannel = supabase
      .channel('realtime-group-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    // Listen jika ada profil yang berubah (misal ganti avatar atau diangkat jadi admin)
    const profileChannel = supabase
      .channel('realtime-profiles-chat')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchProfiles(); // Refresh profil jika ada update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [isOpen]);

  // Auto scroll ke bawah setiap ada pesan baru
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

  const onEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] font-sans">
      {/* Tombol Floating untuk Buka/Tutup Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold"
        >
          <MessageSquare size={20} className="fill-current" />
          <span>Global Chat</span>
        </button>
      )}

      {/* Box Obrolan (Light Mode) */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
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

          {/* Body List Pesan (Tanpa Scrollbar Visual tapi bisa di scroll) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-sm font-medium">
                <Loader2 size={18} className="animate-spin text-emerald-500" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                {/* 3D Emoticon Effect untuk empty state */}
                <div className="text-6xl mb-4 drop-shadow-xl transform hover:scale-110 transition-transform cursor-default">
                  👋
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">No messages yet</h4>
                <p className="text-[11.5px] text-slate-500 font-medium">Send the first message to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && msg.username.toLowerCase() === currentUser.toLowerCase();
                const senderProfile = profiles.find(p => p.id === msg.user_id);
                
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
                      
                      {/* Nama & Badge Admin */}
                      <div className="flex items-center gap-1 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-600">
                          {isMe ? 'You' : (senderProfile?.username || msg.username)}
                        </span>
                        {/* Centang Hijau Admin Sinkron */}
                        {senderProfile?.is_admin && (
                          <CheckCircle2 size={12} className="text-emerald-500 fill-emerald-50" title="Admin Verified" />
                        )}
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-emerald-500 text-white rounded-tr-none shadow-emerald-500/20'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
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

          {/* Footer Input Pesan */}
          <div className="p-3 bg-white border-t border-slate-100 relative">
            
            {/* Popover Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-4 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 grid grid-cols-6 gap-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                {EMOJI_LIST.map((emoji, index) => (
                  <button 
                    key={index}
                    onClick={() => onEmojiClick(emoji)}
                    className="text-xl hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                  >
                    {emoji}
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