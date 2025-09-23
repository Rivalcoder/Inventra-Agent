"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

export default function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!mounted) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e) {
        onClose();
      }
    })();
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [onClose]);

  async function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.92);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Scan with Camera</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <video ref={videoRef} className="w-full rounded-md bg-black" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={capture}>Capture</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


