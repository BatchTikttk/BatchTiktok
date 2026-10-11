import { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldCheck, Loader2, MessageSquare, X } from 'lucide-react';
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

// Daftar pertanyaan cepat (Bilingual: English & Indonesia)
const QUICK_QUESTIONS = [
  { en: "How to upgrade to VIP?", id: "Bagaimana cara upgrade VIP?" },
  { en: "Payment verification takes how long?", id: "Berapa lama verifikasi pembayaran?" },
  { en: "I have transferred, how to confirm?", id: "Saya sudah transfer, bagaimana cara konfirmasinya?" },
  { en: "Where can I download exclusive content?", id: "Dimana saya bisa download konten eksklusif?" }
];

export default function CsModal({ isOpen, onClose, onOpenLoginModal }: CsModalProps) {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminOnline, setIsAdminOnline] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Session User & Cek Status Admin secara Akurat
  useEffect(() => {
    if (!isOpen) return;

    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessionUser(null);
        setIsAdmin(false);
        setIsAdminOnline(false);
        setLoading(false);
        return;
      }

      setSessionUser(session.user);

      // Cek status is_admin dari tabel profiles untuk user yang sedang login
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      const userIsAdmin = !error && !!profile?.is_admin;
      setIsAdmin(userIsAdmin);

      // Jika user yang login adalah admin, maka admin pasti online
      if (userIsAdmin) {
        setIsAdminOnline(true);
      } else {
        // Cek apakah ada admin yang terdaftar / aktif di database untuk user biasa
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_admin', true);

        setIsAdminOnline(!!adminProfiles && adminProfiles.length > 0);
      }

      if (!userIsAdmin) {
        await getOrCreateConversation(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initSession();
  }, [isOpen]);

  // 2. Ambil atau Buat Conversation untuk User Biasa
  const getOrCreateConversation = async (userId: string) => {
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
      }
    } catch (err) {
      console.error('Error init conversation:', err);
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
  }, [messages]);

  // 5. Kirim Pesan
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !sessionUser) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    const { error } = await supabase.from('support_messages').insert([
      {
        conversation_id: conversationId,
        sender_id: sessionUser.id,
        message: messageText,
        is_admin: isAdmin,
      },
    ]);

    if (error) {
      console.error('Failed to send message:', error);
    }
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Vertikal Ramping (max-w-md) tanpa scrolling luar */}
      <div className="relative w-full max-w-md mx-auto h-[82vh] max-h-[640px] flex flex-col">
        
        {/* Tombol Silang di Luar Container dengan Rotasi Hover */}
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 md:-right-10 md:-top-2 z-[60] text-slate-300 hover:text-white bg-transparent border-none p-1 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
          title="Close"
        >
          <X size={24} />
        </button>

        {/* Outer Box */}
        <div className="bg-white rounded-[2.2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col w-full h-full">
          
          {/* Header Polos Tanpa Background Container */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={20} className="text-emerald-500 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Customer Service
                  </h3>
                  {/* Indikator Akurat Berdasarkan Status Login / Database */}
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      {isAdminOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isAdminOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </span>
                    <span className={`text-[10px] font-bold ${isAdminOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isAdminOnline ? 'Admin Online' : 'Admin Offline'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                  Direct live assistance for payment & VIP membership.
                </p>
              </div>
            </div>
          </div>

          {/* Body Utama */}
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
              
              {/* Area Chat Internal */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-white">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === sessionUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-slate-400">
                          {msg.is_admin ? (
                            <ShieldCheck size={18} className="text-amber-500" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>

                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-500 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <div className="text-[9px] font-bold opacity-75 mb-0.5">
                            {msg.is_admin ? 'Customer Service' : 'You'}
                          </div>
                          <div>{msg.message}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-6 bg-white">
                    <MessageSquare size={32} className="mb-2 text-emerald-500 opacity-60" />
                    <p className="text-xs font-bold text-slate-700">Start a Conversation</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Type your questions or issues below, or click quick suggestions below.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Conversation / FAQ Chips (Bilingual EN/ID) */}
              <div className="px-4 py-2 border-t border-slate-50 bg-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Questions / Pertanyaan Cepat:
                </p>
                <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(q.id)}
                      className="flex-shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200/60 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap"
                      title={q.en}
                    >
                      {q.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Polos Tanpa Border Kotak Tambahan */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
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