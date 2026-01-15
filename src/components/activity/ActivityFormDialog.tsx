import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Pencil, Upload, X, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ActivityPlan } from "@/types/activityPlan";
import { AM_NAMES } from "@/types/pipeline";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  se_name: z.string().optional(),
  account_name: z.string().optional(),
  opportunity_name: z.string().optional(),
  activity_date: z.date().optional(),
  am_name: z.string().optional(),
  agenda: z.string().optional(),
  solution_offer: z.string().optional(),
  contract_value: z.coerce.number().optional(),
  est_close_month: z.string().optional(),
  output: z.string().optional(),
  next_action: z.string().optional(),
  create_pipeline: z.boolean().default(false),
  existing_pipeline_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ActivityFormDialogProps {
  mode: "add" | "edit";
  activityPlan?: ActivityPlan;
  onSubmit: (data: Omit<ActivityPlan, "id" | "user_id" | "created_at" | "updated_at">) => Promise<{ error: Error | null }>;
  trigger?: React.ReactNode;
}

export function ActivityFormDialog({
  mode,
  activityPlan,
  onSubmit,
  trigger,
}: ActivityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineEntries, setPipelineEntries] = useState<{ id: string; opportunity_name: string; account_name: string; am_name: string; close_month: string | null; contract_value: number }[]>([]);
  const [amSearchOpen, setAmSearchOpen] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      se_name: "",
      account_name: "",
      opportunity_name: "",
      activity_date: new Date(),
      am_name: "",
      agenda: "",
      solution_offer: "",
      contract_value: 0,
      est_close_month: "",
      output: "",
      next_action: "",
      create_pipeline: false,
      existing_pipeline_id: "",
    },
  });

  const createPipeline = form.watch("create_pipeline");
  const selectedPipelineId = form.watch("existing_pipeline_id");

  // Fetch existing pipeline entries - only user's own entries
  const fetchPipelines = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("pipeline_entries")
      .select("id, opportunity_name, account_name, am_name, close_month, contract_value")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setPipelineEntries(data);
  }, [user?.id]);

  useEffect(() => {
    if (open) fetchPipelines();
  }, [open, fetchPipelines]);

  useEffect(() => {
    if (mode === "edit" && activityPlan) {
      setExistingAttachment(activityPlan.attachment_url || null);
      setAttachmentPreview(activityPlan.attachment_url || null);
    } else if (mode === "add") {
      setAttachmentFile(null);
      setAttachmentPreview(null);
      setExistingAttachment(null);
    }
  }, [mode, activityPlan, open]);

  // Auto-fill account, opportunity, AM name, close month, and contract value when selecting existing pipeline
  const autoFillPipeline = useCallback(() => {
    if (selectedPipelineId && !createPipeline) {
      const selected = pipelineEntries.find(p => p.id === selectedPipelineId);
      if (selected) {
        form.setValue("account_name", selected.account_name);
        form.setValue("opportunity_name", selected.opportunity_name);
        form.setValue("am_name", selected.am_name || "");
        form.setValue("est_close_month", selected.close_month || "");
        form.setValue("contract_value", selected.contract_value || 0);
      }
    }
  }, [selectedPipelineId, createPipeline, pipelineEntries, form]);

  useEffect(() => {
    autoFillPipeline();
  }, [autoFillPipeline]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      setAttachmentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(existingAttachment);
  };

  const uploadAttachment = useCallback(async (): Promise<string | null> => {
    if (!attachmentFile || !user) return existingAttachment;

    const fileExt = attachmentFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("activity-attachments")
      .upload(fileName, attachmentFile);

    if (uploadError) throw uploadError;

    // Store the file path (not the full URL) so we can generate signed URLs when needed
    return fileName;
  }, [attachmentFile, user, existingAttachment]);

  const handleSubmit = useCallback(async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let pipelineEntryId: string | null = data.existing_pipeline_id || null;
      let attachmentUrl: string | null = existingAttachment;

      // Upload attachment if there's a new file
      if (attachmentFile) {
        attachmentUrl = await uploadAttachment();
      }

      // Create pipeline entry if requested
      if (data.create_pipeline && data.opportunity_name && data.account_name) {
        const { data: pipelineData, error: pipelineError } = await supabase
          .from("pipeline_entries")
          .insert({
            user_id: user?.id,
            account_name: data.account_name,
            opportunity_name: data.opportunity_name,
            se_name: data.se_name,
            am_name: data.am_name || "",
            stage: "Initial Communication",
            pilar: "Fleet Management",
            tower: "EPINI",
            contract_value: data.contract_value,
            close_month: data.est_close_month || null,
          })
          .select("id")
          .single();

        if (pipelineError) throw pipelineError;
        pipelineEntryId = pipelineData?.id || null;

        toast({
          title: "Pipeline Created",
          description: "A new pipeline opportunity has been created.",
        });
      }

      const result = await onSubmit({
        se_name: data.se_name,
        account_name: data.account_name || null,
        opportunity_name: data.opportunity_name || null,
        activity_date: format(data.activity_date, "yyyy-MM-dd"),
        am_name: data.am_name || null,
        agenda: data.agenda || null,
        solution_offer: data.solution_offer || null,
        contract_value: data.contract_value,
        rev_plan_fy26: 0,
        est_close_month: data.est_close_month || null,
        output: data.output || null,
        next_action: data.next_action || null,
        pipeline_entry_id: pipelineEntryId,
        attachment_url: attachmentUrl,
      });

      if (result.error) throw result.error;

      toast({
        title: mode === "add" ? "Activity Added" : "Activity Updated",
        description: `Activity plan has been ${mode === "add" ? "created" : "updated"} successfully.`,
      });

      // Reset form and close dialog
      setOpen(false);
      setAttachmentFile(null);
      setAttachmentPreview(null);
      setExistingAttachment(null);

    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [existingAttachment, attachmentFile, user, onSubmit, mode, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button onClick={() => console.log("Button clicked")}>
            {mode === "add" ? (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Activity" : "Edit Activity"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => {
            console.log("Form submitted");
            form.handleSubmit(handleSubmit)(e);
          }} className="space-y-4">
            {/* Create Pipeline Checkbox - At Top */}
            {mode === "add" && (
              <FormField
                control={form.control}
                name="create_pipeline"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 rounded-lg border p-4 bg-muted/50">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-input"
                      />
                    </FormControl>
                    <FormLabel className="font-medium cursor-pointer">
                      Create New Pipeline Opportunity from this Activity
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            {/* Select Existing Pipeline - Only show when NOT creating new pipeline */}
            {mode === "add" && !createPipeline && (
              <FormField
                control={form.control}
                name="existing_pipeline_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Existing Pipeline (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select existing pipeline opportunity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {pipelineEntries.map((entry) => (
                          <SelectItem key={entry.id} value={entry.id}>
                            {entry.opportunity_name} - {entry.account_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SE Name - Only show in edit mode, auto-filled in add mode */}
              {mode === "edit" && (
                <FormField
                  control={form.control}
                  name="se_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SE Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter SE name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Account Name */}
              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter account name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opportunity Name */}
              <FormField
                control={form.control}
                name="opportunity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter opportunity name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AM Name with Search */}
              <FormField
                control={form.control}
                name="am_name"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>AM Name *</FormLabel>
                    <Popover open={amSearchOpen} onOpenChange={setAmSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value || "Select AM"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search AM name..." />
                          <CommandList>
                            <CommandEmpty>No AM found.</CommandEmpty>
                            <CommandGroup>
                              {AM_NAMES.map((name) => (
                                <CommandItem
                                  key={name}
                                  value={name}
                                  onSelect={() => {
                                    field.onChange(name);
                                    setAmSearchOpen(false);
                                  }}
                                >
                                  {name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity Date */}
              <FormField
                control={form.control}
                name="activity_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Activity Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Est Close Month */}
              <FormField
                control={form.control}
                name="est_close_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Close Month *</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contract Value */}
              <FormField
                control={form.control}
                name="contract_value"
                render={({ field }) => {
                  const formatNumberWithCommas = (value: number | string): string => {
                    const numValue = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value;
                    if (isNaN(numValue) || numValue === 0) return "";
                    return new Intl.NumberFormat("id-ID").format(numValue);
                  };

                  const parseFormattedNumber = (value: string): number => {
                    if (!value) return 0;
                    const cleanValue = value.replace(/\./g, "").replace(/,/g, "");
                    return parseInt(cleanValue) || 0;
                  };

                  return (
                    <FormItem>
                      <FormLabel>Contract Value *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0"
                          value={formatNumberWithCommas(field.value || 0)}
                          onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

            </div>

            {/* Agenda */}
            <FormField
              control={form.control}
              name="agenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agenda *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Meeting agenda..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Solution Offer - Smaller */}
            <FormField
              control={form.control}
              name="solution_offer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution Offer *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Solution offered..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Output */}
            <FormField
              control={form.control}
              name="output"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Meeting output..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Next Action */}
            <FormField
              control={form.control}
              name="next_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Action *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Next action items..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment */}
            <div className="space-y-2">
              <FormLabel>Attachment (Photo)</FormLabel>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {attachmentPreview && (
                  <div className="relative">
                    <img
                      src={attachmentPreview}
                      alt="Attachment preview"
                      className="h-16 w-16 object-cover rounded-md border"
                    />
                    {attachmentFile && (
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "add" ? "Add Activity" : "Update Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}