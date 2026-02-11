import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { courseApi } from "../../api/courseApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { lessonApi } from "../../api/lessonApi";
import { progressApi } from "../../api/progressApi";
import { quizApi } from "../../api/quizApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { CourseDetailDto, CourseProgressDto, LessonDto, CreateLessonRequest } from "../../types";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ProgressBar from "../../components/ui/ProgressBar";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg && typeof msg === "string") return msg;
    if (error.response?.status) return `Server error (${error.response.status})`;
    if (error.code === "ERR_NETWORK") return "Cannot connect to server. Please check your connection.";
  }
  return fallback;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/
  );
  return match?.[1] ?? null;
}

export default function LessonStudyPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isStudent, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Completion requirements
  const [videoWatchPercent, setVideoWatchPercent] = useState(0);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const watchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSentPercentRef = useRef(0);
  const watchRequestPending = useRef(false);

  const loadData = useCallback(() => {
    if (!courseId) return;
    setIsLoading(true);
    setLoadError(null);
    const promises: Promise<unknown>[] = [
      courseApi.getById(courseId).then((res) => setCourse(res.data)),
    ];
    if (isStudent) {
      promises.push(
        enrollmentApi.myCourses()
          .then((res) => setEnrolled(res.data.some((e) => e.courseId === courseId)))
          .catch(() => {}),
        progressApi.getCourseProgress(courseId).then((res) => setProgress(res.data)).catch(() => {})
      );
    }
    Promise.all(promises)
      .catch((err) => {
        const msg = getApiErrorMessage(err, "Failed to load lesson data");
        setLoadError(msg);
        toast.error(msg);
      })
      .finally(() => setIsLoading(false));
  }, [courseId, isStudent, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset requirements when lesson changes
  useEffect(() => {
    setSidebarOpen(false);
    setVideoWatchPercent(0);
    setHasQuiz(false);
    setQuizDone(false);
    lastSentPercentRef.current = 0;
  }, [lessonId]);

  // Check quiz requirement for students
  useEffect(() => {
    if (!lessonId || !isStudent) return;
    quizApi.getByLesson(lessonId).then((res) => {
      if (res.data && res.data.length > 0) {
        setHasQuiz(true);
        quizApi.getResult(lessonId)
          .then(() => setQuizDone(true))
          .catch(() => setQuizDone(false));
      }
    }).catch(() => {});
  }, [lessonId, isStudent]);

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

  const isLessonUnlocked = useCallback((index: number) => {
    if (isAdmin) return true;
    if (index === 0) return true;
    const currentLp = progress?.lessons.find((l) => l.lessonId === sortedLessons[index]?.id);
    if (currentLp?.isCompleted) return true;
    const prevLp = progress?.lessons.find((l) => l.lessonId === sortedLessons[index - 1]?.id);
    return !!prevLp?.isCompleted;
  }, [isAdmin, progress, sortedLessons]);

  const currentLessonUnlocked = isLessonUnlocked(currentIndex);

  const goToLesson = useCallback(
    (lesson: LessonDto) => navigate(`/courses/${courseId}/lessons/${lesson.id}`),
    [courseId, navigate]
  );

  const youtubeId = currentLesson?.videoUrl ? getYouTubeId(currentLesson.videoUrl) : null;

  // Initialize videoWatchPercent from backend progress
  useEffect(() => {
    if (lessonProgress?.videoWatchPercent) {
      setVideoWatchPercent(lessonProgress.videoWatchPercent);
      lastSentPercentRef.current = lessonProgress.videoWatchPercent;
    }
  }, [lessonProgress?.videoWatchPercent]);

  // YouTube IFrame API: track watch percentage & send to backend
  useEffect(() => {
    if (!youtubeId || !isStudent || !lessonId || isLoading) return;

    const loadYTApi = (): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (win.YT?.Player) return Promise.resolve();
      return new Promise((resolve) => {
        if (!document.getElementById("yt-iframe-api")) {
          const script = document.createElement("script");
          script.id = "yt-iframe-api";
          script.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(script);
        }
        const prev = win.onYouTubeIframeAPIReady;
        win.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      });
    };

    const startTracking = () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = setInterval(() => {
        const player = ytPlayerRef.current;
        if (!player?.getCurrentTime || !player?.getDuration) return;
        const duration = player.getDuration();
        if (!duration || duration <= 0) return;
        const percent = Math.round((player.getCurrentTime() / duration) * 100);
        setVideoWatchPercent((prev) => Math.max(prev, percent));
        // Send to backend every 10% increase, skip if previous request still pending
        if (percent >= lastSentPercentRef.current + 10 && !watchRequestPending.current) {
          watchRequestPending.current = true;
          lastSentPercentRef.current = percent;
          progressApi.updateWatchProgress(lessonId, percent)
            .catch(() => {})
            .finally(() => { watchRequestPending.current = false; });
        }
      }, 3000);
    };

    const stopTracking = () => {
      if (watchIntervalRef.current) { clearInterval(watchIntervalRef.current); watchIntervalRef.current = null; }
    };

    let cancelled = false;
    loadYTApi().then(() => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch {} }
      ytPlayerRef.current = new win.YT.Player("lesson-video", {
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 1) startTracking();  // PLAYING
            else stopTracking();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopTracking();
      if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch {} ytPlayerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId, isStudent, lessonId, isLoading]);

  // Can the student mark as complete?
  const hasVideo = !!youtubeId;
  const videoOk = videoWatchPercent >= 80;
  const requirementsMet =
    (!hasVideo || videoOk) && (!hasQuiz || quizDone);

  const [completing, setCompleting] = useState(false);
  const manuallyUncompleted = useRef(false);

  const handleCompleteLesson = useCallback(() => {
    if (!lessonId || !courseId || completing) return;
    setCompleting(true);
    progressApi.completeLesson(lessonId)
      .then(() => progressApi.getCourseProgress(courseId))
      .then((res) => {
        setProgress(res.data);
        toast.success("Lesson completed!");
      })
      .catch(() => toast.error("Failed to complete lesson. Please try again."))
      .finally(() => setCompleting(false));
  }, [lessonId, courseId, completing, toast]);

  const handleUncompleteLesson = useCallback(() => {
    if (!lessonId || !courseId || completing) return;
    setCompleting(true);
    manuallyUncompleted.current = true;
    progressApi.uncompleteLesson(lessonId)
      .then(() => progressApi.getCourseProgress(courseId))
      .then((res) => {
        setProgress(res.data);
        toast.success("Lesson marked as incomplete");
      })
      .catch(() => {
        manuallyUncompleted.current = false;
        toast.error("Failed to update lesson status. Please try again.");
      })
      .finally(() => setCompleting(false));
  }, [lessonId, courseId, completing, toast]);

  // Reset manual uncomplete flag when lesson changes
  useEffect(() => {
    manuallyUncompleted.current = false;
  }, [lessonId]);

  // Auto-complete when all requirements are met
  useEffect(() => {
    if (!isStudent || !lessonId || !courseId || !progress || isCompleted || !requirementsMet || manuallyUncompleted.current) return;
    handleCompleteLesson();
  }, [requirementsMet, isCompleted, progress, isStudent, lessonId, courseId, handleCompleteLesson]);

  // Admin inline edit
  const [editing, setEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { register, handleSubmit, reset: resetForm, formState: { errors: formErrors, isSubmitting } } = useForm<CreateLessonRequest>();

  const openEditForm = useCallback(() => {
    if (!currentLesson) return;
    resetForm({
      title: currentLesson.title,
      content: currentLesson.content,
      orderIndex: currentLesson.orderIndex,
      videoUrl: currentLesson.videoUrl || "",
      documentUrl: currentLesson.documentUrl || "",
    });
    setEditing(true);
  }, [currentLesson, resetForm]);

  const onSubmitEdit = useCallback(async (data: CreateLessonRequest) => {
    if (!lessonId || !courseId) return;
    setUploadProgress(0);
    const payload = {
      ...data,
      orderIndex: currentLesson.orderIndex,
      videoUrl: data.videoUrl?.trim() || undefined,
      documentUrl: data.documentUrl?.trim() || undefined,
    };
    const onProgress = (e: { loaded: number; total?: number }) => {
      if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    try {
      const res = await lessonApi.update(lessonId, payload, onProgress);
      const updatedLesson = res.data;
      setUploadProgress(0);
      toast.success("Lesson updated");
      setEditing(false);
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...updatedLesson } : l
          ),
        };
      });
    } catch (err) {
      setUploadProgress(0);
      const msg = isAxiosError(err) && typeof err.response?.data?.message === "string"
        ? err.response.data.message : "Failed to update lesson";
      toast.error(msg);
    }
  }, [lessonId, courseId, toast, currentLesson]);

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  if (loadError) {
    return (
      <EmptyState title="Failed to load lesson" description={loadError}
        action={
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={loadData}>Retry</Button>
            <Link to="/"><Button variant="secondary" size="sm">Back to Courses</Button></Link>
          </div>
        }
      />
    );
  }

  if (!course) {
    return (
      <EmptyState title="Course not found" description="The course you're looking for doesn't exist"
        action={<Link to="/"><Button variant="secondary" size="sm">Back to Courses</Button></Link>}
      />
    );
  }

  if (isStudent && !enrolled) {
    return (
      <EmptyState title="Enrollment required" description="You need to enroll in this course to access lessons"
        action={<Link to={`/courses/${courseId}`}><Button variant="primary" size="sm">Go to Course</Button></Link>}
      />
    );
  }

  if (isStudent && !currentLessonUnlocked) {
    return (
      <EmptyState title="Lesson locked" description="Complete the previous lesson first to unlock this one"
        action={<Link to={`/courses/${courseId}`}><Button variant="primary" size="sm">Back to Course</Button></Link>}
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
    <div className="-mx-6 -my-10">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/courses/${courseId}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{course.title}</span>
          <span className="text-xs text-gray-400">Lesson {currentIndex + 1}/{sortedLessons.length}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle lessons"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-7.5rem)]">
        {/* Left sidebar — lesson list */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} md:block w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto`}>
          <div className="py-2">
            {sortedLessons.map((l, i) => {
              const lp = progress?.lessons.find((p) => p.lessonId === l.id);
              const isCurrent = l.id === lessonId;
              const unlocked = isLessonUnlocked(i);
              return (
                <button
                  key={l.id}
                  onClick={() => unlocked && goToLesson(l)}
                  disabled={!unlocked}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors ${
                    !unlocked ? "opacity-40 cursor-not-allowed" : isCurrent ? "bg-gray-100 font-medium text-gray-900 cursor-pointer" : "text-gray-600 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 ${
                    lp?.isCompleted ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {lp?.isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : !unlocked ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="flex-1 truncate">{l.title}</span>
                  {l.videoUrl && (
                    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right content area */}
        <main className={`flex-1 overflow-y-auto ${sidebarOpen ? "hidden md:block" : ""}`}>
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {/* Lesson header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-mono">{String(currentIndex + 1).padStart(2, "0")}</span>
                <h1 className="text-xl font-semibold text-gray-900 mt-0.5">{currentLesson.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && !editing && (
                  <button
                    onClick={openEditForm}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
                {isStudent && isCompleted && (
                  <button
                    onClick={handleUncompleteLesson}
                    disabled={completing}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                    title="Click to mark as incomplete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {completing ? "Updating..." : "Completed"}
                  </button>
                )}
                {!isStudent && isCompleted && <Badge variant="success">Completed</Badge>}
              </div>
            </div>

            {/* Admin inline edit form */}
            {isAdmin && editing && (
              <form onSubmit={handleSubmit(onSubmitEdit)} className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Edit Lesson</h3>
                <Input label="Title" placeholder="Lesson title" error={formErrors.title?.message} {...register("title", { required: "Title is required" })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
                  <textarea
                    placeholder="Lesson content..."
                    rows={6}
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent resize-y ${formErrors.content ? "border-red-400 focus:ring-red-500" : ""}`}
                    {...register("content", { required: "Content is required" })}
                  />
                  {formErrors.content && <p className="text-red-500 text-xs mt-1.5">{formErrors.content.message}</p>}
                </div>
<Input label="Video URL" type="url" placeholder="https://www.youtube.com/watch?v=..." {...register("videoUrl")} />
                <Input label="Document URL" type="url" placeholder="https://docs.example.com/..." {...register("documentUrl")} />
                {isSubmitting && (
                  <ProgressBar value={uploadProgress} label="Updating..." detail={`${uploadProgress}%`} size="sm" />
                )}
                <div className="flex gap-2 pt-1">
                  <Button type="submit" size="sm" loading={isSubmitting}>Update</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={isSubmitting}>Cancel</Button>
                </div>
              </form>
            )}

            {/* Video embed */}
            {youtubeId && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  id="lesson-video"
                  src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Lesson content */}
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentLesson.content}
            </div>

            {/* Document link */}
            {currentLesson.documentUrl && (
              <a
                href={currentLesson.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Documentation
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {/* Quiz & Practice links */}
            {user && (
              <div className="flex gap-2 flex-wrap">
                <Link to={`/courses/${courseId}/lessons/${lessonId}/quiz`}>
                  <Button variant="secondary" size="sm">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quiz
                    </span>
                  </Button>
                </Link>
                <Link to={`/courses/${courseId}/lessons/${lessonId}/practice`}>
                  <Button variant="secondary" size="sm">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Practice
                    </span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Completion requirements */}
            {isStudent && !isCompleted && progress && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {(hasVideo || hasQuiz) && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">Requirements</p>
                    {hasVideo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${videoOk ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                          {videoOk ? (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /></svg>
                          )}
                        </span>
                        <span className={videoOk ? "text-gray-700" : "text-gray-400"}>
                          Watch the video {videoWatchPercent > 0 && !videoOk && <span className="text-xs">({videoWatchPercent}% / 80%)</span>}
                        </span>
                      </div>
                    )}
                    {hasQuiz && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${quizDone ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                          {quizDone ? (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /></svg>
                          )}
                        </span>
                        <span className={quizDone ? "text-gray-700" : "text-gray-400"}>
                          Complete the quiz
                          {!quizDone && (
                            <Link to={`/courses/${courseId}/lessons/${lessonId}/quiz`} className="ml-1.5 text-gray-900 underline underline-offset-2 hover:no-underline">
                              Go to quiz
                            </Link>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {requirementsMet && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCompleteLesson}
                    disabled={completing}
                  >
                    {completing ? "Completing..." : "Complete Lesson"}
                  </Button>
                )}
              </div>
            )}

            {/* Prev / Next navigation */}
            <nav className="flex justify-between items-center pt-4 border-t border-gray-100" aria-label="Lesson navigation">
              {prevLesson ? (
                <button onClick={() => goToLesson(prevLesson)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="truncate max-w-[200px]">{prevLesson.title}</span>
                </button>
              ) : <div />}
              {nextLesson && isLessonUnlocked(currentIndex + 1) ? (
                <button onClick={() => goToLesson(nextLesson)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                  <span className="truncate max-w-[200px]">{nextLesson.title}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div />}
            </nav>
          </div>
        </main>
      </div>
    </div>
  );
}
