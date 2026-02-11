import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { enrollmentApi } from "../../api/enrollmentApi";
import { useToast } from "../../hooks/useToast";
import type { EnrollmentDto } from "../../types";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    enrollmentApi
      .myCourses()
      .then((res) => setEnrollments(res.data))
      .catch(() => toast.error("Failed to load enrollments"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="My Courses" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (<SkeletonCard key={i} />))}
        </div>
      ) : enrollments && enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} hover>
              <h2 className="text-sm font-semibold text-gray-900">{enrollment.courseTitle}</h2>
              <p className="text-xs text-gray-400 mt-1.5">Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
              <div className="mt-2">
                <Badge variant={enrollment.status === "Active" ? "success" : "info"}>{enrollment.status}</Badge>
              </div>
              <Link to={`/my-courses/${enrollment.courseId}/progress`} className="mt-4 block">
                <Button variant="secondary" size="sm" className="w-full">View Progress</Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No enrolled courses" description="You haven't enrolled in any courses yet"
          action={<Link to="/courses"><Button variant="secondary" size="sm">Browse Courses</Button></Link>}
        />
      )}
    </div>
  );
}
