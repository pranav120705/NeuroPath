


# 🧠 AI-Powered Physical Exercise Monitoring System using PoseNet

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg">
  <img alt="Status" src="https://img.shields.io/badge/Status-Completed-green.svg">
  <img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white">
  <img alt="TensorFlow.js" src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=flat&logo=tensorflow&logoColor=white">
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black">
</p>

### _Telehealth-Based In-Home Rehabilitation Platform_

---

## 📖 Introduction

This project presents an **AI-powered telehealth system** designed for **in-home physical rehabilitation** using **PoseNet**, a machine learning model capable of detecting human body keypoints from webcam video input.

Patients perform physical exercises at home, while doctors remotely monitor progress through pose estimation, joint angle computation, and statistical analysis. The system provides **real-time posture feedback**, tracks progress, and visualizes recovery trends.

This approach offers a **low-cost, accessible alternative** to traditional in-person physiotherapy and motion-capture systems.

---

## 📚 Table of Contents

- [Introduction](#-introduction)
- [Demo / Preview](#-demo--preview)
- [Objectives](#-objectives)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Algorithm and Computations](#-algorithm-and-computations)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Flow of Execution](#-flow-of-execution)
- [Sample Output](#-sample-output)
- [Results and Discussion](#-results-and-discussion)
- [Conclusion](#-conclusion)
- [Reference](#-reference)
- [License](#-license)

---

## 📸 Demo / Preview

> A live-action demo of the PoseNet model detecting joint angles and providing real-time feedback to the patient. The doctor's dashboard visualizes the data analysis.

*(**Suggestion:** Record a GIF of your application in action and place it here. You can drag and drop a GIF into the GitHub editor to upload it.)*

``

---

## 🎯 Objectives

- Enable home-based physiotherapy using **AI-driven pose estimation**.
- Detect and evaluate **elbow and knee joint angles** during exercise.
- Provide **real-time posture feedback** to patients.
- Allow doctors to remotely analyze progress using **statistical data**.
- Reduce costs and improve accessibility for patients with limited mobility.

---

## 🏗️ System Architecture

Patient (React Frontend) → PoseNet (Pose Detection) → Angle Calculation
↓ ↓
Firebase Firestore ←→ FastAPI Backend ←→ Doctor Dashboard

### Modules

1.  **Patient Module** – Perform exercises, view feedback.
2.  **Doctor Module** – Analyze data, compare sessions, prescribe routines.
3.  **Admin Module** – Manage doctor and patient accounts.
4.  **Database Module** – Store session data and user information in Firebase.

---

## ⚙️ Features

### 👩‍⚕️ Patient Side

-   Login via Firebase Authentication.
-   Perform exercises using webcam input.
-   Real-time skeleton visualization and feedback (“✅ Correct Posture” / “⚠️ Adjust Position”).
-   View past performance charts and doctor feedback.

### 🧑‍⚕️ Doctor Side

-   Manage and view patient data.
-   Review exercise analytics through Recharts.
-   Automatically compare performance across multiple days.
-   Use computed metrics (MAD, MSE, MAPE) to assess recovery rate.

### 🧠 AI/ML Component

-   **PoseNet (TensorFlow.js)** detects 17 human keypoints.
-   Calculates joint angles using **geometric vector math**.
-   Measures deviation from ideal posture for performance evaluation.

---

## fF; Tech Stack

| Category | Technology |
| :--- | :--- |
| **Front-End** | React.js, TypeScript, Vite |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | Firebase / Firestore |
| **AI Model** | PoseNet (TensorFlow.js) |
| **Visualization** | Recharts |
| **Deployment** | Firebase Hosting |

---

## 🧮 Algorithm and Computations

### Pose Detection:

PoseNet identifies 17 keypoints: shoulders, elbows, wrists, hips, knees, and ankles.
Angles are calculated using the **Law of Cosines** between three points:

$$
\theta = \cos^{-1}\left(\frac{(B-A)\cdot(C-B)}{\|B-A\|\|C-B\|}\right)
$$

### Statistical Evaluation:

To measure progress and posture accuracy, the system uses:

$$
MAD = \frac{\sum |A_t - F_t|}{N}
$$
$$
MSE = \frac{\sum (A_t - F_t)^2}{N}
$$
$$
MAPE = \frac{\sum \left|\frac{A_t - F_t}{A_t}\right|}{N} \times 100\%
$$

Where:

-   *$A_t$* = Ideal (benchmark) angle
-   *$F_t$* = Patient’s recorded angle
-   *$N$* = Number of frames

**Interpretation:**

-   Low **MAD** → Accurate movement
-   Low **MSE** → Stable performance
-   Low **MAPE** → Improved recovery rate

---

## 🧩 Project Structure

```yaml
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── LoginScreen.tsx
│ │ │ ├── DoctorDashboard.tsx
│ │ │ ├── PatientDashboard.tsx
│ │ │ ├── ExerciseSession.tsx
│ │ │ ├── AnalysisChart.tsx
│ │ │ └── StatsTable.tsx
│ │ ├── services/
│ │ │ └── poseUtils.ts # Pose estimation & angle calculation
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── vite.config.ts
│ ├── package.json
│ └── tsconfig.json
│
├── backend/
│ ├── main.py # FastAPI backend entry point
│ ├── database.py # Firebase connection
│ ├── routers/
│ │ ├── doctors.py
│ │ ├── patients.py
│ │ ├── exercises.py
│ │ └── sessions.py
│ ├── requirements.txt
│
└── README.md
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18X6Rw-bgU0zxNYTE-w3dJCKFjL2qoFMo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Run the app:
   `npm run dev`

