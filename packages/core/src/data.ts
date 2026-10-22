// Data source for the ryux tools. apps/mcp loads published RYUX Knowledge from Supabase through
// setData(); until then only the local patterns below (knowledge, with no screens as evidence) exist.

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

// No sample screens: a screen is evidence, so it only comes from published RYUX Knowledge (setData).
// Without Supabase the tools answer with no screens rather than with invented ones.
export const SAMPLE_SCREENS: Screen[] = [];

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
    example_screen_ids: [],
  },
  "virtual-account": {
    name: "Virtual account",
    description: "Transfer ke nomor rekening unik per transaksi.",
    user_behavior_notes: "Pengguna butuh tombol salin nomor, batas waktu bayar, dan panduan per bank.",
    scope: "local",
    useful_when: "Checkout online dengan pembayaran lewat transfer bank.",
    risk: "Batas waktu yang tersembunyi membuat pesanan batal tanpa disadari.",
    context: ["ecommerce"],
    example_screen_ids: [],
  },
};

// Active data. Default: no screens and the sample patterns; apps/mcp loads Supabase through setData().
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
