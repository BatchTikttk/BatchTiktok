import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, Send, Trash2, Loader2, ShieldCheck, Clock, Reply, CornerDownRight, AlertCircle } from 'lucide-react';
import AvatarBorderVip from './AvatarBorderVip';

interface CommentsProps {
  itemId: string | number;
  currentUser?: any; 
  onRequireLogin: () => void;
}

export default function Comments({ itemId, currentUser, onRequireLogin }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  // State untuk menangkap error jika itemId bukan UUID
  const [uuidError, setUuidError] = useState<string | null>(null);

  const currentUserId = typeof currentUser === 'string' ? currentUser : currentUser?.id;

  // Fungsi untuk memvalidasi format UUID
  const isValidUUID = (id: string | number) => {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    return regexExp.test(String(id));
  };

  useEffect(() => {
    if (!itemId) return;

    // Cek apakah itemId adalah UUID yang valid sesuai skema database
    if (!isValidUUID(itemId)) {
      setUuidError(`Data itemId ("${itemId}") bukan format UUID yang valid. Harap kirimkan id (UUID) dari tabel batches.`);
      setIsLoading(false);
      return;
    }

    setUuidError(null);
    fetchComments();
    
    if (currentUserId) {
      fetchCurrentUserProfile();
    }
  }, [itemId, currentUserId]);

  const fetchCurrentUserProfile = async () => {
    if (!currentUserId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url, vip_border_url, animation_border_url, is_premium, is_admin')
      .eq('id', currentUserId)
      .single();
    
    if (!error && data) {
      setCurrentUserProfile(data);
    }
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
        parent_id,
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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else if (data) {
      setComments(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          content: newComment.trim(),
          parent_id: null
        }
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
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

    if (error) {
      console.error('Error submitting comment:', error);
      alert(`Gagal mengirim komentar: ${error.message}`);
    } else if (data) {
      setComments([...comments, data]);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!currentUserId) {
      onRequireLogin();
      return;
    }

    if (!replyText.trim()) return;

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('comments')
      .insert([
        { 
          item_id: itemId,
          user_id: currentUserId, 
          content: replyText.trim(),
          parent_id: parentId
        }
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
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

    if (error) {
      console.error('Error submitting reply:', error);
      alert(`Gagal mengirim balasan: ${error.message}`);
    } else if (data) {
      setComments([...comments, data]);
      setReplyingTo(null);
      setReplyText('');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Hapus komentar ini?")) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
    } else {
      setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
    }
  };

  // UI Error Handler jika itemId bukan UUID
  if (uuidError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[32px] p-6 text-red-600 flex items-start gap-3 w-full shadow-sm">
        <AlertCircle className="shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-lg mb-1">Konfigurasi Komponen Error</h3>
          <p className="text-sm leading-relaxed mb-3">{uuidError}</p>
          <div className="bg-white p-3 rounded-xl border border-red-100 text-xs text-slate-700">
            <strong>Cara Perbaiki:</strong> Cari file yang memanggil komponen ini (misal di halaman detail video), dan ubah prop-nya menjadi:<br/>
            <code className="text-emerald-600 font-bold block mt-1">
              &lt;Comments itemId={'{batch.id}'} ... /&gt;
            </code>
          </div>
        </div>
      </div>
    );
  }

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
            borderUrl={vipBorder} 
            isPremium={isPremium} 
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

  const mainComments = comments
    .filter(c => !c.parent_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
  const getReplies = (parentId: string) => 
    comments
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const CommentBlock = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => (
    <div className={`flex gap-3 lg:gap-4 group ${isReply ? 'mt-4' : ''}`}>
      {isReply && (
        <div className="mt-3 text-slate-300 hidden md:block">
          <CornerDownRight size={16} />
        </div>
      )}
      
      {renderAvatarWithBorder(comment.profiles, isReply ? 'small' : 'medium')}

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3 border-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-800">
                {comment.profiles?.username || 'Unknown User'}
              </span>
              {comment.profiles?.is_admin && (
                <ShieldCheck className="text-[#fbbf24]" size={12} />
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600 break-words leading-relaxed">
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-1.5 px-2">
          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <Clock size={10} />
            {new Date(comment.created_at).toLocaleString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>

          {!isReply && (
            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  onRequireLogin();
                  return;
                }
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText('');
              }}
              className={`text-[10px] font-bold transition-colors flex items-center gap-1 ${
                replyingTo === comment.id ? 'text-[#10b981]' : 'text-slate-400 hover:text-[#10b981]'
              }`}
            >
              <Reply size={10} /> Reply
            </button>
          )}
          
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
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full border-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 text-[#10b981] rounded-2xl">
          <Send size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">
          Comments <span className="text-slate-400 text-sm font-medium">({comments.length})</span>
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3 lg:gap-4 items-start">
        {renderAvatarWithBorder(currentUserProfile || {}, 'medium')}
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => !currentUserId && onRequireLogin()}
            placeholder={currentUserId ? "Write your comment..." : "Login to write a comment..."}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)]"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#10b981] disabled:opacity-50 transition-colors"
          >
            {isSubmitting && !replyingTo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-300" size={24} />
          </div>
        ) : mainComments.length > 0 ? (
          mainComments.map((comment) => (
            <div key={comment.id} className="w-full">
              
              <CommentBlock comment={comment} />

              <div className="ml-12 md:ml-16 mt-2 border-l-2 border-slate-100 pl-4">
                
                {getReplies(comment.id).map(reply => (
                  <CommentBlock comment={reply} isReply={true} key={reply.id} />
                ))}

                {replyingTo === comment.id && (
                  <form 
                    onSubmit={(e) => handleReplySubmit(e, comment.id)} 
                    className="mt-4 flex gap-3 items-start animate-in fade-in duration-200"
                  >
                    {renderAvatarWithBorder(currentUserProfile || {}, 'small')}
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.profiles?.username || 'User'}...`}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)]"
                        disabled={isSubmitting}
                        autoFocus
                      />
                      <button 
                        type="submit"
                        disabled={!replyText.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#10b981] disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
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