const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;
const HIGHSCORE_FILE = 'highscores.json';

// Middleware zum Parsen von JSON-Daten
app.use(express.json());

// CORS für localhost aktivieren
app.use(cors());

// GET-Route zum Auslesen des Highscores
app.get('/highscore', (req, res) => {
  try {
    const highscores = getHighscores();
    res.json(highscores);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Auslesen des Highscores' });
  }
});

// GET-Route zum Auslesen des Highscores eines Spielers
app.get('/highscore/:player', (req, res) => {
  try {
    const { player } = req.params;

    let highscores = getHighscores();
    const existingPlayer = highscores.find((highscore) => highscore.player === player);

    if (!existingPlayer) {
      res.status(404).json({ error: 'Spieler nicht gefunden' });
      return;
    }

    res.json(existingPlayer);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Auslesen des Highscores' });
  }
});

// POST-Route zum Speichern des Highscores
app.post('/highscore', (req, res) => {
  try {
    const { player, score, username } = req.body;

    if (!player || !score || !username) {
      res.status(400).json({ error: 'Spielername, Punktzahl und Benutzername erforderlich' });
      return;
    }

    let highscores = getHighscores();

    // Überprüfen, ob Spieler bereits einen Highscore hat, und ob der neue Highscore besser ist
    const existingPlayer = highscores.find((highscore) => highscore.player === player);
    if (existingPlayer) {
      if (existingPlayer.score >= score) {
        res.status(400).json({ error: 'Highscore nicht besser als bisheriger Highscore' });
        return;
      }

      highscores = highscores.filter((highscore) => highscore.player !== player);
    }

    highscores.push({ player, score, username });
    saveHighscores(highscores);

    res.json({ message: 'Highscore erfolgreich gespeichert' });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Speichern des Highscores' });
  }
});

// Funktion zum Auslesen der Highscores aus der JSON-Datei
function getHighscores() {
  const highscoresData = fs.readFileSync(HIGHSCORE_FILE, 'utf8');
  return JSON.parse(highscoresData);
}

// Funktion zum Speichern der Highscores in der JSON-Datei
function saveHighscores(highscores) {
  const highscoresData = JSON.stringify(highscores, null, 2);
  fs.writeFileSync(HIGHSCORE_FILE, highscoresData, 'utf8');
}

// Server starten
app.listen(PORT, () => {
  console.log(`Server gestartet auf Port ${PORT}`);
});
