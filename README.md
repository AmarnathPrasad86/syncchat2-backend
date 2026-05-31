# Simple Full Stack User Registration Project

This beginner-friendly mini project shows how to build a full-stack backend system using:

- Node.js + Express.js
- MongoDB + Mongoose
- Python + Flask
- JavaScript backend logic

The system supports user registration with validation, duplicate email checking, MongoDB storage, and Node.js calling a Python service to generate a welcome message.

## Project Structure

```
project-root/
│
├── node-backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── controllers/
│   │   └── authController.js
│   ├── views/
│   │   └── responseView.js
│   └── services/
│       ├── pythonService.js
│       └── validationService.js
│
├── python-service/
│   ├── app.py
│   └── requirements.txt
│
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Install MongoDB

Install MongoDB Community Edition from the official website:
https://www.mongodb.com/try/download/community

Start MongoDB locally, for example using `mongod` or your OS service manager.

### 2. Install Node.js Dependencies

Open a terminal in `node-backend/`:

```powershell
cd c:\Users\shreena\OneDrive\Desktop\AmarAssigment\SyncChat2\node-backend
npm install
```

### 3. Install Python Dependencies

Open a terminal in `python-service/`:

```powershell
cd c:\Users\shreena\OneDrive\Desktop\AmarAssigment\SyncChat2\python-service
python -m pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` inside `node-backend/` and update values if needed:

```powershell
cd c:\Users\shreena\OneDrive\Desktop\AmarAssigment\SyncChat2\node-backend
copy ..\.env.example .env
```

## Run the Services

### Start the Python service

```powershell
cd c:\Users\shreena\OneDrive\Desktop\AmarAssigment\SyncChat2\python-service
python app.py
```

This starts the Flask service on `http://127.0.0.1:5000`.

### Start the Node.js backend

```powershell
cd c:\Users\shreena\OneDrive\Desktop\AmarAssigment\SyncChat2\node-backend
npm run dev
```

This starts the Node.js server on `http://localhost:4000`.

## API Endpoint

### Register User

- URL: `POST http://localhost:4000/api/auth/register`
- Content-Type: `application/json`

#### Request Body

```json
{
  "name": "Amar",
  "email": "amar@example.com",
  "password": "secure123"
}
```

#### Successful Response

```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "<mongo-id>",
    "name": "Amar",
    "email": "amar@example.com",
    "welcomeMessage": "Welcome Amar!"
  }
}
```

## What the Project Does

1. Node.js receives the registration request.
2. It validates `name`, `email`, and `password`.
3. It checks MongoDB for duplicate email.
4. It calls the Python service at `/welcome`.
5. The Python service returns a welcome message.
6. Node.js saves the user to MongoDB, including the welcome message.
7. The API returns a JSON response.

## Notes for Beginners

- `server.js` initializes Express and MongoDB connection.
- `routes/auth.js` defines the registration API path.
- `controllers/authController.js` contains the registration logic.
- `views/responseView.js` formats API responses in a simple MVC-style view module.
- `services/validationService.js` checks request data before the controller saves the user.
- `services/pythonService.js` handles Node-to-Python communication.
- `python-service/app.py` is a simple Flask app that returns a welcome message.

## API Testing Example

Use Postman, Insomnia, or `curl` to test the registration endpoint:

```powershell
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Amar\",\"email\":\"amar@example.com\",\"password\":\"secure123\"}"
```

## Additional Tips

- If you want to test Python first, open `http://127.0.0.1:5000/health` in your browser.
- Use a real MongoDB connection string if you want to run this in the cloud.
- You can add password hashing later with `bcrypt`.
