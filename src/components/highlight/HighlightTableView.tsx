import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { HighlightFormDialog } from "./HighlightFormDialog";
import { Highlight, HIGHLIGHT_CATEGORIES, HIGHLIGHT_STATUSES } from "@/types/highlight";

interface HighlightTableViewProps {
  data: Highlight[];
  loading: boolean;
  onAdd: (
    data: Omit<Highlight, "id" | "created_at" | "updated_at" | "created_by" | "creator_name">
  ) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, data: Partial<Highlight>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

const ITEMS_PER_PAGE = 10;

export function HighlightTableView({
  data,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: HighlightTableViewProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique stages from data
  const uniqueStages = useMemo(() => {
    const stages = data.map((item) => item.stage).filter((stage): stage is string => !!stage);
    return [...new Set(stages)];
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.related_account?.toLowerCase().includes(searchLower) ||
          item.related_opportunity?.toLowerCase().includes(searchLower) ||
          item.se_name?.toLowerCase().includes(searchLower) ||
          item.creator_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    // Stage filter
    if (stageFilter !== "all") {
      result = result.filter((item) => item.stage === stageFilter);
    }

    return result;
  }, [data, search, statusFilter, categoryFilter, stageFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success("Highlight deleted successfully");
    }
  };

  const canEdit = (highlight: Highlight) => {
    return isAdmin || highlight.created_by === user?.id;
  };

  const canDelete = () => {
    return isAdmin;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Complate":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Complate</Badge>;
      case "On Progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">On Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold">Highlights</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search highlights..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {HIGHLIGHT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {HIGHLIGHT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={stageFilter}
            onValueChange={(value) => {
              setStageFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {uniqueStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <HighlightFormDialog onSave={onAdd} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SE Name</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Oppty Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Highlight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Potential Rev</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No highlights found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((highlight) => (
                <TableRow key={highlight.id}>
                  <TableCell>{highlight.se_name || "-"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {highlight.related_account || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {highlight.related_opportunity || "-"}
                  </TableCell>
                  <TableCell>{highlight.stage || "-"}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {highlight.title}
                  </TableCell>
                  <TableCell>{getStatusBadge(highlight.status)}</TableCell>
                  <TableCell>{formatCurrency(highlight.potential_rev)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit(highlight) && (
                        <HighlightFormDialog
                          highlight={highlight}
                          onSave={onAdd}
                          onUpdate={onUpdate}
                        />
                      )}
                      {canDelete() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Highlight</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{highlight.title}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(highlight.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length}{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
