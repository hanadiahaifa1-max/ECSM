export type Stage =
  | "Initial Communication"
  | "Proposal"
  | "Negotiation"
  | "PoC"
  | "Sign Agreement"
  | "Closed Won"
  | "Closed Lost";

export const STAGES: Stage[] = [
  "Initial Communication",
  "Proposal",
  "Negotiation",
  "PoC",
  "Sign Agreement",
  "Closed Won",
  "Closed Lost",
];

export const PRODUCT_FAMILIES = [
  "Fleet Sense",
  "Fleet Sight",
  "IoT Analytics",
  "Video Intelligent",
  "Sense Analytics",
  "IoT Sphere",
  "Enterprise Data Lake with Low Code Integrated System",
  "Private Network",
  "Managed Service SDWAN",
  "Network Priority",
  "Direct Peering",
  "Repeater Picotel",
  "IaaS",
  "PVR",
  "Femtocell",
  "Intank",
  "Fuel Management System",
  "Smart Lighting",
  "Smart Meter",
  "Connected Mine",
  "Asset Performance Management",
  "Smart Dashboard",
  "Vessel Monitoring System",
  "Tap on Bus",
  "IoT Envion",
  "IoT Control Center",
  "Soundbox",
  "Connected Worker",
  "IoT Analytics",
  "Modem Router Industrial",
  "LinkCar",
  "Mobile Device Management (MDM)",
  "Mobile Endpoint Protection (MEP)",
  "Telkomsel Guard",
  "Kaspersky Standard Protection",
  "TEMS - Spam Call Protection",
  "CloudX Hub",
  "nGage Robocall API",
  "Attendance Apps",
  "CloudX Communication",
  "Field Force Management",
  "Smart Tax",
  "Robotic Process Automation (RPA)",
  "Custom POS",
  "Enterprise Call Solution",
  "Office 365",
  "Telkomsel Marketing Automation (TMA) / CEP",
  "HCM Suites (Modular Apps)",
  "Smart Voice Comm (SVC)",
  "nGage Number Masking",
  "Touch to Talk",
  "nGage Omnichannel",
  "nGage Video API",
  "AVA - AI Virtual Assistant",
  "SAVIA",
  "EDC",
];

export const PILARS = [
  "Fleet Management",
  "IoT Analytic and Security",
  "Network & Infra",
  "IoT Industrial",
  "Advance Communication",
  "Mobile Security & Emerging",
  "UCC and Business Productivity",
];

export const TOWERS = ["EPINI", "ESEM"];

export const PRODUCT_FAMILY_MAPPING: Record<string, { pilar: string; tower: string }> = {
  // Fleet Management
  "Fleet Sense": { pilar: "Fleet Management", tower: "EPINI" },
  "Fleet Sight": { pilar: "Fleet Management", tower: "EPINI" },

  // IoT Analytic and Security
  "IoT Analytics": { pilar: "IoT Analytic and Security", tower: "EPINI" },
  "Video Intelligent": { pilar: "IoT Analytic and Security", tower: "EPINI" },
  "Sense Analytics": { pilar: "IoT Analytic and Security", tower: "EPINI" },
  "IoT Sphere": { pilar: "IoT Analytic and Security", tower: "EPINI" },
  "Enterprise Data Lake with Low Code Integrated System": { pilar: "IoT Analytic and Security", tower: "EPINI" },

  // Network & Infra
  "Private Network": { pilar: "Network & Infra", tower: "EPINI" },
  "Managed Service SDWAN": { pilar: "Network & Infra", tower: "EPINI" },
  "Network Priority": { pilar: "Network & Infra", tower: "EPINI" },
  "Direct Peering": { pilar: "Network & Infra", tower: "EPINI" },
  "Repeater Picotel": { pilar: "Network & Infra", tower: "EPINI" },
  IaaS: { pilar: "Network & Infra", tower: "EPINI" },
  PVR: { pilar: "Network & Infra", tower: "EPINI" },
  Femtocell: { pilar: "Network & Infra", tower: "EPINI" },

  // IoT Industrial
  Intank: { pilar: "IoT Industrial", tower: "EPINI" },
  "Fuel Management System": { pilar: "IoT Industrial", tower: "EPINI" },
  "Smart Lighting": { pilar: "IoT Industrial", tower: "EPINI" },
  "Smart Meter": { pilar: "IoT Industrial", tower: "EPINI" },
  "Connected Mine": { pilar: "IoT Industrial", tower: "EPINI" },
  "Asset Performance Management": { pilar: "IoT Industrial", tower: "EPINI" },
  "Smart Dashboard": { pilar: "IoT Industrial", tower: "EPINI" },
  "Vessel Monitoring System": { pilar: "IoT Industrial", tower: "EPINI" },
  "Tap on Bus": { pilar: "IoT Industrial", tower: "EPINI" },
  "IoT Envion": { pilar: "IoT Industrial", tower: "EPINI" },

  // Advance Communication
  "IoT Control Center": { pilar: "Advance Communication", tower: "EPINI" },
  Soundbox: { pilar: "Advance Communication", tower: "EPINI" },
  "Connected Worker": { pilar: "Advance Communication", tower: "EPINI" },
  LinkCar: { pilar: "Advance Communication", tower: "EPINI" },
  "Modem Router Industrial": { pilar: "Advance Communication", tower: "EPINI" },
  EDC: { pilar: "Advance Communication", tower: "EPINI" },

  // Mobile Security & Emerging
  "Mobile Device Management (MDM)": { pilar: "Mobile Security & Emerging", tower: "ESEM" },
  "Mobile Endpoint Protection (MEP)": { pilar: "Mobile Security & Emerging", tower: "ESEM" },
  "Telkomsel Guard": { pilar: "Mobile Security & Emerging", tower: "ESEM" },
  "Kaspersky Standard Protection": { pilar: "Mobile Security & Emerging", tower: "ESEM" },
  "TEMS - Spam Call Protection": { pilar: "Mobile Security & Emerging", tower: "ESEM" },

  // UCC and Business Productivity
  "CloudX Hub": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "nGage Robocall API": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Attendance Apps": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "CloudX Communication": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Field Force Management": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Smart Tax": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Robotic Process Automation (RPA)": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Custom POS": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Enterprise Call Solution": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Office 365": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Telkomsel Marketing Automation (TMA) / CEP": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "HCM Suites (Modular Apps)": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Smart Voice Comm (SVC)": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "nGage Number Masking": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "Touch to Talk": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "nGage Omnichannel": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "nGage Video API": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  "AVA - AI Virtual Assistant": { pilar: "UCC and Business Productivity", tower: "ESEM" },
  SAVIA: { pilar: "UCC and Business Productivity", tower: "ESEM" },
};

