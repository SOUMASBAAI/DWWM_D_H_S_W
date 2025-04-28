import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en mode ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const { person } = req.body;
    const timestamp = Date.now();
    const safePerson = (person || 'Unknown').replace(/\s+/g, '_');
    const filename = `${safePerson}_${timestamp}.png`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Charger snapshots.json
const snapshotsPath = path.join(__dirname, 'snapshots.json');

const loadSnapshots = () => {
  if (!fs.existsSync(snapshotsPath)) {
    fs.writeFileSync(snapshotsPath, JSON.stringify([]));
  }
  const data = fs.readFileSync(snapshotsPath);
  return JSON.parse(data);
};

const saveSnapshots = (snapshots) => {
  fs.writeFileSync(snapshotsPath, JSON.stringify(snapshots, null, 2));
};

// Route POST pour upload
app.post('/upload', upload.single('snapshot'), (req, res) => {
  const { labels, person } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const snapshots = loadSnapshots();
  const now = new Date();
  const date = now.toLocaleDateString('en-US'); // MM/DD/YYYY
  const time = now.toLocaleTimeString('en-US', { hour12: true }); // 12h AM/PM

const newSnapshot = {
  id: Date.now(),
  filename: file.filename,      // <- ici le nom du fichier généré par multer
  labels: Array.isArray(labels) ? labels : [labels || 'Unknown'],
  date: date,
  time: time,
  filepath: `/uploads/${file.filename}`, // <- ici aussi lié au nom du fichier
};


  snapshots.push(newSnapshot);
  saveSnapshots(snapshots);

  res.json({ message: 'Snapshot saved!', snapshot: newSnapshot });
});

// Route GET pour récupérer tout
app.get('/snapshots', (req, res) => {
  const snapshots = loadSnapshots();
  res.json(snapshots);
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});