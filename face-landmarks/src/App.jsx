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
          await pose.send({image: webcamRef.current.video});
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
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
      results.poseLandmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    }
  };

  // Utility function to draw connections
  function drawConnectors(ctx, landmarks, connections, {color, lineWidth}) {
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
    <div className="App">
      <Webcam ref={webcamRef} style={{display: 'none'}} />
      <canvas ref={canvasRef} style={{position: 'absolute', left: 0, top: 0}} />
    </div>
  );
}

export default App;
