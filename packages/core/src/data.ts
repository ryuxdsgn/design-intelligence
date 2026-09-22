// Data contoh untuk mencoba tool ryux secara lokal.
// Nanti diganti query ke Supabase (hanya konten berstatus "published").

export type Screen = {
  screen_id: string;
  app: { name: string; category: string };
  version: string;
  captured_at: string;
  flow: { id: string; type: string; position: number };
  tags: string[];
  image_url: string;
  designer_notes: { why_it_works: string; weaknesses: string };
  reviewed: boolean;
  untrusted_text: { ocr: string };
};

export type LocalPattern = {
  name: string;
  description: string;
  user_behavior_notes: string;
  example_screen_ids: string[];
};

export const SCREENS: Screen[] = [
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
  },
];

export const LOCAL_PATTERNS: Record<string, LocalPattern> = {
  qris: {
    name: "QRIS",
    description: "Pembayaran dengan scan atau menampilkan kode QR standar nasional.",
    user_behavior_notes:
      "Dipakai luas untuk nominal kecil; pengguna berharap nominal dan nama merchant terlihat jelas sebelum konfirmasi.",
    example_screen_ids: ["scr_demo_001"],
  },
  "virtual-account": {
    name: "Virtual account",
    description: "Transfer ke nomor rekening unik per transaksi.",
    user_behavior_notes: "Pengguna butuh tombol salin nomor, batas waktu bayar, dan panduan per bank.",
    example_screen_ids: ["scr_demo_001"],
  },
};
