'use client';

import React, { useState, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

interface VoiceAiButtonProps {
  onCommand: (transcription: string, intent: any) => void;
}

export default function VoiceAiButton({ onCommand }: VoiceAiButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);

  // 1. START RECORDING
  const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent text selection or scrolling
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      // Only attach the stop handler once
      mediaRecorder.current.onstop = handleUpload;
      
      startTime.current = Date.now();
      mediaRecorder.current.start();
      setIsRecording(true);
      toast.info("Listening... (Release to send)");
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied. Please check browser settings.");
    }
  };

  // 2. STOP RECORDING
  const stopRecording = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isRecording) return;

    const duration = Date.now() - startTime.current;

    // Minimum recording duration check
    if (duration < 500) { 
      toast.warning("Hold longer to record!");
      if (mediaRecorder.current) {
          mediaRecorder.current.onstop = null; // Remove handler to prevent upload
          mediaRecorder.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop(); // This triggers onstop -> handleUpload
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // 3. UPLOAD TO BACKEND
  const handleUpload = async () => {
    // Safety check: ensure we have data
    if (audioChunks.current.length === 0) {
        setIsProcessing(false);
        return;
    }

    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'command.webm');

    try {
      // ➤ FIX: Use api.post and set headers
      const { data } = await api.post('/assistant/voice-command', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // ➤ FIX: Match backend response structure
      // Backend returns: { message, transcription, createdPost: { ..., intent: ... } }
      const intent = data.createdPost?.intent || data.intent; 

      onCommand(data.transcription, intent);
      
      toast.success("AI processed command!", {
        description: `"${data.transcription}"`
      });

    } catch (error: any) {
      console.error("Voice Upload Error:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(`Failed: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        // Mouse Events
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording} // Safety: Stop if dragged away
        // Touch Events (Mobile)
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isProcessing}
        className={`
            group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border shadow-sm transition-all duration-300 select-none cursor-pointer
            ${isRecording 
                ? 'bg-red-50 border-red-200 shadow-red-500/20' 
                : 'bg-white border-blue-100 hover:shadow-md hover:border-blue-300'}
        `}
      >
        <div className={`
            w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors
            ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-tr from-blue-500 to-indigo-600'}
        `}>
            {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isRecording ? (
                <Mic className="w-3.5 h-3.5" />
            ) : (
                <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`}
                    alt="AI"
                    className="w-full h-full rounded-full border border-white/20"
                />
            )}
        </div>
        
        <span className={`text-xs font-bold ${isRecording ? 'text-red-500' : 'text-gray-600'}`}>
            {isRecording ? 'Listening...' : isProcessing ? 'Thinking...' : 'Voice AI'}
        </span>
      </motion.button>

      {/* Recording Ripple Effect */}
      {isRecording && (
        <span className="absolute -inset-1 rounded-full bg-red-400 opacity-20 animate-ping pointer-events-none"></span>
      )}
    </div>
  );
}