import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import { progressApi } from "../../api/progressApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { CourseDetailDto, CourseProgressDto, LessonDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

export default function LessonStudyPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isStudent } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    const promises: Promise<unknown>[] = [
      courseApi.getById(courseId).then((res) => setCourse(res.data)),
    ];
    if (isStudent) {
      promises.push(
        progressApi.getCourseProgress(courseId).then((res) => setProgress(res.data)).catch(() => {})
      );
    }
    Promise.all(promises)
      .catch(() => toast.error("Failed to load lesson data"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, isStudent]);

  const sortedLessons = useMemo(
    () => [...(course?.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [course?.lessons]
  );

  const currentIndex = useMemo(
    () => sortedLessons.findIndex((l) => l.id === lessonId),
    [sortedLessons, lessonId]
  );

  const currentLesson = sortedLessons[currentIndex];
  const prevLesson: LessonDto | undefined = sortedLessons[currentIndex - 1];
  const nextLesson: LessonDto | undefined = sortedLessons[currentIndex + 1];
  const lessonProgress = progress?.lessons.find((l) => l.lessonId === lessonId);
  const isCompleted = lessonProgress?.isCompleted ?? false;

  const goToLesson = useCallback(
    (lesson: LessonDto) => navigate(`/courses/${courseId}/lessons/${lesson.id}`),
    [courseId, navigate]
  );

  const handleComplete = async () => {
    if (!lessonId || !courseId) return;
    setActionLoading(true);
    try {
      await progressApi.completeLesson(lessonId);
      const res = await progressApi.getCourseProgress(courseId);
      setProgress(res.data);
      toast.success("Lesson completed");
    } catch {
      toast.error("Failed to complete lesson");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  if (!course) {
    return (
      <EmptyState title="Course not found" description="The course you're looking for doesn't exist"
        action={<Link to="/"><Button variant="secondary" size="sm">Back to Courses</Button></Link>}
      />
    );
  }

  if (!currentLesson) {
    return (
      <EmptyState title="Lesson not found" description="This lesson doesn't exist in the course"
        action={<Link to={`/courses/${courseId}`}><Button variant="secondary" size="sm">Back to Course</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={course.title} backTo={`/courses/${courseId}`} backLabel="Course" />

      {/* Lesson navigation bar */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5">
        <span className="text-xs text-gray-400">Lesson {currentIndex + 1} of {sortedLessons.length}</span>
        <div className="flex items-center gap-1" role="tablist" aria-label="Lesson navigation">
          {sortedLessons.map((l, i) => {
            const lp = progress?.lessons.find((p) => p.lessonId === l.id);
            const isCurrent = l.id === lessonId;
            return (
              <button
                key={l.id}
                onClick={() => goToLesson(l)}
                title={`${i + 1}. ${l.title}`}
                aria-label={`Lesson ${i + 1}: ${l.title}${lp?.isCompleted ? " (completed)" : ""}`}
                aria-current={isCurrent ? "true" : undefined}
                className={`w-7 h-7 rounded text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isCurrent ? "bg-gray-900 text-white"
                    : lp?.isCompleted ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson content */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">{String(currentLesson.orderIndex + 1).padStart(2, "0")}</span>
            <h2 className="text-lg font-semibold text-gray-900">{currentLesson.title}</h2>
          </div>
          {isCompleted && <Badge variant="success">Completed</Badge>}
        </div>

        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {currentLesson.content}
        </div>

        {isStudent && !isCompleted && progress && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button onClick={handleComplete} loading={actionLoading}>Mark as Complete</Button>
          </div>
        )}
      </Card>

      {/* Prev / Next navigation */}
      <nav className="flex justify-between items-center" aria-label="Lesson navigation">
        {prevLesson ? (
          <button onClick={() => goToLesson(prevLesson)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" aria-label={`Previous: ${prevLesson.title}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="truncate max-w-[200px]">{prevLesson.title}</span>
          </button>
        ) : <div />}
        {nextLesson ? (
          <button onClick={() => goToLesson(nextLesson)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" aria-label={`Next: ${nextLesson.title}`}>
            <span className="truncate max-w-[200px]">{nextLesson.title}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : <div />}
      </nav>

      {/* All lessons list */}
      <details className="border border-gray-200 rounded-lg">
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
          All Lessons ({sortedLessons.length})
        </summary>
        <div className="border-t border-gray-200">
          {sortedLessons.map((l, i) => {
            const lp = progress?.lessons.find((p) => p.lessonId === l.id);
            const isCurrent = l.id === lessonId;
            return (
              <button
                key={l.id}
                onClick={() => goToLesson(l)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                  isCurrent ? "bg-gray-50 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-xs text-gray-400 font-mono w-5">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{l.title}</span>
                {lp?.isCompleted && (
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
