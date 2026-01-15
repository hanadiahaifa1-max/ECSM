import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineEntry, Stage, STAGES } from "@/types/pipeline";
import { Search, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PipelineTableProps {
  data: PipelineEntry[];
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

export function PipelineTable({ data }: PipelineTableProps) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [pilarFilter, setPilarFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");
  const pilars = [...new Set(data.map((d) => d.pilar))];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.accountName.toLowerCase().includes(search.toLowerCase()) ||
        item.opportunityName.toLowerCase().includes(search.toLowerCase()) ||
        item.amName.toLowerCase().includes(search.toLowerCase()) ||
        item.seName.toLowerCase().includes(search.toLowerCase());

      const matchesStage = stageFilter === "all" || item.stage === stageFilter;
      const matchesPilar = pilarFilter === "all" || item.pilar === pilarFilter;
      const matchesCompletion =
        completionFilter === "all" ||
        (completionFilter === "complete" && isPipelineComplete(item)) ||
        (completionFilter === "incomplete" && !isPipelineComplete(item));

      return matchesSearch && matchesStage && matchesPilar && matchesCompletion;
    });
  }, [data, search, stageFilter, pilarFilter, completionFilter]);

  const totalValue = filteredData.reduce((sum, item) => sum + item.contractValue, 0);

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Pipeline Details
            <Badge variant="secondary" className="ml-2">
              {filteredData.length} opportunities
            </Badge>
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search account, opportunity, AM, or SE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Stage" />
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
            <Select value={pilarFilter} onValueChange={setPilarFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Pilar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pilars</SelectItem>
                {pilars.map((pilar) => (
                  <SelectItem key={pilar} value={pilar}>
                    {pilar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={completionFilter} onValueChange={setCompletionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Complete
                  </div>
                </SelectItem>
                <SelectItem value="incomplete">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Incomplete
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="min-w-[180px]">Account</TableHead>
                  <TableHead className="min-w-[200px]">Opportunity</TableHead>
                  <TableHead className="min-w-[120px]">Stage</TableHead>
                  <TableHead>Pilar</TableHead>
                  <TableHead>Tower</TableHead>
                  <TableHead>AM</TableHead>
                  <TableHead>SE</TableHead>
                  <TableHead>Close Month</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
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
                          <div className="text-xs text-muted-foreground">{item.productFamily}</div>
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
