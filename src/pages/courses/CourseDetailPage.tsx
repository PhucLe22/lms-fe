import { useEffect, useState, useMemo } from "react";
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

  const incompleteLessons = useMemo(() => {
    if (!progress || !course) return 0;
    return progress.totalLessons - progress.completedLessons;
  }, [progress, course]);

  const handleUnenroll = async () => {
    if (!id) return;
    if (incompleteLessons > 0) {
      const confirmed = window.confirm(
        `You have ${incompleteLessons} incomplete lesson${incompleteLessons > 1 ? "s" : ""}. Unenroll and lose all progress?`
      );
      if (!confirmed) return;
    }
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

  const sortedLessons = useMemo(
    () => [...(course?.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [course?.lessons]
  );

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
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={course.level === "Beginner" ? "success" : course.level === "Intermediate" ? "warning" : "danger"}>
            {course.level}
          </Badge>
        </div>
        <p className="text-gray-500 text-sm">{course.description}</p>
        <p className="text-xs text-gray-400 mt-2">By {course.creatorName}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {isStudent && !enrolled && (
          <Button onClick={handleEnroll} loading={actionLoading === "enroll"}>Enroll in Course</Button>
        )}
        {isStudent && enrolled && (
          <Button variant="secondary" onClick={handleUnenroll} loading={actionLoading === "unenroll"}>
            Unenroll {incompleteLessons > 0 && <span className="text-gray-400 ml-1">({incompleteLessons} incomplete)</span>}
          </Button>
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
        {sortedLessons.length > 0 ? (
          <div className="space-y-2">
            {sortedLessons.map((lesson, i) => {
              const lp = progress?.lessons.find((l) => l.lessonId === lesson.id);
              const prevCompleted = i === 0 || progress?.lessons.find((l) => l.lessonId === sortedLessons[i - 1].id)?.isCompleted;
              const unlocked = isAdmin || (enrolled && (lp?.isCompleted || prevCompleted));
              const className = `block border border-gray-200 rounded-lg p-4 transition-colors duration-150 ${unlocked ? "hover:bg-gray-50 cursor-pointer" : "opacity-60"}`;
              const content = (
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">{String(lesson.orderIndex + 1).padStart(2, "0")}</span>
                      <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.videoUrl && (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="Has video"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {lesson.documentUrl && (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="Has document"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      )}
                      {!unlocked && (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label="Locked"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      )}
                    </div>
                    <p className="text-gray-500 mt-1 text-sm pl-7 line-clamp-2">{lesson.content}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {lp?.isCompleted && <Badge variant="success">Completed</Badge>}
                  </div>
                </div>
              );
              return unlocked ? (
                <Link key={lesson.id} to={`/courses/${id}/lessons/${lesson.id}`} className={className}>{content}</Link>
              ) : (
                <div key={lesson.id} className={className}>{content}</div>
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
