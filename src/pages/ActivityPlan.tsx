import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ActivityTableView } from "@/components/activity/ActivityTableView";
import { useAuth } from "@/hooks/useAuth";
import { useActivityPlans } from "@/hooks/useActivityPlans";
import { Loader2, Sparkles, LayoutDashboard, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ActivityPlan = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activityPlans,
    loading: plansLoading,
    addActivityPlan,
    updateActivityPlan,
    deleteActivityPlan,
  } = useActivityPlans();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/highlight", label: "Highlight", icon: Sparkles },
    { to: "/activity-plan", label: "Activity Plan", icon: CalendarCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 mb-6 border-b pb-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Hero Section */}
        <div className="mb-8 rounded-2xl gradient-hero p-8 text-primary-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <CalendarCheck className="h-8 w-8" />
                Activity Plan
              </h2>
              <p className="mt-2 text-lg opacity-90">
                Track your sales activities, meetings, and follow-up actions
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="rounded-lg bg-primary-foreground/10 px-4 py-2 backdrop-blur">
                <span className="text-sm font-medium">
                  {activityPlans.length} Total Activities
                </span>
              </div>
            </div>
          </div>
        </div>

        {plansLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ActivityTableView
            data={activityPlans}
            loading={false}
            onAdd={addActivityPlan}
            onUpdate={updateActivityPlan}
            onDelete={deleteActivityPlan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 ECSM Division • Pipeline Tracking System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ActivityPlan;
