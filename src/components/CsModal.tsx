import { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, MessageSquare, X, RotateCcw } from 'lucide-react';
import { supabase } from '../supabase';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface CsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: string | null;
  onOpenLoginModal?: () => void;
}

// URL Avatar khusus Agent DutaKlip
const AGENT_AVATAR_URL = "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Qris/AgentDutaKlip.webp";

// Quick Questions & Auto-Reply Responses Database
const QUICK_QUESTIONS = [
  "Bagaimana cara upgrade VIP?",
  "Berapa lama verifikasi pembayaran?",
  "Saya sudah transfer, bagaimana cara konfirmasinya?",
  "Dimana saya bisa download konten eksklusif?"
];

const AUTO_REPLIES: Record<string, string> = {
  "Bagaimana cara upgrade VIP?": "Untuk upgrade VIP, Anda dapat mengklik menu Upgrade VIP di Navbar atau tombol 'Upgrade Now' pada banner utama. Setelah itu, lakukan transfer sebesar Rp 50.000 ke QRIS yang tersedia dan kirimkan bukti transfer ke Admin.",
  "Berapa lama verifikasi pembayaran?": "Verifikasi pembayaran manual biasanya memakan waktu 5-15 menit setelah Anda mengirimkan bukti transfer via WhatsApp ke Tim Admin kami.",
  "Saya sudah transfer, bagaimana cara konfirmasinya?": "Silakan buka halaman /pay lalu klik tombol 'Confirm Payment / Contact Admin' untuk langsung membuka WhatsApp Admin dengan pesan otomatis. Lampirkan foto bukti transfer Anda di sana.",
  "Dimana saya bisa download konten eksklusif?": "Konten eksklusif dapat diakses langsung pada halaman utama atau folder creator setelah akun Anda di-upgrade menjadi status VIP Lifetime Pass.",
  "default": "Halo! Terima kasih telah menghubungi Agent DutaKlip. Pesan Anda telah kami terima dan sistem otomatis kami akan segera membantu Anda."
};

