import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { courseApi } from "../../api/courseApi";
import { useToast } from "../../hooks/useToast";
import type { CreateCourseRequest, CourseDetailDto } from "../../types";
import type { AxiosError } from "axios";
import PageHeader from "../../components/ui/PageHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function CourseFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCourseRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<CourseDetailDto | null>(null);

  useEffect(() => {
    if (id) {
      courseApi
        .getById(id)
        .then((res) => {
          setCourse(res.data);
          reset({ title: res.data.title, description: res.data.description, level: res.data.level });
        })
        .catch(() => toast.error("Failed to load course"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset]);

  const onSubmit = async (data: CreateCourseRequest) => {
    setIsLoading(true);
    setError("");
    try {
      if (id) {
        await courseApi.update(id, data);
        toast.success("Course updated");
      } else {
        await courseApi.create(data);
        toast.success("Course created");
      }
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Failed to save course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <PageHeader title={id ? "Edit Course" : "Create Course"} backTo="/" backLabel="Courses" />

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Course title"
          type="text"
          placeholder="Introduction to Web Development"
          error={errors.title?.message}
          {...register("title", { required: "Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
          <select
            {...register("level", { required: "Level is required" })}
            className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent cursor-pointer ${errors.level ? "border-red-400 focus:ring-red-500" : ""}`}
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          {errors.level && <p className="text-red-500 text-xs mt-1.5">{errors.level.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            placeholder="Describe your course..."
            rows={5}
            {...register("description")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={isLoading}>{isLoading ? "Saving..." : id ? "Update Course" : "Create Course"}</Button>
          <Link to="/"><Button variant="secondary" type="button">Cancel</Button></Link>
        </div>

        {id && course && (
          <Alert variant="info">
            To manage lessons for this course, navigate to the course detail page and use the "Manage Lessons" button.
          </Alert>
        )}
      </form>
    </div>
  );
}
