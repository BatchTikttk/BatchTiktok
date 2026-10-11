import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, MessageSquare, X, CheckCircle2 } from 'lucide-react';
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

const AGENT_AVATAR_URL = "https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Qris/AgentDutaKlip.webp";

// SVG Bendera Resmi (High-Quality Vector CDN)
const GB_FLAG_SVG = "https://flagcdn.com/w40/gb.png";
const ID_FLAG_SVG = "https://flagcdn.com/w40/id.png";

// Daftar Pertanyaan & Topik Terkait (Multi-Language)
const QUICK_QUESTIONS: Record<'en' | 'id', string[]> = {
  en: [
    "How to upgrade VIP?",
    "What are the benefits of VIP/Premium?",
    "How to get animated avatar borders?",
    "How does the achievement system work?",
    "How long does payment verification take?",
    "I have transferred, how to confirm?",
    "Where can I download exclusive content?"
  ],
  id: [
    "Bagaimana cara upgrade VIP?",
    "Apa saja benefit menjadi member VIP/Premium?",
    "Bagaimana cara mendapatkan border avatar animasi?",
    "Bagaimana sistem achievement di DutaKlip?",
    "Berapa lama verifikasi pembayaran?",
    "Saya sudah transfer, bagaimana cara konfirmasinya?",
    "Dimana saya bisa download konten eksklusif?"
  ]
};

const AUTO_REPLIES: Record<'en' | 'id', Record<string, string>> = {
  en: {
    "How to upgrade VIP?": "To upgrade to VIP, click the Upgrade VIP menu in the Navbar or the 'Upgrade Now' button on the main banner. Then, transfer Rp 50,000 to the available QRIS and send the transfer proof to Admin.",
    "What are the benefits of VIP/Premium?": "VIP members get access to all exclusive content, priority queue for custom batch requests, exclusive VIP avatar borders, and premium card backgrounds on the contributor page.",
    "How to get animated avatar borders?": "WebP-based animated avatar borders will automatically activate once your account is upgraded to VIP/Premium member.",
    "How does the achievement system work?": "Achievements and tier badge systems will integrate into your profile as you actively upload and contribute on the platform.",
    "How long does payment verification take?": "Manual payment verification usually takes 5-15 minutes after you send the transfer proof via WhatsApp to our Admin team.",
    "I have transferred, how to confirm?": "Please open the /pay page and click the 'Confirm Payment / Contact Admin' button to directly open WhatsApp Admin with an automated message. Attach your transfer proof photo there.",
    "Where can I download exclusive content?": "Exclusive content can be accessed directly on the main page or creator folders after your account is upgraded to VIP Lifetime Pass status.",
    "default": "Hello! Thank you for contacting Agent DutaKlip. Your message has been received and our automated system will assist you shortly."
  },
  id: {
    "Bagaimana cara upgrade VIP?": "Untuk upgrade VIP, Anda dapat mengklik menu Upgrade VIP di Navbar atau tombol 'Upgrade Now' pada banner utama. Setelah itu, lakukan transfer sebesar Rp 50.000 ke QRIS yang tersedia dan kirimkan bukti transfer ke Admin.",
    "Apa saja benefit menjadi member VIP/Premium?": "Member VIP mendapatkan akses ke semua konten eksklusif, antrean prioritas untuk custom batch requests, border avatar VIP eksklusif, serta background kartu premium di halaman kontributor.",
    "Bagaimana cara mendapatkan border avatar animasi?": "Border avatar animasi berbasis WebP akan otomatis aktif setelah akun Anda berhasil di-upgrade menjadi member VIP/Premium.",
    "Bagaimana sistem achievement di DutaKlip?": "Achievement dan sistem badge tier akan terintegrasi pada profil Anda seiring dengan keaktifan dalam mengunggah serta berkontribusi di platform.",
    "Berapa lama verifikasi pembayaran?": "Verifikasi pembayaran manual biasanya memakan waktu 5-15 menit setelah Anda mengirimkan bukti transfer via WhatsApp ke Tim Admin kami.",
    "Saya sudah transfer, bagaimana cara konfirmasinya?": "Silakan buka halaman /pay lalu klik tombol 'Confirm Payment / Contact Admin' untuk langsung membuka WhatsApp Admin dengan pesan otomatis. Lampirkan foto bukti transfer Anda di sana.",
    "Dimana saya bisa download konten eksklusif?": "Konten eksklusif dapat diakses langsung pada halaman utama atau folder creator setelah akun Anda di-upgrade menjadi status VIP Lifetime Pass.",
    "default": "Halo! Terima kasih telah menghubungi Agent DutaKlip. Pesan Anda telah kami terima dan sistem otomatis kami akan segera membantu Anda."
  }
};

