import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, MoreVertical, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

interface CommentType {
  id: string;
  item_id: string; // Can be batch_id
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
    is_admin: boolean;
    is_premium: boolean;
  };
}

interface CommentProps {
  itemId: string; // ID of the post/batch currently being viewed (e.g., in PreviewPage)
  currentUser: any; // Currently logged in user
  onRequireLogin: () => void; // Function to show login modal if user is not logged in
}

export default function Comment({ itemId, currentUser, onRequireLogin }: CommentProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments from Supabase
  useEffect(() => {
    if (!itemId) return;

    const fetchComments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          item_id,
          user_id,
          content,
          created_at,
          profiles (username, avatar_url, is_admin, is_premium)
        `)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setComments(data as any);
      }
      setIsLoading(false);
    };

    fetchComments();

    // Subscribe to comment changes in real-time
    const channel = supabase
      .channel(`public:comments:item_id=eq.${itemId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `item_id=eq.${itemId}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          item_id: itemId,
          user_id: currentUser.id,
          content: newComment.trim(),
        }
      ]);

    if (!error) {
      setNewComment('');
    } else {
      console.error('Failed to send comment:', error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) console.error('Failed to delete comment:', error);
  };

  // Date format (e.g., "2 hours ago" or "Oct 12, 2026")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 p-6 sm:p-8 mt-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <MessageCircle size={24} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Comments <span className="text-slate-400 font-medium text-lg">({comments.length})</span>
        </h3>
      </div>

      {/* Comment Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
          {currentUser?.user_metadata?.avatar_url ? (
            <img 
              src={currentUser.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 relative group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentUser ? "Write your comment..." : "Login to write a comment..."}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 min-h-[50px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            rows={2}
            disabled={isSubmitting}
            onClick={() => !currentUser && onRequireLogin()}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className={`absolute right-3 bottom-3 p-2 rounded-xl flex items-center justify-center transition-all ${
              newComment.trim() && !isSubmitting
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5 shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              {/* Commentator Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                {comment.profiles?.avatar_url ? (
                  <img 
                    src={comment.profiles.avatar_url} 
                    alt={comment.profiles.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-4 relative group-hover:bg-slate-100/70 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm">
                      {comment.profiles?.username || 'User'}
                    </span>
                    {comment.profiles?.is_admin && (
                      <img 
                        src="https://tqkgconcbawojmejrudz.supabase.co/storage/v1/object/public/Lencana%20BatchTiktok/AdminBadge.webp" 
                        alt="Admin" 
                        className="w-3.5 h-3.5"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Delete Button (Only appears if this comment belongs to the logged-in user, or the user is an Admin) */}
                {currentUser && (currentUser.id === comment.user_id || currentUser.user_metadata?.is_admin) && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}