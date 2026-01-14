import { useState, useMemo } from "react";
import { Search, Filter, Trash2, Loader2, ChevronDown, X, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineFormDialog } from "./PipelineFormDialog";
import { PipelineEntry, Stage, STAGES, calculateRevenueSummary } from "@/types/pipeline";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface PipelineTableViewProps {
  data: PipelineEntry[];
  loading: boolean;
  onAdd: (entry: Omit<PipelineEntry, "id" | "no">) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, entry: Partial<PipelineEntry>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const stageBadgeVariants: Record<Stage, string> = {
  "Initial Communication": "bg-gray-100 text-gray-800 border-gray-200",
  Proposal: "bg-blue-100 text-blue-800 border-blue-200",
  Negotiation: "bg-purple-100 text-purple-800 border-purple-200",
  PoC: "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Sign Agreement": "bg-amber-100 text-amber-800 border-amber-200",
  "Closed Won": "bg-green-100 text-green-800 border-green-200",
  "Closed Lost": "bg-red-100 text-red-800 border-red-200",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `IDR ${(value / 1000000000).toFixed(2)}Bn`;
  }
  if (value >= 1000000) {
    return `IDR ${(value / 1000000).toFixed(1)}Mn`;
  }
  return `IDR ${value.toLocaleString("id-ID")}`;
};

// Check if pipeline entry is complete (has all required fields)
const isPipelineComplete = (entry: PipelineEntry): { complete: boolean; missingFields: string[] } => {
  const requiredFields: { key: keyof PipelineEntry; label: string }[] = [
    { key: "accountName", label: "Account Name" },
    { key: "opportunityName", label: "Opportunity Name" },
    { key: "stage", label: "Stage" },
    { key: "amName", label: "AM Name" },
    { key: "seName", label: "SE Name" },
    { key: "pilar", label: "Pilar" },
    { key: "tower", label: "Tower" },
    { key: "closeMonth", label: "Close Month" },
    { key: "contractValue", label: "Contract Value" },
    { key: "contractPeriod", label: "Contract Period" },
    { key: "productFamily", label: "Product Family" },
    { key: "presalesLoB", label: "Presales LoB" },
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = entry[field.key];
    if (value === null || value === undefined || value === "" || value === 0) {
      missingFields.push(field.label);
    }
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
  };
};

const ITEMS_PER_PAGE = 15;

