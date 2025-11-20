import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, HandLandmarker } from "@mediapipe/tasks-vision";
import { createFaceLandmarker, createHandLandmarker } from './utils/mediaPipeHelper';
import { recognizeGesture } from './utils/gestureHelper';
import WebcamFeed from './components/WebcamFeed';
import HUDOverlay from './components/HUDOverlay';

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);

  const [faces, setFaces] = useState<any[]>([]);
  const [hands, setHands] = useState<any[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [identities, setIdentities] = useState<string[]>([]);
  const [gestures, setGestures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Models
  useEffect(() => {
    const initModels = async () => {
      const face = await createFaceLandmarker();
      const hand = await createHandLandmarker();
      setFaceLandmarker(face);
      setHandLandmarker(hand);
      setLoading(false);
    };
    initModels();
  }, []);

  // Detection Loop
  useEffect(() => {
    let animationFrameId: number;

    const detect = () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && faceLandmarker && handLandmarker) {
        const video = webcamRef.current.video;
        const startTimeMs = performance.now();

        // Detect Faces
        const faceResult = faceLandmarker.detectForVideo(video, startTimeMs);
        const currentFaces = [];
        const currentMoods = [];
        const currentIdentities = [];

        if (faceResult.faceLandmarks) {
          for (let i = 0; i < faceResult.faceLandmarks.length; i++) {
            const landmarks = faceResult.faceLandmarks[i];

            // Calculate Bounding Box
            let minX = 1, minY = 1, maxX = 0, maxY = 0;
            for (const lm of landmarks) {
              if (lm.x < minX) minX = lm.x;
              if (lm.x > maxX) maxX = lm.x;
              if (lm.y < minY) minY = lm.y;
              if (lm.y > maxY) maxY = lm.y;
            }

            currentFaces.push({
              box: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
              landmarks: landmarks
            });

            // Simple Mood Logic
            // Mouth corners: 61 (left), 291 (right). Top lip: 0, Bottom lip: 17.
            const leftMouth = landmarks[61];
            const rightMouth = landmarks[291];
            const topLip = landmarks[0];
            const bottomLip = landmarks[17];

            const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
            const mouthHeight = Math.abs(bottomLip.y - topLip.y);
            const smileRatio = (leftMouth.y + rightMouth.y) / 2 - topLip.y; // Simple approximation

            let mood = "NEUTRAL";
            if (smileRatio < -0.01) mood = "SAD";
            else if (smileRatio > 0.01 && mouthWidth > 0.15) mood = "HAPPY"; // Wide mouth + corners up
            else if (mouthHeight < 0.02) mood = "SERIOUS";
            else mood = "CONFIDENT"; // Default fallback for now

            currentMoods.push(mood);

            // Identity Simulation
            // If face is on the left side (x < 0.5), it's Fildza. Right side is Ammara.
            // Or just assign based on index if they are close to center.
            const centerX = (minX + maxX) / 2;
            if (faceResult.faceLandmarks.length === 1) {
              currentIdentities.push("FILDZA"); // Default to user
            } else {
              // Sort by X position to keep identities stable
              currentIdentities.push(centerX < 0.5 ? "FILDZA" : "AMMARA");
            }
          }
        }

        // Detect Hands
        const handResult = handLandmarker.detectForVideo(video, startTimeMs);
        const currentHands = handResult.landmarks ? handResult.landmarks : [];
        const currentGestures = currentHands.map((hand: any[]) => recognizeGesture(hand));

        setFaces(currentFaces);
        setMoods(currentMoods);
        setIdentities(currentIdentities);
        setHands(currentHands);
        setGestures(currentGestures);
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => cancelAnimationFrame(animationFrameId);
  }, [faceLandmarker, handLandmarker]);

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {loading && (
        <div className="absolute z-50 flex flex-col items-center text-cyber-primary animate-pulse">
          <div className="text-2xl font-orbitron font-bold mb-2">INITIALIZING AI CORE...</div>
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-primary animate-scan-line w-full origin-left"></div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-6xl aspect-video">
        <WebcamFeed ref={webcamRef} className="w-full h-full" />
        <HUDOverlay
          faces={faces}
          hands={hands}
          moods={moods}
          identities={identities}
          gestures={gestures}
        />
      </div>
    </div>
  );
}

export default App;
