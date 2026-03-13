const express = require('express');
const { Assignment, Submission, User } = require('../models');
const { authenticate, isTeacher } = require('../middleware/auth');
const router = express.Router();

// Get assignments (Teacher sees all their own, Student sees all Published)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const assignments = await Assignment.findAll({
        where: { teacher_id: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.json(assignments);
    } else {
      const assignments = await Assignment.findAll({
        where: { status: 'Published' },
        order: [['createdAt', 'DESC']]
      });
      res.json(assignments);
    }
  } catch (error) {
    console.error('Fetch assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment (Teacher only)
router.post('/', authenticate, isTeacher, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      due_date,
      teacher_id: req.user.id
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (Teacher only)
router.put('/:id', authenticate, isTeacher, async (req, res) => {
  try {
    const { title, description, due_date, status } = req.body;
    const assignment = await Assignment.findOne({ where: { id: req.params.id, teacher_id: req.user.id } });
    
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.status === 'Completed') return res.status(400).json({ message: 'Cannot edit a completed assignment' });

    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.due_date = due_date || assignment.due_date;
    
    // Status transition rules
    if (status) {
      if (assignment.status === 'Draft' && status === 'Published') assignment.status = 'Published';
      else if (assignment.status === 'Published' && status === 'Completed') assignment.status = 'Completed';
      else if (assignment.status !== status) {
        return res.status(400).json({ message: `Invalid status transition from ${assignment.status} to ${status}` });
      }
    }

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment (Teacher only, only Drafts)
router.delete('/:id', authenticate, isTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ where: { id: req.params.id, teacher_id: req.user.id } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.status !== 'Draft') return res.status(400).json({ message: 'Only Draft assignments can be deleted' });

    await assignment.destroy();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get submissions for an assignment (Teacher only)
router.get('/:id/submissions', authenticate, isTeacher, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ where: { id: req.params.id, teacher_id: req.user.id } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const submissions = await Submission.findAll({
      where: { assignment_id: assignment.id },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      order: [['submitted_date', 'DESC']]
    });
    res.json(submissions);
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single assignment details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
        include: [{ model: User, as: 'teacher', attributes: ['name'] }]
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    if (req.user.role === 'student' && assignment.status !== 'Published' && assignment.status !== 'Completed') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'teacher' && assignment.teacher_id !== req.user.id) {
       return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
