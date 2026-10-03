const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadResume,
  getResumes,
  getResume,
  analyzeResumeDoc,
  deleteResume,
} = require('../controllers/resumeController');

// In-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/:id/analyze', analyzeResumeDoc);
router.delete('/:id', deleteResume);

module.exports = router;
