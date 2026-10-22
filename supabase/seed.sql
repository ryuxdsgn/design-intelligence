-- Seed ryux: paket, kosakata tag, dan pola lokal. Tanpa app, flow, atau screen contoh: screen hanya
-- datang dari bukti nyata lewat editor atau pipeline. Akun/billing kosong (butuh auth.users nyata).

insert into plans (id, slug, monthly_credits, price_idr, active) values
  ('plan_early', 'early_access', 1000, 0, true),
  ('plan_free', 'free', 50, 0, false),
  ('plan_pro', 'pro', 1500, null, false),
  ('plan_team', 'team', 0, null, false);

insert into plan_features (plan_id, feature_key, limit_value) values
  ('plan_early', 'image.full_res', 'false'),
  ('plan_pro', 'image.full_res', 'true'),
  ('plan_pro', 'tool.export_flow', 'true');

insert into tags (id, layer, slug, label) values
  ('tag_qris', 'pattern', 'qris', 'QRIS'),
  ('tag_va', 'pattern', 'virtual-account', 'Virtual account'),
  ('tag_otpwa', 'pattern', 'otp-sms-wa', 'OTP via SMS atau WhatsApp'),
  ('tag_pmp', 'component', 'payment-method-picker', 'Pemilih metode bayar'),
  ('tag_bottomsheet', 'component', 'bottom-sheet', 'Bottom sheet'),
  ('tag_otpinput', 'component', 'otp-input', 'Kolom OTP');

insert into patterns (id, slug, name, scope, description, user_behavior_notes, useful_when, risk, context) values
  ('lp_qris', 'qris', 'QRIS', 'local',
   'Pembayaran dengan scan atau menampilkan kode QR standar nasional.',
   'Dipakai luas untuk nominal kecil; pengguna berharap nominal dan nama merchant terlihat jelas sebelum konfirmasi.',
   'Pembayaran tatap muka atau nominal kecil di merchant yang menerima QRIS.',
   'Tanpa nominal dan nama merchant sebelum konfirmasi, pengguna bisa membayar ke pihak yang salah.',
   '{fnb,ewallet,pos-umkm}'),
  ('lp_va', 'virtual-account', 'Virtual account', 'local',
   'Transfer ke nomor rekening unik per transaksi.',
   'Pengguna butuh tombol salin nomor, batas waktu bayar, dan panduan per bank.',
   'Checkout online dengan pembayaran lewat transfer bank.',
   'Batas waktu yang tersembunyi membuat pesanan batal tanpa disadari.',
   '{ecommerce}');
