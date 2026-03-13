const bcrypt = require('bcryptjs');
const { sequelize, User, Assignment } = require('./models');

async function seed() {
  await sequelize.sync({ force: true }); // Reset DB

  const salt = await bcrypt.genSalt(10);
  const teacherPassword = await bcrypt.hash('teacher123', salt);
  const studentPassword = await bcrypt.hash('student123', salt);

  const teacher = await User.create({
    name: 'Mr. Smith',
    email: 'teacher@upaay.com',
    password: teacherPassword,
    role: 'teacher'
  });

  const student = await User.create({
    name: 'Jane Doe',
    email: 'student@upaay.com',
    password: studentPassword,
    role: 'student'
  });

  const student2 = await User.create({
    name: 'John Doe',
    email: 'student2@upaay.com',
    password: studentPassword,
    role: 'student'
  });

  await Assignment.create({
    title: 'Math Homework 1',
    description: 'Solve the first 10 problems on page 42.',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    status: 'Published',
    teacher_id: teacher.id
  });

  await Assignment.create({
    title: 'Science Project Draft',
    description: 'Submit your initial ideas for the final project.',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    status: 'Draft',
    teacher_id: teacher.id
  });

  console.log('Database seeded successfully.');
  console.log('Teacher: teacher@upaay.com / teacher123');
  console.log('Student: student@upaay.com / student123');
  process.exit();
}

seed().catch(console.error);