export const PRESALES_LOBS = [
  "Financial Institutions",
  "ICT, Retail & Business Services",
  "Manufacturing, Transportation, Logistic & Infrastructure",
  "Central Government, Hospitality & Education",
  "Resource & Energy",
  "Local Government, Hospitality & Education",
];

export const TELKOM_SI_OPTIONS = ["Telkom", "SI"];

export const TELKOM_NAMES = [
  "Dicky Nurachman",
  "Hasudungan Irwan",
  "Win Aufa Fidhuha",
  "Diatri Nimas Arum",
  "Grahito Amerto",
  "Ronald Sambira",
  "Mariance Sibuea",
  "Iwan Prasetyo"
];

export const AM_NAMES = [
  "Abdul Halim",
  "Achmad Syafrian",
  "Adi Riswanto",
  "Adie Krisnanto",
  "Adisty Faristania",
  "Adnan Hardjo Sumantri Sipayung",
  "Adwinrizal Hilmansyah",
  "Aji Prasetio Suanza",
  "Akmal Hidayat",
  "Alan Tri Wijaya",
  "Albert S M Silalahi",
  "Alitha Primaiswari Pratiwi",
  "Ananda Salsabilla",
  "Andhi Prabowo",
  "Andi Muhammad Fachri Chaeruddin",
  "Andi Muhammad Tauhid Aplatun",
  "Andrie Yudhanto Irawan",
  "Angela Merici Diah Larasati",
  "Angga Prasetyo",
  "Anggi Arief Wibowo",
  "Anindito Agung Sampurno",
  "Annisa Rezki Arief",
  "Arfian Dwiaditya Tjandra",
  "Arie Priambudi",
  "Arief Rahman Hakim",
  "Aries Sandipala",
  "Arini Musfirah",
  "Asep Kurniawan",
  "Asep Suherman",
  "Asmin",
  "Astri Anggraeny Nurhidayati",
  "Aulia Yusrani Medina",
  "Azis Cahyono",
  "Bayu Putut Aribowo",
  "Bayu Wicaksono",
  "Bela Aksapratama",
  "Bhima Wicaksana Sigalayan",
  "Bonita Losparingi",
  "Boyke Darmawan Sutarman",
  "Cahya Perbawa Aji",
  "Charles P Simanjuntak",
  "Darmiasih",
  "Dewi Ayu Mulyasari",
  "Dian Ekasari",
  "Dilly Ramadhan Nurrahmat",
  "Doni Laksono",
  "Dwi Antika Oktarini",
  "Eries Nandar",
  "Ernest Lombok P Siagian",
  "Eva Mariani Tambunan",
  "Fadli Febriandi",
  "Fahmy",
  "Fahreza",
  "Fajrin Umar",
  "Fakhrurrazi Suzli",
  "Farhan Fajri",
  "Farid Nahrir",
  "Febianto Saputro",
  "Felipe Ferari",
  "Ferdian Ramadhan Suria",
  "Firman Canra",
  "Gilang Prasada Putra",
  "Gioliano Putra",
  "Giovani Fredrik",
  "Gohima Talenta",
  "Haqi Pratama Basili",
  "Hardiansyah",
  "Harliano Adelsa",
  "Harvianto",
  "Hatara Trirama",
  "Hayatin Nusur",
  "Herdin Hasibuan",
  "Hifdzuddin Aziz",
  "Himawan Fajar Rahmansyah",
  "I Gusti Gde Ngurah Gowinda K",
  "Ibana Sokala Hutasoit",
  "Ichsan Feriansyah",
  "Ida Bagus Wisnu Singarsa",
  "Ika Ambarsari",
  "Indra Zulfikar",
  "Ira Riasari H",
  "Irfan Jauhan",
  "Isnaendera Yusminanda",
  "Jonathan",
  "Kevin Yuan Putra Dinata",
  "Laina Tusifa",
  "Lucky Kurniawan",
  "M. Fiqransyah",
  "M. Prima Putra",
  "Makki Fauzi",
  "Marlina Kusumawati",
  "Mihror Dendi Prastyo",
  "Miyarno",
  "Mochamad Arif Rahman",
  "Mochamad Giri Akbar",
  "Mohamad Rizky Oktava",
  "Muhammad Afif Kurniawan",
  "Muhammad Arfidh",
  "Muhammad Gevani",
  "Muhammad Ikhsan Aulia",
  "Muhammad Jatra",
  "Muhammad Reza Suerman",
  "Muhammad Rifky Refinaldi",
  "Muhammad Rizky Darmawan",
  "Muhammad Yusup Jaya Saputra",
  "Musa Sembiring",
  "Nabila Rizka Febrina",
  "Nasita Ratih Damayanti",
  "Ni Komang Meigawati",
  "Novianto Priharyono",
  "Nur Rahmat Abadi Barus",
  "Nurcholis",
  "Okita Amanda Oktora",
  "Pandu Adi Setiawan",
  "Patria Kurnia Gati",
  "Praditya Aryatama",
  "Priyangga Arya Sadewa",
  "Puji Gita Utami",
  "Raditiya Apriyanto Ramadhan",
  "Ragu Rahman",
  "Randi Andaru Putra",
  "Rangga Fajar Aliyanto",
  "Rangga Putera Perdana",
  "Rendy Sofhandani",
  "Revin Raisky Nurfadly",
  "Ria Yunita Yoranty",
  "Rian Adi Tama",
  "Rico",
  "Ridho Eka Saputra",
  "Ridho Winanda",
  "Ridwan Mohammad Nasrun",
  "Risha Fadila Syafrizal",
  "Risky Septianda",
  "Riza Ananda Santoso",
  "Robby Suhendra",
  "Rohmanuddin Setiawan",
  "Rudi Hermawan Siregar",
  "Rudi Muslaini",
  "Ruruh Hergitarestu",
  "Satya Sri Nugroho",
  "Satya Wardhana",
  "Serlita Djufry",
  "Setianto Basuki",
  "Sherena Varenska Nikita",
  "Sigit Nur Rohman",
  "Sony Widjaya",
  "Sri Rahayu",
  "Sumali",
  "Syaeful Alam",
  "Syafruddin A",
  "Teddy Bertrand",
  "Titus Siswandono",
  "Toto Budi Prasetyo",
  "Tri Karya Ibnu Sina",
  "Viki Suriadinata",
  "Viola Andrea Megumi",
  "Widdy Haryadi",
  "Widyo Bayuaji",
  "Winardy Wahab Mailangkay",
  "Windy Herlin Ali",
  "Winny Sri Adriani",
  "Wirangga Luvianca",
  "Wisnu Dharma Eko Saputro",
  "Wiwiek Wijayanti Silalahi",
  "Yana Mulyana",
  "Yani Herawati",
  "Yeanni Kussyuwarni",
  "Yogi Adi Permadi",
  "Yulius Otoluwa",
];

