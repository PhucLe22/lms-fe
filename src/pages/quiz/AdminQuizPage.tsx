import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { quizApi } from "../../api/quizApi";
import { useToast } from "../../hooks/useToast";
import type { QuizDto, CreateQuizRequest, QuizAnswer } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const ANSWER_LABELS: QuizAnswer[] = ["A", "B", "C", "D"];

export default function AdminQuizPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<QuizDto | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuizDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreateQuizRequest>();

  const loadData = useCallback(async () => {
    if (!lessonId) return;
    try {
      const res = await quizApi.getByLessonAdmin(lessonId);
      setQuizzes(res.data);
    } catch {
      setError("Failed to load quizzes");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" });
    setShowForm(true);
    setError("");
  };

  const openEdit = (quiz: QuizDto) => {
    setEditing(quiz);
    setValue("question", quiz.question);
    setValue("optionA", quiz.optionA);
    setValue("optionB", quiz.optionB);
    setValue("optionC", quiz.optionC);
    setValue("optionD", quiz.optionD);
    setValue("correctAnswer", quiz.correctAnswer);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    reset();
    setError("");
  };

  const onSubmit = async (data: CreateQuizRequest) => {
    if (!lessonId) return;
    setError("");
    try {
      if (editing) {
        await quizApi.update(editing.id, data);
        toast.success("Quiz updated");
      } else {
        await quizApi.create(lessonId, data);
        toast.success("Quiz created");
      }
      closeForm();
      setIsLoading(true);
      await loadData();
    } catch {
      setError(editing ? "Failed to update quiz" : "Failed to create quiz");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await quizApi.delete(deleteTarget.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const getOptions = (quiz: QuizDto) => [
    { key: "A" as QuizAnswer, value: quiz.optionA },
    { key: "B" as QuizAnswer, value: quiz.optionB },
    { key: "C" as QuizAnswer, value: quiz.optionC },
    { key: "D" as QuizAnswer, value: quiz.optionD },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Manage Quiz"
        backTo={`/courses/${courseId}/lessons/${lessonId}`}
        backLabel="Lesson"
        actions={!showForm ? <Button size="sm" onClick={openCreate}>Add Question</Button> : undefined}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editing ? "Edit Question" : "New Question"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Question" placeholder="What is...?" error={errors.question?.message}
              {...register("question", { required: "Question is required" })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Option A" placeholder="First option" error={errors.optionA?.message}
                {...register("optionA", { required: "Required" })}
              />
              <Input label="Option B" placeholder="Second option" error={errors.optionB?.message}
                {...register("optionB", { required: "Required" })}
              />
              <Input label="Option C" placeholder="Third option" error={errors.optionC?.message}
                {...register("optionC", { required: "Required" })}
              />
              <Input label="Option D" placeholder="Fourth option" error={errors.optionD?.message}
                {...register("optionD", { required: "Required" })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correct Answer</label>
              <select
                {...register("correctAnswer", { required: "Required" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent cursor-pointer"
              >
                {ANSWER_LABELS.map((l) => (
                  <option key={l} value={l}>Option {l}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={isSubmitting}>{editing ? "Update" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {quizzes.length > 0 ? (
        <div className="space-y-2">
          {quizzes.map((quiz, i) => (
            <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{i + 1}. {quiz.question}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {getOptions(quiz).map((opt) => (
                      <Badge key={opt.key} variant={opt.key === quiz.correctAnswer ? "success" : "default"}>
                        {opt.key}: {opt.value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(quiz)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(quiz)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No quiz questions" description="Add your first question"
          action={!showForm ? <Button size="sm" onClick={openCreate}>Add Question</Button> : undefined}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete question"
        message={`Are you sure you want to delete this question? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
