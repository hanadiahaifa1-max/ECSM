import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Edit, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  PipelineEntry,
  STAGES,
  PRODUCT_FAMILIES,
  PILARS,
  TOWERS,
  PRESALES_LOBS,
  TELKOM_SI_OPTIONS,
  AM_NAMES,
  PRODUCT_FAMILY_MAPPING,
  calculateRevenueSummary,
} from "@/types/pipeline";

const otcEntrySchema = z.object({
  closeMonth: z.string(),
  amount: z.coerce.number().min(0).default(0),
});

const formSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(200),
  opportunityName: z.string().min(1, "Opportunity name is required").max(200),
  stage: z.enum([
    "Initial Communication",
    "Proposal",
    "Negotiation",
    "PoC",
    "Sign Agreement",
    "Closed Won",
    "Closed Lost",
  ]),
  productFamily: z.string().min(1, "Product family is required"),
  pilar: z.string().min(1, "Pilar is required"),
  tower: z.string().min(1, "Tower is required"),
  seName: z.string().min(1, "SE name is required").max(100),
  presalesLoB: z.string().min(1, "Pre-sales LoB is required"),
  amName: z.string().min(1, "AM name is required").max(100),
  closeMonth: z.string().optional().default(""),
  contractPeriod: z.string().optional().default("12"),
  contractValue: z.coerce.number().min(0).default(0),
  monthlyAmount: z.coerce.number().min(0).default(0),
  otcEntries: z.array(otcEntrySchema).default([]),
  // Year 1
  jan: z.coerce.number().min(0).default(0),
  feb: z.coerce.number().min(0).default(0),
  mar: z.coerce.number().min(0).default(0),
  apr: z.coerce.number().min(0).default(0),
  may: z.coerce.number().min(0).default(0),
  jun: z.coerce.number().min(0).default(0),
  jul: z.coerce.number().min(0).default(0),
  aug: z.coerce.number().min(0).default(0),
  sep: z.coerce.number().min(0).default(0),
  oct: z.coerce.number().min(0).default(0),
  nov: z.coerce.number().min(0).default(0),
  dec: z.coerce.number().min(0).default(0),
  // Year 2
  jan_y2: z.coerce.number().min(0).default(0),
  feb_y2: z.coerce.number().min(0).default(0),
  mar_y2: z.coerce.number().min(0).default(0),
  apr_y2: z.coerce.number().min(0).default(0),
  may_y2: z.coerce.number().min(0).default(0),
  jun_y2: z.coerce.number().min(0).default(0),
  jul_y2: z.coerce.number().min(0).default(0),
  aug_y2: z.coerce.number().min(0).default(0),
  sep_y2: z.coerce.number().min(0).default(0),
  oct_y2: z.coerce.number().min(0).default(0),
  nov_y2: z.coerce.number().min(0).default(0),
  dec_y2: z.coerce.number().min(0).default(0),
  // Year 3
  jan_y3: z.coerce.number().min(0).default(0),
  feb_y3: z.coerce.number().min(0).default(0),
  mar_y3: z.coerce.number().min(0).default(0),
  apr_y3: z.coerce.number().min(0).default(0),
  may_y3: z.coerce.number().min(0).default(0),
  jun_y3: z.coerce.number().min(0).default(0),
  jul_y3: z.coerce.number().min(0).default(0),
  aug_y3: z.coerce.number().min(0).default(0),
  sep_y3: z.coerce.number().min(0).default(0),
  oct_y3: z.coerce.number().min(0).default(0),
  nov_y3: z.coerce.number().min(0).default(0),
  dec_y3: z.coerce.number().min(0).default(0),
  // Year 4
  jan_y4: z.coerce.number().min(0).default(0),
  feb_y4: z.coerce.number().min(0).default(0),
  mar_y4: z.coerce.number().min(0).default(0),
  apr_y4: z.coerce.number().min(0).default(0),
  may_y4: z.coerce.number().min(0).default(0),
  jun_y4: z.coerce.number().min(0).default(0),
  jul_y4: z.coerce.number().min(0).default(0),
  aug_y4: z.coerce.number().min(0).default(0),
  sep_y4: z.coerce.number().min(0).default(0),
  oct_y4: z.coerce.number().min(0).default(0),
  nov_y4: z.coerce.number().min(0).default(0),
  dec_y4: z.coerce.number().min(0).default(0),
  // Year 5
  jan_y5: z.coerce.number().min(0).default(0),
  feb_y5: z.coerce.number().min(0).default(0),
  mar_y5: z.coerce.number().min(0).default(0),
  apr_y5: z.coerce.number().min(0).default(0),
  may_y5: z.coerce.number().min(0).default(0),
  jun_y5: z.coerce.number().min(0).default(0),
  jul_y5: z.coerce.number().min(0).default(0),
  aug_y5: z.coerce.number().min(0).default(0),
  sep_y5: z.coerce.number().min(0).default(0),
  oct_y5: z.coerce.number().min(0).default(0),
  nov_y5: z.coerce.number().min(0).default(0),
  dec_y5: z.coerce.number().min(0).default(0),
  telkomSI: z.string().min(1, "Telkom/SI is required").default("Telkom"),
  siName: z.string().max(100).optional(),
  bespokeProject: z.boolean().default(false),
  projectId: z.string().max(50).optional(),
  poReleaseDate: z.date().optional().nullable(),
  attachmentFile: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PipelineFormDialogProps {
  entry?: PipelineEntry;
  onSave: (data: Omit<PipelineEntry, "id" | "no">) => Promise<{ error: Error | null }>;
  onUpdate?: (id: string, data: Partial<PipelineEntry>) => Promise<{ error: Error | null }>;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format number with thousand separators (commas)
const formatNumberWithCommas = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue) || numValue === 0) return "";
  return new Intl.NumberFormat("id-ID").format(numValue);
};

