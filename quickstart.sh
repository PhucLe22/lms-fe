#!/bin/bash
# LMS Frontend - Quick Start Commands

# Navigate to project
cd /Users/mac/Documents/NET_CORE/lms-fe

# Install dependencies (already done)
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

echo "
═══════════════════════════════════════════════════════════
    LMS Frontend - React 18 + TypeScript + Tailwind
═══════════════════════════════════════════════════════════

📍 Development Server: http://localhost:5173
📍 Backend API:       http://localhost:5038/api

🔐 Demo Credentials:
   Admin:   admin@lms.com / Admin@123
   Student: studenta@lms.com / Student@123

📁 Project Structure:
   src/
   ├── api/              → API service modules
   ├── context/          → Auth state management
   ├── components/       → Reusable components
   ├── pages/            → Page components
   ├── types/            → TypeScript interfaces
   └── App.tsx           → Main routing

🚀 Commands:
   npm run dev          → Start development server
   npm run build        → Build for production
   npm run preview      → Preview production build

📚 Documentation:
   README.md            → Full project documentation
   SETUP_GUIDE.md       → Development guide

✨ Features Implemented:
   ✅ Authentication (Register/Login with JWT)
   ✅ Course browsing with pagination & search
   ✅ Student enrollment & progress tracking
   ✅ Admin course management
   ✅ Protected routes & role-based access
   ✅ TypeScript type safety
   ✅ Tailwind CSS styling
   ✅ Error handling & loading states

═══════════════════════════════════════════════════════════
"
