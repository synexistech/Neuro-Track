import { forwardRef } from 'react';
import Webcam from 'react-webcam';

interface WebcamFeedProps {
    className?: string;
}

const WebcamFeed = forwardRef<Webcam, WebcamFeedProps>(({ className }, ref) => {
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <div className={`relative overflow-hidden rounded-xl border-2 border-cyber-primary/30 box-glow ${className}`}>
            <Webcam
                ref={ref}
                audio={false}
                width={1280}
                height={720}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
            />

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-scanline opacity-10"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyber-primary/5 to-transparent animate-scan-line"></div>
        </div>
    );
});

export default WebcamFeed;
