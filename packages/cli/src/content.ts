// Konten ryux-rules yang dibundel bersama CLI. Karya orisinal ryux.design (lisensi MIT):
// ditulis dari nol berdasarkan standar & riset publik (10 heuristik Nielsen 1994, riset UX
// Nielsen Norman Group, WCAG 2.2, Apple HIG, Material). Sumber lengkap: docs/design-rules.md.

// Semua aturan RX. Empat lapisan desain: RX-C filter, RX-H heuristik, RX-N pedoman NNGroup, RX-L
// lokal. Plus RX-K: add-on kode bersih (concern ryux-code), di luar gate desain inti.
export const RULES: Record<string, string> = {
  "RX-C-01": "Setiap keputusan desain merujuk minimal satu screen_id nyata sebagai bukti.",
  "RX-C-02": "Hindari tata letak template generik tanpa alasan konteks.",
  "RX-C-03": "Tanpa angka atau statistik tanpa sumber nyata; kosong lebih baik daripada mengarang.",
  "RX-C-04": "Tanpa testimonial, nama, atau foto orang yang dikarang.",
  "RX-C-05": "Placeholder ditandai jelas ([DATA NYATA], [LOGO]), tidak menyamar sebagai final.",
  "RX-C-06": "Copy spesifik pada tindakan dan manfaat; hindari klise kosong dan CTA generik.",
  "RX-C-07": "Palet warna terbatas: 2 sampai 3 warna inti + 1 aksen.",
  "RX-C-08": "Skala spasi dan tipografi konsisten (mis. kelipatan 4 atau 8).",
  "RX-C-09": "Catatan desainer ditulis manusia, bukan digenerate AI.",
  "RX-H-01": "Visibilitas status sistem: proses lebih dari 1 detik menampilkan status + estimasi.",
  "RX-H-02": "Kecocokan dengan dunia nyata: bahasa dan urutan sesuai kebiasaan pengguna.",
  "RX-H-03": "Kendali & kebebasan: sediakan batal, undo, dan pintu keluar yang jelas.",
  "RX-H-04": "Konsistensi & standar: ikuti konvensi platform dan pola internal.",
  "RX-H-05": "Pencegahan kesalahan: konfirmasi aksi merusak, validasi sebelum kirim.",
  "RX-H-06": "Kenali bukan mengingat: tampilkan pilihan dan konteks, kurangi beban ingatan.",
  "RX-H-07": "Fleksibel & efisien: sediakan jalan pintas untuk pengguna mahir.",
  "RX-H-08": "Estetika & minimalis: setiap elemen punya alasan, utamakan info relevan.",
  "RX-H-09": "Pemulihan error: pesan jelas, sebut sebab, beri jalan keluar konkret.",
  "RX-H-10": "Bantuan kontekstual singkat di titik pemakaian.",
  "RX-H-11": "Kontras WCAG AA: teks biasa >= 4.5:1, teks besar >= 3:1.",
  "RX-H-12": "Teks body >= 12px; target sentuh >= 44x44px.",
  "RX-H-13": "Fokus keyboard terlihat; urutan fokus logis.",
  "RX-H-14": "State lengkap (loading/kosong/error/sukses); tanpa overflow; hormati safe area.",
  "RX-N-01": "Umpan balik sesuai batas waktu respons: > 1 dtk tampilkan loading, > 10 dtk progres + estimasi.",
  "RX-N-02": "Form satu kolom, label di atas field (bukan hanya di dalam field).",
  "RX-N-03": "Validasi inline dan pertahankan input pengguna saat error.",
  "RX-N-04": "Minimalkan field; tandai wajib/opsional jelas; default masuk akal.",
  "RX-N-05": "Pesan error sebut masalah + solusi, dekat lokasi, jangan salahkan pengguna.",
  "RX-N-06": "Biaya total (ongkir, admin, pajak) transparan sebelum pengguna berkomitmen.",
  "RX-N-07": "Ringkasan pesanan yang bisa diperiksa + indikator progres untuk alur bertahap.",
  "RX-N-08": "Minim friksi masuk: dukung jalur tamu atau login cepat.",
  "RX-N-09": "Kepercayaan jujur: tanpa urgensi atau scarcity palsu; sinyal keamanan nyata.",
  "RX-N-10": "Input mobile tepat: keyboard sesuai tipe (numerik untuk nominal/OTP), autofill.",
  "RX-N-11": "Cegah kesalahan: konfirmasi aksi tak-terbalikkan (hapus, bayar) + undo bila bisa.",
  "RX-N-12": "Wayfinding: judul jelas 'di mana saya', tombol kembali/batal selalu ada.",
  "RX-L-01": "QRIS: nominal dan nama merchant jelas sebelum konfirmasi.",
  "RX-L-02": "Virtual account: tombol salin nomor, batas waktu bayar, panduan per bank.",
  "RX-L-03": "OTP: tawarkan kanal (SMS atau WhatsApp); hitung mundur kirim ulang wajar.",
  "RX-L-04": "Biaya (admin, ongkir, pajak) terlihat sebelum pengguna berkomitmen.",
  "RX-L-05": "Alamat: dukung patokan dan detail rumah, bukan hanya pin peta.",
  "RX-L-06": "Nominal uang memakai format Rupiah lokal (Rp + titik ribuan).",
  "RX-L-07": "Copy Bahasa Indonesia wajar, bukan terjemahan kaku dari Inggris.",
  "RX-L-08": "Rujukan dan pola diambil dari aplikasi Indonesia nyata.",
  "RX-L-09": "Paylater atau cicilan: tampilkan limit, tenor, dan total biaya jelas.",
  "RX-L-10": "e-KYC: panduan bingkai dan alasan pengambilan data sebelum kamera dibuka.",
  "RX-K-01": "Komentar menjelaskan alasan (kenapa), bukan mengulang apa yang sudah jelas dari kode.",
  "RX-K-02": "Nama variabel dan fungsi spesifik serta bermakna; hindari data, temp, helper, manager tanpa konteks.",
  "RX-K-03": "Hapus kode mati, impor tak terpakai, dan blok ter-comment; jangan tinggalkan TODO kosong.",
  "RX-K-04": "Ikuti gaya berkas di sekitarnya (format, penamaan, pola); jangan memaksakan gaya baru.",
  "RX-K-05": "Hindari abstraksi dan konfigurasi berlebih untuk kebutuhan yang belum ada.",
  "RX-K-06": "Tangani error dengan pesan yang bisa ditindak; jangan menelan error diam-diam.",
};

