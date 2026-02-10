import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { progressApi } from "../../api/progressApi";
import { useToast } from "../../hooks/useToast";
import type { CourseProgressDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";

export default function CourseProgressPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) return;
    progressApi
      .getCourseProgress(courseId)
      .then((res) => setProgress(res.data))
      .catch(() => toast.error("Failed to load progress"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  if (!progress) {
    return (
      <EmptyState title="Progress not found" description="We couldn't find progress data for this course"
        action={<Link to="/my-courses"><Button variant="secondary" size="sm">Back to My Courses</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title={progress.courseTitle} backTo="/my-courses" backLabel="My Courses" />

      <Card padding="lg">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{progress.completedLessons}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{progress.totalLessons}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{Math.round(progress.progressPercent)}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Progress</p>
          </div>
        </div>
        <ProgressBar value={progress.progressPercent} label="Overall Progress" detail={`${progress.completedLessons}/${progress.totalLessons}`} />
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Lessons</h2>
        <div className="space-y-2">
          {progress.lessons.map((lesson) => (
            <Link key={lesson.lessonId} to={`/courses/${courseId}/lessons/${lesson.lessonId}`}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-gray-400 font-mono">{String(lesson.orderIndex + 1).padStart(2, "0")}</span>
                <h3 className="text-sm font-medium text-gray-900 truncate">{lesson.lessonTitle}</h3>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {lesson.completedAt && <span className="text-xs text-gray-400">{new Date(lesson.completedAt).toLocaleDateString()}</span>}
                {lesson.isCompleted ? <Badge variant="success">Done</Badge> : <Badge variant="default">Pending</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
