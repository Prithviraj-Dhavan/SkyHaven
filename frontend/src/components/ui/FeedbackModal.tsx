import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { api } from '../../services/api';
import { CheckCircle2, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('loading');
    try {
      await api.submitFeedback({ name, email, message, rating });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setName('');
        setEmail('');
        setMessage('');
        setRating(5);
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send us your Feedback" maxWidth="md">
      {status === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
          <p className="text-slate-500 text-sm">Your feedback has been submitted successfully. We appreciate your input.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#06152a] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#06152a] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="Your email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#06152a] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#06152a] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="Tell us what you think..."
            />
          </div>

          {status === 'error' && (
            <div className="text-rose-500 text-sm">Failed to submit feedback. Please try again.</div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
