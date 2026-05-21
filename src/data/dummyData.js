export const currentAdmin = {
  id: "admin_001",
  name: "Admin Informatika",
  email: "admin.if@its.ac.id",
  role: "admin",

  universityId: "its",
  universityName: "Institut Teknologi Sepuluh Nopember",
  universityShortName: "ITS",

  departmentId: "informatics",
  departmentName: "Informatika",
};

export const dummyUniversitas = [
    {
    id: "its",
    name: "Institut Teknologi Sepuluh Nopember",
    shortName: "ITS",
    city: "Surabaya",
    status: "active"
    },
    {
        id: "ugm",
        name: "Universitas Gadjah Mada",
        shortName: "UGM",
        city: "Yogyakarta",
        status: "active"
    },
    {
        id: "unair",
        name: "Universitas Airlangga",
        shortName: "UNAIR",
        city: "Surabaya",
        status: "active"
    },
    {
        id: "ui",
        name: "Universitas Indonesia",
        shortName: "UI",
        city: "Depok",
        status: "active"
    },
    {
        id: "itb",
        name: "Institut Teknologi Bandung",
        shortName: "ITB",
        city: "Bandung",
        status: "active"
    }
];

export const dummyDepartments = [
  {
    id: "informatics",
    universityId: "its",
    name: "Informatika",
    adminId: "admin_001",
    status: "active",
  },
  {
    id: "information-systems",
    universityId: "its",
    name: "Sistem Informasi",
    adminId: null,
    status: "active",
  },
  {
    id: "electrical-engineering",
    universityId: "its",
    name: "Teknik Elektro",
    adminId: null,
    status: "active",
  },
  {
    id: "computer-science",
    universityId: "ugm",
    name: "Ilmu Komputer",
    adminId: null,
    status: "active",
  },
];

export const dummyBuildings = [
  {
    id: "building_001",
    name: "Gedung Informatika",
    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-20",
  },
  {
    id: "building_002",
    name: "Gedung Riset Informatika",
    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-20",
  },
  {
    id: "building_003",
    name: "Gedung Sistem Informasi",
    universityId: "its",
    departmentId: "information-systems",
    createdAt: "2026-05-20",
  },
];

export const dummyRooms = [
  {
    id: "room_001",
    name: "IF-105",
    buildingId: "building_001",
    floor: 1,
    type: "Ruang Kelas",
    universityId: "its",
    departmentId: "informatics",
  },
  {
    id: "room_002",
    name: "Lab Pemrograman",
    buildingId: "building_001",
    floor: 2,
    type: "Laboratorium",
    universityId: "its",
    departmentId: "informatics",
  },
  {
    id: "room_003",
    name: "SI-201",
    buildingId: "building_003",
    floor: 2,
    type: "Ruang Kelas",
    universityId: "its",
    departmentId: "information-systems",
  },
];

export const dummyReports = [
  {
    id: "report_001",
    title: "AC bocor di IF-105",
    description:
      "Air AC menetes ke meja mahasiswa dan membuat kelas kurang nyaman.",
    category: "Facility",
    status: "pending",
    buildingId: "building_001",
    roomId: "room_001",
    reportedBy: "Budi Santoso",
    imageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    adminNote: "",
    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-20",
  },
  {
    id: "report_002",
    title: "Lampu kelas menyala terus",
    description:
      "Lampu di Lab Pemrograman tetap menyala meskipun ruangan kosong.",
    category: "Energy",
    status: "in_progress",
    buildingId: "building_001",
    roomId: "room_002",
    reportedBy: "Siti Aminah",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    adminNote: "Sedang dicek oleh petugas fasilitas.",
    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-19",
  },
  {
    id: "report_003",
    title: "Tempat sampah penuh",
    description:
      "Tempat sampah di depan gedung sudah penuh dan perlu dibersihkan.",
    category: "Waste",
    status: "completed",
    buildingId: "building_002",
    roomId: null,
    reportedBy: "Raka Pratama",
    imageUrl:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    adminNote: "Sudah dibersihkan oleh petugas kebersihan.",
    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-18",
  },
  {
    id: "report_004",
    title: "Kipas ruangan rusak",
    description: "Kipas di ruang SI-201 tidak bisa menyala.",
    category: "Facility",
    status: "pending",
    buildingId: "building_003",
    roomId: "room_003",
    reportedBy: "Dewi Lestari",
    imageUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
    adminNote: "",
    universityId: "its",
    departmentId: "information-systems",
    createdAt: "2026-05-18",
  },
];

export const dummyChallenges = [
  {
    id: "challenge_001",
    title: "Bawa Tumbler",
    description: "Gunakan tumbler pribadi untuk mengurangi sampah plastik.",
    points: 20,
    status: "active",

    proofRequired: true,
    proofType: "photo",
    quantityRequired: null,

    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-20",
  },
  {
    id: "challenge_002",
    title: "Matikan Lampu Setelah Kelas",
    description: "Pastikan lampu dan AC dimatikan setelah kelas selesai.",
    points: 15,
    status: "inactive",

    proofRequired: true,
    proofType: "photo",
    quantityRequired: null,

    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-19",
  },
  {
    id: "challenge_003",
    title: "Setor 5 Botol Plastik",
    description:
      "Kumpulkan dan setor minimal 5 botol plastik ke bank sampah kampus.",
    points: 30,
    status: "active",

    proofRequired: true,
    proofType: "photo_quantity",
    quantityRequired: 5,

    universityId: "its",
    departmentId: "informatics",
    createdAt: "2026-05-18",
  },
  {
    id: "challenge_004",
    title: "Bawa Kotak Makan",
    description: "Gunakan kotak makan pribadi untuk mengurangi sampah makanan.",
    points: 25,
    status: "active",

    proofRequired: true,
    proofType: "photo",
    quantityRequired: null,

    universityId: "its",
    departmentId: "information-systems",
    createdAt: "2026-05-19",
  },
];

