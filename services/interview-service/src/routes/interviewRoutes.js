const express = require('express');
const router = express.Router();
const {
  createInterview,
  getInterviews,
  getInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  getResult,
} = require('../controllers/interviewController');

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/:id/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/:id/result', getResult);

module.exports = router;
