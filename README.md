# Assignment Workflow Portal - Backend

This is the backend for the Assignment Workflow Portal, built with Node.js, Express.js, and SQLite (via Sequelize). 

## Features
- **Authentication**: JWT-based authentication for Teachers and Students.
- **Role-Based Access Control**: Ensures students cannot access teacher-only routes.
- **Assignment Management**: Teachers can create, edit, publish, and complete assignments. Draft assignments can be deleted.
- **Submissions**: Students can view published assignments, submit one answer per assignment, and view their submission history. Teachers can view and mark submissions as reviewed.
- **Workflow State Transitions**: Assignments transition strictly from Draft -> Published -> Completed.

## Tech Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework for routing
- **Sequelize**: ORM for database interactions
- **SQLite**: Local file-based database (ideal for quick setup and evaluation)
- **JSON Web Tokens (JWT)**: For stateless, secure authentication
- **Bcryptjs**: For secure password hashing

## Prerequisites
- Node.js (v14 or higher)
- npm

## Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The repository includes a `.env` file for convenience, which sets the `PORT` and `JWT_SECRET`. Since this is a test project, it is included directly.

3. **Seed Database**
   Initialize the SQLite database and create test users/data.
   ```bash
   node seed.js
   ```
   **Test Credentials:**
   - Teacher: `teacher@mail.com` / `teacher123`
   - Student: `student@mail.com` / `student123`

4. **Start Server**
   ```bash
   node server.js
   ```
   The backend will run on `http://localhost:5000`.

## Assumptions
- For simplicity in a test environment, SQLite is used so there is no need to set up a separate external database server.
- The `seed.js` script handles creating the database structure automatically (using Sequelize's `sync`).
