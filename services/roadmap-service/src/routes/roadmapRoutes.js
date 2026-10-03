const express = require('express');
const router = express.Router();
const {
  getActive,
  getAll,
  getById,
  generate,
  updateProgress,
} = require('../controllers/roadmapController');

router.get('/active', getActive);
router.get('/', getAll);
router.get('/:id', getById);
router.post('/generate', generate);
router.patch('/:id/progress', updateProgress);

module.exports = router;
