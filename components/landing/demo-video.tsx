'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideo({ isOpen, onClose }: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl mx-4 aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 animate-pulse"></div>
              
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full animate-float"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-teal-500/20 rounded-full animate-float animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-500/20 rounded-full animate-float animation-delay-4000"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <Play className="w-12 h-12 ml-1" />
                </motion.div>
                
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  InventSmart AI Demo
                </motion.h3>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 mb-6"
                >
                  See how AI-powered inventory management transforms your business
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center space-x-4"
                >
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="ml-2">{isPlaying ? 'Pause' : 'Play'} Demo</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Video Controls */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handlePlayPause}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    onClick={handleMute}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleFullscreen}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              ×
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 