export function PipelineTableView({ data, loading, onAdd, onUpdate, onDelete }: PipelineTableViewProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [amFilter, setAmFilter] = useState<string>("all");
  const [seFilter, setSeFilter] = useState<string>("all");
  const [closeMonthFilter, setCloseMonthFilter] = useState<string>("all");
  const [pilarFilter, setPilarFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uniqueAMs = useMemo(() => [...new Set(data.map((d) => d.amName).filter(Boolean))].sort(), [data]);
  const uniqueSEs = useMemo(() => [...new Set(data.map((d) => d.seName).filter(Boolean))].sort(), [data]);
  const uniqueCloseMonths = useMemo(() => [...new Set(data.map((d) => d.closeMonth).filter(Boolean))].sort(), [data]);
  const uniquePilars = useMemo(() => [...new Set(data.map((d) => d.pilar).filter(Boolean))].sort(), [data]);
  const uniqueAccounts = useMemo(() => [...new Set(data.map((d) => d.accountName).filter(Boolean))].sort(), [data]);

  const activeFilterCount = [stageFilter, amFilter, seFilter, closeMonthFilter, pilarFilter, accountFilter].filter(f => f !== "all").length;

  const clearAllFilters = () => {
    setStageFilter("all");
    setAmFilter("all");
    setSeFilter("all");
    setCloseMonthFilter("all");
    setPilarFilter("all");
    setAccountFilter("all");
    setSearch("");
  };

  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        entry.accountName.toLowerCase().includes(searchLower) ||
        entry.opportunityName.toLowerCase().includes(searchLower) ||
        entry.amName?.toLowerCase().includes(searchLower) ||
        entry.seName?.toLowerCase().includes(searchLower);

      const matchesStage = stageFilter === "all" || entry.stage === stageFilter;
      const matchesAM = amFilter === "all" || entry.amName === amFilter;
      const matchesSE = seFilter === "all" || entry.seName === seFilter;
      const matchesCloseMonth = closeMonthFilter === "all" || entry.closeMonth === closeMonthFilter;
      const matchesPilar = pilarFilter === "all" || entry.pilar === pilarFilter;
      const matchesAccount = accountFilter === "all" || entry.accountName === accountFilter;

      return matchesSearch && matchesStage && matchesAM && matchesSE && matchesCloseMonth && matchesPilar && matchesAccount;
    });
  }, [data, search, stageFilter, amFilter, seFilter, closeMonthFilter, pilarFilter, accountFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Calculate summary metrics
  const totalFY26Revenue = useMemo(() => {
    return data.reduce((sum, entry) => {
      const summary = calculateRevenueSummary(entry.revPlan);
      return sum + summary.fy;
    }, 0);
  }, [data]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await onDelete(id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Opportunity deleted successfully");
    }
    setDeletingId(null);
  };

  const canModify = (entry: PipelineEntry) => {
    return isAdmin || entry.userId === user?.id;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Pipeline Opportunities</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredData.length} opportunities • Total FY-26: {formatCurrency(totalFY26Revenue)}
            </p>
          </div>
          <PipelineFormDialog onSave={onAdd} onUpdate={onUpdate} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Clear Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by account, opportunity, AM, or SE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="min-w-[150px]">
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        Account
                        <ChevronDown className="h-3 w-3" />
                        {accountFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {uniqueAccounts.map((account) => (
                        <SelectItem key={account} value={account}>
                          {account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead className="min-w-[140px]">
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        Stage
                        <ChevronDown className="h-3 w-3" />
                        {stageFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <Select value={pilarFilter} onValueChange={setPilarFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        Pilar
                        <ChevronDown className="h-3 w-3" />
                        {pilarFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pilars</SelectItem>
                      {uniquePilars.map((pilar) => (
                        <SelectItem key={pilar} value={pilar}>
                          {pilar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Select value={amFilter} onValueChange={setAmFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        AM
                        <ChevronDown className="h-3 w-3" />
                        {amFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All AMs</SelectItem>
                      {uniqueAMs.map((am) => (
                        <SelectItem key={am} value={am}>
                          {am}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Select value={seFilter} onValueChange={setSeFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        SE
                        <ChevronDown className="h-3 w-3" />
                        {seFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All SEs</SelectItem>
                      {uniqueSEs.map((se) => (
                        <SelectItem key={se} value={se}>
                          {se}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <Select value={closeMonthFilter} onValueChange={setCloseMonthFilter}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 font-medium text-muted-foreground hover:text-foreground focus:ring-0">
                      <div className="flex items-center gap-1">
                        Close Month
                        <ChevronDown className="h-3 w-3" />
                        {closeMonthFilter !== "all" && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {uniqueCloseMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="text-right">Contract Value</TableHead>
                <TableHead className="text-right">FY-26 Rev</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                    No opportunities found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((entry, index) => {
                  const revSummary = calculateRevenueSummary(entry.revPlan);
                  const completionStatus = isPipelineComplete(entry);
                  return (
                    <TableRow key={entry.id} className={`hover:bg-muted/30 ${!completionStatus.complete ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          {!completionStatus.complete && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertCircle className="h-4 w-4 text-amber-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[250px]">
                                  <p className="font-semibold mb-1">Data belum lengkap:</p>
                                  <ul className="text-xs list-disc list-inside">
                                    {completionStatus.missingFields.map((field) => (
                                      <li key={field}>{field}</li>
                                    ))}
                                  </ul>
                                  <p className="text-xs mt-1 text-muted-foreground italic">Klik Edit untuk melengkapi</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">{entry.accountName}</TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        <div className="flex items-center gap-1">
                          {entry.opportunityName}
                          {!completionStatus.complete && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
                              Perlu Edit
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stageBadgeVariants[entry.stage]} variant="outline">
                          {entry.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.pilar}</TableCell>
                      <TableCell>{entry.amName || "-"}</TableCell>
                      <TableCell>{entry.seName || "-"}</TableCell>
                      <TableCell>{entry.closeMonth || "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(entry.contractValue)}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(revSummary.fy)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canModify(entry) && (
                            <>
                              <PipelineFormDialog entry={entry} onSave={onAdd} onUpdate={onUpdate} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    {deletingId === entry.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{entry.opportunityName}"? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
