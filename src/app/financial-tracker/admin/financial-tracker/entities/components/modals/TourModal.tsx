// src/app/admin/financial-tracker/entities/components/modals/TourModal.tsx
'use client';

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Zap, LayoutDashboard, Filter, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TourModal({ isOpen, onClose, onComplete }: TourModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Entity Management',
      description: 'Let\'s take a quick tour to help you get started with managing your entities efficiently.',
      icon: LayoutDashboard,
      color: 'blue'
    },
    {
      title: 'Quick Filters',
      description: 'Use quick filters to instantly view entities by module, status, or your favorites.',
      icon: Filter,
      color: 'purple'
    },
    {
      title: 'Multiple Views',
      description: 'Switch between Table, Cards, Kanban, and Gallery views to visualize your data.',
      icon: Eye,
      color: 'green'
    },
    {
      title: 'Favorites & Bulk Actions',
      description: 'Star important entities and use bulk mode for mass operations.',
      icon: Star,
      color: 'yellow'
    },
    {
      title: 'Ready to Go!',
      description: 'You\'re all set! Start managing your entities with confidence.',
      icon: Zap,
      color: 'orange'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete();
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-${currentStep.color}-100 dark:bg-${currentStep.color}-900/30 flex items-center justify-center`}>
                <Icon className={`h-10 w-10 text-${currentStep.color}-600 dark:text-${currentStep.color}-400`} />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">{currentStep.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {currentStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 0}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex space-x-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step ? 'w-6 bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {step === steps.length - 1 ? (
                <Play className="h-5 w-5 text-green-600" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={onClose}
            className="mt-4 text-xs text-gray-400 hover:text-gray-600 w-full text-center"
          >
            Skip Tour
          </button>
        </div>
      </motion.div>
    </div>
  );
}