const UI_TEXT: Record<'en' | 'id', Record<string, string>> = {
  en: {
    subtitle: "Instant automated support for payment & membership.",
    finish: "Finish",
    loginFirst: "Please Login First",
    loginDesc: "You need to be logged in to send messages and connect with support.",
    loginBtn: "Login Now",
    startConv: "Start a Conversation",
    selectPrompt: "Select a question below to send instantly:",
    related: "Related Questions:",
    placeholder: "Type your message..."
  },
  id: {
    subtitle: "Dukungan otomatis instan untuk pembayaran & keanggotaan.",
    finish: "Selesai",
    loginFirst: "Silakan Login Terlebih Dahulu",
    loginDesc: "Anda harus login terlebih dahulu untuk mengirim pesan dan terhubung dengan dukungan.",
    loginBtn: "Login Sekarang",
    startConv: "Mulai Percakapan",
    selectPrompt: "Pilih pertanyaan di bawah untuk mengirim secara instan:",
    related: "Pertanyaan Terkait:",
    placeholder: "Ketik pesan Anda..."
  }
};

export default function CsModal({ isOpen, onClose, onOpenLoginModal }: CsModalProps) {
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [displayUsername, setDisplayUsername] = useState<string>('You');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Sesi Pengguna & Profile
  useEffect(() => {
    if (!isOpen) return;

    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessionUser(null);
        setUserAvatar(null);
        setLoading(false);
        return;
      }

      setSessionUser(session.user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profile?.username) setDisplayUsername(profile.username);
      if (profile?.avatar_url) setUserAvatar(profile.avatar_url);
      else if (session.user.user_metadata?.avatar_url) {
        setUserAvatar(session.user.user_metadata.avatar_url);
      }

      await getOrCreateConversation(session.user.id);
    };

    initSession();
  }, [isOpen]);

  // 2. Ambil atau Buat Conversation
  const getOrCreateConversation = async (userId: string): Promise<string | null> => {
    try {
      let { data: conv } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!conv) {
        const { data: newConv } = await supabase
          .from('support_conversations')
          .insert([{ user_id: userId, status: 'active' }])
          .select('id')
          .single();

        conv = newConv;
      }

      if (conv) {
        setConversationId(conv.id);
        fetchMessages(conv.id);
        subscribeToMessages(conv.id);
        return conv.id;
      }
      return null;
    } catch (err) {
      console.error('Error init conversation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Messages
  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  // 4. Realtime Subscription
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

  // Membersihkan Chat saat Modal Ditutup / Selesai
  const handleCleanupAndClose = async () => {
    if (conversationId) {
      await supabase
        .from('support_messages')
        .delete()
        .eq('conversation_id', conversationId);
    }
    setMessages([]);
    onClose();
  };

  const handleFinishChat = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      await supabase
        .from('support_messages')
        .delete()
        .eq('conversation_id', conversationId);

      setMessages([]);
    } catch (err) {
      console.error('Error finishing chat:', err);
    } finally {
      setLoading(false);
    }
  };

  // Balasan Bot Otomatis
  const triggerAutoBotReply = async (userMsgText: string, activeConvId: string) => {
    setIsBotTyping(true);

    const replies = AUTO_REPLIES[lang];
    let replyText = replies[userMsgText];
    
    if (!replyText) {
      const lower = userMsgText.toLowerCase();
      if (lower.includes('upgrade') || lower.includes('vip') || lower.includes('bayar')) {
        replyText = lang === 'en' ? replies["How to upgrade VIP?"] : replies["Bagaimana cara upgrade VIP?"];
      } else if (lower.includes('benefit') || lower.includes('premium')) {
        replyText = lang === 'en' ? replies["What are the benefits of VIP/Premium?"] : replies["Apa saja benefit menjadi member VIP/Premium?"];
      } else if (lower.includes('avatar') || lower.includes('animasi') || lower.includes('webp')) {
        replyText = lang === 'en' ? replies["How to get animated avatar borders?"] : replies["Bagaimana cara mendapatkan border avatar animasi?"];
      } else if (lower.includes('achievement') || lower.includes('badge')) {
        replyText = lang === 'en' ? replies["How does the achievement system work?"] : replies["Bagaimana sistem achievement di DutaKlip?"];
      } else if (lower.includes('lama') || lower.includes('waktu') || lower.includes('verifikasi')) {
        replyText = lang === 'en' ? replies["How long does payment verification take?"] : replies["Berapa lama verifikasi pembayaran?"];
      } else if (lower.includes('transfer') || lower.includes('bukti') || lower.includes('konfirmasi')) {
        replyText = lang === 'en' ? replies["I have transferred, how to confirm?"] : replies["Saya sudah transfer, bagaimana cara konfirmasinya?"];
      } else {
        replyText = replies["default"];
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
    }, 1100);
  };

  // 5. Kirim Pesan
  const executeSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !sessionUser) return;

    setSending(true);

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = await getOrCreateConversation(sessionUser.id);
      }

      if (!activeConvId) return;

      const cleanText = textToSend.trim();
      setInputText('');

      const { error } = await supabase.from('support_messages').insert([
        {
          conversation_id: activeConvId,
          sender_id: sessionUser.id,
          message: cleanText,
          is_admin: false,
        },
      ]);

      if (!error) {
        triggerAutoBotReply(cleanText, activeConvId);
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    executeSendMessage(inputText);
  };

  const handleQuickQuestionClick = (questionText: string) => {
    executeSendMessage(questionText);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const currentQuestions = QUICK_QUESTIONS[lang];
  const unaskedQuestions = currentQuestions.filter(
    (q) => !messages.some((m) => m.message.trim().toLowerCase() === q.trim().toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCleanupAndClose();
      }}
    >
      <div className="relative w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto h-[88vh] max-h-[760px] flex flex-col">
        
        {/* Tombol Silang */}
        <button 
          onClick={handleCleanupAndClose}
          className="absolute -top-10 right-0 md:-right-10 md:-top-2 z-[60] text-slate-300 hover:text-white bg-transparent border-none p-1 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer flex items-center justify-center"
          title="Close"
        >
          <X size={24} />
        </button>

        {/* Modal Outer Box */}
        <div className="bg-white rounded-[2.2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col w-full h-full">
          
          {/* Header dengan Gambar Bendera Asli */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 shadow-2xs">
                <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                    Agent DutaKlip
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  </h3>

                  {/* Tombol Switcher Bahasa dengan Image Flag SVG */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`text-xs font-bold transition-all bg-transparent border-none cursor-pointer flex items-center gap-1 ${lang === 'en' ? 'text-slate-900 opacity-100 scale-105' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                      title="English"
                    >
                      <img src={GB_FLAG_SVG} alt="EN" className="w-4 h-3 rounded-[2px] object-cover border border-slate-200 shadow-2xs" />
                      EN
                    </button>
                    <span className="text-slate-300 text-xs font-light">/</span>
                    <button
                      type="button"
                      onClick={() => setLang('id')}
                      className={`text-xs font-bold transition-all bg-transparent border-none cursor-pointer flex items-center gap-1 ${lang === 'id' ? 'text-slate-900 opacity-100 scale-105' : 'text-slate-400 opacity-50 hover:opacity-80'}`}
                      title="Indonesia"
                    >
                      <img src={ID_FLAG_SVG} alt="ID" className="w-4 h-3 rounded-[2px] object-cover border border-slate-200 shadow-2xs" />
                      ID
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                  {UI_TEXT[lang].subtitle}
                </p>
              </div>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleFinishChat}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 text-xs font-bold border-none"
                title={UI_TEXT[lang].finish}
              >
                <CheckCircle2 size={15} />
                <span>{UI_TEXT[lang].finish}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            </div>
          ) : !sessionUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
              <MessageSquare size={38} className="text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">{UI_TEXT[lang].loginFirst}</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
                {UI_TEXT[lang].loginDesc}
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenLoginModal) onOpenLoginModal();
                  else window.dispatchEvent(new Event('openLoginModal'));
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
              >
                {UI_TEXT[lang].loginBtn}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              
              {/* Area Canvas Chat */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-white">
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
                              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
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

                    {/* Animasi Bot Mengetik */}
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

                    {/* Related Questions */}
                    {!isBotTyping && unaskedQuestions.length > 0 && (
                      <div className="pt-2 flex flex-col items-start gap-2">
                        <p className="text-xs font-semibold text-slate-500 px-1">
                          {UI_TEXT[lang].related}
                        </p>
                        <div className="flex flex-col gap-2 w-full max-w-md">
                          {unaskedQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              type="button"
                              disabled={sending}
                              onClick={() => handleQuickQuestionClick(q)}
                              className="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-100 hover:border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
                            >
                              <span>{q}</span>
                              <Send size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 flex-shrink-0 ml-1" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-2 my-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden mb-2 border border-slate-200 shadow-sm">
                      <img src={AGENT_AVATAR_URL} alt="Agent DutaKlip" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">{UI_TEXT[lang].startConv}</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-sm leading-relaxed mb-4">
                      {UI_TEXT[lang].selectPrompt}
                    </p>

                    <div className="flex flex-col gap-2 w-full max-w-md">
                      {currentQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={sending}
                          onClick={() => handleQuickQuestionClick(q)}
                          className="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-100 hover:border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
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
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-100 flex items-center gap-2 bg-white flex-shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={UI_TEXT[lang].placeholder}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-2.5 sm:p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center border-none"
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