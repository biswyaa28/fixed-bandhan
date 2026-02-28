/**
 * Bandhan AI — Video Call Button (Bumble-style Safe Video)
 * In-chat button with permission flow, waiting room, and safety.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Phone, MicOff, Mic, VideoOff,
  X, Shield, Clock, AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

type CallState = "idle" | "requesting" | "waiting" | "connected" | "ended";

export interface VideoCallButtonProps {
  recipientName: string;
  recipientId: string;
  onInitiateCall?: (recipientId: string) => void;
  onEndCall?: () => void;
  onReport?: () => void;
  language?: "en" | "hi";
  className?: string;
}

export function VideoCallButton({
  recipientName,
  recipientId,
  onInitiateCall,
  onEndCall,
  onReport,
  language = "en",
  className,
}: VideoCallButtonProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const handleInitiate = () => setCallState("requesting");

  const handleConfirm = () => {
    setCallState("waiting");
    onInitiateCall?.(recipientId);
    // Simulate connection after 2s
    setTimeout(() => setCallState("connected"), 2000);
  };

  const handleEnd = () => {
    setCallState("ended");
    onEndCall?.();
    setTimeout(() => setCallState("idle"), 3000);
  };

  const handleCancel = () => setCallState("idle");

  // Idle: show button
  if (callState === "idle") {
    return (
      <button
        onClick={handleInitiate}
        className={cn(
          "w-10 h-10 flex items-center justify-center",
          "border-2 border-black bg-white cursor-pointer",
          "shadow-[2px_2px_0px_#000000]",
          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
          "transition-[transform,box-shadow] duration-150",
          className,
        )}
        aria-label="Start video call"
      >
        <Video className="w-4 h-4 text-black" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* Permission dialog */}
      {callState === "requesting" && (
        <motion.div
          key="requesting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80" onClick={handleCancel} />
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-[90%] max-w-[360px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000]"
          >
            <div className="px-6 py-3 bg-black text-white flex items-center gap-2">
              <Video className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-xs font-heading font-bold uppercase tracking-wider">
                {language === "en" ? "Video Call" : "वीडियो कॉल"}
              </span>
            </div>
            <div className="px-6 py-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
                <Video className="w-8 h-8 text-[#424242]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-bold text-black m-0">
                {language === "en"
                  ? `Start video call with ${recipientName}?`
                  : `${recipientName} के साथ वीडियो कॉल शुरू करें?`}
              </p>
              <div className="flex items-center gap-1 justify-center mt-2">
                <Shield className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
                <p className="text-[10px] text-[#9E9E9E] m-0">
                  {language === "en"
                    ? "Screenshots blocked · Recording detected"
                    : "स्क्रीनशॉट ब्लॉक · रिकॉर्डिंग डिटेक्ट"}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 border-2 border-black text-xs font-heading font-bold uppercase cursor-pointer hover:bg-[#F8F8F8]"
                >
                  {language === "en" ? "Cancel" : "रद्द"}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                >
                  {language === "en" ? "Start Call" : "कॉल शुरू"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Waiting room */}
      {callState === "waiting" && (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#212121] flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 bg-[#424242] border-2 border-black flex items-center justify-center mb-6">
            <span className="text-2xl font-heading font-bold text-white">{recipientName[0]}</span>
          </div>
          <p className="text-sm font-heading font-bold text-white uppercase tracking-wider mb-2">
            {language === "en" ? `Calling ${recipientName}...` : `${recipientName} को कॉल कर रहे हैं...`}
          </p>
          {/* Pulsing dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-white border border-black"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <button
            onClick={handleCancel}
            className="mt-8 px-6 py-2.5 border-2 border-white bg-transparent text-white text-xs font-heading font-bold uppercase cursor-pointer hover:bg-white hover:text-black transition-colors"
          >
            {language === "en" ? "Cancel" : "रद्द"}
          </button>
        </motion.div>
      )}

      {/* Connected */}
      {callState === "connected" && (
        <motion.div
          key="connected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#212121] flex flex-col"
        >
          {/* Video area placeholder */}
          <div className="flex-1 flex items-center justify-center bg-[#1a1a1a]">
            <div className="w-24 h-24 bg-[#424242] border-2 border-black flex items-center justify-center">
              <span className="text-3xl font-heading font-bold text-white">{recipientName[0]}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-6 bg-black border-t-2 border-white">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-12 h-12 flex items-center justify-center border-2 border-white cursor-pointer",
                isMuted ? "bg-white text-black" : "bg-transparent text-white",
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" strokeWidth={2} /> : <Mic className="w-5 h-5" strokeWidth={2} />}
            </button>
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={cn(
                "w-12 h-12 flex items-center justify-center border-2 border-white cursor-pointer",
                isCameraOff ? "bg-white text-black" : "bg-transparent text-white",
              )}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" strokeWidth={2} /> : <Video className="w-5 h-5" strokeWidth={2} />}
            </button>
            <button
              onClick={handleEnd}
              className="w-14 h-14 flex items-center justify-center bg-white text-black border-[3px] border-white cursor-pointer shadow-[2px_2px_0px_rgba(255,255,255,0.3)]"
              aria-label="End call"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" strokeWidth={2.5} />
            </button>
            <button
              onClick={onReport}
              className="w-12 h-12 flex items-center justify-center border-2 border-white bg-transparent text-white cursor-pointer"
              aria-label="Report during call"
            >
              <AlertTriangle className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Ended */}
      {callState === "ended" && (
        <motion.div
          key="ended"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#212121] flex flex-col items-center justify-center"
        >
          <Phone className="w-10 h-10 text-white mb-4" strokeWidth={1.5} />
          <p className="text-sm font-heading font-bold text-white uppercase">
            {language === "en" ? "Call Ended" : "कॉल समाप्त"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VideoCallButton;
