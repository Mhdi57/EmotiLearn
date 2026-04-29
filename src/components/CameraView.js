/**
 * CameraView.js - Live camera with real-time facial expression detection
 *
 * Uses face-api.js to detect emotions in real-time from the webcam.
 * When the child makes the correct face, it auto-triggers success.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

// Map face-api.js expression names to our app's emotion names
const EXPRESSION_MAP = {
  happy: 'happy',
  sad: 'sad',
  neutral: 'neutral',
  angry: 'angry',
  surprised: 'surprised',
  fearful: 'scared',
  disgusted: 'angry', // map disgusted to angry (close enough for kids)
};

const CameraView = ({ targetEmotion, onEmotionDetected, onSuccess, loading }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionLoopRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0); // 0-100, how long they've held the right face
  const matchCountRef = useRef(0);
  const successTriggeredRef = useRef(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = process.env.PUBLIC_URL + '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('Face detection models loaded!');
      } catch (err) {
        console.error('Error loading models:', err);
        setCameraError('Could not load face detection. Please refresh the page.');
      }
    };
    loadModels();
  }, []);

  // Start the camera
  useEffect(() => {
    if (!modelsLoaded) return;

    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onplaying = () => {
            if (mounted) setCameraReady(true);
          };
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Auto-play issue:', playErr);
          }
        }
      } catch (err) {
        console.error('Camera access error:', err);
        if (mounted) {
          setCameraError(
            err.name === 'NotAllowedError'
              ? 'Camera access denied. Please allow camera access and refresh.'
              : 'Could not access camera. Please check your device.'
          );
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
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
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 }))
        .withFaceExpressions();

      if (detection) {
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

        // Check if it matches the target (low threshold so it's quick and fun)
        if (mappedEmotion === targetEmotion && maxConf > 0.25) {
          matchCountRef.current += 1;
          // Need 5 consecutive frames (~1 second) — balanced speed
          const progress = Math.min((matchCountRef.current / 5) * 100, 100);
          setMatchProgress(progress);

          if (matchCountRef.current >= 5 && !successTriggeredRef.current) {
            successTriggeredRef.current = true;
            setMatchProgress(100);
            // Trigger success!
            if (onSuccess) {
              onSuccess({
                detected_emotion: mappedEmotion,
                confidence: maxConf,
                success: true,
              });
            }
            return; // Stop the loop
          }
        } else {
          // Wrong expression — decay progress slowly
          matchCountRef.current = Math.max(0, matchCountRef.current - 0.5);
          setMatchProgress(Math.max(0, (matchCountRef.current / 5) * 100));
        }
      } else {
        // No face detected
        setDetectedEmotion(null);
        setConfidence(0);
        matchCountRef.current = Math.max(0, matchCountRef.current - 0.5);
        setMatchProgress(Math.max(0, (matchCountRef.current / 3) * 100));
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
    }, 200); // Run detection every 200ms — fast and responsive

    detectionLoopRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [cameraReady, modelsLoaded, runDetection]);

  // Get color for the match progress ring
  const getProgressColor = () => {
    if (matchProgress >= 80) return '#4CAF50';
    if (matchProgress >= 40) return '#FF9800';
    return '#e0e0e0';
  };

  // Get emoji for detected emotion
  const getDetectedEmoji = () => {
    const emojiMap = {
      happy: '😊', sad: '😢', neutral: '😐',
      angry: '😠', surprised: '😮', scared: '😨',
    };
    return emojiMap[detectedEmotion] || '🤔';
  };

  return (
    <div className="camera-view">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera error state */}
      {cameraError && (
        <div className="camera-error">
          <div className="camera-error-icon">📷❌</div>
          <p className="camera-error-text">{cameraError}</p>
        </div>
      )}

      {/* Loading models */}
      {!modelsLoaded && !cameraError && (
        <div className="camera-loading-models">
          <div className="models-spinner" />
          <span className="models-loading-text">Loading face detection AI...</span>
        </div>
      )}

      {/* Live video feed */}
      {!cameraError && modelsLoaded && (
        <div className="camera-feed-container">
          {/* Loading camera */}
          {!cameraReady && (
            <div className="camera-loading">
              <div className="camera-loading-animation">
                <span className="camera-loading-icon">📷</span>
                <span className="camera-loading-text">Starting camera...</span>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`camera-video ${cameraReady ? 'visible' : 'hidden'}`}
          />

          {/* Border color changes based on match */}
          <div
            className="camera-overlay-border"
            style={{
              borderColor: matchProgress > 60 ? '#4CAF50' : matchProgress > 20 ? '#FF9800' : '#74B9FF',
              boxShadow: matchProgress > 60
                ? '0 0 20px rgba(76, 175, 80, 0.4), inset 0 0 20px rgba(76, 175, 80, 0.1)'
                : 'none',
            }}
          />

          {/* Face guide */}
          {cameraReady && (
            <div className="camera-face-guide">
              <div
                className="face-guide-oval"
                style={{ borderColor: `rgba(${matchProgress > 60 ? '76,175,80' : '255,255,255'}, 0.4)` }}
              />
            </div>
          )}

          {/* Real-time emotion indicator overlay */}
          {cameraReady && detectedEmotion && (
            <div className="detected-emotion-overlay">
              <span className="detected-emoji">{getDetectedEmoji()}</span>
              <span className="detected-label">{detectedEmotion}</span>
              <span className="detected-confidence">{confidence}%</span>
            </div>
          )}

          {/* Match progress bar at the bottom */}
          {cameraReady && (
            <div className="match-progress-container">
              <div
                className="match-progress-bar"
                style={{
                  width: `${matchProgress}%`,
                  backgroundColor: getProgressColor(),
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Status text below camera */}
      {cameraReady && !loading && (
        <div className="camera-status">
          {matchProgress >= 80 ? (
            <span className="status-text status-text--great">Almost there! Hold it! 🎯</span>
          ) : detectedEmotion === targetEmotion ? (
            <span className="status-text status-text--good">That's it! Keep holding! 👏</span>
          ) : detectedEmotion ? (
            <span className="status-text status-text--try">
              I see <strong>{detectedEmotion}</strong> — try to look more <strong>{targetEmotion}</strong>!
            </span>
          ) : (
            <span className="status-text status-text--waiting">Show me your face! 👀</span>
          )}
        </div>
      )}

      {/* Analyzing state */}
      {loading && (
        <div className="camera-analyzing">
          <div className="analyzing-animation">
            <div className="analyzing-spinner" />
            <span className="analyzing-text">Checking your face...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
