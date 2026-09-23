// Konten ryux-rules yang dibundel bersama CLI. Karya orisinal ryux.design (source-available):
// ditulis dari nol berdasarkan standar publik (10 heuristik Nielsen 1994, WCAG 2.2, Apple HIG,
// Material Design). Penomoran dan teks milik ryux. Sumber lengkap: docs/design-rules.md.

export type LayerId = "RX-C" | "RX-H" | "RX-L";

export interface Layer {
  id: LayerId;
  title: string;
  hint: string;
  rules: { id: string; text: string }[];
}

export const LAYERS: Record<LayerId, Layer> = {
  "RX-C": {
    id: "RX-C",
    title: "Filter anti slop",
    hint: "Pola UI generik, copy hambar, konten tak jujur",
    rules: [
      { id: "RX-C-01", text: "Setiap keputusan desain merujuk minimal satu screen_id nyata sebagai bukti." },
      { id: "RX-C-02", text: "Hindari tata letak template generik tanpa alasan konteks." },
      { id: "RX-C-03", text: "Tanpa angka atau statistik tanpa sumber nyata; kosong lebih baik daripada mengarang." },
      { id: "RX-C-04", text: "Tanpa testimonial, nama, atau foto orang yang dikarang." },
      { id: "RX-C-05", text: "Placeholder ditandai jelas ([DATA NYATA], [LOGO]), tidak menyamar sebagai final." },
      { id: "RX-C-06", text: "Copy spesifik pada tindakan dan manfaat; hindari klise kosong dan CTA generik." },
      { id: "RX-C-07", text: "Palet warna terbatas: 2 sampai 3 warna inti + 1 aksen." },
      { id: "RX-C-08", text: "Skala spasi dan tipografi konsisten (mis. kelipatan 4 atau 8)." },
      { id: "RX-C-09", text: "Catatan desainer ditulis manusia, bukan digenerate AI." },
    ],
  },
  "RX-H": {
    id: "RX-H",
    title: "Heuristik usability & aksesibilitas",
    hint: "10 heuristik Nielsen (1994) + WCAG",
    rules: [
      { id: "RX-H-01", text: "Visibilitas status sistem: proses lebih dari 1 detik menampilkan status + estimasi." },
      { id: "RX-H-02", text: "Kecocokan dengan dunia nyata: bahasa dan urutan sesuai kebiasaan pengguna." },
      { id: "RX-H-03", text: "Kendali & kebebasan: sediakan batal, undo, dan pintu keluar yang jelas." },
      { id: "RX-H-04", text: "Konsistensi & standar: ikuti konvensi platform dan pola internal." },
      { id: "RX-H-05", text: "Pencegahan kesalahan: konfirmasi aksi merusak, validasi sebelum kirim." },
      { id: "RX-H-06", text: "Kenali bukan mengingat: tampilkan pilihan dan konteks, kurangi beban ingatan." },
      { id: "RX-H-07", text: "Fleksibel & efisien: sediakan jalan pintas untuk pengguna mahir." },
      { id: "RX-H-08", text: "Estetika & minimalis: setiap elemen punya alasan, utamakan info relevan." },
      { id: "RX-H-09", text: "Pemulihan error: pesan jelas, sebut sebab, beri jalan keluar konkret." },
      { id: "RX-H-10", text: "Bantuan kontekstual singkat di titik pemakaian." },
      { id: "RX-H-11", text: "Kontras WCAG AA: teks biasa >= 4.5:1, teks besar >= 3:1." },
      { id: "RX-H-12", text: "Teks body >= 12px; target sentuh >= 44x44px." },
      { id: "RX-H-13", text: "Fokus keyboard terlihat; urutan fokus logis." },
      { id: "RX-H-14", text: "State lengkap (loading/kosong/error/sukses); tanpa overflow; hormati safe area." },
    ],
  },
  "RX-L": {
    id: "RX-L",
    title: "Pola & copy Indonesia",
    hint: "QRIS, VA, OTP, Rupiah, e-KYC",
    rules: [
      { id: "RX-L-01", text: "QRIS: nominal dan nama merchant jelas sebelum konfirmasi." },
      { id: "RX-L-02", text: "Virtual account: tombol salin nomor, batas waktu bayar, panduan per bank." },
      { id: "RX-L-03", text: "OTP: tawarkan kanal (SMS atau WhatsApp); hitung mundur kirim ulang wajar." },
      { id: "RX-L-04", text: "Biaya (admin, ongkir, pajak) terlihat sebelum pengguna berkomitmen." },
      { id: "RX-L-05", text: "Alamat: dukung patokan dan detail rumah, bukan hanya pin peta." },
      { id: "RX-L-06", text: "Nominal uang memakai format Rupiah lokal (Rp + titik ribuan)." },
      { id: "RX-L-07", text: "Copy Bahasa Indonesia wajar, bukan terjemahan kaku dari Inggris." },
      { id: "RX-L-08", text: "Rujukan dan pola diambil dari aplikasi Indonesia nyata." },
      { id: "RX-L-09", text: "Paylater atau cicilan: tampilkan limit, tenor, dan total biaya jelas." },
      { id: "RX-L-10", text: "e-KYC: panduan bingkai dan alasan pengambilan data sebelum kamera dibuka." },
    ],
  },
};

export const ALL_LAYERS: LayerId[] = ["RX-C", "RX-H", "RX-L"];
export const RULES_VERSION = "0.1.0";
export const MCP_NAME = "ryux";
export const MCP_URL = "https://mcp.ryux.design/mcp";
export const MCP_ADD_CMD = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;
export const MARK_START = "<!-- ryux-rules:start -->";
export const MARK_END = "<!-- ryux-rules:end -->";
