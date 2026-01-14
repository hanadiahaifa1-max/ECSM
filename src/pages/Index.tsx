import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StageChart } from "@/components/dashboard/StageChart";
import { LoBChart } from "@/components/dashboard/LoBChart";
import { PipelineTableView } from "@/components/pipeline/PipelineTableView";
import { useAuth } from "@/hooks/useAuth";
import { usePipeline } from "@/hooks/usePipeline";
import { useLoBDistribution } from "@/hooks/useLoBDistribution";
import { mockPipelineData, getTotalByStage, getMonthlyRevenue } from "@/data/mockData";
import {
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Calendar,
  Loader2,
  LayoutDashboard,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatBillion = (value: number) => {
  if (value >= 1000000000) {
    return `IDR ${(value / 1000000000).toFixed(1)}Bn`;
  }
  if (value >= 1000000) {
    return `IDR ${(value / 1000000).toFixed(0)}Mn`;
  }
  return `IDR ${value.toLocaleString("id-ID")}`;
};

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { entries, loading: pipelineLoading, addEntry, updateEntry, deleteEntry } = usePipeline();
  const { lobData } = useLoBDistribution();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Use database entries if available, otherwise fallback to mock data
  const pipelineData = entries.length > 0 ? entries : mockPipelineData;

  const stageData = getTotalByStage(pipelineData);
  const monthlyData = getMonthlyRevenue(pipelineData);

  // Calculate stats - Total revenue plan for this year (sum of all monthly plans)
  const totalPipeline = pipelineData.reduce((sum, d) => {
    const plan = d.revPlan;
    const yearlyPlan = plan.jan + plan.feb + plan.mar + plan.apr + plan.may + plan.jun +
                       plan.jul + plan.aug + plan.sep + plan.oct + plan.nov + plan.dec;
    return sum + yearlyPlan;
  }, 0);
  const closedWonEntries = pipelineData.filter((d) => d.stage === "Closed Won");
  const closedWonCount = closedWonEntries.length;
  const closedWon = closedWonEntries.reduce((sum, d) => {
    const plan = d.revPlan;
    return sum + plan.jan + plan.feb + plan.mar + plan.apr + plan.may + plan.jun +
           plan.jul + plan.aug + plan.sep + plan.oct + plan.nov + plan.dec;
  }, 0);
  const inProgressEntries = pipelineData.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage));
  const inProgress = inProgressEntries.length;
  const inProgressRevPlan = inProgressEntries.reduce((sum, d) => {
    const plan = d.revPlan;
    return sum + plan.jan + plan.feb + plan.mar + plan.apr + plan.may + plan.jun +
           plan.jul + plan.aug + plan.sep + plan.oct + plan.nov + plan.dec;
  }, 0);

  // Calculate FY target achievement
  const fyTarget = 300000000000; // 300B
  const targetAchievement = (closedWon / fyTarget) * 100;

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
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
              <h2 className="text-3xl font-bold tracking-tight">ECSM Division Pipeline</h2>
              <p className="mt-2 text-lg opacity-90">Fiscal Year 2026 • Real-time Tracking Dashboard</p>
            </div>
            <div className="mt-4 flex items-center gap-4 md:mt-0">
              <div className="rounded-lg bg-primary-foreground/10 px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Last updated: Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {pipelineLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Pipeline"
                value={formatBillion(totalPipeline)}
                subtitle={`${pipelineData.length} opportunities`}
                icon={BarChart3}
                trend={{ value: 12.5, isPositive: true }}
                variant="primary"
              />
              <StatCard
                title="Closed Won"
                value={formatBillion(closedWon)}
                subtitle={`${closedWonCount} opportunities • ${targetAchievement.toFixed(1)}% of FY target`}
                icon={Target}
                trend={{ value: 8.2, isPositive: true }}
                variant="primary"
              />
              <StatCard
                title="In Progress"
                value={formatBillion(inProgressRevPlan)}
                subtitle={`${inProgress} opportunities`}
                icon={TrendingUp}
                variant="primary"
              />
            </div>

            {/* Charts Row */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <RevenueChart data={monthlyData} />
              <StageChart data={stageData} />
            </div>

            {/* LoB Distribution */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              <LoBChart data={lobData} />
              <div className="lg:col-span-2">
                <div className="glass-card rounded-xl p-6 animate-slide-up h-full">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-primary" />
                    Team Performance
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from(new Set(pipelineData.map((d) => d.seName).filter((n): n is string => !!n))).map(
                      (name) => {
                        const deals = pipelineData.filter((d) => d.seName === name);
                        const total = deals.reduce((sum, d) => sum + d.contractValue, 0);
                        const progress = totalPipeline > 0 ? (total / totalPipeline) * 100 : 0;

                        return (
                          <div key={name} className="rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{name}</span>
                              <span className="text-sm text-muted-foreground">{deals.length} deals</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full gradient-primary transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-primary">{formatBillion(total)}</span>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Table with Form */}
            <PipelineTableView
              data={pipelineData}
              loading={false}
              onAdd={addEntry}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2026 ECSM Division • Pipeline Tracking System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
