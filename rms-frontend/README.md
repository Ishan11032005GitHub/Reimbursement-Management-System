# 🧾 RMS – Reimbursement Management System

Welcome to **RMS**, a full-stack web application designed to manage reimbursement requests with a **secure authentication system** and a **two-step approval workflow**.  
Built to simulate a real corporate reimbursement flow with **USER** and **MANAGER** roles.

---

## 📚 Table of Contents

- [📌 Features](#-features)  
- [🛠️ Technologies Used](#-technologies-used)  
- [⚙️ Workflow Overview](#️-workflow-overview)  
- [🚀 How to Run](#-how-to-run)  
- [📬 Contact](#-contact)  

---

## 📌 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Password encryption using **bcrypt**
- Role-based access control (**USER / MANAGER**)
- Automatic redirection to login on logout or token expiry
- Protected routes across the application

### 📝 Request Management
- Create reimbursement requests
- Edit requests while in **DRAFT** state
- Upload supporting files (receipts, invoices)
- Searchable category dropdown
- Client-side and server-side validation

### 🔄 Approval Workflow
- Manager-level approval
- Final approval by request creator
- Rejection handling
- Request status tracking:
  - `DRAFT`
  - `SUBMITTED`
  - `MANAGER_APPROVED`
  - `FINAL_APPROVED`
  - `REJECTED`

### 🖥️ UI / UX
- Fully responsive layout
- Role-aware navigation bar
- Dedicated dashboards for users and managers
- Detailed request view page

---

## 🛠️ Technologies Used

### Frontend
- React (Vite)
- React Router v6
- Axios
- Context API
- JWT Decode
- React Select
- Custom CSS (responsive)

### Backend
- Node.js
- Express.js
- MySQL
- JWT
- bcrypt
- Multer (file uploads)

---

## ⚙️ Workflow Overview

### 🔁 Request Lifecycle
-  DRAFT
-    |
-    |
- [Submit ↓]
-    |
-   \|/
- SUBMITTED ----------[Manager Rejects]----------> REJECTED
-     |
-     | 
- [Manager Approves ↓]
-     |
-    \|/
- MANAGER_APPROVED
-     |
-     |
- [Final Approve ↓]
-     |
-    \|/
- FINAL_APPROVED


### 👥 Roles & Permissions

| Role     | Capabilities |
|----------|--------------|
| USER     | Create, edit drafts, submit, final approve |
| MANAGER  | View submitted requests, approve or reject |

---

## 🚀 How to Run

### Backend

cd rms-backend
npm install
node index.js

### Frontend
cd rms-frontend
npm install
npm run dev


### 📬 Contact
- 📧 Email: ishan11032005@gmail.com
- 💼 LinkedIn: https://www.linkedin.com/in/yourprofile
- 🧑‍💻 GitHub: https://github.com/Ishan11032005GitHub
