import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, Send, Trash2, Loader2, ShieldCheck, Clock, Reply } from 'lucide-react';
import AvatarBorderVip from './AvatarBorderVip';

interface CommentsProps {
  itemId: string | number;
  currentUser?: any; 
  onRequireLogin: () => void;
}

export default function Comments({ itemId, currentUser, onRequireLogin }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // State untuk fitur Reply
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  const currentUserId = typeof currentUser === 'string' ? currentUser : currentUser?.id;

  useEffect(() => {
    fetchComments();
    if (currentUserId) {
      fetchCurrentUserProfile();
    }
  }, [itemId, currentUserId]);

  const fetchCurrentUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, vip_border_url, animation_border_url, is_premium, is_admin')
      .eq('id', currentUserId)
      .single();
    
    if (data) setCurrentUserProfile(data);
  };

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('comments') 
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          username,
          avatar_url,
          vip_border_url,
          animation_border_url,
          is_premium,
          is_admin
        )
      `)
      .eq('item_id', itemId) 
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  const handleSumbit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      onRequireLogin();
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert([
        { 
          item_id: itemId,
          user_id: currentUserId, 
          content: newComment.trim() 
        }
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          username,
          avatar_url,
          vip_border_url,
          animation_border_url,
          is_premium,
          is_admin
        )
      `)
      .single();

    if (!error && data) {
      setComments([data, ...comments]);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  // Fungsi khusus untuk submit balasan (reply)
  const handleReplySubmit = async (e: React.FormEvent, parentComment: any) => {
    e.preventDefault();
    if (!currentUserId) {
      onRequireLogin();
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmitting(true);
    
    // Format balasan dengan mention, misal: "@username balasannya..."
    const mentionedUser = parentComment.profiles?.username || 'User';
    const finalContent = `@${mentionedUser} ${replyText.trim()}`;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        { 
          item_id: itemId,
          user_id: currentUserId, 
          content: finalContent 
        }
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          username,
          avatar_url,
          vip_border_url,
          animation_border_url,
          is_premium,
          is_admin
        )
      `)
      .single();

    if (!error && data) {
      setComments([data, ...comments]); // Tambahkan komentar ke list utama
      setReplyingTo(null); // Tutup form reply
      setReplyText(''); // Kosongkan input
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Hapus komentar ini?")) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  const renderAvatarWithBorder = (profile: any, size: 'small' | 'medium' = 'medium') => {
    const isPremium = profile?.is_premium;
    const vipBorder = profile?.vip_border_url;
    const animBorder = profile?.animation_border_url;
    const avatarUrl = profile?.avatar_url;
    
    const containerClass = size === 'medium' ? 'w-10 h-10' : 'w-8 h-8';
    const iconSize = size === 'medium' ? 20 : 16;

    return (
      <div className={`relative flex-shrink-0 ${containerClass}`}>
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 overflow-hidden flex items-center justify-center text-white shadow-sm relative z-10">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={iconSize} />
          )}
        </div>

        {isPremium && vipBorder ? (
          <AvatarBorderVip 
            isPremium={isPremium} 
            borderUrl={vipBorder}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] max-w-none object-contain z-20 pointer-events-none"
          />
        ) : animBorder ? (
          <img 
            src={animBorder} 
            alt="Animation Border" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] max-w-none object-contain z-20 pointer-events-none" 
          />
        ) : null}
      </div>
    );
  };

  // Fungsi untuk memberi highlight hijau pada @username
  const renderCommentContent = (content: string) => {
    if (content.startsWith('@')) {
      const spaceIndex = content.indexOf(' ');
      if (spaceIndex !== -1) {
        const mention = content.substring(0, spaceIndex);
        const text = content.substring(spaceIndex + 1);
        return (
          <>
            <span className="text-[#10b981] font-medium mr-1">{mention}</span>
            {text}
          </>
        );
      }
    }
    return content;
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 text-[#10b981] rounded-2xl">
          <Send size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          Comments <span className="text-slate-400 text-sm font-medium">({comments.length})</span>
        </h3>
      </div>

      {/* Main Comment Input */}
      <form onSubmit={handleSumbit} className="mb-8 flex gap-3 lg:gap-4 items-start">
        {renderAvatarWithBorder(currentUserProfile || {}, 'medium')}
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => !currentUserId && onRequireLogin()}
            placeholder={currentUserId ? "Write your comment..." : "Login to write a comment..."}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#10b981] disabled:opacity-50 transition-colors"
          >
            {isSubmitting && !replyingTo ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-300" size={24} />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 lg:gap-4 group">
              {renderAvatarWithBorder(comment.profiles, 'medium')}

              <div className="flex-1 min-w-0">
                <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">
                        {comment.profiles?.username || 'Unknown User'}
                      </span>
                      {comment.profiles?.is_admin && (
                        <ShieldCheck size={12} className="text-[#fbbf24]" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 break-words leading-relaxed">
                    {renderCommentContent(comment.content)}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-1.5 px-2">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock size={10} />
                    {new Date(comment.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {/* Tombol Reply */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUserId) {
                        onRequireLogin();
                        return;
                      }
                      // Toggle buka/tutup form reply
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      setReplyText('');
                    }}
                    className={`text-[10px] font-bold transition-colors flex items-center gap-1 ${
                      replyingTo === comment.id ? 'text-[#10b981]' : 'text-slate-400 hover:text-[#10b981]'
                    }`}
                  >
                    <Reply size={10} /> Reply
                  </button>
                  
                  {(currentUserId === comment.user_id || currentUserProfile?.is_admin) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  )}
                </div>

                {/* Input Reply (Muncul saat tombol Reply diklik) */}
                {replyingTo === comment.id && (
                  <form 
                    onSubmit={(e) => handleReplySubmit(e, comment)} 
                    className="mt-3 flex gap-3 items-start animate-in fade-in duration-200"
                  >
                    {renderAvatarWithBorder(currentUserProfile || {}, 'small')}
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.profiles?.username || 'User'}...`}
                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all shadow-sm"
                        disabled={isSubmitting}
                        autoFocus
                      />
                      <button 
                        type="submit"
                        disabled={!replyText.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#10b981] disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400 font-medium">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        )}
      </div>
    </div>
  );
}