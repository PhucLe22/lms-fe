import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";
import type { StudentListDto, PaginatedResult } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function AdminStudentsPage() {
  const [data, setData] = useState<PaginatedResult<StudentListDto> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<StudentListDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    adminApi
      .getStudents(page, 10, debouncedSearch || undefined)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load students");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteStudent(deleteTarget.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((s) => s.id !== deleteTarget.id),
              totalCount: prev.totalCount - 1,
            }
          : prev
      );
      toast.success("Student deleted");
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleRole = async (student: StudentListDto) => {
    const newRole = student.role === "Admin" ? "Student" : "Admin";
    setRoleLoading(student.id);
    try {
      const res = await adminApi.updateRole(student.id, newRole);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((s) =>
                s.id === student.id ? res.data : s
              ),
            }
          : prev
      );
      toast.success(`Role changed to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setRoleLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Students" />

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={handleSearch}
          aria-label="Search students"
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Courses</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link to={`/admin/students/${student.id}`} className="hover:underline">
                        {student.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{student.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={student.role === "Admin" ? "info" : "default"}>
                        {student.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{student.enrolledCourses}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleRole(student)}
                          disabled={roleLoading === student.id}
                          className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {roleLoading === student.id ? "..." : student.role === "Admin" ? "Make Student" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <nav className="flex gap-1 justify-center mt-8" aria-label="Pagination">
              {Array.from({ length: data.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  aria-current={page === i + 1 ? "page" : undefined}
                  aria-label={`Page ${i + 1}`}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    page === i + 1 ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          title="No students found"
          description={search ? "Try a different search term" : "No students have registered yet"}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete student"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
