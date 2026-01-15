import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PipelineEntry, Stage, STAGES } from "@/types/pipeline";
import { PipelineFormDialog } from "./PipelineFormDialog";
import { Search, CheckCircle2, AlertCircle, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface PipelineTableViewProps {
  data: PipelineEntry[];
  loading?: boolean;
  onAdd?: (entry: Omit<PipelineEntry, 'id' | 'no' | 'createdAt' | 'updatedAt'>) => Promise<{ error: Error | null }>;
  onUpdate?: (id: string, entry: Partial<PipelineEntry>) => Promise<{ error: Error | null }>;
  onDelete?: (id: string) => void;
}

const stageBadgeVariants: Record<Stage, string> = {
  "Initial Communication": "bg-gray-100 text-gray-800 border-gray-200",
  Proposal: "bg-blue-100 text-blue-800 border-blue-200",
  Negotiation: "bg-purple-100 text-purple-800 border-purple-200",
  PoC: "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Sign Agreement": "bg-amber-100 text-amber-800 border-amber-200",
  "Closed Won": "bg-success/15 text-success border-success/30",
  "Closed Lost": "bg-destructive/15 text-destructive border-destructive/30",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `IDR ${(value / 1000000000).toFixed(2)}Bn`;
  }
  if (value >= 1000000) {
    return `IDR ${(value / 1000000).toFixed(0)}Mn`;
  }
  return `IDR ${value.toLocaleString("id-ID")}`;
};

// Check if pipeline entry is complete (all key fields filled)
const isPipelineComplete = (item: PipelineEntry) => {
  return !!(
    item.opportunityName &&
    item.accountName &&
    item.amName &&
    item.stage &&
    item.productFamily &&
    item.pilar &&
    item.tower &&
    item.seName &&
    item.presalesLoB &&
    item.closeMonth &&
    item.contractValue &&
    item.contractValue > 0
  );
};

// Column filter component
interface ColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  label: string;
}

