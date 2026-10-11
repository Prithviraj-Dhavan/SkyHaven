import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { api } from '../../services/api';
import { MessageSquare, Star } from 'lucide-react';

export const FeedbackTable: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminFeedback()
      .then((res) => {
        if (res.success) {
          setFeedbacks(res.data);
        }
      })
      .catch((err) => console.error('Failed to load feedback', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading user feedback...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          User Feedback Submissions
        </h2>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          No feedback has been submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => (
            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.email}</div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {item.rating}/5
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 whitespace-pre-wrap">
                {item.message}
              </p>
              <div className="text-[10px] text-slate-400 mt-4 text-right">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
