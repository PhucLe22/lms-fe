# LMS Frontend - Setup & Development Guide

## ✅ Project Status

The **LMS Frontend** is now fully initialized and ready for development!

### What's Included
- ✅ React 18 + TypeScript + Vite setup
- ✅ Tailwind CSS configured
- ✅ Complete folder structure
- ✅ All API service modules (Auth, Course, Lesson, Enrollment, Progress)
- ✅ Authentication Context with JWT management
- ✅ Protected routes with role-based access
- ✅ Pages: Login, Register, Course List, Course Detail
- ✅ Student features: Enroll, My Courses, Progress tracking
- ✅ Admin features: Create/Edit courses (basic)
- ✅ Full TypeScript support

## 🚀 Getting Started

### 1. Start Development Server
```bash
cd /Users/mac/Documents/NET_CORE/lms-fe
npm run dev
```

The app will open at **http://localhost:5173**

### 2. Backend Configuration
Ensure your .NET backend is running on **http://localhost:5038** with CORS enabled:

```csharp
// In Program.cs
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()));

app.UseCors();
```

### 3. Test with Demo Credentials

**Admin Account:**
- Email: `admin@lms.com`
- Password: `Admin@123`

**Student Account:**
- Email: `studenta@lms.com`
- Password: `Student@123`

## 📋 Project Structure

```
src/
├── api/                      # API modules
│   ├── axiosClient.ts       # JWT interceptor
│   ├── authApi.ts
│   ├── courseApi.ts
│   ├── lessonApi.ts
│   ├── enrollmentApi.ts
│   └── progressApi.ts
│
├── context/                 # State management
│   └── AuthContext.tsx
│
├── components/              # Reusable components
│   └── layout/
│       ├── Navbar.tsx
│       └── ProtectedRoute.tsx
│
├── pages/                   # Page components
│   ├── auth/
│   ├── courses/
│   ├── student/
│   └── admin/
│
├── types/                   # TypeScript interfaces
│   └── index.ts
│
└── App.tsx                  # Main routing
```

## 🔐 Authentication Flow

1. **User registers/logs in** → Calls `/auth/register` or `/auth/login`
2. **JWT token stored** → Saved in `localStorage`
3. **Token attached to requests** → Axios interceptor handles this
4. **Token expires?** → Auto-redirects to login on 401 response
5. **User logs out** → Token cleared from storage

## 📱 Available Pages

### Public Routes
- **`/`** - Browse all courses
- **`/courses/:id`** - View course details
- **`/login`** - Login page
- **`/register`** - Registration page

### Student-Only Routes
- **`/my-courses`** - View enrolled courses
- **`/my-courses/:courseId/progress`** - Track progress

### Admin-Only Routes
- **`/courses/new`** - Create new course
- **`/courses/:id/edit`** - Edit course
- **`/admin/lessons/:courseId`** - Manage lessons (placeholder)

## 🛠️ Development Workflow

### Running Tests
```bash
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Common Tasks

**View API requests**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions and watch API calls

**Debug Auth issues**
- Check `localStorage` in DevTools Console:
  ```javascript
  localStorage.getItem('token')
  ```
- Check Network tab for 401/403 responses

**Add a new page**
1. Create file in `src/pages/`
2. Add route in `App.tsx`
3. Import and use in Routes

**Call an API**
1. Import API module: `import { courseApi } from "../../api/courseApi"`
2. Call the function: `await courseApi.getAll(1, 10)`
3. Handle response/errors

## 🎨 Styling with Tailwind

Tailwind classes are available throughout:
```tsx
// Colors
<div className="text-blue-600 bg-blue-50">

// Spacing
<div className="px-4 py-2 mb-4">

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hover/Focus
<button className="hover:bg-blue-700 focus:ring-2">
```

See [Tailwind Docs](https://tailwindcss.com) for full reference.

## 🚨 Troubleshooting

### CORS Error
**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:** Ensure backend has CORS configured for `http://localhost:5173`

### 401 Unauthorized
**Problem:** API returns 401 even with token

**Check:**
1. Token is being sent in requests (DevTools → Network → Headers)
2. Token is valid and not expired
3. Backend is expecting format: `Authorization: Bearer <token>`

### Build Errors
**Problem:** TypeScript errors during build

**Solution:**
1. Check imports use `type` for TypeScript types:
   ```tsx
   import type { CourseDto } from "../types"
   ```
2. Run `npm run build` to see full errors
3. Check `tsconfig.json` settings

### Hot Module Replacement Not Working
**Problem:** Changes don't reflect without full refresh

**Solution:**
1. Stop dev server (Ctrl+C)
2. Clear `.next` folder if exists
3. Run `npm run dev` again

## 📚 TypeScript Tips

All types are in `src/types/index.ts`. Use them consistently:

```tsx
// ✅ Good: Explicit types
const [courses, setCourses] = useState<CourseDto[]>([]);

// ❌ Avoid: Implicit any
const [courses, setCourses] = useState([]);
```

## 🎯 Next Phase: Expanding Features

### Phase 4: Complete Admin Features
- [ ] Lesson CRUD interface
- [ ] Drag-to-reorder lessons
- [ ] Delete courses with confirmation
- [ ] Admin dashboard with stats

### Phase 5: Enhanced UX
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Modal dialogs

### Phase 6: Testing
- [ ] Unit tests with Vitest
- [ ] Integration tests
- [ ] E2E tests with Playwright

## API Endpoints Reference

All endpoints are in the backend at `http://localhost:5038/api/`:

```
Auth:
  POST /auth/register    - Create account
  POST /auth/login       - Login user
  GET  /auth/me          - Get current user

Courses:
  GET  /courses?page=1&search=...    - List courses
  GET  /courses/{id}                 - Get course details
  POST /courses                      - Create course (Admin)
  PUT  /courses/{id}                 - Update course (Admin)
  DELETE /courses/{id}               - Delete course (Admin)

Lessons:
  GET  /courses/{courseId}/lessons   - Get course lessons
  POST /courses/{courseId}/lessons   - Create lesson (Admin)
  PUT  /lessons/{id}                 - Update lesson (Admin)
  DELETE /lessons/{id}               - Delete lesson (Admin)

Enrollments:
  POST   /enrollments/{courseId}     - Enroll in course
  GET    /enrollments/my-courses     - Get enrolled courses
  DELETE /enrollments/{courseId}     - Unenroll from course

Progress:
  POST /lessons/{lessonId}/complete  - Mark lesson complete
  GET  /courses/{courseId}/progress  - Get course progress
```

## Contributing Notes

When adding new features:
1. Add TypeScript types to `src/types/index.ts`
2. Create API function in appropriate `src/api/*.ts` file
3. Create page/component with proper error handling
4. Add route to `App.tsx`
5. Test with demo credentials
6. Build to verify no TypeScript errors

---

**Ready to develop! Happy coding!**

Questions? Check the comprehensive README.md for more details.
