import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "../../api/courseApi";
import { useAuth } from "../../hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../hooks/useToast";
import type { CourseDto, CourseLevel, PaginatedResult } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const LEVELS: { value: CourseLevel | ""; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const levelBadgeVariant = (level: CourseLevel) => {
  switch (level) {
    case "Beginner": return "success" as const;
    case "Intermediate": return "warning" as const;
    case "Advanced": return "danger" as const;
  }
};

export default function CourseListPage() {
  const [data, setData] = useState<PaginatedResult<CourseDto> | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<CourseLevel | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    courseApi
      .getAll(page, 10, debouncedSearch || undefined, level || undefined)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load courses");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, level]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLevel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value as CourseLevel | "");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        actions={
          isAdmin ? (
            <Link to="/courses/new">
              <Button size="sm">Create course</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
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
            placeholder="Search courses..."
            value={search}
            onChange={handleSearch}
            aria-label="Search courses"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent"
          />
        </div>
        <select
          value={level}
          onChange={handleLevel}
          aria-label="Filter by level"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 focus:border-transparent cursor-pointer"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                <Card hover className="h-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">{course.title}</h2>
                    <Badge variant={levelBadgeVariant(course.level)}>{course.level}</Badge>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{course.description || "No description"}</p>
                  <div className="flex justify-between mt-4 text-xs text-gray-400">
                    <span>{course.lessonCount} lessons</span>
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{course.creatorName}</p>
                </Card>
              </Link>
            ))}
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
          title="No courses found"
          description={search || level ? "Try a different search term or filter" : "No courses have been created yet"}
        />
      )}
    </div>
  );
}
