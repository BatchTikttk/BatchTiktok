import { useState } from 'react';
import { supabase } from '../supabase';
import { Crown, Clock, Send, Link as LinkIcon } from 'lucide-react';

interface CustomBatchRequestProps {
  currentUser: any; 
}

// The currentUser prop contains data from the profiles table
export default function CustomBatchRequest({ currentUser }: CustomBatchRequestProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Check if the user is VIP based on the is_premium column from the profiles table
  const isVip = currentUser?.is_premium || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl || !currentUser) {
      setMessage('Error: You must be logged in to make a request.');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');

    // Insert data into the newly created batch_requests table
    const { error } = await supabase
      .from('batch_requests')
      .insert([
        {
          user_id: currentUser.id,
          target_url: targetUrl,
          is_priority: isVip, // Automatically true if the user is VIP
          status: 'pending'
          // result_url is not passed here as it will be filled by the admin later
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      setMessage('Failed to send request. Please try again.');
      console.error(error);
    } else {
      setTargetUrl('');
      setMessage(isVip ? 'Success! Your priority request is at the top of the queue. ⚡' : 'Success! Your request has entered the standard queue.');
    }
  };

  if (!currentUser) return null; // Hide form if not logged in

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className={`p-6 text-white ${isVip ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gray-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Custom Batch Request</h2>
            <p className="text-gray-300 text-sm">
              Request the admin to archive your selected TikTok profile.
            </p>
          </div>
          {isVip && <Crown className="text-yellow-400" size={32} />}
        </div>
      </div>

      <div className="p-6">
        <div className={`flex gap-3 p-4 rounded-xl mb-6 ${isVip ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
          {isVip ? <Crown className="shrink-0 text-yellow-500 mt-1" size={20} /> : <Clock className="shrink-0 text-gray-400 mt-1" size={20} />}
          <div>
            <h4 className="font-semibold">{isVip ? 'VIP Queue Active' : 'Standard Queue'}</h4>
            <p className="text-sm">
              {isVip ? 'Your request is prioritized and will be processed faster by the admin.' : 'Estimated processing 3-7 days. Upgrade to VIP for instant processing.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="url" 
              placeholder="Enter TikTok profile link..." 
              value={targetUrl} 
              onChange={(e) => setTargetUrl(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              required 
            />
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'} ${isVip ? 'bg-yellow-500' : 'bg-blue-600'}`}
          >
            {isSubmitting ? 'Processing...' : 'Send Request'}
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}