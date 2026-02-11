import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizApi } from "../../api/quizApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { QuizDto, QuizResultDto, QuizAnswer, EnrollmentDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

function getQuizOptions(quiz: QuizDto) {
  return [
    { key: "A" as QuizAnswer, value: quiz.optionA },
    { key: "B" as QuizAnswer, value: quiz.optionB },
    { key: "C" as QuizAnswer, value: quiz.optionC },
    { key: "D" as QuizAnswer, value: quiz.optionD },
  ];
}

function getResultOptions(detail: { optionA: string; optionB: string; optionC: string; optionD: string }) {
  return [
    { key: "A" as QuizAnswer, value: detail.optionA },
    { key: "B" as QuizAnswer, value: detail.optionB },
    { key: "C" as QuizAnswer, value: detail.optionC },
    { key: "D" as QuizAnswer, value: detail.optionD },
  ];
}

export default function QuizPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isAdmin, isStudent, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [result, setResult] = useState<QuizResultDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!lessonId || !courseId || authLoading) return;
    setIsLoading(true);

    const promises: Promise<unknown>[] = [
      quizApi.getByLesson(lessonId).then((res) => setQuizzes(res.data)),
    ];

    if (isStudent) {
      promises.push(
        enrollmentApi.myCourses().then((res) => {
          const isEnrolled = res.data.some((e: EnrollmentDto) => e.courseId === courseId);
          setEnrolled(isEnrolled);
        }).catch(() => setEnrolled(false))
      );
      promises.push(
        quizApi.getResult(lessonId).then((res) => {
          setResult(res.data);
        }).catch(() => {})
      );
    } else if (isAdmin) {
      setEnrolled(true); // Admin always has access
    }

    Promise.all(promises)
      .catch(() => toast.error("Failed to load quiz"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, courseId, isAdmin, isStudent, authLoading]);

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

  const handleSelect = (quizId: string, answer: QuizAnswer) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [quizId]: answer }));
  };

  const handleSubmit = async () => {
    if (!lessonId) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([quizId, answer]) => ({
          quizId,
          answer,
        })),
      };
      const res = await quizApi.submit(lessonId, payload);
      setResult(res.data);
      setSubmitted(true);
      toast.success(`Score: ${Math.round(res.data.score)}%`);
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setResult(null);
    setAnswers({});
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  const allAnswered = quizzes.length > 0 && quizzes.every((q) => answers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Quiz"
        backTo={`/courses/${courseId}/lessons/${lessonId}`}
        backLabel="Lesson"
        actions={
          isAdmin ? (
            <Link to={`/admin/lessons/${courseId}/${lessonId}/quiz`}>
              <Button size="sm">Manage Quiz</Button>
            </Link>
          ) : undefined
        }
      />

      {/* Enrollment required */}
      {isStudent && enrolled === false && (
        <Alert variant="warning">
          <div className="flex items-center justify-between gap-4">
            <span>You need to enroll in this course to take the quiz.</span>
            <Button size="sm" onClick={handleEnroll} loading={enrolling}>Enroll Now</Button>
          </div>
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{submitted ? "Your Score" : "Previous Score"}</p>
              <p className="text-3xl font-semibold text-gray-900">{Math.round(result.score)}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {result.correctAnswers}/{result.totalQuestions} correct
              </p>
            </div>
            {submitted && (
              <Button variant="secondary" size="sm" onClick={handleRetake}>Retake</Button>
            )}
          </div>
        </Card>
      )}

      {quizzes.length === 0 ? (
        <EmptyState title="No quiz available" description="There are no quiz questions for this lesson yet" />
      ) : (
        <>
          {/* Questions */}
          <div className="space-y-4">
            {quizzes.map((quiz, qi) => {
              const detail = submitted ? result?.details?.find((d) => d.quizId === quiz.id) : undefined;
              const options = detail ? getResultOptions(detail) : getQuizOptions(quiz);
              return (
                <Card key={quiz.id} padding="md">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    {qi + 1}. {quiz.question}
                  </p>
                  <div className="space-y-2">
                    {options.map((opt) => {
                      const selected = answers[quiz.id] === opt.key;
                      let optionClass = "border-gray-200 hover:bg-gray-50";
                      if (submitted && detail) {
                        if (opt.key === detail.correctAnswer) optionClass = "border-emerald-300 bg-emerald-50";
                        else if (opt.key === detail.selectedAnswer && !detail.isCorrect) optionClass = "border-red-300 bg-red-50";
                      } else if (selected) {
                        optionClass = "border-gray-900 bg-gray-50";
                      }
                      const disabled = submitted || (isStudent && !enrolled);
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelect(quiz.id, opt.key)}
                          disabled={disabled}
                          className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer disabled:cursor-default ${optionClass}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs ${selected || (submitted && detail && opt.key === detail.selectedAnswer) ? "border-gray-900" : "border-gray-300"}`}>
                              {(selected || (submitted && detail && opt.key === detail.selectedAnswer)) && (
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-900 block" />
                              )}
                            </span>
                            <span className="text-xs font-medium text-gray-400 w-4">{opt.key}.</span>
                            {opt.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && detail && (
                    <div className="mt-2">
                      <Badge variant={detail.isCorrect ? "success" : "danger"}>
                        {detail.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Submit button */}
          {!submitted && enrolled && (
            <div>
              {!allAnswered && (
                <Alert variant="info" className="mb-3">
                  Answer all questions to submit ({Object.keys(answers).length}/{quizzes.length})
                </Alert>
              )}
              <Button onClick={handleSubmit} loading={submitting} disabled={!allAnswered}>
                Submit Quiz
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
