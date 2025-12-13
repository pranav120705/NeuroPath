import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose, JointAngles, Session, ExercisePreset } from '../types';
import { calculateAllAngles, drawPose } from '../services/poseUtils';

interface ExerciseSessionProps {
  exercise: ExercisePreset;
  onSessionComplete: (sessionData: Omit<Session, 'id' | 'patientId' | 'doctorId' | 'exercisePresetId'>, exerciseId: string) => void;
  onCancel: () => void;
}

const ExerciseSession: React.FC<ExerciseSessionProps> = ({ exercise, onSessionComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const sessionTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);

  const [model, setModel] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState('Loading...');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const recordedAnglesRef = useRef<Session['angles']>({
      leftElbow: [],
      rightElbow: [],
      leftKnee: [],
      rightKnee: [],
  });

  const setup = async () => {
    setStatus('Loading PoseNet model...');
    try {
      const posenetModel = await (window as any).posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
      });
      setModel(posenetModel);
      setStatus('Loading webcam...');

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setStatus('Ready to start session.');
          };
        }
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      setStatus('Error: Could not initialize camera or model.');
    }
  };

  useEffect(() => {
    setup();
    return () => {
      // Cleanup timers and camera stream
      if (sessionTimer.current) clearTimeout(sessionTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
  }, []);
  
  useEffect(() => {
    const poseLoop = async () => {
      if (!model || !videoRef.current || videoRef.current.readyState < 4) {
        animationFrameId.current = requestAnimationFrame(poseLoop);
        return;
      }

      const video = videoRef.current;
      const pose: Pose = await model.estimateSinglePose(video, { flipHorizontal: false });

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          if (canvasRef.current.width !== video.videoWidth || canvasRef.current.height !== video.videoHeight) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          drawPose(pose, ctx);
        }
      }

      if (isSessionActive) {
        const angles = calculateAllAngles(pose);
        Object.keys(angles).forEach(key => {
            const joint = key as keyof JointAngles;
            if(angles[joint]) {
                recordedAnglesRef.current[joint].push(angles[joint]!);
            }
        });
      }
      
      animationFrameId.current = requestAnimationFrame(poseLoop);
    };

    poseLoop();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [model, isSessionActive]);

  const handleStart = () => {
    recordedAnglesRef.current = { leftElbow: [], rightElbow: [], leftKnee: [], rightKnee: [] };
    setIsSessionActive(true);
    setStatus(`Session in progress... ${exercise.duration}s remaining`);
    setCountdown(exercise.duration);

    countdownTimer.current = window.setInterval(() => {
        setCountdown(prev => {
            const newTime = (prev ?? 0) - 1;
            setStatus(`Session in progress... ${newTime > 0 ? newTime : 0}s remaining`);
            if(newTime <= 0) {
              handleStop();
            }
            return newTime;
        });
    }, 1000);
  };
  
  const handleStop = useCallback(() => {
    setIsSessionActive(false);
    setStatus('Session complete.');
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    setCountdown(null);
    
    // a short delay to show "complete" message before navigating away
    setTimeout(() => {
        onSessionComplete({
            date: new Date().toISOString(),
            angles: recordedAnglesRef.current
        }, exercise.id);
    }, 1500);
  }, [onSessionComplete, exercise.id]);

  return (
    <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 text-center">{exercise.name}</h2>
      <p className="text-gray-600 text-center mb-4">{exercise.description}</p>
      <div className="relative w-full max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-inner bg-gray-900">
        <video ref={videoRef} width="640" height="480" className="absolute top-0 left-0 w-full h-full" style={{transform: "scaleX(-1)"}}/>
        <canvas ref={canvasRef} width="640" height="480" className="absolute top-0 left-0 w-full h-full" style={{transform: "scaleX(-1)"}}/>
         {countdown !== null && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-4xl font-bold p-4 rounded-lg">
            {countdown}
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-lg font-medium text-gray-700 h-6">{status}</p>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        {!isSessionActive ? (
          <button
            onClick={handleStart}
            disabled={!model || status !== 'Ready to start session.'}
            className="px-8 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all transform hover:scale-105"
          >
            Stop Session
          </button>
        )}
        <button
            onClick={onCancel}
            disabled={isSessionActive}
            className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Cancel
        </button>
      </div>
    </div>
  );
};

export default ExerciseSession;