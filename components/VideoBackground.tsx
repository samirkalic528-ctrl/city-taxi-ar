
import React, { useEffect, useRef } from 'react';

const VideoBackground: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                // OPTIMIZATION: Request 720p instead of full resolution
                // This saves huge amounts of RAM and battery
                const constraints = {
                    video: { 
                        facingMode: "environment",
                        width: { ideal: 1280, max: 1920 },
                        height: { ideal: 720, max: 1080 },
                        frameRate: { ideal: 30, max: 30 }
                    },
                    audio: false 
                };

                stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied or not available", err);
            }
        };

        startCamera();

        return () => {
            // CRITICAL: Stop all tracks to release camera hardware and memory
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const currentStream = videoRef.current.srcObject as MediaStream;
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"
        />
    );
};

export default VideoBackground;
