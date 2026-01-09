'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/src/lib/api';

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
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = handleUpload;
      
      startTime.current = Date.now();
      mediaRecorder.current.start();
      setIsRecording(true);
      toast.info("Listening... (Release to send)");
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied");
    }
  };

  // 2. STOP RECORDING
  const stopRecording = () => {
  const duration = Date.now() - startTime.current;

      if (duration < 1000) { //  If less than 1 second
        toast.warning("Hold longer to record!");
        if (mediaRecorder.current) {
            // Cancel recording logic (don't set onstop handler to upload)
            mediaRecorder.current.onstop = null; 
            mediaRecorder.current.stop();
        }
        setIsRecording(false);
        return;
    }
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // 3. UPLOAD TO BACKEND
  const handleUpload = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'command.webm');

    try {
      // Call your NestJS Backend
      const res = await api.upload<any>('/assistant/voice-command', formData);
      
      // Pass result back to Dashboard
      onCommand(res.transcription, res.createdPost?.platformData?.aiIntent);
      
      toast.success("AI processed your command!", {
        description: `"${res.transcription}"`
      });

    } catch (error: any) {
      console.error(" Voice Upload Error:", error); 
      toast.error(`Failed: ${error.message}`);
    }finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isProcessing}
        className={`
            group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border shadow-sm transition-all duration-300 select-none
            ${isRecording 
                ? 'bg-white-50 border-blue-200 shadow-blue-500/20' 
                : 'bg-white border-blue-100 hover:shadow-md hover:border-blue-300'}
        `}
      >
        <div className={`
            w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors
            ${isRecording ? 'bg-blue-500 animate-pulse' : 'bg-gradient-to-tr from-blue-500 to-blue-500'}
        `}>
            {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isRecording ? (
                <Mic className="w-3.5 h-3.5" />
            ) : (
                // Use your Brand Avatar here if you want
                <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=EasyAI&backgroundColor=3C48F6`}
                    alt="AI"
                    className="w-full h-full rounded-full border border-white/20"
                />
            )}
        </div>
      </motion.button>

      {/* Recording Ripple Effect */}
      {isRecording && (
        <span className="absolute -inset-1 rounded-full bg-blue-400 opacity-20 animate-ping pointer-events-none"></span>
      )}
    </div>
  );
}