export default function CsModal({ isOpen, onClose, onOpenLoginModal }: CsModalProps) {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [displayUsername, setDisplayUsername] = useState<string>('You');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Session User & Profil (Avatar & Username)
  useEffect(() => {
    if (!isOpen) return;

    const initSession = async () => {
      setLoading(true);
      setErrorMessage(null);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessionUser(null);
        setIsAdmin(false);
        setUserAvatar(null);
        setLoading(false);
        return;
      }

      setSessionUser(session.user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, is_admin, avatar_url')
        .eq('id', session.user.id)
        .single();

      const userIsAdmin = !error && !!profile?.is_admin;
      setIsAdmin(userIsAdmin);

      if (profile?.username) {
        setDisplayUsername(profile.username);
      }

      if (profile?.avatar_url) {
        setUserAvatar(profile.avatar_url);
      } else if (session.user.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }

      if (!userIsAdmin) {
        await getOrCreateConversation(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initSession();
  }, [isOpen]);

  // 2. Ambil atau Buat Conversation
  const getOrCreateConversation = async (userId: string): Promise<string | null> => {
    try {
      let { data: conv, error } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (!conv) {
        const { data: newConv, error: createError } = await supabase
          .from('support_conversations')
          .insert([{ user_id: userId, status: 'active' }])
          .select('id')
          .single();

        if (createError) throw createError;
        conv = newConv;
      }

      if (conv) {
        setConversationId(conv.id);
        fetchMessages(conv.id);
        subscribeToMessages(conv.id);
        return conv.id;
      }
      return null;
    } catch (err: any) {
      console.error('Error init conversation:', err);
      setErrorMessage('Gagal menginisialisasi chat.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 3. Ambil Riwayat Pesan
  const fetchMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  // 4. Supabase Realtime Subscription
  const subscribeToMessages = (convId: string) => {
    const channel = supabase
      .channel(`support_chat_${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  // Perbaikan Fungsi New Chat yang Aman dari Bug State & RLS
  const handleNewChat = async () => {
    if (!sessionUser) return;
    setLoading(true);
    setErrorMessage(null);
    setConversationId(null);
    setMessages([]);
    await getOrCreateConversation(sessionUser.id);
  };

  // Simulasi Balasan Bot Otomatis Agent DutaKlip
  const triggerAutoBotReply = async (userMsgText: string, activeConvId: string) => {
    setIsBotTyping(true);

    let replyText = AUTO_REPLIES[userMsgText];
    if (!replyText) {
      const lower = userMsgText.toLowerCase();
      if (lower.includes('upgrade') || lower.includes('vip') || lower.includes('bayar')) {
        replyText = AUTO_REPLIES["Bagaimana cara upgrade VIP?"];
      } else if (lower.includes('lama') || lower.includes('waktu') || lower.includes('verifikasi')) {
        replyText = AUTO_REPLIES["Berapa lama verifikasi pembayaran?"];
      } else if (lower.includes('transfer') || lower.includes('bukti') || lower.includes('konfirmasi')) {
        replyText = AUTO_REPLIES["Saya sudah transfer, bagaimana cara konfirmasinya?"];
      } else {
        replyText = AUTO_REPLIES["default"];
      }
    }

    setTimeout(async () => {
      setIsBotTyping(false);

      const { error } = await supabase
        .from('support_messages')
        .insert([
          {
            conversation_id: activeConvId,
            sender_id: sessionUser.id,
            message: replyText,
            is_admin: true,
          },
        ]);

      if (error) {
        const tempMsg: Message = {
          id: 'bot-' + Date.now(),
          conversation_id: activeConvId,
          sender_id: 'agent-bot',
          message: replyText,
          is_admin: true,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, tempMsg]);
      }
    }, 1200);
  };

  // 5. Fungsi Pengiriman Pesan
  const executeSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !sessionUser) return;

    setSending(true);
    setErrorMessage(null);

    let activeConvId = conversationId;
    if (!activeConvId) {
      activeConvId = await getOrCreateConversation(sessionUser.id);
    }

    if (!activeConvId) {
      setSending(false);
      setErrorMessage('Sesi percakapan tidak ditemukan.');
      return;
    }

    const cleanText = textToSend.trim();
    setInputText('');

    const { error } = await supabase.from('support_messages').insert([
      {
        conversation_id: activeConvId,
        sender_id: sessionUser.id,
        message: cleanText,
        is_admin: isAdmin,
      },
    ]);

    if (error) {
      console.error('Failed to send message:', error);
      setErrorMessage(`Gagal mengirim: ${error.message}`);
    } else {
      if (!isAdmin) {
        triggerAutoBotReply(cleanText, activeConvId);
      }
    }
    setSending(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage(inputText);
  };

  const handleQuickQuestionClick = (questionText: string) => {
    executeSendMessage(questionText);
  };

  // Helper Format Waktu
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md sm:max-w-lg mx-auto h-[82vh] max-h-[640px] flex flex-col">
        
        {/* Tombol Silang di Luar Container */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 md:-right-10 md:-top-2 z-[60] text-slate-300 hover:text-white bg-transparent border-none p-1 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
          title="Close"
        >
          <X size={24} />
        </button>

        {/* Modal Outer Box */}
        <div className="bg-white rounded-[2.2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col w-full h-full">
          
          {/* Header Minimalis dengan Avatar Agent & Tombol New Chat */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 shadow-2xs">
                <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Agent DutaKlip
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                  Instant automated support for payment & membership.
                </p>
              </div>
            </div>

            {/* Tombol Refresh / New Chat */}
            <button
              onClick={handleNewChat}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border-none bg-transparent cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="New Chat / Menu"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-[11px] font-semibold text-red-600 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 bg-transparent border-none cursor-pointer">✕</button>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </div>
          ) : !sessionUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
              <MessageSquare size={38} className="text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">Please Login First</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
                You need to be logged in to send messages and connect with support.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLoginModal) onOpenLoginModal();
                  else window.dispatchEvent(new Event('openLoginModal'));
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
              >
                Login Now
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              
              {/* Area Canvas Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                {messages.length > 0 ? (
                  <>
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === sessionUser.id && !msg.is_admin;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200 bg-slate-100 text-slate-400 shadow-2xs mt-1">
                            {msg.is_admin ? (
                              <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
                            ) : userAvatar ? (
                              <img src={userAvatar} alt="You" className="w-full h-full object-cover" />
                            ) : (
                              <User size={16} />
                            )}
                          </div>

                          <div className={`flex flex-col max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[11px] font-bold text-slate-700 mb-1 px-1">
                              {msg.is_admin ? 'Agent DutaKlip' : displayUsername}
                            </span>

                            <div
                              className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-500 text-white rounded-tr-none shadow-sm'
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                              }`}
                            >
                              {msg.message}
                            </div>

                            <span className="text-[9px] font-semibold text-slate-400 mt-1 px-1">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isBotTyping && (
                      <div className="flex items-start gap-2.5 flex-row">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 shadow-2xs mt-1">
                          <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-[11px] font-bold text-slate-700 mb-1 px-1">Agent DutaKlip</span>
                          <div className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-2 my-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border border-slate-200 shadow-sm">
                      <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Start a Conversation</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed mb-4">
                      Select a question below to send instantly:
                    </p>

                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={sending}
                          onClick={() => handleQuickQuestionClick(q)}
                          className="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-100 hover:border-emerald-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
                        >
                          <span>{q}</span>
                          <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 flex-shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input Pesan */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white flex-shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center border-none"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}