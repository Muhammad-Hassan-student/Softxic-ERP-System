// src/app/admin/financial-tracker/entities/components/modals/FeedbackModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Send, Star, Bug, Lightbulb, Heart, Smile, Frown, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [type, setType] = useState<'feedback' | 'bug' | 'feature'>('feedback');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ type, rating, message, email, screenshot });
      toast.success('Thank you for your feedback!');
      setSubmitting(false);
      onClose();
    }, 1500);
  };

  const handleScreenshot = () => {
    // Simulate screenshot capture
    setScreenshot('data:image/png;base64,sample');
    toast.success('Screenshot captured');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Send Feedback</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Feedback Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setType('feedback')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  type === 'feedback' ? 'border-purple-500 bg-purple-50' : ''
                }`}
              >
                <Smile className={`h-5 w-5 ${type === 'feedback' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="text-xs">Feedback</span>
              </button>
              <button
                onClick={() => setType('bug')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  type === 'bug' ? 'border-red-500 bg-red-50' : ''
                }`}
              >
                <Bug className={`h-5 w-5 ${type === 'bug' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className="text-xs">Bug Report</span>
              </button>
              <button
                onClick={() => setType('feature')}
                className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                  type === 'feature' ? 'border-green-500 bg-green-50' : ''
                }`}
              >
                <Lightbulb className={`h-5 w-5 ${type === 'feature' ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-xs">Feature</span>
              </button>
            </div>
          </div>

          {/* Rating */}
          {type === 'feedback' && (
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={type === 'bug' 
                ? "Describe the bug and steps to reproduce..." 
                : type === 'feature'
                ? "Describe the feature you'd like to see..."
                : "Share your thoughts, suggestions, or feedback..."
              }
              className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
              rows={4}
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="We'll only use this to respond to your feedback"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
            />
          </div>

          {/* Screenshot */}
          <div>
            <button
              onClick={handleScreenshot}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
            >
              <Camera className="h-4 w-4 mr-1" />
              Attach Screenshot
            </button>
            {screenshot && (
              <div className="mt-2 p-2 bg-gray-100 rounded flex items-center justify-between">
                <span className="text-xs">screenshot.png</span>
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500">
            Your feedback helps us improve the platform for everyone.
          </p>
        </div>
      </motion.div>
    </div>
  );
}