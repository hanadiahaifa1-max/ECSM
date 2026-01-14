import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Highlight, HIGHLIGHT_CATEGORIES, HIGHLIGHT_STATUSES, DEPT_IN_CHARGE_OPTIONS } from "@/types/highlight";
import { usePipeline } from "@/hooks/usePipeline";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.string().min(1, "Category is required"),
  highlightDate: z.date({ required_error: "Highlight date is required" }),
  status: z.enum(["On Progress", "Complate"], { required_error: "Status is required" }),
  pipelineEntryId: z.string().min(1, "Pipeline entry is required"),
  supportNeeded: z.string().min(1, "Support needed is required").max(500),
  deptInCharge: z.enum(["AM", "Product", "Delivery"], { required_error: "Department in charge is required" }),
});

type FormData = z.infer<typeof formSchema>;

interface HighlightFormDialogProps {
  highlight?: Highlight;
  onSave: (
    data: Omit<Highlight, "id" | "created_at" | "updated_at" | "created_by" | "creator_name">,
  ) => Promise<{ error: Error | null }>;
  onUpdate?: (id: string, data: Partial<Highlight>) => Promise<{ error: Error | null }>;
}

export function HighlightFormDialog({ highlight, onSave, onUpdate }: HighlightFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!highlight;
  const { user } = useAuth();
  const { userLoB } = useUserProfile();
  const { entries: pipelineEntries } = usePipeline();

  // Filter pipeline entries to only show user's own entries
  const userPipelineEntries = useMemo(() => {
    return pipelineEntries.filter((entry) => entry.userId === user?.id);
  }, [pipelineEntries, user?.id]);

  // Get selected pipeline entry details
  const getSelectedPipelineEntry = (pipelineId: string | undefined) => {
    if (!pipelineId) return null;
    return userPipelineEntries.find((entry) => entry.id === pipelineId);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      highlightDate: undefined,
      status: "On Progress",
      pipelineEntryId: "",
      supportNeeded: "",
      deptInCharge: undefined,
    },
  });

  const selectedPipelineId = form.watch("pipelineEntryId");
  const selectedPipeline = getSelectedPipelineEntry(selectedPipelineId);

  useEffect(() => {
    if (highlight && open) {
      form.reset({
        title: highlight.title,
        category: highlight.category || "",
        highlightDate: highlight.highlight_date ? new Date(highlight.highlight_date) : undefined,
        status: highlight.status as "On Progress" | "Complate",
        pipelineEntryId: highlight.pipeline_entry_id || "",
        supportNeeded: highlight.support_needed || "",
        deptInCharge: highlight.dept_in_charge as "AM" | "Product" | "Delivery" | undefined,
      });
    }
  }, [highlight, open, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const selectedEntry = getSelectedPipelineEntry(data.pipelineEntryId);

      const highlightData = {
        title: data.title,
        category: data.category,
        highlight_date: format(data.highlightDate, "yyyy-MM-dd"),
        status: data.status,
        pipeline_entry_id: data.pipelineEntryId,
        related_account: selectedEntry?.accountName || null,
        related_opportunity: selectedEntry?.opportunityName || null,
        se_name: selectedEntry?.seName || null,
        presales_lob: userLoB || null,
        stage: selectedEntry?.stage || null,
        potential_rev: selectedEntry?.contractValue || null,
        description: null,
        support_needed: data.supportNeeded,
        dept_in_charge: data.deptInCharge,
      };

      let result;
      if (isEditing && onUpdate && highlight) {
        result = await onUpdate(highlight.id, highlightData);
      } else {
        result = await onSave(highlightData as any);
      }

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(isEditing ? "Highlight updated successfully" : "Highlight created successfully");
        setOpen(false);
        form.reset();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Highlight
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Highlight" : "Add New Highlight"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Pipeline Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pipeline Entry</h3>
              <FormField
                control={form.control}
                name="pipelineEntryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Pipeline Entry *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your pipeline entry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userPipelineEntries.length === 0 ? (
                          <SelectItem value="no-entries" disabled>
                            No pipeline entries found
                          </SelectItem>
                        ) : (
                          userPipelineEntries.map((entry) => (
                            <SelectItem key={entry.id} value={entry.id}>
                              {entry.accountName} - {entry.opportunityName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Auto-filled fields from pipeline */}
              {selectedPipeline && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Auto-filled from Pipeline:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Account Name:</span>
                      <p className="font-medium">{selectedPipeline.accountName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opportunity:</span>
                      <p className="font-medium">{selectedPipeline.opportunityName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SE Name:</span>
                      <p className="font-medium">{selectedPipeline.seName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pre-sales LoB:</span>
                      <p className="font-medium">{userLoB || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stage:</span>
                      <p className="font-medium">{selectedPipeline.stage}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Potential Rev:</span>
                      <p className="font-medium">{formatCurrency(selectedPipeline.contractValue)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Highlight Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Highlight Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Highlight *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter highlight description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HIGHLIGHT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="highlightDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Highlight Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HIGHLIGHT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Support Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supportNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Needed *</FormLabel>
                      <FormControl>
                        <Input placeholder="What support is needed?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deptInCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dept/Divisi in Charge *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPT_IN_CHARGE_OPTIONS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Highlight" : "Create Highlight"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
