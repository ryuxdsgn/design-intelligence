-- Seed ryux: paket + 2 flow contoh (Indonesia), semua 'published' agar terbaca lewat RLS.
-- Cermin data awal di packages/core/src/data.ts. Akun/billing kosong (butuh auth.users nyata).

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

insert into apps (id, name, category, platform, publisher, status) values
  ('app_warung', 'Warung Contoh', 'fnb', 'android', 'Contoh', 'published'),
  ('app_toko', 'Toko Contoh', 'ecommerce', 'android', 'Contoh', 'published');

insert into app_versions (id, app_id, version, captured_at, device) values
  ('ver_warung_340', 'app_warung', '3.4.0', '2026-09-10', 'Android'),
  ('ver_toko_812', 'app_toko', '8.1.2', '2026-09-12', 'Android');

insert into flows (id, app_version_id, flow_type, title, step_count, status) values
  ('flw_demo_checkout', 'ver_warung_340', 'cart-checkout', 'Checkout QRIS', 1, 'published'),
  ('flw_demo_onboarding', 'ver_toko_812', 'onboarding', 'Onboarding OTP', 1, 'published');

insert into screens (id, flow_id, position, image_path, width, height, ocr_text, status) values
  ('scr_demo_001', 'flw_demo_checkout', 3, 'signed/scr_demo_001', 1080, 2340,
   'Pilih metode pembayaran · QRIS · Virtual Account BCA', 'published'),
  ('scr_demo_002', 'flw_demo_onboarding', 1, 'signed/scr_demo_002', 1080, 2340,
   'Kirim kode lewat WhatsApp · Kirim ulang dalam 60 detik', 'published');

insert into screen_tags (screen_id, tag_id, source, confidence) values
  ('scr_demo_001', 'tag_pmp', 'human', 1),
  ('scr_demo_001', 'tag_qris', 'human', 1),
  ('scr_demo_001', 'tag_va', 'human', 1),
  ('scr_demo_001', 'tag_bottomsheet', 'human', 1),
  ('scr_demo_002', 'tag_otpwa', 'human', 1),
  ('scr_demo_002', 'tag_otpinput', 'human', 1);

insert into designer_notes (id, target_type, target_id, why_it_works, weaknesses, local_context, author) values
  ('note_001', 'screen', 'scr_demo_001',
   'QRIS diletakkan paling atas karena paling sering dipakai untuk nominal kecil; VA dikelompokkan per bank.',
   'Biaya admin baru terlihat setelah metode dipilih.', 'Pengguna warung, nominal kecil', 'Redho'),
  ('note_002', 'screen', 'scr_demo_002',
   'Pengguna bisa memilih OTP lewat WhatsApp, yang lebih andal daripada SMS.',
   'Hitung mundur kirim ulang terlalu lama (60 detik).', 'Onboarding e-commerce', 'Redho');

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

insert into observations (id, target_type, target_id, dimension, statement, label, source, status) values
  ('obs_demo_001_a', 'screen', 'scr_demo_001', 'hierarchy', 'QRIS is listed first, above the virtual account group.', 'observed', 'human', 'published'),
  ('obs_demo_001_b', 'screen', 'scr_demo_001', 'components', 'Payment methods sit in a bottom sheet, grouped by type.', 'observed', 'human', 'published'),
  ('obs_demo_002_a', 'screen', 'scr_demo_002', 'interaction', 'The OTP channel can be switched to WhatsApp before sending.', 'observed', 'human', 'published');
