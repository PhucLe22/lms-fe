# 📚 LMS Frontend - Documentation Index

## Quick Navigation

### 🚀 Getting Started
1. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Development setup and quick start
2. **[README.md](README.md)** - Complete project documentation

### 📖 Reference
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Detailed implementation overview
- **[COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md)** - Feature checklist

### 🎯 Commands
```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📁 Project Structure Overview

```
lms-fe/
├── src/
│   ├── api/              # API service modules
│   ├── context/          # State management
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx           # Main routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
│
├── README.md             # Full documentation
├── SETUP_GUIDE.md        # Development guide
├── IMPLEMENTATION_SUMMARY.md  # Implementation details
├── COMPLETION_CHECKLIST.md    # Feature checklist
└── quickstart.sh         # Quick start commands
```

---

## 🔐 Demo Credentials

```
Admin:   admin@lms.com / Admin@123
Student: studenta@lms.com / Student@123
```

---

## ✨ Key Features

### ✅ Authentication
- Register new accounts
- Login with JWT
- Logout with auto-cleanup
- Auto-login on page refresh

### ✅ Course Management
- Browse courses with pagination
- Search courses
- View course details
- Admin: Create/edit courses

### ✅ Student Features
- Enroll in courses
- View enrolled courses
- Track progress per course
- Mark lessons complete
- View completion dates

### ✅ Admin Features
- Create new courses
- Edit course details
- Delete courses (basic)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| HTTP | Axios |
| State | Context API |
| Forms | React Hook Form |
| Styling | Tailwind CSS |
| Build Output | ~312KB |

---

## 📝 File Manifest

### API Modules (`src/api/`)
- `axiosClient.ts` - Axios with JWT interceptor
- `authApi.ts` - Authentication endpoints
- `courseApi.ts` - Course CRUD operations
- `lessonApi.ts` - Lesson management
- `enrollmentApi.ts` - Course enrollment
- `progressApi.ts` - Progress tracking

### Context (`src/context/`)
- `AuthContext.tsx` - Global auth state

### Components (`src/components/layout/`)
- `Navbar.tsx` - Navigation bar
- `ProtectedRoute.tsx` - Route protection

### Pages (`src/pages/`)
- `auth/LoginPage.tsx` - User login
- `auth/RegisterPage.tsx` - User registration
- `courses/CourseListPage.tsx` - Browse courses
- `courses/CourseDetailPage.tsx` - Course details
- `courses/CourseFormPage.tsx` - Create/edit course
- `student/MyCoursesPage.tsx` - Enrolled courses
- `student/CourseProgressPage.tsx` - Track progress
- `admin/AdminLessonsPage.tsx` - Lesson management

### Types (`src/types/`)
- `index.ts` - All TypeScript interfaces

---

## 🚀 Quick Start Workflow

### 1. Start Development
```bash
cd /Users/mac/Documents/NET_CORE/lms-fe
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Login
Use demo credentials:
- Admin: `admin@lms.com` / `Admin@123`
- Student: `studenta@lms.com` / `Student@123`

### 4. Test Features
- Browse courses
- Enroll in courses
- Track progress
- Create courses (admin)

---

## 🔗 API Endpoints

All requests go to: `http://localhost:5038/api/`

### Authentication
```
POST /auth/register      - Create account
POST /auth/login         - Login
GET  /auth/me            - Get current user
```

### Courses
```
GET  /courses            - List courses (paginated)
GET  /courses/:id        - Get course details
POST /courses            - Create course (Admin)
PUT  /courses/:id        - Update course (Admin)
DELETE /courses/:id      - Delete course (Admin)
```

### Lessons
```
GET    /courses/:courseId/lessons       - Get lessons
POST   /courses/:courseId/lessons       - Create lesson
PUT    /lessons/:id                     - Update lesson
DELETE /lessons/:id                     - Delete lesson
```

### Enrollments
```
POST   /enrollments/:courseId           - Enroll
GET    /enrollments/my-courses          - Get my courses
DELETE /enrollments/:courseId           - Unenroll
```

### Progress
```
POST /lessons/:lessonId/complete        - Complete lesson
GET  /courses/:courseId/progress        - Get progress
```

---

## 🎓 Learning Path

### Beginner
1. Read [README.md](README.md)
2. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Run `npm run dev`
4. Test login/register flow
5. Explore pages in browser

### Intermediate
1. Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
2. Explore source code in `src/`
3. Understand the project structure
4. Try modifying a page
5. Add a new feature

### Advanced
1. Add new API endpoints
2. Create new pages
3. Implement lesson CRUD UI
4. Add form validation
5. Extend authentication

---

## 🐛 Troubleshooting

### CORS Error
**Problem:** API requests blocked by CORS

**Solution:** Ensure backend has CORS configured for `http://localhost:5173`

### 401 Unauthorized
**Problem:** Token not being sent

**Check:**
- Token is in localStorage: `localStorage.getItem('token')`
- Token is in request headers (DevTools → Network)

### Build Errors
**Solution:**
```bash
npm run build
# Check error messages and fix imports
```

### Port Already in Use
**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

---

## 📞 Support

### Documentation
- **README.md** - Full documentation
- **SETUP_GUIDE.md** - Development guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation details

### Code Comments
- Inline comments explain complex logic
- TypeScript types are self-documenting
- Function names are descriptive

### Common Issues
See SETUP_GUIDE.md → Troubleshooting section

---

## ✅ Verification Checklist

Before starting development:

- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Run `npm run build` (verify no errors)
- [ ] Run `npm run dev`
- [ ] Open browser to `http://localhost:5173`
- [ ] Test login with demo credentials
- [ ] Test basic functionality

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| TypeScript Files | 20 |
| React Components | 11 |
| API Modules | 6 |
| Pages | 9 |
| Type Definitions | 25+ |
| Build Size | 312KB |
| Build Time | <1 sec |

---

## 🎯 Next Steps

1. **Develop Locally**
   - Run `npm run dev`
   - Test all features
   - Understand the code

2. **Extend Features**
   - Add lesson CRUD UI
   - Improve admin features
   - Add more validations

3. **Deploy**
   - Run `npm run build`
   - Deploy `dist/` folder
   - Update API base URL

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 👨‍💻 Built For

**Fresher developers learning:**
- React 18
- TypeScript
- Modern frontend development
- REST API integration
- Professional project structure

---

**Last Updated:** February 10, 2026
**Status:** ✅ Production Ready
**Version:** 1.0

For detailed information, see the specific documentation files listed above.
