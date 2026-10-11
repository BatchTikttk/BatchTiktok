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

export default function CsModal({ isOpen, onClose, onOpenLoginModal }: CsModalProps) {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Session User & Cek Status Admin
  useEffect(() => {
    if (!isOpen) return;

    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setSessionUser(session.user);

      // Cek apakah user adalah admin[cite: 11]
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      const userIsAdmin = !!profile?.is_admin;
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        // Jika user biasa, cari atau buat conversation khusus miliknya[cite: 11]
        await getOrCreateConversation(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initSession();
  }, [isOpen]);

  // 2. Ambil atau Buat Conversation untuk User Biasa[cite: 11]
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
        // Buat baru jika belum ada[cite: 11]
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

  // 3. Ambil Riwayat Pesan[cite: 11]
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

  // 4. Supabase Realtime Subscription untuk Pesan Masuk[cite: 11]
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

  // Scroll otomatis ke bawah saat ada pesan baru[cite: 11]
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Kirim Pesan[cite: 11]
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl my-auto">
        
        {/* Tombol Close di Luar Container */}
        <button 
          onClick={onClose}
          className="absolute -top-4 right-1 md:-right-10 md:-top-2 z-[60] text-slate-300 hover:text-white bg-slate-800/80 md:bg-transparent rounded-full p-1.5 md:p-0 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
          title="Close"
        >
          <X size={24} />
        </button>

        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col w-full h-[80vh] max-h-[700px]">
          
          {/* Header Informatif dengan Keterangan Jelas */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Customer Service & Support
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Need help with payment verification or account upgrade? Chat directly with our support team here.
                </p>
              </div>
            </div>
          </div>

          {/* Konten Utama / Body */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : !sessionUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
              <MessageSquare size={44} className="text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-800 mb-1">Please Login First</h4>
              <p className="text-xs text-slate-500 mb-5 max-w-xs leading-relaxed">
                You need to be logged in to send messages and connect with customer service support.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLoginModal) onOpenLoginModal();
                  else window.dispatchEvent(new Event('openLoginModal'));
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer border-none"
              >
                Login Now
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              
              {/* Area Pesan */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === sessionUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-slate-400">
                          {msg.is_admin ? (
                            <ShieldCheck size={20} className="text-amber-500" />
                          ) : (
                            <User size={18} />
                          )}
                        </div>

                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-emerald-500 text-white rounded-br-none shadow-sm'
                              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75 mb-1">
                            {msg.is_admin ? 'Customer Service' : 'You'}
                          </div>
                          <div>{msg.message}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                    <MessageSquare size={36} className="mb-2 opacity-40 text-emerald-500" />
                    <p className="text-sm font-bold text-slate-700">Start a Conversation</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Send your questions, payment proofs, or assistance requests below. Our support team will respond shortly.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form Input Pesan */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message or issue here..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center border-none"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}