// Aturan inti — selalu terpasang (bukti + kejujuran konten).
export const CORE_RULES = ["RX-C-01", "RX-C-03", "RX-C-04", "RX-C-05", "RX-C-09"];

export interface Concern {
  id: string;
  label: string;
  hint: string;
  rules: string[];
}

// Concern (seperti antislop: ui / copywriting / dst) yang memetakan ke aturan RX.
export const CONCERNS: Concern[] = [
  {
    id: "ui",
    label: "UI & visual",
    hint: "pola generik, palet, spasi, konsistensi, state",
    rules: ["RX-C-02", "RX-C-07", "RX-C-08", "RX-H-04", "RX-H-08", "RX-H-14", "RX-N-12"],
  },
  {
    id: "copy",
    label: "Copywriting Indonesia",
    hint: "Bahasa wajar, Rupiah, pesan error, CTA",
    rules: ["RX-C-06", "RX-L-06", "RX-L-07", "RX-H-09", "RX-N-05"],
  },
  {
    id: "a11y",
    label: "Aksesibilitas",
    hint: "kontras, ukuran teks, target sentuh, fokus, state",
    rules: ["RX-H-11", "RX-H-12", "RX-H-13", "RX-H-14"],
  },
  {
    id: "ux",
    label: "Pola UX terapan (NNGroup)",
    hint: "form, error, checkout, kepercayaan, waktu-respons",
    rules: ["RX-N-01", "RX-N-02", "RX-N-03", "RX-N-05", "RX-N-06", "RX-N-07", "RX-N-09", "RX-N-11"],
  },
  {
    id: "local",
    label: "Pola Indonesia",
    hint: "QRIS, VA, OTP, biaya, alamat, paylater, e-KYC",
    rules: ["RX-L-01", "RX-L-02", "RX-L-03", "RX-L-04", "RX-L-05", "RX-L-09", "RX-L-10"],
  },
  {
    id: "code",
    label: "Kode bersih",
    hint: "komentar jujur, penamaan bermakna, tanpa kode mati, gaya konsisten",
    rules: ["RX-K-01", "RX-K-02", "RX-K-03", "RX-K-04", "RX-K-05", "RX-K-06"],
  },
];

export const ALL_CONCERN_IDS = CONCERNS.map((c) => c.id);
export const RULES_VERSION = "0.2.0";
export const MCP_NAME = "ryux";
export const MCP_URL = "https://mcp.ryux.design/mcp";
export const MCP_ADD_CMD = `claude mcp add --transport http ${MCP_NAME} ${MCP_URL}`;
export const MARK_START = "<!-- ryux-rules:start -->";
export const MARK_END = "<!-- ryux-rules:end -->";
