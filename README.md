# VidTube

VidTube is a full-stack video-sharing platform built with the MERN stack. Users
can discover and watch videos, create channels, upload content, interact with
the community, and organize videos into playlists.

## Features

- Browse, search, and watch videos
- Upload videos, thumbnails, avatars, and cover images
- JWT authentication with access and refresh tokens
- Channel profiles with subscriber counts
- Subscribe and unsubscribe from channels
- Like videos and view liked videos
- Add, edit, and delete comments
- Create and manage playlists
- Watch history tracking
- Creator dashboard with channel statistics and video management
- Responsive dark-themed interface

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js and Express 5
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Cloudinary for media storage
- Multer for multipart file uploads
- bcrypt for password hashing

## Project Structure

```text
VidTube/
├── backend/
│   └── src/
│       ├── controllers/    # Request handlers
│       ├── db/             # MongoDB connection
│       ├── middlewares/    # Authentication, uploads, and errors
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API route definitions
│       └── utils/          # Shared response and Cloudinary helpers
└── frontend/
    └── src/
        ├── api/            # Axios API client
        ├── components/     # Reusable UI components
        ├── layouts/        # Application layouts
        ├── pages/          # Application pages
        ├── routes/         # React Router configuration
        ├── services/       # API service functions
        └── store/          # Redux store and slices
```

## Prerequisites

- Node.js 18 or later
- npm
- A MongoDB Atlas cluster or local MongoDB instance
- A Cloudinary account for video and image uploads

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ritwizshukla749-byte/VidTube.git
cd VidTube
```

### 2. Configure the backend

```bash
cd backend
copy .env.sample .env
```

On macOS or Linux, use `cp .env.sample .env` instead of the `copy` command.
Then update `.env` with your MongoDB, JWT, and Cloudinary credentials:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=http://localhost:5173
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

The backend listens on `http://localhost:8000` by default.

### 3. Configure and start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` with the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |
| `npm test` | Run backend tests with Vitest |

### Frontend

Run these commands from `frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## API Overview

All API routes are prefixed with `/api/v1`.

| Resource | Base path | Examples |
| --- | --- | --- |
| Health check | `/healthcheck` | Check API availability |
| Users | `/users` | Register, login, profile, and watch history |
| Videos | `/videos` | Upload, browse, update, and delete videos |
| Dashboard | `/dashboard` | View channel statistics and manage videos |
| Likes | `/likes` | Toggle likes and list liked videos |
| Comments | `/comments` | Add, edit, list, and delete comments |
| Subscriptions | `/subscriptions` | Manage channel subscriptions |
| Playlists | `/playlists` | Create and manage playlists |
| Tweets | `/tweets` | Manage authenticated user posts |

Protected endpoints use the JWT-based authentication flow and require the
authentication cookie issued by the backend.

## Environment and Security

- Never commit `.env` files or real credentials.
- Use long, randomly generated values for both token secrets.
- Configure `CORS_ORIGIN` to match the deployed frontend URL in production.
- Configure Cloudinary upload settings before using video or image uploads.

## License

This project is distributed under the ISC license specified in
`backend/package.json`.