function ColumnFilter({ value, onChange, options, placeholder, label }: ColumnFilterProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs w-full min-w-[100px]">
          <SelectValue placeholder={placeholder} />
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PipelineTableView({ data, loading, onAdd, onUpdate, onDelete }: PipelineTableViewProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [pilarFilter, setPilarFilter] = useState<string>("all");
  const [productFamilyFilter, setProductFamilyFilter] = useState<string>("all");
  const [towerFilter, setTowerFilter] = useState<string>("all");
  const [amFilter, setAmFilter] = useState<string>("all");
  const [seFilter, setSeFilter] = useState<string>("all");
  const [closeMonthFilter, setCloseMonthFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");

  // Extract unique values for filters
  const accounts = [...new Set(data.map((d) => d.accountName).filter(Boolean))].sort();
  const pilars = [...new Set(data.map((d) => d.pilar).filter(Boolean))].sort();
  const productFamilies = [...new Set(data.map((d) => d.productFamily).filter((pf): pf is string => !!pf && pf.trim() !== ''))].sort();
  const towers = [...new Set(data.map((d) => d.tower).filter(Boolean))].sort();
  const ams = [...new Set(data.map((d) => d.amName).filter(Boolean))].sort();
  const ses = [...new Set(data.map((d) => d.seName).filter(Boolean))].sort();
  const closeMonths = [...new Set(data.map((d) => d.closeMonth).filter((cm): cm is string => !!cm && cm.trim() !== ''))].sort();

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.accountName.toLowerCase().includes(search.toLowerCase()) ||
        item.opportunityName.toLowerCase().includes(search.toLowerCase()) ||
        item.amName.toLowerCase().includes(search.toLowerCase()) ||
        item.seName.toLowerCase().includes(search.toLowerCase());

      const matchesAccount = accountFilter === "all" || item.accountName === accountFilter;
      const matchesStage = stageFilter === "all" || item.stage === stageFilter;
      const matchesPilar = pilarFilter === "all" || item.pilar === pilarFilter;
      const matchesProductFamily = productFamilyFilter === "all" || item.productFamily === productFamilyFilter;
      const matchesTower = towerFilter === "all" || item.tower === towerFilter;
      const matchesAm = amFilter === "all" || item.amName === amFilter;
      const matchesSe = seFilter === "all" || item.seName === seFilter;
      const matchesCloseMonth = closeMonthFilter === "all" || item.closeMonth === closeMonthFilter;
      const matchesCompletion =
        completionFilter === "all" ||
        (completionFilter === "complete" && isPipelineComplete(item)) ||
        (completionFilter === "incomplete" && !isPipelineComplete(item));

      return matchesSearch && matchesAccount && matchesStage && matchesPilar && matchesProductFamily && matchesTower && matchesAm && matchesSe && matchesCloseMonth && matchesCompletion;
    });
  }, [data, search, accountFilter, stageFilter, pilarFilter, productFamilyFilter, towerFilter, amFilter, seFilter, closeMonthFilter, completionFilter]);

  const totalValue = filteredData.reduce((sum, item) => sum + item.contractValue, 0);

  const clearAllFilters = () => {
    setSearch("");
    setAccountFilter("all");
    setStageFilter("all");
    setPilarFilter("all");
    setProductFamilyFilter("all");
    setTowerFilter("all");
    setAmFilter("all");
    setSeFilter("all");
    setCloseMonthFilter("all");
    setCompletionFilter("all");
  };

  const hasActiveFilters = search || accountFilter !== "all" || stageFilter !== "all" || pilarFilter !== "all" || productFamilyFilter !== "all" || towerFilter !== "all" || amFilter !== "all" || seFilter !== "all" || closeMonthFilter !== "all" || completionFilter !== "all";

  // Check if user can edit/delete an entry
  const canEditEntry = (entry: PipelineEntry) => {
    return user?.id === entry.userId;
  };

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Pipeline Opportunity
            <Badge variant="secondary" className="ml-2">
              {filteredData.length} opportunities
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search account, opportunity, AM, or SE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {onAdd && (
            <PipelineFormDialog 
              onSave={onAdd}
              onUpdate={onUpdate}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Filter Row */}
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 py-2">
                    <span className="text-xs font-medium">#</span>
                  </TableHead>
                  <TableHead className="min-w-[160px] py-2">
                    <ColumnFilter
                      value={accountFilter}
                      onChange={setAccountFilter}
                      options={accounts}
                      placeholder="All"
                      label="Account"
                    />
                  </TableHead>
                  <TableHead className="min-w-[160px] py-2">
                    <ColumnFilter
                      value={completionFilter}
                      onChange={setCompletionFilter}
                      options={["complete", "incomplete"]}
                      placeholder="All"
                      label="Opportunity"
                    />
                  </TableHead>
                  <TableHead className="min-w-[140px] py-2">
                    <ColumnFilter
                      value={stageFilter}
                      onChange={setStageFilter}
                      options={STAGES}
                      placeholder="All"
                      label="Stage"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px] py-2">
                    <ColumnFilter
                      value={pilarFilter}
                      onChange={setPilarFilter}
                      options={pilars}
                      placeholder="All"
                      label="Pilar"
                    />
                  </TableHead>
                  <TableHead className="min-w-[140px] py-2">
                    <ColumnFilter
                      value={productFamilyFilter}
                      onChange={setProductFamilyFilter}
                      options={productFamilies}
                      placeholder="All"
                      label="Product Family"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px] py-2">
                    <ColumnFilter
                      value={towerFilter}
                      onChange={setTowerFilter}
                      options={towers}
                      placeholder="All"
                      label="Tower"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px] py-2">
                    <ColumnFilter
                      value={amFilter}
                      onChange={setAmFilter}
                      options={ams}
                      placeholder="All"
                      label="AM"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px] py-2">
                    <ColumnFilter
                      value={seFilter}
                      onChange={setSeFilter}
                      options={ses}
                      placeholder="All"
                      label="SE"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px] py-2">
                    <ColumnFilter
                      value={closeMonthFilter}
                      onChange={setCloseMonthFilter}
                      options={closeMonths}
                      placeholder="All"
                      label="Close Month"
                    />
                  </TableHead>
                  <TableHead className="text-right py-2">
                    <span className="text-xs font-medium">Contract Value</span>
                  </TableHead>
                  <TableHead className="w-[100px] py-2">
                    <span className="text-xs font-medium">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 15).map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium text-muted-foreground">{item.no}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.accountName}</div>
                      <div className="text-xs text-muted-foreground">{item.telkomSI}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isPipelineComplete(item) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{item.opportunityName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium", stageBadgeVariants[item.stage])}>
                        {item.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.pilar}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.productFamily}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.tower}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.amName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.seName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.closeMonth}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{formatCurrency(item.contractValue)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canEditEntry(item) && onUpdate && (
                          <PipelineFormDialog
                            entry={item}
                            onSave={onAdd!}
                            onUpdate={onUpdate}
                          />
                        )}
                        {canEditEntry(item) && onDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Pipeline Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{item.opportunityName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {!canEditEntry(item) && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {filteredData.length > 15 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Showing 15 of {filteredData.length} opportunities
          </p>
        )}
      </CardContent>
    </Card>
  );
}
