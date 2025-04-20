# SyncEdge: Collaborative Management of Tasks Tool
URL -> https://syncedge.vercel.app/

## By
**GROUP X**: Gursimran Singh Basra, Tanmay Agavile, Nitish Joshi, Eashan Verma, Sharanya Santosh

---

## Objective
SyncEdge is a dynamic online collaboration tool designed to streamline task management among individuals and groups. Users can securely log in, create and categorize tasks, and collaborate through groups or publicly accessible boards. The system provides privacy controls, completion tracking, and contextual tagging, offering flexibility in how tasks are created, shared, and managed. Additional features include resource links and metadata for enhanced searchability and relevance. Group formation with role-based access control allows group owners to manage memberships and assign collaborative responsibilities.

---

## Overview
SyncEdge is a full-stack web application developed to organize and track tasks in both individual and collaborative environments. Key features include:

- **Task Management**: Create, edit, and manage tasks with descriptions, resource links, and contextual tags.
- **Kanban-Style Interface**: Visualize task progress through stages like "Requirement Gathering," "In Development," and "Testing."
- **Group Collaboration**: Form and manage teams with role-based access control.
- **Secure Authentication**: User authentication with JWT and bcryptjs for password hashing.
- **Modern Tech Stack**: Built using React, Node.js, Express.js, and MongoDB.

---

## Technology Stack

### Frontend
- **React**: For building dynamic and reusable UI components.
- **Material UI (MUI)**: For accessible and consistent UI design.
- **React Router DOM**: For single-page application (SPA) navigation.
- **Axios**: For handling HTTP requests.
- **React-Toastify**: For user notifications.
- **js-cookie**: For secure session management.

### Backend
- **Node.js**: Non-blocking, event-driven runtime for server-side logic.
- **Express.js**: Minimal and flexible web framework.
- **JWT Authentication**: For secure session management.
- **bcryptjs**: For password hashing.
- **dotenv**: For managing environment variables.

### Database
- **MongoDB**: NoSQL database for storing user data, tasks, and group associations.
- **Mongoose**: ODM library for schema validation and data modeling.

---

## Features

### Task Management
- Create, edit, and delete tasks.
- Assign visibility settings (private, group-shared, or public).
- Add resource links and tags for enhanced searchability.

### Group Collaboration
- Create and manage groups.
- Assign roles and responsibilities.
- Share tasks within groups.

### Security
- JWT-based authentication.
- Password hashing with bcryptjs.
- CORS configuration for secure client-server communication.

### User Experience
- Kanban-style task board for visualizing progress.
- Responsive design for mobile and desktop.
- Instant feedback with toast notifications.

---

## Steps to Use This Project Locally

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd task-management-app```
2. **Install Dependencies**:
    Navigate to both the frontend and backend directories and install the required dependencies:
    ```bash
    cd frontend
    npm install
    cd ../backend
    npm install```
3. **Update Configuration**:
    Update the production URLs to development URLs in the following files:
        - backend/server.js
        - frontend/src/config.js
4. **Set Up Environment Variables**:
    - Request the .env file from the developers.
    - Place the .env file in the backend directory. This file contains sensitive information such as database URIs, JWT secrets, and email credentials.
5. **Start the Backend Server**:
    Navigate to the backend directory and start the backend server:
    ```bash
    cd backend
    npm run server
    ```
6. **Start the Frontend Development Server**:
    Navigate to the frontend directory and start the frontend development server:
    ```bash
    cd frontend
    npm start
    ```
7. **Access the Application**:
    Open your browser and navigate to http://localhost:3000 to access the application.

---

## Wireframes
Wireframes were essential in designing SyncEdge, providing a structured and intuitive user interface. Key wireframes include:

- **Login and Registration**: Minimal forms for user authentication.
- **Task Board**: Kanban-style layout with stages like "To Do," "In Development," and "Completed."
- **Group Management**: Create and manage groups with role-based access control.

---

## Future Enhancements
- **Real-Time Collaboration**: Integrate WebSockets for live updates.
- **Calendar Integration**: Sync task deadlines with Google Calendar or Outlook.
- **Mobile App Support**: Extend functionality to mobile platforms using React Native.
- **Task Analytics Dashboard**: Visualize productivity stats and group activity logs.

---

## Conclusion
SyncEdge is a robust and scalable task management solution designed for both individual and collaborative workflows. Its modular architecture, secure authentication, and responsive design make it a versatile platform for real-world SaaS applications. With future enhancements, SyncEdge is well-positioned to evolve into a comprehensive collaborative tool.
