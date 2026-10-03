// Data contoh untuk mencoba tool ryux secara lokal.
// Nanti diganti query ke Supabase (hanya konten berstatus "published").

export type Screen = {
  screen_id: string;
  app: { name: string; category: string; platform?: string };
  version: string;
  captured_at: string;
  flow: { id: string; type: string; position: number };
  tags: string[];
  image_url: string;
  designer_notes: { why_it_works: string; weaknesses: string };
  reviewed: boolean;
  untrusted_text: { ocr: string };
  /** What is visible on the screen, confirmed by a person (dimension: layout, hierarchy, ...). */
  observations?: Observation[];
};

export type Observation = { dimension: string; label: "measured" | "observed" | "inferred"; statement: string };

/** A pattern seen in real apps: an observed pattern with where it was seen, never a best practice. */
export type LocalPattern = {
  name: string;
  scope?: "local" | "general";
  description: string;
  user_behavior_notes: string;
  useful_when?: string;
  risk?: string;
  context?: string[];
  /** screen_ids of published screens tagged with this pattern (derived, not typed). */
  example_screen_ids: string[];
  observed_apps?: string[];
};

export const SAMPLE_SCREENS: Screen[] = [
  {
    screen_id: "scr_demo_001",
    app: { name: "Warung Contoh", category: "fnb" },
    version: "3.4.0",
    captured_at: "2026-09-10",
    flow: { id: "flw_demo_checkout", type: "cart-checkout", position: 3 },
    tags: ["payment-method-picker", "qris", "virtual-account", "bottom-sheet"],
    image_url: "https://example.com/signed/scr_demo_001?exp=900",
    designer_notes: {
      why_it_works:
        "QRIS diletakkan paling atas karena paling sering dipakai untuk nominal kecil; VA dikelompokkan per bank.",
      weaknesses: "Biaya admin baru terlihat setelah metode dipilih.",
    },
    reviewed: true,
    untrusted_text: { ocr: "Pilih metode pembayaran · QRIS · Virtual Account BCA" },
    observations: [
      { dimension: "hierarchy", label: "observed", statement: "QRIS is listed first, above the virtual account group." },
      { dimension: "components", label: "observed", statement: "Payment methods sit in a bottom sheet, grouped by type." },
    ],
  },
  {
    screen_id: "scr_demo_002",
    app: { name: "Toko Contoh", category: "ecommerce" },
    version: "8.1.2",
    captured_at: "2026-09-12",
    flow: { id: "flw_demo_onboarding", type: "onboarding", position: 1 },
    tags: ["otp-sms-wa", "otp-input"],
    image_url: "https://example.com/signed/scr_demo_002?exp=900",
    designer_notes: {
      why_it_works: "Pengguna bisa memilih OTP lewat WhatsApp, yang lebih andal daripada SMS.",
      weaknesses: "Hitung mundur kirim ulang terlalu lama (60 detik).",
    },
    reviewed: true,
    untrusted_text: { ocr: "Kirim kode lewat WhatsApp · Kirim ulang dalam 60 detik" },
    observations: [
      { dimension: "interaction", label: "observed", statement: "The OTP channel can be switched to WhatsApp before sending." },
    ],
  },
];

export const SAMPLE_LOCAL_PATTERNS: Record<string, LocalPattern> = {
  qris: {
    name: "QRIS",
    description: "Pembayaran dengan scan atau menampilkan kode QR standar nasional.",
    user_behavior_notes:
      "Dipakai luas untuk nominal kecil; pengguna berharap nominal dan nama merchant terlihat jelas sebelum konfirmasi.",
    scope: "local",
    useful_when: "Pembayaran tatap muka atau nominal kecil di merchant yang menerima QRIS.",
    risk: "Tanpa nominal dan nama merchant sebelum konfirmasi, pengguna bisa membayar ke pihak yang salah.",
    context: ["fnb", "ewallet", "pos-umkm"],
    example_screen_ids: ["scr_demo_001"],
    observed_apps: ["Warung Contoh"],
  },
  "virtual-account": {
    name: "Virtual account",
    description: "Transfer ke nomor rekening unik per transaksi.",
    user_behavior_notes: "Pengguna butuh tombol salin nomor, batas waktu bayar, dan panduan per bank.",
    scope: "local",
    useful_when: "Checkout online dengan pembayaran lewat transfer bank.",
    risk: "Batas waktu yang tersembunyi membuat pesanan batal tanpa disadari.",
    context: ["ecommerce"],
    example_screen_ids: ["scr_demo_001"],
    observed_apps: ["Warung Contoh"],
  },
};

// Sumber data aktif. Default = data contoh; apps/mcp memuat data Supabase lewat setData().
let currentScreens: Screen[] = SAMPLE_SCREENS;
let currentLocalPatterns: Record<string, LocalPattern> = SAMPLE_LOCAL_PATTERNS;

export function setData(screens: Screen[], patterns: Record<string, LocalPattern>): void {
  currentScreens = screens;
  currentLocalPatterns = patterns;
}

export function getScreens(): Screen[] {
  return currentScreens;
}

export function getLocalPatterns(): Record<string, LocalPattern> {
  return currentLocalPatterns;
}
