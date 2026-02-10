import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../hooks/useToast";
import type { StudentDetailDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import ProgressBar from "../../components/ui/ProgressBar";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    adminApi
      .getStudent(id)
      .then((res) => {
        if (!cancelled) setStudent(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load student details");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleToggleRole = async () => {
    if (!student || !id) return;
    const newRole = student.role === "Admin" ? "Student" : "Admin";
    setRoleLoading(true);
    try {
      await adminApi.updateRole(id, newRole);
      setStudent((prev) => prev ? { ...prev, role: newRole } : prev);
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteStudent(id);
      toast.success("Student deleted");
      navigate("/admin/students");
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>;
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <PageHeader title="Student Details" backTo="/admin/students" backLabel="Students" />
        <Alert variant="error">{error || "Student not found"}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={student.fullName}
        backTo="/admin/students"
        backLabel="Students"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleRole}
              loading={roleLoading}
            >
              {student.role === "Admin" ? "Make Student" : "Make Admin"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Card padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email</span>
            <p className="text-gray-900 font-medium mt-0.5">{student.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Role</span>
            <p className="mt-0.5">
              <Badge variant={student.role === "Admin" ? "info" : "default"}>
                {student.role}
              </Badge>
            </p>
          </div>
          <div>
            <span className="text-gray-500">Joined</span>
            <p className="text-gray-900 mt-0.5">
              {new Date(student.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Enrolled courses</span>
            <p className="text-gray-900 font-medium mt-0.5">{student.enrollments.length}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Enrolled Courses</h2>
        {student.enrollments.length > 0 ? (
          <div className="space-y-3">
            {student.enrollments.map((enrollment) => (
              <Card key={enrollment.courseId} padding="md" hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${enrollment.courseId}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        {enrollment.courseTitle}
                      </Link>
                      <Badge variant={enrollment.status === "Completed" ? "success" : "warning"}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={enrollment.progressPercent}
                    size="sm"
                    detail={`${enrollment.progressPercent}%`}
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No enrollments"
            description="This student hasn't enrolled in any courses yet"
          />
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete student"
        message={`Are you sure you want to delete "${student.fullName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
