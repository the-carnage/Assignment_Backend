const express = require('express');
const { Submission, Assignment } = require('../models');
const { authenticate, isStudent, isTeacher } = require('../middleware/auth');
const router = express.Router();

// Submit an answer (Student only)
router.post('/', authenticate, isStudent, async (req, res) => {
  try {
    const { assignment_id, answer } = req.body;
    
    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    if (assignment.status !== 'Published') {
      return res.status(400).json({ message: 'Assignment is not open for submission' });
    }

    if (new Date() > new Date(assignment.due_date)) {
      return res.status(400).json({ message: 'Assignment is past due date' });
    }

    const existingSubmission = await Submission.findOne({
      where: { assignment_id, student_id: req.user.id }
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted an answer for this assignment' });
    }

    const submission = await Submission.create({
      answer,
      student_id: req.user.id,
      assignment_id
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark submission as reviewed (Teacher only)
router.put('/:id/review', authenticate, isTeacher, async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: Assignment, as: 'assignment' }]
    });

    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.assignment.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    submission.reviewed = true;
    await submission.save();

    res.json(submission);
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student view their own submissions
router.get('/my', authenticate, isStudent, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { student_id: req.user.id },
      include: [{ model: Assignment, as: 'assignment' }]
    });
    res.json(submissions);
  } catch (error) {
    console.error('Fetch my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
