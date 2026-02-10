import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { courseApi } from "../../api/courseApi";
import { lessonApi } from "../../api/lessonApi";
import { useToast } from "../../hooks/useToast";
import type { CourseDetailDto, LessonDto, CreateLessonRequest } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function AdminLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LessonDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreateLessonRequest>();

  const loadData = useCallback(async () => {
    if (!courseId) return;
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        courseApi.getById(courseId),
        lessonApi.getByCourse(courseId),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      setError("Failed to load course data");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateForm = () => {
    setEditingLesson(null);
    reset({ title: "", content: "", orderIndex: lessons.length, videoUrl: "", documentUrl: "" });
    setShowForm(true);
    setError("");
  };

  const openEditForm = (lesson: LessonDto) => {
    setEditingLesson(lesson);
    setValue("title", lesson.title);
    setValue("content", lesson.content);
    setValue("orderIndex", lesson.orderIndex);
    setValue("videoUrl", lesson.videoUrl || "");
    setValue("documentUrl", lesson.documentUrl || "");
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLesson(null);
    reset();
    setError("");
  };

  const onSubmit = async (data: CreateLessonRequest) => {
    if (!courseId) return;
    setError("");
    try {
      if (editingLesson) {
        await lessonApi.update(editingLesson.id, data);
        toast.success("Lesson updated");
      } else {
        await lessonApi.create(courseId, data);
        toast.success("Lesson created");
      }
      closeForm();
      setIsLoading(true);
      await loadData();
    } catch {
      setError(editingLesson ? "Failed to update lesson" : "Failed to create lesson");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await lessonApi.delete(deleteTarget.id);
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      toast.success("Lesson deleted");
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={course ? `Lessons — ${course.title}` : "Manage Lessons"}
        backTo={courseId ? `/courses/${courseId}` : "/"}
        backLabel="Course"
        actions={!showForm ? <Button size="sm" onClick={openCreateForm}>Add Lesson</Button> : undefined}
      />

      {error && <Alert variant="error">{error}</Alert>}

      {showForm && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{editingLesson ? "Edit Lesson" : "New Lesson"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" placeholder="Lesson title" error={errors.title?.message} {...register("title", { required: "Title is required" })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
              <textarea
                placeholder="Lesson content..."
                rows={6}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent resize-y ${errors.content ? "border-red-400 focus:ring-red-500" : ""}`}
                {...register("content", { required: "Content is required" })}
              />
              {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content.message}</p>}
            </div>
            <Input label="Order Index" type="number" placeholder="0" error={errors.orderIndex?.message}
              {...register("orderIndex", { required: "Order is required", valueAsNumber: true, min: { value: 0, message: "Must be 0 or greater" } })}
            />
            <Input label="Video URL" type="url" placeholder="https://www.youtube.com/watch?v=..."
              {...register("videoUrl")}
            />
            <Input label="Document URL" type="url" placeholder="https://docs.example.com/..."
              {...register("documentUrl")}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={isSubmitting}>{editingLesson ? "Update" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {lessons.length > 0 ? (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 transition-colors duration-150 hover:bg-gray-50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">{String(lesson.orderIndex + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-medium text-gray-900">{lesson.title}</h3>
                    {lesson.videoUrl && (
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    {lesson.documentUrl && (
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1 text-sm pl-7 line-clamp-2">{lesson.content}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditForm(lesson)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(lesson)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No lessons yet" description="Add your first lesson to this course"
          action={!showForm ? <Button size="sm" onClick={openCreateForm}>Add Lesson</Button> : undefined}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete lesson"
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
