import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import sound from "../assets/SFB-appphoto.mp3";
import { drawRect } from "../assets/js/utilities.js";

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

  // Main function
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

  // Fonction de capture et sauvegarde

  function play() {
    new Audio(sound).play();
  }

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
      name:
        predictions.length > 0
          ? predictions.map((p) => p.class).join(", ")
          : "Aucune détection",
      date: new Date().toLocaleString(),
      image: imageSrc,
      objects: predictions,
    };

    savePrediction(prediction);

    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "snapshot.png";
      link.click();
    }
  }, [webcamRef]);

  useEffect(() => {
    runCoco();
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("predictions");
    if (stored) setHistory(JSON.parse(stored));
  }, [imgSrc]);

  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        muted={true}
        screenshotFormat="image/png"
        width={640}
        height={480}
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 8,
          width: 640,
          height: 480,
        }}
      />
      <button
        className="snapshot-btn"
        onClick={() => {
          capture();
          play();
        }}
      >
        📸 Capture
      </button>

      {imgSrc && (
        <img
          src={imgSrc}
          alt="Snapshot"
          style={{ marginTop: 10, width: 320, height: 240 }}
        />
      )}
      {history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Historique des prédictions</h3>
          <ul>
            {history.map((item, idx) => (
              <li key={idx}>
                <strong>{item.date}</strong> - {item.name}
                <br />
                <img
                  src={item.image}
                  alt="Snapshot"
                  style={{ width: 160, margin: 5 }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Detection;
