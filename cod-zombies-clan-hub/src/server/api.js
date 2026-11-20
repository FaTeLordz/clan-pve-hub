const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../db');

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Serve static web frontend
  const publicDir = path.join(__dirname, 'public');
  app.use(express.static(publicDir));

  // --- API Routes ---

  // Get all franchises (Hub cards)
  app.get('/api/franchises', (req, res) => {
    try {
      const franchises = db.getFranchises();
      res.json({ success: true, franchises });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get games (optional franchise filter)
  app.get('/api/games', (req, res) => {
    try {
      const { franchise } = req.query;
      const games = db.getGames(franchise);
      res.json({ success: true, games });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get maps (optional game filter)
  app.get('/api/maps', (req, res) => {
    try {
      const { game, franchise } = req.query;
      let maps;
      if (game && game !== 'all') {
        maps = db.getMapsForGame(game);
      } else {
        maps = db.getAllMaps(franchise);
      }
      res.json({ success: true, maps });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', (req, res) => {
    try {
      const { franchise, game, map, players, mode, limit } = req.query;
      const records = db.getLeaderboard({
        franchise_id: franchise,
        game_id: game,
        map_name: map,
        player_count: players,
        game_mode: mode,
        limit: limit ? parseInt(limit, 10) : 50
      });
      res.json({ success: true, count: records.length, leaderboard: records });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get clan stats
  app.get('/api/stats', (req, res) => {
    try {
      const { franchise } = req.query;
      const stats = db.getClanStats(franchise);
      res.json({ success: true, stats });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Web submission endpoint
  app.post('/api/submit', (req, res) => {
    try {
      const { franchise_id, game_id, map_name, player_count, game_mode, round, player_name, proof_url, teammates, twitch_channel } = req.body;

      if (!game_id || !map_name || !player_count || !round || !player_name || !proof_url) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const id = db.createSubmission({
        franchise_id,
        game_id,
        map_name,
        player_count,
        game_mode: game_mode || 'Standard',
        round: parseInt(round, 10),
        player_name,
        proof_url,
        teammates,
        twitch_channel,
        status: 'pending'
      });

      res.json({
        success: true,
        message: 'Submission received! A clan moderator will review your proof shortly.',
        submissionId: id
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fallback to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}

module.exports = { createServer };