export const dummyEvents = [
  {
    id: "event_001",
    title: "Clean Up Campus ITS",
    description: "Kegiatan bersih-bersih area kampus bersama seluruh mahasiswa ITS.",
    location: "Taman Alumni ITS",
    date: "2026-06-05",
    quota: 100,
    registeredCount: 3,
    status: "active",
    universityId: "its",
    scope: "university",
    createdBy: "admin_001",
    createdByDepartmentId: "informatics",
    createdAt: "2026-05-20",
  },
  {
    id: "event_002",
    title: "Green Volunteer Day",
    description: "Aksi relawan hijau untuk meningkatkan kesadaran lingkungan kampus.",
    location: "Perpustakaan ITS",
    date: "2026-06-12",
    quota: 50,
    registeredCount: 2,
    status: "completed",
    universityId: "its",
    scope: "university",
    createdBy: "admin_001",
    createdByDepartmentId: "informatics",
    createdAt: "2026-05-18",
  },
  {
    id: "event_003",
    title: "UGM Sustainability Fair",
    description: "Pameran inovasi keberlanjutan untuk mahasiswa UGM.",
    location: "Grha Sabha Pramana",
    date: "2026-06-20",
    quota: 80,
    registeredCount: 1,
    status: "active",
    universityId: "ugm",
    scope: "university",
    createdBy: "admin_ugm_001",
    createdByDepartmentId: "computer-science",
    createdAt: "2026-05-18",
  },
];
export const dummyEventParticipants = [
  {
    id: "participant_001",
    eventId: "event_001",
    studentId: "student_001",
    studentName: "Kukuh Putra",
    studentEmail: "kukuh@student.its.ac.id",
    departmentName: "Informatika",
    universityId: "its",
    registeredAt: "2026-05-20",
  },
  {
    id: "participant_002",
    eventId: "event_001",
    studentId: "student_002",
    studentName: "Budi Santoso",
    studentEmail: "budi@student.its.ac.id",
    departmentName: "Sistem Informasi",
    universityId: "its",
    registeredAt: "2026-05-20",
  },
  {
    id: "participant_003",
    eventId: "event_001",
    studentId: "student_003",
    studentName: "Siti Aminah",
    studentEmail: "siti@student.its.ac.id",
    departmentName: "Teknik Elektro",
    universityId: "its",
    registeredAt: "2026-05-21",
  },
  {
    id: "participant_004",
    eventId: "event_002",
    studentId: "student_004",
    studentName: "Raka Pratama",
    studentEmail: "raka@student.its.ac.id",
    departmentName: "Informatika",
    universityId: "its",
    registeredAt: "2026-05-18",
  },
  {
    id: "participant_005",
    eventId: "event_002",
    studentId: "student_005",
    studentName: "Dewi Lestari",
    studentEmail: "dewi@student.its.ac.id",
    departmentName: "Sistem Informasi",
    universityId: "its",
    registeredAt: "2026-05-18",
  },
  {
    id: "participant_006",
    eventId: "event_003",
    studentId: "student_006",
    studentName: "Andi Wijaya",
    studentEmail: "andi@student.ugm.ac.id",
    departmentName: "Ilmu Komputer",
    universityId: "ugm",
    registeredAt: "2026-05-18",
  },
];

export const dummyChallengeSubmissions = [
  {
    id: "submission_001",
    challengeId: "challenge_003",
    studentId: "student_001",
    studentName: "Kukuh Putra",
    studentEmail: "kukuh@student.its.ac.id",
    proofImageUrl:
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80",
    submittedQuantity: 5,
    note: "Saya setor 5 botol plastik di bank sampah Gedung Informatika.",
    status: "submitted",
    pointsAwarded: 0,
    adminNote: "",
    universityId: "its",
    departmentId: "informatics",
    submittedAt: "2026-05-20",
  },
  {
    id: "submission_002",
    challengeId: "challenge_003",
    studentId: "student_002",
    studentName: "Budi Santoso",
    studentEmail: "budi@student.its.ac.id",
    proofImageUrl:
      "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=800&q=80",
    submittedQuantity: 3,
    note: "Saya baru mengumpulkan 3 botol plastik.",
    status: "submitted",
    pointsAwarded: 0,
    adminNote: "",
    universityId: "its",
    departmentId: "informatics",
    submittedAt: "2026-05-20",
  },
  {
    id: "submission_003",
    challengeId: "challenge_001",
    studentId: "student_003",
    studentName: "Siti Aminah",
    studentEmail: "siti@student.its.ac.id",
    proofImageUrl:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
    submittedQuantity: null,
    note: "Saya membawa tumbler saat kuliah hari ini.",
    status: "approved",
    pointsAwarded: 20,
    adminNote: "Bukti sudah sesuai.",
    universityId: "its",
    departmentId: "informatics",
    submittedAt: "2026-05-19",
  },
];