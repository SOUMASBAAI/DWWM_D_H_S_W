import React, { useRef, useState, useEffect, useCallback } from "react";
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

  // Fonction pour sauvegarder une prédiction dans le localStorage
  const savePrediction = (prediction) => {
    const stored = localStorage.getItem("predictions");
    const predictions = stored ? JSON.parse(stored) : [];
    predictions.push(prediction);
    localStorage.setItem("predictions", JSON.stringify(predictions));
  };

  // Fonction pour démarrer la détection en continu
  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 100); // 100ms pour éviter surcharge CPU
  };

  // Fonction pour détecter des objets
  const detect = async (net) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Mise à jour des dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Détection
      const obj = await net.detect(video);

      // Dessiner les résultats
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  // Fonction pour jouer le son
  const playSound = () => {
    new Audio(sound).play();
  };

  // Fonction pour capturer une image + sauvegarder la prédiction
  const capture = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    let predictions = [];
    if (webcamRef.current.video.readyState === 4) {
      const net = await cocossd.load();
      const video = webcamRef.current.video;
      predictions = await net.detect(video);
    }

    const prediction = {
      name: predictions.length > 0
        ? predictions.map((p) => p.class).join(", ")
        : "Aucune détection",
      date: new Date().toLocaleString(),
      image: imageSrc,
      objects: predictions,
    };

    savePrediction(prediction);

    // Télécharger l'image
    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "snapshot.png";
      link.click();
    }
  }, []);

  // Fonction pour retirer une image de l'historique
  const removeImgSrc = (indexToRemove) => {
    const updatedHistory = history.filter((_, idx) => idx !== indexToRemove);
    setHistory(updatedHistory);
    localStorage.setItem("predictions", JSON.stringify(updatedHistory));
  };

  // Charger le modèle une seule fois
  useEffect(() => {
    runCoco();
  }, []);

  // Recharger l'historique si une nouvelle image est capturée
  useEffect(() => {
    const stored = localStorage.getItem("predictions");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, [imgSrc]);

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <div style={{ position: "relative" }}>
        <Webcam
          ref={webcamRef}
          muted
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
            top: 0,
            textAlign: "center",
            zIndex: 8,
            width: 640,
            height: 480,
          }}
        />
      </div>

      <button
        className="snapshot-btn"
        onClick={() => {
          capture();
          playSound();
        }}
        style={{ marginTop: 20 }}
      >
        📸 Capture
      </button>

      {imgSrc && (
        <div style={{ marginTop: 20 }}>
          <img
            src={imgSrc}
            alt="Snapshot"
            style={{ width: 320, height: 240, borderRadius: 10 }}
          />
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Historique des prédictions</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {history.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 20 }}>
                <strong>{item.date}</strong> - {item.name}
                <br />
                <img
                  src={item.image}
                  alt="Snapshot"
                  style={{ width: 160, height: 120, marginTop: 10 }}
                />
                <br />
                <button
                  className="remove-button"
                  onClick={() => removeImgSrc(idx)}
                  style={{
                    marginTop: 10,
                    padding: "5px 10px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
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
