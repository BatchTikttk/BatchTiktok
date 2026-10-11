import { useState, useEffect, useRef } from 'react';
import { Send, User, ShieldCheck, Loader2, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function Cs({ onBack }: { onBack?: () => void }) {
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
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setSessionUser(session.user);

      // Cek apakah user adalah admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      const userIsAdmin = !!profile?.is_admin;
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        // Jika user biasa, cari atau buat conversation khusus miliknya
        await getOrCreateConversation(session.user.id);
      } else {
        // Jika admin, sementara arahkan ke percakapan aktif pertama atau sediakan list (bisa disesuaikan)
        setLoading(false);
      }
    };

    initSession();
  }, []);

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
        // Buat baru jika belum ada
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

  // 4. Supabase Realtime Subscription untuk Pesan Masuk
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

  // Scroll otomatis ke bawah saat ada pesan baru
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-6 text-center">
        <MessageSquare size={48} className="text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">Please Login First</h2>
        <p className="text-xs text-slate-500 mb-6">You need to log in to access Customer Service support.</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#10b981] text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col h-screen">
        
        {/* Header Bersih Tanpa Border & Tanpa Background Ikon */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors bg-transparent cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Back</span>
          </button>
          
          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-lg">
            <MessageSquare size={22} className="text-[#10b981]" />
            <span>Customer Service</span>
          </div>
        </div>

        {/* Kotak Chat Utama Tanpa Border & Tanpa Background Kontainer Ikon */}
        <div className="flex-1 bg-white rounded-[32px] shadow-[0_10px_30px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden mb-4">
          
          {/* Area Pesan */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isMe = msg.sender_id === sessionUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-slate-400">
                      {msg.is_admin ? (
                        <ShieldCheck size={22} className="text-[#fbbf24]" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>

                    <div
                      className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-[#10b981] text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-70 mb-1">
                        {msg.is_admin ? 'Customer Service' : 'You'}
                      </div>
                      <div>{msg.message}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare size={36} className="mb-2 opacity-50" />
                <p className="text-sm font-semibold">No messages yet.</p>
                <p className="text-xs text-slate-400 mt-1">Send a message to start chatting with our support team.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input Pesan Tanpa Border */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-5 py-3.5 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-3.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}