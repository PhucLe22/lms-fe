# LMS Frontend

A modern, fresher-friendly Learning Management System frontend built with **React 18**, **TypeScript**, and **Tailwind CSS**. Designed to integrate seamlessly with the .NET 9 LMS backend API.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📋 Tech Stack

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Routing:** React Router v6
- **HTTP Client:** Axios (with JWT interceptor)
- **State Management:** React Context
- **UI Framework:** Tailwind CSS
- **Forms:** React Hook Form
- **Build Tool:** Vite

## 📁 Project Structure

```
src/
├── api/                          # API service modules
│   ├── axiosClient.ts           # Axios instance with JWT interceptor
│   ├── authApi.ts               # Authentication endpoints
│   ├── courseApi.ts             # Course CRUD endpoints
│   ├── lessonApi.ts             # Lesson CRUD endpoints
│   ├── enrollmentApi.ts         # Enrollment endpoints
│   └── progressApi.ts           # Progress tracking endpoints
│
├── context/
│   └── AuthContext.tsx          # Global authentication state
│
├── components/
│   └── layout/
│       ├── Navbar.tsx           # Navigation bar
│       └── ProtectedRoute.tsx   # Route protection wrapper
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx        # User login
│   │   └── RegisterPage.tsx     # User registration
│   ├── courses/
│   │   ├── CourseListPage.tsx   # Browse all courses
│   │   ├── CourseDetailPage.tsx # View course details + enroll
│   │   └── CourseFormPage.tsx   # Create/edit course (Admin)
│   ├── student/
│   │   ├── MyCoursesPage.tsx    # Enrolled courses
│   │   └── CourseProgressPage.tsx # Track progress
│   └── admin/
│       └── AdminLessonsPage.tsx # Manage lessons (Admin)
│
├── types/
│   └── index.ts                 # TypeScript interfaces
│
├── App.tsx                      # Main routing config
└── main.tsx                     # Entry point
```

## 🔐 Authentication Flow

### JWT Token Management
- Tokens are automatically attached to all API requests via Axios interceptor
- Stored in `localStorage` for persistence
- Auto-logout on 401 (Unauthorized) responses

### Demo Credentials
```
Admin:   admin@lms.com / Admin@123
Student: studenta@lms.com / Student@123
```

### Protected Routes
Routes are protected based on user role:
- **Admin Only:** Course creation/editing, lesson management
- **Student Only:** Enroll in courses, track progress
- **Public:** Browse courses, view details

## 📱 Key Features

### Phase 1: Authentication ✅
- User registration with email validation
- Login with JWT token storage
- Logout functionality
- Role-based access control

### Phase 2: Browse Courses ✅
- List all courses with pagination
- Search courses by title/description
- View detailed course information
- Display lesson count and enrollment count

### Phase 3: Student Features ✅
- Enroll/unenroll from courses
- View enrolled courses
- Track course progress
- Mark lessons as complete
- View detailed progress breakdown

### Phase 4: Admin Features (In Progress)
- Create new courses
- Edit course details
- Delete courses
- Manage lessons (create, update, delete)

## 🛠️ API Integration

All API calls are centralized in the `src/api/` directory.

### Example: Fetching Courses
```typescript
import { courseApi } from "./api/courseApi";

const response = await courseApi.getAll(page, pageSize, searchTerm);
```

### Example: Completing a Lesson
```typescript
import { progressApi } from "./api/progressApi";

await progressApi.completeLesson(lessonId);
```

## 🔧 Configuration

### Backend URL
Update in `src/api/axiosClient.ts`:
```typescript
const axiosClient = axios.create({
  baseURL: "http://localhost:5038/api",  // Update this
  headers: { "Content-Type": "application/json" },
});
```

### CORS Configuration (Backend)
Your backend needs CORS enabled for `http://localhost:5173`:
```csharp
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()));

app.UseCors();
```

## 📝 TypeScript Types

All types are in `src/types/index.ts` and match your backend DTOs:
- `AuthResponse`, `User`, `LoginRequest`, `RegisterRequest`
- `CourseDto`, `CourseDetailDto`, `CreateCourseRequest`
- `LessonDto`, `CreateLessonRequest`
- `EnrollmentDto`
- `LessonProgressDto`, `CourseProgressDto`
- `PaginatedResult<T>`

## 🎨 Styling

**Tailwind CSS** provides rapid UI development:
- Responsive grid layouts
- Color schemes and shadows
- Form styling with focus states
- Hover and transition effects

## 🧪 Testing the App

1. **Login as Admin:**
   - Email: `admin@lms.com` / Password: `Admin@123`
   - Create courses and manage lessons

2. **Login as Student:**
   - Email: `studenta@lms.com` / Password: `Student@123`
   - Enroll in courses and track progress

## 🚦 Development Tips

### Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Use Network tab to inspect API calls

### Common Issues

**CORS Error?**
- Ensure backend CORS is configured correctly
- Verify frontend URL in backend CORS policy

**401 Unauthorized?**
- Check token validity
- Log out and back in
- Verify token hasn't expired on backend

**API Not Working?**
- Verify backend URL in `axiosClient.ts`
- Check backend is running on port 5038
- Inspect network requests in DevTools

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 🎯 Future Enhancements

1. ✅ Core CRUD pages implemented
2. ⏳ Enhanced form validation with Zod
3. ⏳ Advanced lesson management UI
4. ⏳ Error boundaries
5. ⏳ Loading skeletons
6. ⏳ Unit tests

---

**Built with ❤️ for fresher developers learning React + TypeScript + REST APIs**

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
