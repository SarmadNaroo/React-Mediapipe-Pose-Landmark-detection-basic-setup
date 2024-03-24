import React, { useRef, useEffect } from 'react';
import Webcam from "react-webcam";
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = webcamRef.current.video.videoWidth;
    canvas.height = webcamRef.current.video.videoHeight;

    ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
      results.poseLandmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    }
  };

  // Utility function to draw connections
  function drawConnectors(ctx, landmarks, connections, { color, lineWidth }) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvasRef.current.width, start.y * canvasRef.current.height);
        ctx.lineTo(end.x * canvasRef.current.width, end.y * canvasRef.current.height);
        ctx.stroke();
      }
    });
  }

  return (
    <div className="bg-gray-100 w-full h-screen flex justify-center items-center overflow-hidden relative"> {/* Full screen, center content, and make position relative for floating elements */}
      {/* Floating bar */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center bg-red-300 text-white z-50">
        {/* Content of the floating bar */}
        <div className="flex items-center space-x-4"> {/* Correct and Incorrect counters */}
          <div><span className="font-semibold">Correct:</span> <span className="font-bold">10</span></div>
          <div><span className="font-semibold">Incorrect:</span> <span className="font-bold">2</span></div>
        </div>
        <div className="flex items-center space-x-4"> {/* Timer */}
          <div><span className="font-semibold">Time:</span> <span className="font-bold">01:30</span></div>
        </div>
      </div>
      {/* Webcam and canvas container */}
      <div className="relative w-full max-w-screen-lg mx-auto"> {/* Max width for larger screens, centering */}
        {/* Webcam is hidden but can adjust if needed, maintaining aspect ratio */}
        <Webcam
          ref={webcamRef}
          style={{ display: 'none' }}
        />
        {/* Canvas fills parent, maintains aspect ratio */}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain"
          style={{
            maxWidth: '100vw', /* Maximum width */
            maxHeight: '100vh', /* Maximum height */
            position: 'relative',
            left: 0,
            top: 0
          }}
        />
      </div>
    </div>
  );

}

export default App;
