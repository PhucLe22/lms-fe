import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";

export default function HomePage() {
  const { user, isStudent, isAdmin } = useAuth();

  return (
    <div className="flex flex-col items-center text-center py-16 space-y-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Learning Management System
        </h1>
        <p className="text-lg text-gray-500">
          Explore courses, track your progress, and enhance your skills with our
          structured learning platform.
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/courses">
          <Button size="md">Browse Courses</Button>
        </Link>
        {!user && (
          <Link to="/register">
            <Button variant="secondary" size="md">Get Started</Button>
          </Link>
        )}
        {isStudent && (
          <Link to="/dashboard">
            <Button variant="secondary" size="md">My Dashboard</Button>
          </Link>
        )}
        {isAdmin && (
          <Link to="/courses/new">
            <Button variant="secondary" size="md">Create Course</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-3">
            <svg className="w-8 h-8 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.466.89 6.064 2.346m0-12.304a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.346m0-12.304v12.304" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Structured Courses</h3>
          <p className="text-sm text-gray-500">Learn through well-organized lessons with videos and documents.</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-3">
            <svg className="w-8 h-8 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Quizzes & Practice</h3>
          <p className="text-sm text-gray-500">Test your knowledge with quizzes and hands-on practice exercises.</p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="text-2xl mb-3">
            <svg className="w-8 h-8 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Track Progress</h3>
          <p className="text-sm text-gray-500">Monitor your learning journey with detailed progress tracking.</p>
        </div>
      </div>
    </div>
  );
}
