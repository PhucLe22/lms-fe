import { useEffect, useState, useCallback } from "react";
import { healthApi, type HealthReport } from "../../api/healthApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

interface StatusItem {
  label: string;
  status: "Healthy" | "Degraded" | "Unhealthy" | "Unknown";
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [liveOk, setLiveOk] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const [healthRes, liveRes] = await Promise.allSettled([
        healthApi.getHealth(),
        healthApi.getLive(),
      ]);

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value.data);
      } else {
        setHealth(null);
      }

      setLiveOk(liveRes.status === "fulfilled");
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const overallStatus = health?.status ?? (liveOk ? "Degraded" : "Unhealthy");

  const items: StatusItem[] = [];

  // API liveness
  items.push({
    label: "API Server",
    status: liveOk ? "Healthy" : liveOk === null ? "Unknown" : "Unhealthy",
  });

  // Entries from /health
  if (health?.entries) {
    for (const [key, entry] of Object.entries(health.entries)) {
      const name = key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      items.push({
        label: name,
        status: (entry.status as StatusItem["status"]) ?? "Unknown",
      });
    }
  }

  const statusBadge = (s: StatusItem["status"]) => {
    const variant = s === "Healthy" ? "success" : s === "Degraded" ? "warning" : s === "Unhealthy" ? "danger" : "default";
    return <Badge variant={variant}>{s}</Badge>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="System Status" />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Overall status */}
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${overallStatus === "Healthy" ? "bg-emerald-500" : overallStatus === "Degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Overall Status</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lastChecked ? `Last checked ${lastChecked.toLocaleTimeString()}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(overallStatus as StatusItem["status"])}
                <Button variant="ghost" size="sm" onClick={fetchHealth}>
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          {/* Service breakdown */}
          <Card padding="lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Services</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  {statusBadge(item.status)}
                </div>
              ))}
            </div>
          </Card>

          {/* Duration */}
          {health?.totalDuration && (
            <Card padding="md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Health check duration</span>
                <span className="text-sm font-mono text-gray-700">{health.totalDuration}</span>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
