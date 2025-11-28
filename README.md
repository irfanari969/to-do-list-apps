# ⚛️ To-Do List Application (Full-Stack)

[![Repo Size](https://img.shields.io/github/repo-size/irfanari969/to-do-list-apps?style=flat-square)](https://github.com/irfanari969/to-do-list-apps)
[![Technology](https://img.shields.io/badge/Stack-Full--Stack-informational)](README.md)

Welcome to the repository for my **Full-Stack To-Do List application**. This project utilizes a separate backend server (Node.js/Express) to manage persistent data via a relational database (MySQL).

---

## ✨ Key Features

The application offers a rich set of features covering task management and user experience:

| Feature Category | Description |
| :--- | :--- |
| **Data Persistence** | Full **CRUD** (Create, Read, Update Status, Delete) operations with data stored in the MySQL database. |
| **Advanced Input** | Task creation supports **Task Name**, **Due Date**, and three **Priority** levels (`Low`, `Medium`, `High`). |
| **Task Ordering** | Pending tasks are **automatically sorted** first by **Due Date** (earliest first), then by **Priority** (High first). |
| **Real-time Stats** | Dynamic statistics dashboard displaying **Total**, **Pending**, and **Completed** tasks count. |
| **Filtering & Views** | Users can toggle between **Active Tasks** view and **Completed Tasks** view. |
| **Critical Alerts** | **Notification panel** (with a pulsing badge) instantly alerts the user to tasks that are **Overdue**, **Due Today**, or **Due Tomorrow**. |
| **UI Highlighting** | Pending tasks are visually styled (e.g., color-coded border, "Terlambat!" tag, and pulse animation) based on priority and overdue status. |
| **Bulk Management** | API support for **Deleting all tasks** and **Deleting only completed tasks**. |

---

## 🛠️ Technology Stack

This project is built using a Full-Stack architecture:

| Component | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, **Vanilla JavaScript** | Rich UI and complex client-side logic (dynamic rendering, sorting, status checks, API calls). |
| **Backend** | **Node.js, Express.js** | Provides RESTful API endpoints, handles routing, and DB logic. |
| **Database** | **MySQL / MariaDB** | Relational database (`todo_db`) for structured data storage. |
| **Tools** | `nodemon`, `dotenv` | Development tool for automatic server restart and environment variable management. |

---

## 🔗 API Endpoints

The backend server exposes the following RESTful API endpoints, running on port 3000:

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/tasks` | Retrieves all tasks, ordered by creation date (DESC). |
| **POST** | `/tasks` | Creates a new task. Requires `task_name`, `due_date`, and `priority`. |
| **PATCH** | `/tasks/:id/status` | Updates the `completed` status of a specific task. |
| **DELETE** | `/tasks/:id` | Deletes a specific task by ID. |
| **DELETE** | `/tasks/bulk/completed` | Deletes all tasks that are marked as completed. |
| **DELETE** | `/tasks/bulk/all` | Deletes all tasks in the database. |

---

## ⚙️ Installation & Local Setup

To run this application locally, you must set up both the backend and frontend components.

### Prerequisites

* Node.js
* MySQL/MariaDB Server (e.g., XAMPP, Docker)

### 1. Database Setup

1.  Start your local MySQL/MariaDB server.
2.  Create a new database named **`todo_db`**.
3.  Import the SQL structure located in the `backend/sql/todo_db.sql` file.
    ```bash
    mysql -u [your_user] -p todo_db < backend/sql/todo_db.sql
    ```
4.  **Create `.env` file** in the `backend/` directory and set your database credentials:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=todo_db
    ```

### 2. Backend Installation (Server)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Run the Server (Development):**
    *(Make sure you have added the script `"dev": "nodemon server.js"` to file `package.json` You.)*
    ```bash
    npm run dev 
    ```
    *The server should now be running on `http://localhost:3000`.*

### 3. Frontend Installation (Client)

1.  Return to the repository root directory.
2.  Open the frontend file (`frontend/index.html`) in your browser to access the client interface. Ensure the client-side JavaScript is correctly configured to communicate with the local backend server (`http://localhost:3000`).

---

## 🤝 Contribution

Feel free to fork this repository, suggest features, or submit pull requests. All contributions are welcome!


---

## 📧 Contact

* **GitHub:** [irfanari969](https://github.com/irfanari969)
