const express = require('express');
const router = express.Router();
const {
  getLatest,
  getByInterview,
  getAll,
  generate,
} = require('../controllers/feedbackController');

router.get('/latest', getLatest);
router.get('/interview/:interviewId', getByInterview);
router.get('/', getAll);
router.post('/generate', generate);

module.exports = router;
