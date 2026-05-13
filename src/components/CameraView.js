import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import './CameraView.css';

// Map face-api expressions to our target emotions
const EXPRESSION_MAP = {
  happy: 'happy',
  sad: 'sad',
  neutral: 'neutral',
  angry: 'angry',
  surprised: 'surprised',
  fearful: 'scared',
  disgusted: 'angry', // map disgusted to angry (close enough for kids)
};

const CameraView = ({ targetEmotion, onEmotionDetected, onSuccess, onReady, loading, hideVideo, activeDetection = true }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionLoopRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0); // 0-100, how long they've held the right face
  const matchCountRef = useRef(0);
  const successTriggeredRef = useRef(false);
  const activeDetectionRef = useRef(activeDetection);

  // Reset progress when target emotion changes
  useEffect(() => {
    matchCountRef.current = 0;
    successTriggeredRef.current = false;
    setMatchProgress(0);
    setDetectedEmotion(null);
    setConfidence(0);
  }, [targetEmotion]);

  // Sync prop to ref for zero-latency access in the detection loop
  useEffect(() => {
    activeDetectionRef.current = activeDetection;
  }, [activeDetection]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading models:', err);
      }
    };
    loadModels();
  }, []);

  // Initialize Camera
  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error('Error starting camera:', err);
      }
    };

    startVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [modelsLoaded]);

  // Reset match progress when target emotion changes
  useEffect(() => {
    matchCountRef.current = 0;
    successTriggeredRef.current = false;
    setMatchProgress(0);
    setDetectedEmotion(null);
    setConfidence(0);
  }, [targetEmotion]);

  // Real-time face detection loop
  const runDetection = useCallback(async () => {
    if (!videoRef.current || !cameraReady || !modelsLoaded || successTriggeredRef.current) return;

    const video = videoRef.current;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.1 }))
        .withFaceExpressions();

      // Report ready to parent on first successful load/detection
      if (modelsLoaded && !successTriggeredRef.current && onReady) {
        onReady();
      }

      if (!detection) {
        if (activeDetectionRef.current) {
          setDetectedEmotion(null);
          setConfidence(0);
          matchCountRef.current = Math.max(0, matchCountRef.current - 0.5);
          setMatchProgress(Math.max(0, (matchCountRef.current / 3) * 100));
        }
        return;
      }

      // If detection is not active yet (during countdown), we still run it to "warm up" the model
      if (!activeDetectionRef.current) return;

      const expressions = detection.expressions;
      // Find the dominant expression
      let maxExpr = 'neutral';
      let maxConf = 0;

      Object.entries(expressions).forEach(([expr, conf]) => {
        if (conf > maxConf) {
          maxConf = conf;
          maxExpr = expr;
        }
      });

      const mappedEmotion = EXPRESSION_MAP[maxExpr] || 'neutral';
      setDetectedEmotion(mappedEmotion);
      setConfidence(Math.round(maxConf * 100));

      // Report detected emotion to parent
      if (onEmotionDetected) {
        onEmotionDetected(mappedEmotion, maxConf);
      }

      // Check if it matches the target
      if (mappedEmotion === targetEmotion && maxConf > 0.15) {
        matchCountRef.current += 1;
        const progress = Math.min((matchCountRef.current / 5) * 100, 100);
        setMatchProgress(progress);

        if (matchCountRef.current >= 5 && !successTriggeredRef.current) {
          successTriggeredRef.current = true;
          setMatchProgress(100);
          if (onSuccess) {
            onSuccess({
              detected_emotion: mappedEmotion,
              confidence: maxConf,
              success: true,
            });
          }
        }
      } else {
        // Wrong expression — decay progress quickly
        matchCountRef.current = Math.max(0, matchCountRef.current - 1.5);
        setMatchProgress(Math.max(0, (matchCountRef.current / 5) * 100));
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [cameraReady, modelsLoaded, targetEmotion, onEmotionDetected, onSuccess]);

  // Start detection loop when camera is ready
  useEffect(() => {
    if (!cameraReady || !modelsLoaded) return;

    const interval = setInterval(() => {
      runDetection();
    }, 100);

    detectionLoopRef.current = interval;

    return () => {
      if (detectionLoopRef.current) {
        clearInterval(detectionLoopRef.current);
      }
    };
  }, [cameraReady, modelsLoaded, runDetection]);

  // Get color for the match progress ring
  const getProgressColor = () => {
    if (matchProgress >= 80) return '#4CAF50';
    if (matchProgress >= 40) return '#FF9800';
    return '#74B9FF';
  };

  return (
    <div className="camera-view">
      <div className="camera-container">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`camera-video ${cameraReady && !hideVideo ? 'visible' : 'hidden'}`}
            onCanPlay={() => setCameraReady(true)}
          />

          <div
            className="camera-overlay-border"
            style={{
              borderColor: getProgressColor(),
              boxShadow: matchProgress > 0 ? `0 0 20px ${getProgressColor()}44` : 'none'
            }}
          />

          {/* Face guide - Using provided baby icon */}
          <div className={`camera-face-guide ${hideVideo ? 'countdown-mode' : ''}`}>
            <img
              src="/assets/camera-guide.png"
              alt="Face Guide"
              className="face-guide-image"
              style={{
                borderColor: matchProgress > 60 ? '#4CAF50' : 'rgba(255,255,255,0.4)',
                filter: matchProgress > 60 ? 'drop-shadow(0 0 10px #4CAF50)' : 'none'
              }}
            />
          </div>

          {/* Detected emotion label */}
          {activeDetection && detectedEmotion && (
            <div className="detected-emotion-label" style={{ backgroundColor: getProgressColor() }}>
              {detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)} {confidence}%
            </div>
          )}

          {/* Loading indicator */}
          {(!cameraReady || !modelsLoaded || loading) && (
            <div className="camera-loading">
              <div className="spinner" />
              <p>{!modelsLoaded ? 'Loading AI...' : 'Starting Camera...'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar below the camera */}
      {activeDetection && (
        <div className="match-progress-container">
          <div className="match-progress-text">
            {matchProgress < 100 ? 'Hold that face!' : 'Perfect! 🌟'}
          </div>
          <div className="match-progress-bar-bg">
            <div
              className="match-progress-bar-fill"
              style={{
                width: `${matchProgress}%`,
                backgroundColor: getProgressColor()
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
