# 👷‍♂️ Worker Management System

A comprehensive and modern web application for managing workers, owners, assignments, and payments. Designed for efficiency and ease of use, with a sleek UI and robust backend integration.

## ✨ Features

- **Worker Management**: Track worker availability, status, and details.
- **Owner Management**: Manage clients/owners, assignment histories, and bulk payments.
- **Assignments**: Assign workers to specific tasks (e.g., Kooli, Grass Cutter) with daily tracking.
- **Payment Tracking**: Keep precise records of amounts owed, payments made, and daily earnings.
- **Daily Reports**: Generate comprehensive daily summaries of work done and revenue collected.
- **Responsive Design**: A polished interface that looks great on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios
- **Backend**: Django REST Framework, PostgreSQL
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone <your-repo-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root of the `frontend` directory based on the `.env.example` provided:
   ```bash
   cp .env.example .env
   ```
   
   Ensure your `.env` contains the correct API URL:
   ```env
   VITE_API_URL=http://localhost:8000/api/
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🌍 Deployment to Vercel

This frontend is configured and ready to be deployed to Vercel.

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository.
2. **Import to Vercel**:
   - Log in to your [Vercel dashboard](https://vercel.com/).
   - Click **Add New** > **Project**.
   - Import your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - In the Vercel project settings, go to the **Environment Variables** section.
   - Add a new variable:
      (or your production API URL)
5. **Deploy**: Click **Deploy**! Vercel will automatically build and host your site.

## 📄 License

This project is proprietary and confidential.
