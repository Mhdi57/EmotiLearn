# EmotiLearn 😊

> An AI-powered educational game that helps children recognize and practice facial emotions through real-time, browser-based expression detection.

**EmotiLearn** is an interactive learning prototype designed to make emotional education engaging for children. The application presents an emotion, activates the device camera, and uses an on-device facial-expression model to detect whether the child can reproduce it. Successful matches earn stars and are recorded for review in a parent dashboard.

## Development Status

> **Current version: MVP under active development**

This repository contains the complete first working version of EmotiLearn. A new iteration is planned as part of **Project 2**, with redesigned interfaces, expanded functionality, improved security, and a more complete end-to-end experience.

## Key Features

- Real-time facial-expression recognition through the browser camera.
- Six supported emotions: happy, sad, neutral, angry, surprised, and scared.
- Three progressive difficulty levels.
- Five-round learning sessions with randomized emotions.
- Match confidence and hold-progress feedback.
- Stars, countdowns, sound effects, and celebration animations.
- Parent dashboard showing practice history and learning statistics.
- MongoDB progress persistence with a localStorage fallback.
- Adjustable sound and color-theme settings.
- Responsive, child-friendly interface.

## How It Works

1. The child enters a name and chooses a difficulty level.
2. EmotiLearn selects an emotion from the level's available set.
3. The browser requests camera permission and loads the local face-analysis models.
4. Tiny Face Detector locates the face in each video frame.
5. Face Expression Net estimates expression probabilities.
6. The detected expression is mapped to one of EmotiLearn's learning emotions.
7. Holding the correct expression completes the round and awards stars.
8. Session progress is saved to MongoDB or localStorage when the API is unavailable.
9. A parent dashboard summarizes previous practice activity.

## AI and Computer Vision

EmotiLearn uses **face-api.js** in the browser with:

- **Tiny Face Detector** for lightweight face detection.
- **Face Expression Net** for expression classification.
- Locally bundled model weights under `public/models`.
- Real-time confidence scoring and emotion matching.
- Client-side video processing; camera frames are not intentionally uploaded or stored.

The following mapping is used by the learning experience:

| Model expression | EmotiLearn emotion |
|---|---|
| Happy | Happy |
| Sad | Sad |
| Neutral | Neutral |
| Angry | Angry |
| Surprised | Surprised |
| Fearful | Scared |
| Disgusted | Angry |

## Difficulty Levels

| Level | Included emotions |
|---|---|
| Level 1 | Happy, Sad, Neutral |
| Level 2 | Level 1 + Angry, Surprised |
| Level 3 | Level 2 + Scared |

## Technology Stack

### Frontend

- React
- JavaScript
- CSS
- face-api.js
- Browser MediaDevices API

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- Helmet
- CORS
- Express Rate Limit

## Architecture

```text
Browser Camera
      ↓
Tiny Face Detector
      ↓
Face Expression Net
      ↓
Emotion Matching and Game Logic
      ↓
Stars and Session Feedback
      ↓
Express API → MongoDB
       └────→ localStorage fallback
```

## Project Structure

```text
EmotiLearn/
├── public/
│   ├── assets/             # Visual assets
│   ├── models/             # Face detection and expression models
│   └── sounds/             # Game audio
├── server/
│   ├── models/             # Mongoose data models
│   ├── routes/             # Progress-history API
│   └── index.js            # Express server
├── src/
│   ├── components/         # Camera, dashboard, progress, and feedback UI
│   ├── utils/              # Emotions, sounds, and API helpers
│   ├── ActivityScreen.js   # Learning session and scoring logic
│   ├── HomeScreen.js       # Entry, settings, and level selection
│   └── App.js              # Application navigation
├── .env.example
└── package.json
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- A modern browser with camera access

### Installation

```bash
git clone https://github.com/Mhdi57/EmotiLearn.git
cd EmotiLearn
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

Configure the database connection if needed:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/emotilearn
```

Run the backend in one terminal:

```bash
node server/index.js
```

Run the React application in another terminal:

```bash
npm start
```

Open `http://localhost:3000` and allow camera access when prompted.

## My Contribution

I designed and implemented the current EmotiLearn MVP end-to-end, including:

- Defining the idea, learning flow, and technical architecture.
- Building the React interface and child-friendly game experience.
- Integrating browser camera access and face-api.js models.
- Developing the real-time emotion-detection and matching logic.
- Creating difficulty levels, scoring, sounds, and feedback states.
- Building the parent dashboard and progress-tracking experience.
- Developing the Express and MongoDB backend.
- Adding localStorage fallback, security middleware, and deployment preparation.
- Testing, debugging, and refining the complete prototype.

Future development will build on this MVP with an expanded Project 2 iteration.

## Privacy and Responsible Use

- Camera frames are processed in the browser and are not intentionally stored by the application.
- The prototype stores learning progress such as the entered child name, practiced emotion, result, stars, and date.
- Use test names and non-sensitive data while evaluating the current version.
- Camera-based emotion classification can be inaccurate and should not be used for medical, psychological, disciplinary, or high-stakes decisions.
- A production version involving children would require stronger consent, authentication, data-protection, and parental-control mechanisms.

## Current Limitations

- The parent PIN is a demonstration mechanism and is not secure authentication.
- The current history API does not yet implement user authentication or authorization.
- Frontend and backend progress-field naming requires normalization for consistent MongoDB reporting.
- Expression accuracy varies with lighting, camera angle, occlusion, and individual facial differences.
- The current model recognizes facial patterns, not a person's actual internal emotional state.
- The interface and full workflow are scheduled for further development in Project 2.

## Planned Improvements

- Redesign the interface and user experience.
- Add secure parent accounts and protected child profiles.
- Normalize and validate the progress-data contract.
- Strengthen API authorization and privacy controls.
- Improve accessibility and multilingual support.
- Add automated tests and model-performance evaluation.
- Expand activities, reports, and personalized learning paths.
- Prepare a complete production-ready deployment architecture.

## Disclaimer

EmotiLearn is an educational software prototype. Facial-expression predictions are probabilistic and do not determine a child's true feelings, wellbeing, or mental-health condition.
