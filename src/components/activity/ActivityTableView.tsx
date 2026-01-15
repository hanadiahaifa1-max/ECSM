import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Search, Trash2, Pencil, CalendarDays, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ActivityPlan } from "@/types/activityPlan";
import { ActivityFormDialog } from "./ActivityFormDialog";
import { supabase } from "@/integrations/supabase/client";

// Helper to format YYYY-MM to readable format (e.g., "2026-01" → "Jan-26")
const formatCloseMonth = (month: string | null) => {
  if (!month) return "-";
  const [year, monthNum] = month.split("-");
  if (!year || !monthNum) return month;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(monthNum) - 1;
  if (monthIndex < 0 || monthIndex > 11) return month;
  const shortYear = year.slice(-2);
  return `${monthNames[monthIndex]}-${shortYear}`;
};

interface ActivityTableViewProps {
  data: ActivityPlan[];
  loading: boolean;
  onAdd: (plan: Omit<ActivityPlan, "id" | "user_id" | "created_at" | "updated_at">) => Promise<{ error: Error | null }>;
  onUpdate: (id: string, plan: Partial<ActivityPlan>) => Promise<{ error: Error | null }>;
  onDelete: (id: string) => Promise<{ error: Error | null }>;
}

export function ActivityTableView({
  data,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: ActivityTableViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const generatedUrlsRef = useRef<Set<string>>(new Set());
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  // Temporarily disable signed URLs generation to prevent stack limit error
  useEffect(() => {
    const generateSignedUrls = async () => {
      const urlMap: Record<string, string> = {};
      for (const item of data) {
        if (item.attachment_url && !signedUrls[item.id]) {
          // Check if it's already a full URL (legacy) or just a path
          if (item.attachment_url.startsWith('http')) {
            // Legacy public URL - keep as is for backward compatibility
            urlMap[item.id] = item.attachment_url;
          } else {
            // New path format - generate signed URL
            const { data: signedData } = await supabase.storage
              .from("activity-attachments")
              .createSignedUrl(item.attachment_url, 3600); // 1 hour expiry
            if (signedData?.signedUrl) {
              urlMap[item.id] = signedData.signedUrl;
            }
          }
        }
      }
      if (Object.keys(urlMap).length > 0) {
        setSignedUrls(prev => ({ ...prev, ...urlMap }));
      }
    };

    // Only generate URLs if data has changed and we have items with attachments
    const hasNewAttachments = data.some(item => item.attachment_url && !signedUrls[item.id]);
    if (hasNewAttachments) {
      generateSignedUrls();
    }
  }, [data, signedUrls]);

  // Get unique close months from data for filter
  const uniqueCloseMonths = useMemo(() => {
    return [...new Set(data.map(d => d.est_close_month).filter(Boolean))].sort() as string[];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.se_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.opportunity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.am_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.agenda?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMonth = monthFilter === "all" || item.est_close_month === monthFilter;

      return matchesSearch && matchesMonth;
    });
  }, [data, searchQuery, monthFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleDelete = async (id: string) => {
    const result = await onDelete(id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Activity plan has been deleted.",
      });
    }
  };

  const canEdit = (item: ActivityPlan) => isAdmin || item.user_id === user?.id;
  const canDelete = (item: ActivityPlan) => isAdmin || item.user_id === user?.id;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {uniqueCloseMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatCloseMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ActivityFormDialog mode="add" onSubmit={onAdd} />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>SE Name</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>AM Name</TableHead>
              <TableHead>Agenda</TableHead>
              <TableHead>Contract Value</TableHead>
              <TableHead>Est. Close</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No activity plans found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{item.se_name}</TableCell>
                  <TableCell>{item.account_name || "-"}</TableCell>
                  <TableCell>{item.opportunity_name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      {item.activity_date
                        ? format(new Date(item.activity_date), "dd MMM yyyy")
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>{item.am_name || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.agenda || ""}>
                    {item.agenda || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCurrency(item.contract_value || 0)}
                  </TableCell>
                  <TableCell>{formatCloseMonth(item.est_close_month)}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={item.output || ""}>
                    {item.output || "-"}
                  </TableCell>
                  <TableCell>
                    {item.attachment_url ? (
                      signedUrls[item.id] ? (
                        <a href={signedUrls[item.id]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          <Image className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Loading...</span>
                      )
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit(item) && (
                        <ActivityFormDialog
                          mode="edit"
                          activityPlan={item}
                          onSubmit={async (data) => {
                            const result = await onUpdate(item.id, data);
                            if (result.error) {
                              console.error("Update error:", result.error);
                            }
                            return result;
                          }}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                      )}
                      {canDelete(item) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} entries
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
    </div>
  );
}
