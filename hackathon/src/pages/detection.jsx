import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "../assets/js/utilities.js";
import Sound from "../assets/sound_capture.mp3";

function Detection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [history, setHistory] = useState([]);

  // Sauvegarde dans le localStorage
  const savePrediction = (prediction) => {
    const stored = localStorage.getItem("predictions");
    const predictions = stored ? JSON.parse(stored) : [];
    predictions.push(prediction);
    localStorage.setItem("predictions", JSON.stringify(predictions));
  };

  // Fonction pour retirer une image de l'historique
  const removeImgSrc = (indexToRemove) => {
    const updatedHistory = history.filter((_, idx) => idx !== indexToRemove);
    setHistory(updatedHistory);
    localStorage.setItem("predictions", JSON.stringify(updatedHistory));
  };

  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const obj = await net.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const playSound = () => {
    const audio = new Audio(Sound);
    audio.play();
  };

  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    let predictions = [];
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const net = await cocossd.load();
      const video = webcamRef.current.video;
      predictions = await net.detect(video);
    }

    const prediction = {
      name: predictions.length > 0 ? predictions.map(p => p.class).join(", ") : "Aucune détection",
      date: new Date().toLocaleString(),
      image: imageSrc,
      objects: predictions
    };

    savePrediction(prediction);

    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'snapshot.png';
      link.click();
    }
  }, [webcamRef]);

  useEffect(() => { runCoco(); }, []);
  useEffect(() => {
    const stored = localStorage.getItem("predictions");
    if (stored) setHistory(JSON.parse(stored));
  }, [imgSrc]);

  return (
    <div className="App">
      <div className="flex flex-col items-center">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top: 15,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top: 15,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={() => { capture(); playSound(); }}
        >
          📸 Capture
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold mb-4">Historique des prédictions</h3>
          <ul className="flex flex-wrap justify-center gap-4">
            {history.map((item, idx) => (
              <li key={idx} className="flex flex-col items-center border p-4 rounded shadow">
                <strong>{item.date}</strong> - {item.name}
                <img
                  src={item.image}
                  alt="Snapshot"
                  style={{ width: 160, marginTop: 10 }}
                  className="rounded"
                />
                <button
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  onClick={() => removeImgSrc(idx)}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Detection;
