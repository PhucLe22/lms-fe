import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { progressApi } from "../../api/progressApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { CourseDetailDto, CourseProgressDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import ProgressBar from "../../components/ui/ProgressBar";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isStudent, isAdmin } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const promises: Promise<unknown>[] = [
      courseApi.getById(id).then((res) => setCourse(res.data)),
    ];

    if (isStudent) {
      promises.push(
        enrollmentApi.myCourses()
          .then((res) => setEnrolled(res.data.some((e) => e.courseId === id)))
          .catch(() => {}),
        progressApi.getCourseProgress(id)
          .then((res) => setProgress(res.data))
          .catch(() => {})
      );
    }

    Promise.all(promises)
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isStudent]);

  const handleEnroll = async () => {
    if (!id) return;
    setActionLoading("enroll");
    try {
      await enrollmentApi.enroll(id);
      setEnrolled(true);
      const res = await progressApi.getCourseProgress(id);
      setProgress(res.data);
      toast.success("Enrolled successfully");
    } catch {
      toast.error("Failed to enroll");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async () => {
    if (!id) return;
    setActionLoading("unenroll");
    try {
      await enrollmentApi.unenroll(id);
      setEnrolled(false);
      setProgress(null);
      toast.info("Unenrolled from course");
    } catch {
      toast.error("Failed to unenroll");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (lessonId: string) => {
    if (!id) return;
    setActionLoading(lessonId);
    try {
      await progressApi.completeLesson(lessonId);
      const res = await progressApi.getCourseProgress(id);
      setProgress(res.data);
      toast.success("Lesson completed");
    } catch {
      toast.error("Failed to complete lesson");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        description="The course you're looking for doesn't exist"
        action={<Link to="/"><Button variant="secondary" size="sm">Back to Courses</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title={course.title} backTo="/" backLabel="Courses" />

      <div>
        <p className="text-gray-500 text-sm">{course.description}</p>
        <p className="text-xs text-gray-400 mt-2">By {course.creatorName}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {isStudent && !enrolled && (
          <Button onClick={handleEnroll} loading={actionLoading === "enroll"}>Enroll in Course</Button>
        )}
        {isStudent && enrolled && (
          <Button variant="danger" onClick={handleUnenroll} loading={actionLoading === "unenroll"}>Unenroll</Button>
        )}
        {isStudent && enrolled && (
          <Link to={`/my-courses/${id}/progress`}><Button variant="secondary">View Progress</Button></Link>
        )}
        {isAdmin && (
          <Link to={`/courses/${id}/edit`}><Button variant="secondary">Edit Course</Button></Link>
        )}
        {isAdmin && (
          <Link to={`/admin/lessons/${id}`}><Button variant="secondary">Manage Lessons</Button></Link>
        )}
      </div>

      {progress && (
        <Card>
          <ProgressBar value={progress.progressPercent} label="Course Progress" detail={`${progress.completedLessons}/${progress.totalLessons} lessons`} />
          <p className="text-xs text-gray-400 mt-2">{Math.round(progress.progressPercent)}% complete</p>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Lessons</h2>
        {course.lessons && course.lessons.length > 0 ? (
          <div className="space-y-2">
            {course.lessons.map((lesson) => {
              const lp = progress?.lessons.find((l) => l.lessonId === lesson.id);
              return (
                <Link key={lesson.id} to={`/courses/${id}/lessons/${lesson.id}`} className="block border border-gray-200 rounded-lg p-4 transition-colors duration-150 hover:bg-gray-50">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">{String(lesson.orderIndex + 1).padStart(2, "0")}</span>
                        <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                      </div>
                      <p className="text-gray-500 mt-1 text-sm pl-7 line-clamp-2">{lesson.content}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {enrolled && !lp?.isCompleted && (
                        <Button variant="secondary" size="sm" onClick={(e) => { e.preventDefault(); handleComplete(lesson.id); }} loading={actionLoading === lesson.id}>
                          Complete
                        </Button>
                      )}
                      {lp?.isCompleted && <Badge variant="success">Completed</Badge>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No lessons yet</p>
        )}
      </div>
    </div>
  );
}
