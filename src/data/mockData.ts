import { PipelineEntry, Stage, STAGES, PILARS, TOWERS, PRODUCT_FAMILIES } from "@/types/pipeline";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateRandomRevPlan = (cv: number) => {
  const monthlyBase = cv / 12;
  return {
    jan: Math.round(monthlyBase * (0.5 + Math.random())),
    feb: Math.round(monthlyBase * (0.5 + Math.random())),
    mar: Math.round(monthlyBase * (0.8 + Math.random() * 0.4)),
    apr: Math.round(monthlyBase * (0.5 + Math.random())),
    may: Math.round(monthlyBase * (0.5 + Math.random())),
    jun: Math.round(monthlyBase * (0.8 + Math.random() * 0.4)),
    jul: Math.round(monthlyBase * (0.5 + Math.random())),
    aug: Math.round(monthlyBase * (0.5 + Math.random())),
    sep: Math.round(monthlyBase * (0.8 + Math.random() * 0.4)),
    oct: Math.round(monthlyBase * (0.5 + Math.random())),
    nov: Math.round(monthlyBase * (0.5 + Math.random())),
    dec: Math.round(monthlyBase * (1 + Math.random() * 0.5)),
  };
};

const companies = [
  "PT Telkom Indonesia",
  "Bank Mandiri",
  "PT PLN Persero",
  "Pertamina",
  "Garuda Indonesia",
  "Bank BRI",
  "Bank BNI",
  "Astra International",
  "Indosat Ooredoo",
  "XL Axiata",
  "Tokopedia",
  "Gojek",
  "Bukalapak",
  "Traveloka",
  "OVO",
  "Kementerian Keuangan",
  "Kementerian Kesehatan",
  "BPJS Kesehatan",
  "PT KAI",
  "Angkasa Pura",
];

const seNames = ["Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Dian Permata", "Eko Prasetyo"];
const amNames = ["Fitri Handayani", "Gunawan Susanto", "Hana Wijaya", "Irfan Hakim", "Jasmine Putri"];

export const mockPipelineData: PipelineEntry[] = Array.from({ length: 30 }, (_, i) => {
  const cv = Math.floor(Math.random() * 5000000000) + 500000000;
  const stage = STAGES[Math.floor(Math.random() * STAGES.length)];

  return {
    id: `opp-${i + 1}`,
    no: i + 1,
    accountName: companies[Math.floor(Math.random() * companies.length)],
    opportunityName: `${["Implementation", "Upgrade", "Migration", "Renewal", "New Deployment"][Math.floor(Math.random() * 5)]} ${PRODUCT_FAMILIES[Math.floor(Math.random() * PRODUCT_FAMILIES.length)]}`,
    stage,
    productFamily: PRODUCT_FAMILIES[Math.floor(Math.random() * PRODUCT_FAMILIES.length)],
    pilar: PILARS[Math.floor(Math.random() * PILARS.length)],
    tower: TOWERS[Math.floor(Math.random() * TOWERS.length)],
    seName: seNames[Math.floor(Math.random() * seNames.length)],
    presalesLoB: TOWERS[Math.floor(Math.random() * TOWERS.length)],
    amName: amNames[Math.floor(Math.random() * amNames.length)],
    closeMonth: months[Math.floor(Math.random() * months.length)],
    contractPeriod: Math.floor(Math.random() * 24) + 12,
    contractValue: cv,
    revPlan: generateRandomRevPlan(cv),
    telkomSI: Math.random() > 0.5 ? "Telkom" : "SI",
    siName: null,
    bespokeProject: Math.random() > 0.7,
    projectId: null,
    poReleaseDate: stage === "Closed Won" ? "2026-01-15" : null,
    poReleaseNumber: stage === "Closed Won" ? `PO-2026-${String(i + 1).padStart(4, "0")}` : null,
    attachmentUrl: null,
  };
});

export const getStageCount = (data: PipelineEntry[]) => {
  return STAGES.reduce(
    (acc, stage) => {
      acc[stage] = data.filter((d) => d.stage === stage).length;
      return acc;
    },
    {} as Record<Stage, number>,
  );
};

export const getTotalByStage = (data: PipelineEntry[]) => {
  return STAGES.map((stage) => ({
    stage,
    total: data.filter((d) => d.stage === stage).reduce((sum, d) => {
      const plan = d.revPlan;
      return sum + plan.jan + plan.feb + plan.mar + plan.apr + plan.may + plan.jun +
                   plan.jul + plan.aug + plan.sep + plan.oct + plan.nov + plan.dec;
    }, 0),
    count: data.filter((d) => d.stage === stage).length,
  }));
};

export const getMonthlyRevenue = (data: PipelineEntry[]) => {
  const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return monthNames.map((name, i) => ({
    month: name,
    revenue: data.reduce((sum, d) => sum + d.revPlan[monthKeys[i]], 0),
    target: 4000000000,
  }));
};

export const getPilarDistribution = (data: PipelineEntry[]) => {
  return PILARS.map((pilar) => ({
    name: pilar,
    value: data.filter((d) => d.pilar === pilar).reduce((sum, d) => sum + d.contractValue, 0),
    count: data.filter((d) => d.pilar === pilar).length,
  }));
};

export const getTowerDistribution = (data: PipelineEntry[]) => {
  return TOWERS.map((tower) => ({
    name: tower,
    value: data.filter((d) => d.tower === tower).reduce((sum, d) => sum + d.contractValue, 0),
    count: data.filter((d) => d.tower === tower).length,
  }));
};

export const getLoBDistribution = (data: PipelineEntry[]) => {
  const lobs = [...new Set(data.map((d) => d.presalesLoB).filter((lob): lob is string => !!lob))];
  return lobs.map((lob) => ({
    name: lob,
    value: data.filter((d) => d.presalesLoB === lob).reduce((sum, d) => sum + d.contractValue, 0),
    count: data.filter((d) => d.presalesLoB === lob).length,
  }));
};
