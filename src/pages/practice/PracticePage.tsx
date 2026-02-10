import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { practiceApi } from "../../api/practiceApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { PracticeTaskDto, PracticeSubmissionDto, EnrollmentDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

export default function PracticePage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isAdmin, isStudent, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<PracticeTaskDto[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, PracticeSubmissionDto[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitContent, setSubmitContent] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!lessonId || !courseId || authLoading) return;
    setIsLoading(true);

    const promises: Promise<unknown>[] = [
      practiceApi.getByLesson(lessonId).then(async (res) => {
        setTasks(res.data);
        if (isStudent && res.data.length > 0) {
          const subs: Record<string, PracticeSubmissionDto[]> = {};
          await Promise.all(
            res.data.map((task: PracticeTaskDto) =>
              practiceApi.getMySubmissions(task.id)
                .then((r) => { subs[task.id] = r.data; })
                .catch(() => {})
            )
          );
          setSubmissions(subs);
        }
      }),
    ];

    if (isStudent) {
      promises.push(
        enrollmentApi.myCourses().then((res) => {
          setEnrolled(res.data.some((e: EnrollmentDto) => e.courseId === courseId));
        }).catch(() => setEnrolled(false))
      );
    } else if (isAdmin) {
      setEnrolled(true);
    }

    Promise.all(promises)
      .catch(() => toast.error("Failed to load practice tasks"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, courseId, isStudent, authLoading]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      await enrollmentApi.enroll(courseId);
      setEnrolled(true);
      toast.success("Enrolled successfully");
    } catch {
      toast.error("Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmit = async (taskId: string) => {
    const content = submitContent[taskId]?.trim();
    if (!content) return;
    setSubmitting(taskId);
    try {
      const res = await practiceApi.submit(taskId, { content });
      setSubmissions((prev) => ({
        ...prev,
        [taskId]: [res.data, ...(prev[taskId] || [])],
      }));
      setSubmitContent((prev) => ({ ...prev, [taskId]: "" }));
      toast.success("Submission sent");
    } catch {
      toast.error("Failed to submit");
    } finally {
      setSubmitting(null);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Practice Tasks"
        backTo={`/courses/${courseId}/lessons/${lessonId}`}
        backLabel="Lesson"
        actions={
          isAdmin ? (
            <Link to={`/admin/lessons/${courseId}/${lessonId}/practice`}>
              <Button size="sm">Manage Tasks</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Enrollment required */}
      {isStudent && enrolled === false && (
        <Alert variant="warning">
          <div className="flex items-center justify-between gap-4">
            <span>You need to enroll in this course to submit practice tasks.</span>
            <Button size="sm" onClick={handleEnroll} loading={enrolling}>Enroll Now</Button>
          </div>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <EmptyState title="No practice tasks" description="There are no practice tasks for this lesson yet" />
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => (
            <Card key={task.id} padding="lg">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                <Badge variant={task.submissionType === "GitUrl" ? "info" : "default"}>
                  {task.submissionType === "GitUrl" ? "Git URL" : "Text"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>

              {/* Submit form for enrolled students */}
              {isStudent && enrolled && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Submission ({task.submissionType === "GitUrl" ? "Git repository URL" : "Text answer"})
                  </label>
                  {task.submissionType === "GitUrl" ? (
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={submitContent[task.id] || ""}
                      onChange={(e) => setSubmitContent((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent"
                    />
                  ) : (
                    <textarea
                      placeholder="Write your answer..."
                      rows={4}
                      value={submitContent[task.id] || ""}
                      onChange={(e) => setSubmitContent((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent resize-y"
                    />
                  )}
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => handleSubmit(task.id)}
                    loading={submitting === task.id}
                    disabled={!submitContent[task.id]?.trim()}
                  >
                    Submit
                  </Button>
                </div>
              )}

              {/* Submissions history */}
              {isStudent && submissions[task.id] && submissions[task.id].length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Your Submissions ({submissions[task.id].length})</p>
                  <div className="space-y-2">
                    {submissions[task.id].map((sub) => (
                      <div key={sub.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-700 truncate">{sub.content}</p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
