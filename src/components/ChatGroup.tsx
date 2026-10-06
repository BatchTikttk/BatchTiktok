import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Send, MessageSquare, X, User, Loader2, LogIn, Smile, Volume2, VolumeX } from 'lucide-react';
import AvatarBorderVip from './AvatarBorderVip';

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
  is_premium: boolean;
  vip_border_url?: string | null;
  animation_border_url?: string | null; // Tambahan field animasi border
}

interface UserStats {
  totalUploads: number;
  totalApproved: number;
}

const BADGES = [
  {
    id: 'bronze',
    title: 'Bronze Tier',
    tier: 'Tier 1 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Bronze.webp',
    isUnlocked: (stats: UserStats) => stats.totalUploads >= 10,
  },
  {
    id: 'silver',
    title: 'Silver Tier',
    tier: 'Tier 2 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Silver.webp',
    isUnlocked: (stats: UserStats) => stats.totalUploads >= 30,
  },
  {
    id: 'gold',
    title: 'Gold Tier',
    tier: 'Tier 3 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Gold.webp',
    isUnlocked: (stats: UserStats) => stats.totalUploads >= 50,
  },
  {
    id: 'elite',
    title: 'Elite Tier',
    tier: 'Tier 4 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Elite.webp',
    isUnlocked: (stats: UserStats) => stats.totalUploads >= 100,
  },
  {
    id: 'legend',
    title: 'Legend Tier',
    tier: 'Tier 5 Badge',
    iconUrl: 'https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/New%20Tier%20Badge/Legend.webp',
    isUnlocked: (stats: UserStats) => stats.totalUploads >= 200,
  },
];

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
  const [userStatsMap, setUserStatsMap] = useState<Record<string, UserStats>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMutedRef = useRef(isMuted);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    audioRef.current.volume = 0.6;
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProfiles = async () => {
    // Menambahkan column animation_border_url
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_admin, is_premium, vip_border_url, animation_border_url');
    
    if (!error && data) {
      setProfiles(data);
    }
  };

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from('batches')
      .select('user_id, status');

    if (!error && data) {
      const statsMap: Record<string, UserStats> = {};
      
      data.forEach((batch) => {
        if (!batch.user_id) return;
        if (!statsMap[batch.user_id]) {
          statsMap[batch.user_id] = { totalUploads: 0, totalApproved: 0 };
        }
        statsMap[batch.user_id].totalUploads += 1;
        if (batch.status === 'approved') {
          statsMap[batch.user_id].totalApproved += 1;
        }
      });

      setUserStatsMap(statsMap);
    }
  };

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
      fetchUserStats();
      fetchMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const channelId = `chat-room-${Math.random().toString(36).substring(2, 9)}`;
    const chatChannel = supabase.channel(channelId);

    chatChannel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          if (!isMutedRef.current && audioRef.current) {
            const currentLoggedUser = currentUserRef.current;
            if (!currentLoggedUser || newMsg.username.toLowerCase() !== currentLoggedUser.toLowerCase()) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => console.log('Autoplay audio dihentikan browser:', e));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchProfiles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        () => {
          fetchUserStats();
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
  };

  const getUserUnlockedBadges = (userId?: string) => {
    if (!userId) return [];
    const stats = userStatsMap[userId] || { totalUploads: 0, totalApproved: 0 };
    return BADGES.filter((badge) => badge.isUnlocked(stats));
  };

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
    <>
      {/* Tombol Buka Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9990] flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 font-bold cursor-pointer"
        >
          <MessageSquare size={20} className="fill-current" />
          <span className="hidden sm:inline">Global Chat</span>
          <span className="inline sm:hidden">Chat</span>
        </button>
      )}

      {/* Jendela Chat */}
      {isOpen && (
        <div className="fixed z-[9990] bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[400px] h-[85dvh] sm:h-[540px] max-h-[700px] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10 relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-emerald-500 relative flex items-center justify-center p-1">
                <MessageSquare size={22} className="fill-current opacity-20 absolute" />
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight">Global Group Chat</h3>
                <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime Sync
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${isMuted ? 'text-rose-400 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-50'}`}
                title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-sm font-medium">
                <Loader2 size={18} className="animate-spin text-emerald-500" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <img
                  src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp"
                  alt="3D Animated Waving Hand"
                  className="w-16 h-16 sm:w-20 sm:h-20 mb-3 object-contain drop-shadow-md select-none pointer-events-none"
                />
                <h4 className="text-sm font-bold text-slate-700 mb-1">No messages yet</h4>
                <p className="text-[11.5px] text-slate-500 font-medium">Send the first message to start the conversation.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && msg.username.toLowerCase() === currentUser.toLowerCase();
                const senderProfile = profiles.find((p) => p.id === msg.user_id);
                const userBadges = getUserUnlockedBadges(msg.user_id);

                return (
                  <div key={msg.id} className={`flex gap-2 sm:gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Container Avatar & Borders */}
                    <div className="flex-shrink-0 mt-1 relative w-8 h-8 sm:w-9 sm:h-9 flex justify-center items-center">
                      <div className="w-full h-full relative z-10 rounded-full overflow-hidden shadow-sm border border-slate-200 flex items-center justify-center bg-slate-200">
                        {senderProfile?.avatar_url ? (
                          <img
                            src={senderProfile.avatar_url}
                            alt={msg.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={14} className="text-slate-500" />
                        )}
                      </div>
                      
                      {senderProfile?.is_admin && (
                        <img
                          src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp"
                          alt="Admin"
                          title="Admin Verified"
                          className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-5 h-5 sm:w-[22px] sm:h-[22px] object-contain drop-shadow-md z-30"
                        />
                      )}

                      {/* Rendering Border (Memprioritaskan animation_border_url jika ada) */}
                      {senderProfile?.animation_border_url ? (
                        <img
                          src={senderProfile.animation_border_url}
                          alt="Animated Border"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-none object-contain z-20 pointer-events-none drop-shadow-sm"
  />
                      ) : senderProfile?.is_premium && senderProfile?.vip_border_url ? (
                        <AvatarBorderVip
                          isPremium={senderProfile.is_premium}
                          borderUrl={senderProfile.vip_border_url}
                          className="absolute top-[-6px] sm:top-[-7px] left-1/2 -translate-x-1/2 w-[42px] sm:w-[48px] h-auto max-w-none object-contain z-20 pointer-events-none drop-shadow-sm"
                        />
                      ) : null}
                    </div>

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[75%]`}>
                      
                      <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap">
                        <span className={`text-[11px] sm:text-[12px] font-bold ${senderProfile?.is_admin ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {isMe ? 'You' : senderProfile?.username || msg.username}
                        </span>
                        
                        {!senderProfile?.is_admin && userBadges.map((badge) => (
                          <img
                            key={badge.id}
                            src={badge.iconUrl}
                            alt={badge.title}
                            title={`${badge.title} (${badge.tier})`}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block drop-shadow-sm hover:scale-125 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>

                      <div
                        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-[12px] sm:text-[13px] font-medium leading-relaxed shadow-sm break-words ${
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

          <div className="p-3 bg-white border-t border-slate-100 relative shrink-0">
            {showEmojiPicker && (
              <div className="absolute bottom-[4.5rem] left-2 right-2 sm:left-4 sm:right-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-2 sm:p-3 grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                {EMOJI_LIST.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onEmojiClick(item.char)}
                    className="p-1 sm:p-1.5 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <img src={item.src} alt={item.char} className="w-6 h-6 sm:w-7 sm:h-7 object-contain hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            )}

            {!currentUser ? (
              <button
                onClick={setShowLoginModal}
                className="w-full py-2.5 sm:py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm cursor-pointer"
              >
                <LogIn size={16} />
                Login with Google to chat
              </button>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 sm:p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Smile size={18} className="sm:w-5 sm:h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 text-slate-700 text-[12px] sm:text-[13px] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 border border-slate-200 font-medium transition-all"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 sm:p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}