export interface RevPlan {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export interface PipelineEntry {
  id: string;
  no: number;
  accountName: string;
  opportunityName: string;
  stage: Stage;
  productFamily: string;
  pilar: string;
  tower: string;
  seName: string;
  presalesLoB: string;
  amName: string;
  closeMonth: string;
  contractPeriod: number | "OTC";
  contractValue: number;
  revPlan: RevPlan;
  telkomSI: string;
  siName: string | null;
  telkomName?: string | null;
  bespokeProject: boolean;
  projectId: string | null;
  poReleaseDate: string | null;
  poReleaseNumber: string | null;
  attachmentUrl: string | null;
  userId?: string;
  otcEntries?: Array<{ closeMonth: string; amount: number }>;
}

export interface DashboardStats {
  totalPipeline: number;
  closedWon: number;
  inProgress: number;
  avgDealSize: number;
  targetAchievement: number;
  monthlyTarget: number;
}

export interface QuarterlyRevenue {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

// Calculate quarterly and annual revenue from monthly plan
export const calculateRevenueSummary = (revPlan: RevPlan) => {
  const q1 = revPlan.jan + revPlan.feb + revPlan.mar;
  const q2 = revPlan.apr + revPlan.may + revPlan.jun;
  const q3 = revPlan.jul + revPlan.aug + revPlan.sep;
  const q4 = revPlan.oct + revPlan.nov + revPlan.dec;
  const h1 = q1 + q2;
  const h2 = q3 + q4;
  const fy = h1 + h2;

  return { q1, q2, q3, q4, h1, h2, fy };
};
