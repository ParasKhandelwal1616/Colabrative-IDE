🚀 NexusIDE - Real-Time Collaborative Cloud Editor

NexusIDE is a powerful, browser-based Integrated Development Environment (IDE) that allows developers to write, compile, and execute code in the cloud. It features Google Docs-style real-time collaboration, enabling multiple users to edit code and chat simultaneously in the same room.
✨ Key Features

    ⚡ Real-Time Collaboration: Multiple users can type, edit, and collaborate on the same file instantly using Socket.io and Redis.

    🛡️ Secure Code Execution: Code is executed inside isolated Docker containers (Alpine Linux), ensuring security and preventing malicious attacks on the host server.

    📂 Cloud File System: Create, save, rename, and delete files and projects. All data is persisted in MongoDB.

    🗣️ Built-in Chat: Integrated chat room for developers to discuss logic without leaving the editor.

    💻 Multi-Language Support:

        JavaScript (Node.js)

        Python 3

        C++ (GCC)

        Java (OpenJDK)

    🔐 Authentication: Secure login and user management powered by Clerk.

    🎨 Smart Dashboard: Manage your projects, rename them inline, or join a friend's session via a shared ID/Link.

🛠️ Tech Stack
Frontend

    Framework: Next.js 14 (App Router)

    Language: TypeScript

    Styling: Tailwind CSS + Lucide React (Icons)

    Editor: Monaco Editor (The engine behind VS Code)

    Auth: Clerk

    State/Socket: Socket.io-client

Backend

    Runtime: Node.js + Express

    Real-Time Engine: Socket.io

    Database: MongoDB (via Mongoose)

    Scaling Adapter: Redis (Pub/Sub for socket scaling)

DevOps & Infrastructure

    Containerization: Docker (for sandboxed code execution)

    OS: Alpine Linux images (lightweight and fast)

⚙️ Prerequisites

Before running this project, ensure you have the following installed:

    Node.js (v18 or higher)

    Docker Desktop (Must be running for code execution to work)

    Redis (Used for Socket.io adapter)

    MongoDB (Local or Atlas URL)

🚀 Installation & Setup
1. Clone the Repository
Bash

git clone https://github.com/ParasKhandelwal1616/Colabrative-IDE
cd Colabrative-IDE

2. Setup the Backend (Server)

Navigate to the server folder and install dependencies:
Bash

cd server
npm install

Create a .env file in the server directory:
Code snippet

PORT=5000
MONGO_URI=mongodb://localhost:27017/nexus-ide
REDIS_URL=redis://localhost:6379

3. Setup the Frontend (Client)

Open a new terminal, navigate to the client folder, and install dependencies:
Bash

cd client
npm install

Create a .env.local file in the client directory (Get these keys from your Clerk Dashboard):
Code snippet

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

🏃‍♂️ Running the Application
Step 1: Start Supporting Services

Make sure your database and Redis are running:

    MongoDB: mongod

    Redis: redis-server

    Docker: Ensure Docker Desktop is open and running.

Step 2: Start the Backend
Bash

cd server
npm run dev
# Server should run on http://localhost:5000

Step 3: Start the Frontend
Bash

cd client
npm run dev
# Client should run on http://localhost:3000

📖 Usage Guide

    Login: Open http://localhost:3000 and sign in using Google or Email (via Clerk).

    Create Project: Click "New Project" on the dashboard. Give it a name (e.g., "Python Algo").

    Write Code: Select a file (e.g., main.py) and start typing.

    Run Code: Click the "Run" button. The server will spin up a Docker container, execute your script, and stream the output to the terminal.

    Collaborate:

        Click the "Share" button in the top right.

        Send the link to a friend.

        Once they join, you will see their cursor and edits in real-time!

🧠 System Architecture Diagram
Code snippet

graph TD;
    User-->|Writes Code| Frontend[Next.js Client];
    Frontend-->|Socket Event| Backend[Express Server];
    Backend-->|Save File| DB[(MongoDB)];
    Backend-->|Sync Changes| Redis[Redis Adapter];
    Backend-->|Execute Request| Docker[Docker Container];
    Docker-->|Return Output| Backend;
    Backend-->|Stream Output| Frontend;

🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

    Fork the Project

    Create your Feature Branch (git checkout -b feature/AmazingFeature)

    Commit your Changes (git commit -m 'Add some AmazingFeature')

    Push to the Branch (git push origin feature/AmazingFeature)

    Open a Pull Request

📜 License

Distributed under the MIT License. See LICENSE for more information.

Built with ❤️ by Paras