// Parse formatted number back to plain number
const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  // Remove all dots (thousand separators in id-ID format)
  const cleanValue = value.replace(/\./g, "").replace(/,/g, "");
  return parseInt(cleanValue) || 0;
};

export function PipelineFormDialog({ entry, onSave, onUpdate }: PipelineFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productFamilyOpen, setProductFamilyOpen] = useState(false);
  const [amNameOpen, setAmNameOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("1");
  const isEditing = !!entry;
  const { user } = useAuth();
  const { userLoB } = useUserProfile();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: "",
      opportunityName: "",
      stage: "Initial Communication",
      productFamily: "",
      pilar: "",
      tower: "",
      seName: "",
      presalesLoB: "",
      amName: "",
      closeMonth: "",
      contractPeriod: "12",
      contractValue: 0,
      monthlyAmount: 0,
      otcEntries: [],
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
      jan_y2: 0,
      feb_y2: 0,
      mar_y2: 0,
      apr_y2: 0,
      may_y2: 0,
      jun_y2: 0,
      jul_y2: 0,
      aug_y2: 0,
      sep_y2: 0,
      oct_y2: 0,
      nov_y2: 0,
      dec_y2: 0,
      jan_y3: 0,
      feb_y3: 0,
      mar_y3: 0,
      apr_y3: 0,
      may_y3: 0,
      jun_y3: 0,
      jul_y3: 0,
      aug_y3: 0,
      sep_y3: 0,
      oct_y3: 0,
      nov_y3: 0,
      dec_y3: 0,
      jan_y4: 0,
      feb_y4: 0,
      mar_y4: 0,
      apr_y4: 0,
      may_y4: 0,
      jun_y4: 0,
      jul_y4: 0,
      aug_y4: 0,
      sep_y4: 0,
      oct_y4: 0,
      nov_y4: 0,
      dec_y4: 0,
      jan_y5: 0,
      feb_y5: 0,
      mar_y5: 0,
      apr_y5: 0,
      may_y5: 0,
      jun_y5: 0,
      jul_y5: 0,
      aug_y5: 0,
      sep_y5: 0,
      oct_y5: 0,
      nov_y5: 0,
      dec_y5: 0,
      telkomSI: "Telkom",
      siName: "",
      bespokeProject: false,
      projectId: "",
      poReleaseDate: null,
    },
  });

  const {
    fields: otcFields,
    append: appendOtc,
    remove: removeOtc,
  } = useFieldArray({
    control: form.control,
    name: "otcEntries",
  });

  // Watch monthly values for auto-calculation (all 5 years)
  const monthlyValuesY1 = form.watch([
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ]);
  const monthlyValuesY2 = form.watch([
    "jan_y2",
    "feb_y2",
    "mar_y2",
    "apr_y2",
    "may_y2",
    "jun_y2",
    "jul_y2",
    "aug_y2",
    "sep_y2",
    "oct_y2",
    "nov_y2",
    "dec_y2",
  ]);
  const monthlyValuesY3 = form.watch([
    "jan_y3",
    "feb_y3",
    "mar_y3",
    "apr_y3",
    "may_y3",
    "jun_y3",
    "jul_y3",
    "aug_y3",
    "sep_y3",
    "oct_y3",
    "nov_y3",
    "dec_y3",
  ]);
  const monthlyValuesY4 = form.watch([
    "jan_y4",
    "feb_y4",
    "mar_y4",
    "apr_y4",
    "may_y4",
    "jun_y4",
    "jul_y4",
    "aug_y4",
    "sep_y4",
    "oct_y4",
    "nov_y4",
    "dec_y4",
  ]);
  const monthlyValuesY5 = form.watch([
    "jan_y5",
    "feb_y5",
    "mar_y5",
    "apr_y5",
    "may_y5",
    "jun_y5",
    "jul_y5",
    "aug_y5",
    "sep_y5",
    "oct_y5",
    "nov_y5",
    "dec_y5",
  ]);

  const revenueSummary = useMemo(() => {
    const y1Total = monthlyValuesY1.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const y2Total = monthlyValuesY2.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const y3Total = monthlyValuesY3.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const y4Total = monthlyValuesY4.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const y5Total = monthlyValuesY5.reduce((sum, val) => sum + (Number(val) || 0), 0);

    return {
      total: y1Total + y2Total + y3Total + y4Total + y5Total,
    };
  }, [monthlyValuesY1, monthlyValuesY2, monthlyValuesY3, monthlyValuesY4, monthlyValuesY5]);

  // Calculate FY+1 spillover (revenue that goes to next fiscal year)
  const fySpillover = useMemo(() => {
    const contractValue = form.watch("contractValue");
    const closeMonth = form.watch("closeMonth");
    const contractPeriod = form.watch("contractPeriod");

    if (!contractValue || contractValue <= 0 || !closeMonth || !contractPeriod) {
      return { amount: 0, months: 0, hasSpillover: false };
    }

    // Parse contract period
    let period = 12;
    if (typeof contractPeriod === "string" && contractPeriod === "OTC") {
      period = 1;
    } else {
      period = parseInt(String(contractPeriod)) || 12;
    }

    // Parse close month to get starting index (0-based)
    const monthIndex = parseInt(closeMonth.split("-")[1]) - 1;

    // Calculate how many months spill into next year
    const remainingMonthsInYear = 12 - monthIndex;
    const spilloverMonths = Math.max(0, period - remainingMonthsInYear);

    if (spilloverMonths <= 0) {
      return { amount: 0, months: 0, hasSpillover: false };
    }

    // Calculate spillover amount
    const monthlyAmount = Math.floor(contractValue / period);
    const spilloverAmount = monthlyAmount * spilloverMonths;

    return {
      amount: spilloverAmount,
      months: spilloverMonths,
      hasSpillover: true,
    };
  }, [form.watch("contractValue"), form.watch("closeMonth"), form.watch("contractPeriod")]);

  useEffect(() => {
    if (entry && open) {
      form.reset({
        accountName: entry.accountName,
        opportunityName: entry.opportunityName,
        stage: entry.stage,
        productFamily: entry.productFamily,
        pilar: entry.pilar,
        tower: entry.tower,
        seName: entry.seName || user?.user_metadata?.full_name || "",
        presalesLoB: entry.presalesLoB || userLoB || "",
        amName: entry.amName || "",
        closeMonth: entry.closeMonth || "",
        contractPeriod: String(entry.contractPeriod || 12),
        contractValue: entry.contractValue,
        jan: entry.revPlan.jan,
        feb: entry.revPlan.feb,
        mar: entry.revPlan.mar,
        apr: entry.revPlan.apr,
        may: entry.revPlan.may,
        jun: entry.revPlan.jun,
        jul: entry.revPlan.jul,
        aug: entry.revPlan.aug,
        sep: entry.revPlan.sep,
        oct: entry.revPlan.oct,
        nov: entry.revPlan.nov,
        dec: entry.revPlan.dec,
        telkomSI: entry.telkomSI || "Telkom",
        siName: entry.siName || "",
        bespokeProject: entry.bespokeProject || false,
        projectId: entry.projectId || "",
        poReleaseDate: entry.poReleaseDate ? new Date(entry.poReleaseDate) : null,
      });
    }
  }, [entry, open, form, user, userLoB]);

  useEffect(() => {
    if (open && !isEditing && user) {
      form.setValue("seName", user.user_metadata?.full_name || "");
      if (userLoB) {
        form.setValue("presalesLoB", userLoB);
      }
    }
  }, [open, isEditing, user, userLoB, form]);

  // Auto-fill pilar and tower when product family is selected
  useEffect(() => {
    const productFamily = form.watch("productFamily");
    if (productFamily && PRODUCT_FAMILY_MAPPING[productFamily]) {
      const mapping = PRODUCT_FAMILY_MAPPING[productFamily];
      form.setValue("pilar", mapping.pilar);
      form.setValue("tower", mapping.tower);
    }
  }, [form.watch("productFamily"), form]);

  // Watch form values for auto-spread
  const watchedOtcEntries = form.watch("otcEntries") || [];
  const monthlyAmount = form.watch("monthlyAmount") || 0;
  const contractPeriod = form.watch("contractPeriod") || "12";
  const closeMonth = form.watch("closeMonth") || "";
  
  // Serialize OTC entries to trigger useEffect when values change
  const otcEntriesKey = JSON.stringify(watchedOtcEntries);

  // Auto-spread to revenue plan based on OTC entries and monthly amount (5 years)
  useEffect(() => {
    const monthsY1 = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
    const monthsY2 = [
      "jan_y2",
      "feb_y2",
      "mar_y2",
      "apr_y2",
      "may_y2",
      "jun_y2",
      "jul_y2",
      "aug_y2",
      "sep_y2",
      "oct_y2",
      "nov_y2",
      "dec_y2",
    ] as const;
    const monthsY3 = [
      "jan_y3",
      "feb_y3",
      "mar_y3",
      "apr_y3",
      "may_y3",
      "jun_y3",
      "jul_y3",
      "aug_y3",
      "sep_y3",
      "oct_y3",
      "nov_y3",
      "dec_y3",
    ] as const;
    const monthsY4 = [
      "jan_y4",
      "feb_y4",
      "mar_y4",
      "apr_y4",
      "may_y4",
      "jun_y4",
      "jul_y4",
      "aug_y4",
      "sep_y4",
      "oct_y4",
      "nov_y4",
      "dec_y4",
    ] as const;
    const monthsY5 = [
      "jan_y5",
      "feb_y5",
      "mar_y5",
      "apr_y5",
      "may_y5",
      "jun_y5",
      "jul_y5",
      "aug_y5",
      "sep_y5",
      "oct_y5",
      "nov_y5",
      "dec_y5",
    ] as const;
    const allMonths = [...monthsY1, ...monthsY2, ...monthsY3, ...monthsY4, ...monthsY5];
    const yearMonths = [monthsY1, monthsY2, monthsY3, monthsY4, monthsY5];

    // Clear all months first
    allMonths.forEach((month) => {
      form.setValue(month, 0);
    });

    // Add OTC amounts to their respective months (Year 1 only for OTC)
    watchedOtcEntries.forEach((otc) => {
      if (otc.closeMonth && otc.amount > 0) {
        const monthIndex = parseInt(otc.closeMonth.split("-")[1]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          const currentValue = form.getValues(monthsY1[monthIndex]) || 0;
          form.setValue(monthsY1[monthIndex], currentValue + otc.amount);
        }
      }
    });

    // Spread monthly amount starting from close month across 5 years
    if (closeMonth && monthlyAmount > 0) {
      const startMonthIndex = parseInt(closeMonth.split("-")[1]) - 1;
      const period = parseInt(contractPeriod) || 12;

      for (let i = 0; i < period && i < 60; i++) {
        const monthInYear = (startMonthIndex + i) % 12;
        const yearOffset = Math.floor((startMonthIndex + i) / 12);

        if (yearOffset < 5) {
          const targetMonth = yearMonths[yearOffset][monthInYear];
          const currentValue = (form.getValues(targetMonth as keyof FormData) as number) || 0;
          form.setValue(targetMonth as keyof FormData, currentValue + monthlyAmount);
        }
      }
    }
  }, [otcEntriesKey, monthlyAmount, closeMonth, contractPeriod, form]);

  // CV = Sum of Revenue Plan across all 5 years (always in sync)
  useEffect(() => {
    form.setValue("contractValue", revenueSummary.total);
  }, [revenueSummary.total, form]);

  // Year configurations for revenue plan
  const yearConfigs = [
    {
      value: "1",
      label: "Year 1 (FY-26)",
      fields: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const,
    },
    {
      value: "2",
      label: "Year 2 (FY-27)",
      fields: [
        "jan_y2",
        "feb_y2",
        "mar_y2",
        "apr_y2",
        "may_y2",
        "jun_y2",
        "jul_y2",
        "aug_y2",
        "sep_y2",
        "oct_y2",
        "nov_y2",
        "dec_y2",
      ] as const,
    },
    {
      value: "3",
      label: "Year 3 (FY-28)",
      fields: [
        "jan_y3",
        "feb_y3",
        "mar_y3",
        "apr_y3",
        "may_y3",
        "jun_y3",
        "jul_y3",
        "aug_y3",
        "sep_y3",
        "oct_y3",
        "nov_y3",
        "dec_y3",
      ] as const,
    },
    {
      value: "4",
      label: "Year 4 (FY-29)",
      fields: [
        "jan_y4",
        "feb_y4",
        "mar_y4",
        "apr_y4",
        "may_y4",
        "jun_y4",
        "jul_y4",
        "aug_y4",
        "sep_y4",
        "oct_y4",
        "nov_y4",
        "dec_y4",
      ] as const,
    },
    {
      value: "5",
      label: "Year 5 (FY-30)",
      fields: [
        "jan_y5",
        "feb_y5",
        "mar_y5",
        "apr_y5",
        "may_y5",
        "jun_y5",
        "jul_y5",
        "aug_y5",
        "sep_y5",
        "oct_y5",
        "nov_y5",
        "dec_y5",
      ] as const,
    },
  ];

  const currentYearConfig = yearConfigs.find((y) => y.value === selectedYear) || yearConfigs[0];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const entryData = {
        accountName: data.accountName,
        opportunityName: data.opportunityName,
        stage: data.stage,
        productFamily: data.productFamily,
        pilar: data.pilar,
        tower: data.tower,
        seName: data.seName || "",
        presalesLoB: data.presalesLoB || "",
        amName: data.amName || "",
        closeMonth: data.closeMonth || "",
        contractPeriod: data.contractPeriod || "12",
        contractValue: data.contractValue,
        revPlan: {
          jan: data.jan,
          feb: data.feb,
          mar: data.mar,
          apr: data.apr,
          may: data.may,
          jun: data.jun,
          jul: data.jul,
          aug: data.aug,
          sep: data.sep,
          oct: data.oct,
          nov: data.nov,
          dec: data.dec,
        },
        telkomSI: data.telkomSI,
        siName: data.telkomSI === "SI" ? data.siName : null,
        bespokeProject: data.bespokeProject,
        projectId: data.projectId || null,
        poReleaseDate: data.poReleaseDate ? format(data.poReleaseDate, "yyyy-MM-dd") : null,
        poReleaseNumber: null,
        attachmentUrl: null,
      };

      let result;
      if (isEditing && onUpdate && entry) {
        result = await onUpdate(entry.id, entryData as Partial<PipelineEntry>);
      } else {
        result = await onSave(entryData as Omit<PipelineEntry, "id" | "no">);
      }

      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(isEditing ? "Opportunity updated successfully" : "Opportunity created successfully");
        setOpen(false);
        form.reset();
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
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
            Add Opportunity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Opportunity Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Opportunity Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="PT Example Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="opportunityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Implementation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
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
                  name="productFamily"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Product Family *</FormLabel>
                      <Popover open={productFamilyOpen} onOpenChange={setProductFamilyOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={productFamilyOpen}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? PRODUCT_FAMILIES.find((pf) => pf === field.value) || field.value
                                : "Select or type product family..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search product family..."
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                            <CommandList>
                              <CommandEmpty>No product family found. Type to add manually.</CommandEmpty>
                              <CommandGroup>
                                {PRODUCT_FAMILIES.map((pf) => (
                                  <CommandItem
                                    key={pf}
                                    value={pf}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue === field.value ? "" : currentValue);
                                      setProductFamilyOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn("mr-2 h-4 w-4", field.value === pf ? "opacity-100" : "opacity-0")}
                                    />
                                    {pf}
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
                <FormField
                  control={form.control}
                  name="pilar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilar *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pilar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PILARS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
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
                  name="tower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tower *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tower" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOWERS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
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
                  name="amName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>AM Name *</FormLabel>
                      <Popover open={amNameOpen} onOpenChange={setAmNameOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={amNameOpen}
                              className="w-full justify-between"
                            >
                              {field.value
                                ? AM_NAMES.find((am) => am === field.value) || field.value
                                : "Select or type AM name..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search AM name..."
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                            <CommandList>
                              <CommandEmpty>No AM found. Type to add manually.</CommandEmpty>
                              <CommandGroup>
                                {AM_NAMES.map((am) => (
                                  <CommandItem
                                    key={am}
                                    value={am}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue === field.value ? "" : currentValue);
                                      setAmNameOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn("mr-2 h-4 w-4", field.value === am ? "opacity-100" : "opacity-0")}
                                    />
                                    {am}
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
              </div>
            </div>

            <Separator />

            {/* Section 2: Contract & Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contract & Timeline</h3>

              {/* OTC Section - Styled Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">OTC (One-Time Charges)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-blue-300 dark:border-blue-700 text-black-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={() => appendOtc({ closeMonth: "", amount: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add OTC
                  </Button>
                </div>

                {otcFields.length === 0 ? (
                  <p className="text-sm text-blue-600/70 dark:text-black-400/70 italic">No OTC entries added</p>
                ) : (
                  <div className="space-y-3">
                    {otcFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-black-600 dark:text-black-400">
                            OTC {index + 1}
                          </span>
                        </div>
                        <FormField
                          control={form.control}
                          name={`otcEntries.${index}.closeMonth` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Close Month</FormLabel>
                              <FormControl>
                                <Input type="month" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`otcEntries.${index}.amount` as const}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>OTC Amount (IDR)</FormLabel>
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
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                            onClick={() => removeOtc(index)}
                          >
                            <span className="text-destructive">×</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Contract Section - Styled Box */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-4">Monthly Contract</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="closeMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Month</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Period (months)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="36">36</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                            <SelectItem value="60">60</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Amount (IDR)</FormLabel>
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
                    )}
                  />
                </div>
              </div>

              {/* Contract Value Summary */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Contract Value (CV)</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(revenueSummary.total)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 4: Revenue Plan - 5 Years */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Revenue Plan</h3>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearConfigs.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Year */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">{currentYearConfig.label}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {currentYearConfig.fields.map((month) => (
                    <FormField
                      key={month}
                      control={form.control}
                      name={month}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="capitalize text-xs">{month.replace(/_y\d$/, "")}</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              className="text-sm"
                              value={formatNumberWithCommas(field.value || 0)}
                              onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5: Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telkomSI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telkom / SI *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TELKOM_SI_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("telkomSI") === "SI" && (
                  <FormField
                    control={form.control}
                    name="siName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SI Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SI name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="bespokeProject"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Bespoke Project</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project ID</FormLabel>
                      <FormControl>
                        <Input placeholder="PRJ-2026-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="poReleaseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>PO / PKS Release Date</FormLabel>
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
                  name="attachmentFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Attachment (PDF)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onChange(file);
                          }}
                          {...field}
                        />
                      </FormControl>
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
                {isEditing ? "Update Opportunity" : "Create Opportunity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
