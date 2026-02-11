import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../../api/dashboardApi";
import { useToast } from "../../hooks/useToast";
import type { DashboardDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    dashboardApi
      .get()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  if (!data) {
    return (
      <EmptyState title="Dashboard unavailable" description="We couldn't load your dashboard data"
        action={<Link to="/courses"><Button variant="secondary" size="sm">Browse Courses</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <p className="text-2xl font-semibold text-gray-900">{data.totalEnrolledCourses}</p>
          <p className="text-xs text-gray-500 mt-0.5">Enrolled</p>
        </Card>
        <Card padding="md">
          <p className="text-2xl font-semibold text-gray-900">{data.completedCourses}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </Card>
        <Card padding="md">
          <p className="text-2xl font-semibold text-gray-900">{Math.round(data.overallProgressPercent)}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Overall Progress</p>
        </Card>
        <Card padding="md">
          <p className="text-2xl font-semibold text-gray-900">{Math.round(data.averageQuizScore)}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Quiz Score</p>
        </Card>
      </div>

      {/* Course breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Course Progress</h2>
        {data.courses.length > 0 ? (
          <div className="space-y-3">
            {data.courses.map((course) => (
              <Link key={course.courseId} to={`/courses/${course.courseId}`} className="block">
                <Card hover padding="md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{course.courseTitle}</h3>
                    <span className="text-xs text-gray-500">
                      {course.completedLessons}/{course.totalLessons} lessons
                    </span>
                  </div>
                  <ProgressBar value={course.progressPercent} size="sm" />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>{Math.round(course.progressPercent)}% complete</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No courses yet" description="Enroll in courses to see your progress here"
            action={<Link to="/courses"><Button variant="secondary" size="sm">Browse Courses</Button></Link>}
          />
        )}
      </div>
    </div>
  );
}
