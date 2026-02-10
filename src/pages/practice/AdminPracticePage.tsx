import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { practiceApi } from "../../api/practiceApi";
import { useToast } from "../../hooks/useToast";
import type { PracticeTaskDto, CreatePracticeTaskRequest, PracticeSubmissionDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function AdminPracticePage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<PracticeTaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PracticeTaskDto | null>(null);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PracticeTaskDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewSubs, setViewSubs] = useState<{ task: PracticeTaskDto; subs: PracticeSubmissionDto[] } | null>(null);
  const [subsLoading, setSubsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreatePracticeTaskRequest>();

  const loadData = useCallback(async () => {
    if (!lessonId) return;
    try {
      const res = await practiceApi.getByLesson(lessonId);
      setTasks(res.data);
    } catch {
      setError("Failed to load practice tasks");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ title: "", description: "", submissionType: "Text" });
    setShowForm(true);
    setError("");
  };

  const openEdit = (task: PracticeTaskDto) => {
    setEditing(task);
    setValue("title", task.title);
    setValue("description", task.description);
    setValue("submissionType", task.submissionType);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    reset();
    setError("");
  };

  const onSubmit = async (data: CreatePracticeTaskRequest) => {
    if (!lessonId) return;
    setError("");
    try {
      if (editing) {
        await practiceApi.update(editing.id, data);
        toast.success("Task updated");
      } else {
        await practiceApi.create(lessonId, data);
        toast.success("Task created");
      }
      closeForm();
      setIsLoading(true);
      await loadData();
    } catch {
      setError(editing ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await practiceApi.delete(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const viewSubmissions = async (task: PracticeTaskDto) => {
    setSubsLoading(true);
    try {
      const res = await practiceApi.getSubmissions(task.id);
      setViewSubs({ task, subs: res.data });
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setSubsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Manage Practice Tasks"
        backTo={`/courses/${courseId}/lessons/${lessonId}`}
        backLabel="Lesson"
        actions={!showForm ? <Button size="sm" onClick={openCreate}>Add Task</Button> : undefined}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editing ? "Edit Task" : "New Task"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" placeholder="Task title" error={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                placeholder="Describe the task..."
                rows={4}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent resize-y ${errors.description ? "border-red-400 focus:ring-red-500" : ""}`}
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Submission Type</label>
              <select
                {...register("submissionType", { required: "Required" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent cursor-pointer"
              >
                <option value="Text">Text</option>
                <option value="GitUrl">Git URL</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={isSubmitting}>{editing ? "Update" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <Badge variant={task.submissionType === "GitUrl" ? "info" : "default"}>
                      {task.submissionType === "GitUrl" ? "Git URL" : "Text"}
                    </Badge>
                  </div>
                  <p className="text-gray-500 mt-1 text-sm line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => viewSubmissions(task)} loading={subsLoading}>
                    Submissions
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(task)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No practice tasks" description="Add your first practice task"
          action={!showForm ? <Button size="sm" onClick={openCreate}>Add Task</Button> : undefined}
        />
      )}

      {/* Submissions viewer */}
      {viewSubs && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Submissions — {viewSubs.task.title}</h3>
            <Button variant="ghost" size="sm" onClick={() => setViewSubs(null)}>Close</Button>
          </div>
          {viewSubs.subs.length > 0 ? (
            <div className="space-y-2">
              {viewSubs.subs.map((sub) => (
                <div key={sub.id} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{sub.studentName}</span>
                    <span className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 break-all">{sub.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No submissions yet</p>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
