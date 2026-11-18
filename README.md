# Mini CRM

A modern, full-stack Customer Relationship Management (CRM) application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Mini CRM helps businesses manage sales leads, track companies, schedule and organize follow-up tasks, and view pipeline analytics through an intuitive dashboard.

---

## Technologies Used

- **Frontend**:
  - React.js (v18)
  - Vite
  - React Router DOM (v7)
  - Axios
  - Custom Responsive CSS (Modern Navy Blue & White Theme, Inter font)
- **Backend**:
  - Node.js (ES Modules)
  - Express.js
  - Mongoose (MongoDB Object Modeling)
  - JSON Web Tokens (JWT) & bcryptjs (Authentication)
  - Helmet & CORS (Security)
- **Database**:
  - MongoDB Atlas (Cloud) / MongoDB Community Server

---

## Features

- **Authentication & Security**:
  - Secure JWT authentication with bcrypt password hashing.
  - Show / Hide password toggle with default hidden state.
  - Professional flash toast notifications on login and logout.
- **Interactive Dashboard**:
  - Real-time pipeline metrics: Total Leads, Qualified Leads, Tasks Due Today, Completed Tasks.
  - Quick action shortcuts to add leads, companies, and tasks.
- **Lead Management**:
  - Create, view, edit, permanently delete, and soft-archive leads.
  - Mandatory lead fields: Lead Name, Email, Phone, Company, Status, Source, and Lead Image (Notes optional).
  - Strict 10-digit mobile number validation and email format validation.
  - Permanent lead image storage with thumbnail display (44 × 44 px) and enlarged image preview modal.
  - Real-time lead search and status filtering (New, Contacted, Qualified, Converted, Lost).
- **Company Management**:
  - Full CRUD operations: Company Name, Contact Person, Industry, Email, Phone, Website, Address (Notes optional).
  - Safe cascading reference management: unlinking company references safely when a company is deleted.
  - View associated active leads per company profile.
- **Task & Follow-up Tracking**:
  - Create, view, edit, and delete follow-up tasks with title, description, priority (Low, Medium, High), status (Pending, In Progress, Completed), and due date.
  - Linked to existing leads: displays the circular lead profile picture (36 × 36 px) with fallback initials next to the lead name.
  - One-click task completion toggle and inline status updates.
- **User Interface & Experience**:
  - Clean modals with backdrop blur (zero browser default `alert`, `prompt`, or `confirm` popups).
  - Confirmation modals for delete and archive operations.
  - Top-right floating auto-dismissing toast notifications.

---

## Project Structure

```text
mini-crm/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT verification & role authorization
│   │   ├── models/
│   │   │   └── index.js            # Mongoose schemas (User, Company, Lead, Task)
│   │   ├── seed.js                 # Initial admin seeding script
│   │   └── server.js               # Express application, routes, and DB connection
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx                # React root, routes, views, modals, state
│   │   └── style.css               # Modern navy blue & white theme styles
│   ├── index.html                  # HTML entry with Google Fonts (Inter)
│   ├── .env.example                # Frontend environment template
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
├── .gitignore                      # Git exclusion rules
└── README.md                       # Project documentation
```

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster or local MongoDB instance

---

### 1. Clone the Repository

```bash
git clone https://github.com/Preethi1709/mini-crm.git
cd mini-crm
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string and a secret key:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/mini-crm?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the initial database (creates the initial administrator account):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at **http://localhost:5000**.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional):
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will run at **http://localhost:5173**.

---

## Localhost URLs

| Component | URL | Description |
|---|---|---|
| **Frontend Application** | `http://localhost:5173` | React CRM web interface |
| **Backend API** | `http://localhost:5000` | Express REST API server |
| **API Health Check** | `http://localhost:5000/health` | Server health status endpoint |

---

## Usage Guide

1. Open `http://localhost:5173` in your web browser.
2. Sign in using your administrator credentials.
3. **Leads**:
   - Click **+ Add Lead** to create a lead with an image, 10-digit mobile number, email, company, and source.
   - Click the lead's image thumbnail to view an enlarged preview.
   - Use the search bar and status dropdown to filter leads.
4. **Companies**:
   - Register client accounts with industry, website, address, and primary contact.
   - View associated leads under each company.
5. **Tasks**:
   - Schedule tasks linked to leads, set priorities (Low / Medium / High), and due dates.
   - The related lead's circular avatar displays directly in the task row.
   - Use the checkmark button or status dropdown to mark tasks completed.
