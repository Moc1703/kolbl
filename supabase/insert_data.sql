-- 1. Tambah kolom asal_mg
ALTER TABLE reports ADD COLUMN IF NOT EXISTS asal_mg VARCHAR(255);

-- 2. Insert data
INSERT INTO reports (
    created_at, 
    nama, 
    asal_mg, 
    kronologi, 
    instagram, 
    tiktok, 
    no_hp, 
    bukti_url, 
    pelapor_nama, 
    pelapor_kontak, 
    kategori,
    status
) VALUES 
-- 1. Grace Adelia
('2023-07-23 20:19:06', 'Grace Adelia Natalia Silalahi', 'Tanpa Handle', 'Lolos Job YOU dari Tomodachi mg Sudah 3 bulan tanpa kabar alias melarikan produk.', 'graceanssgrc_', NULL, '081286239809', 'https://drive.google.com/open?id=1PFfV3V-QolE7eQWWwa3wdPXBKnAKjO-dC', 'ALZ MG', '085880688355', 'KOL', 'approved'),

-- 2. Vivi (Management bermasalah)
('2023-07-29 17:27:59', 'Vivi', '-', 'Awalnya mau join jadi admin mg baru sebulan kurang buka mg baru niat daftar jadi admin cuma nyolong ilmu mg.', 'vivi2.903', NULL, '089512008368', 'https://drive.google.com/open?id=1JurHQLs7RtF1imcmgRNwUKmUbHhgs2tq', 'Besti MG', '085882101000', 'MG', 'approved'),

-- 3. AR MG
('2023-07-30 00:13:55', 'AR MG', 'Buzzer MG', 'Membuat management baru tanpa persetujuan mg asal, status masih talent tapi buka mg.', 'ar_.management', NULL, '085722739566', 'https://drive.google.com/open?id=1cnvVMC2J4oCk6FTQsDYJfI5nFu5meo4F', 'Buzzer MG', '085600200388', 'MG', 'approved'),

-- 4. Helda Angel
('2023-08-08 18:30:34', 'Helda Angel', 'Dumis Production', 'Tidak jujur client udah TF tapi talent bilang belum masuk/bawa kabur uang client.', 'Heldangel_', NULL, '085752400722', 'https://drive.google.com/open?id=1V_v111GaAIW2c-xnQEl0qHQ3oIla206m', 'Dumis Production', '083861973368', 'KOL', 'approved'),

-- 5. Lidya Indah (Galaxy MG KW)
('2023-10-31 08:58:23', 'Lidya Indah (Lidya Muse)', 'Galaxy MG', 'Admin/Talent tidak bertanggung jawab, buka MG sendiri copas nama Galaxy MG, bawa kabur produk endorse.', 'lidya.muse', NULL, '085691665643', 'https://drive.google.com/drive/folders/1-UwEcWJDXxPuCwTdIupDrVflFOMD0Zff', 'C.I TEAM', '-', 'MG', 'approved'),

-- 6. Arshyla
('2025-01-02 11:47:10', 'Arshyla', 'Calz', 'Apply job elshe Januari sendiri, pas udah lolos ngeluhin produk mahal. Lemot respon, playing victim.', 'arshylaaa', 'sisildiary', '0895640194900', 'https://drive.google.com/drive/folders/1rdTJbD9wgaetjmeDx81O_DEnf7elhRQV', 'Candyfluencer', '0895330604045', 'KOL', 'approved'),

-- 7. Arcky Ebela
('2025-01-04 00:00:52', 'Arcky Ebela', 'Dyla MG', 'Apply job sendiri, lolos tapi ngeluh, keluar seenaknya di job running.', 'fauzanabell', NULL, '087761134355', 'https://drive.google.com/drive/folders/1Re85slVQFH38Sb2U8yMxUD7ofxQg9AXq', 'Dyla MG', '082323894110', 'KOL', 'approved'),

-- 8. Zefanya Gabriella Samosir
('2025-01-08 15:26:48', 'Zefanya Gabriella Samosir', 'Shania Mg', 'Cancel sepihak dengan alasan mau off, lelet draft, tidak ada itikad baik.', 'zgabriellas', 'zeffgab', '089694344890', 'https://drive.google.com/drive/folders/12ZiMmGOyizCR8Df6orVqcp2FqGNivY-c', 'Shania Mg', '-', 'KOL', 'approved'),

-- 9. Syarifah Salsabila
('2025-01-08 15:29:41', 'Syarifah Salsabila', 'Shania Mg', 'Tidak ada kabar (ghosting), alasan kecelakaan tapi update IG Story, hide IG management.', 'syarifahsalsabila_', 'biyyabiyy', '081368311037', 'https://drive.google.com/drive/folders/16-dpaafnWG0StpjpnGMTFgVzgpcp-dt2', 'Shania Mg', '-', 'KOL', 'approved'),

-- 10. Rachel Isabella (Fayola Management)
('2025-01-18 20:44:07', 'Rachel Isabella / Fayola Management', 'Fayola Management', 'Penipu, pencuri data, penculik talent, penyebar kebencian. Mengaku admin tapi ternyata founder bermasalah.', 'i.am_belz', 'fangching_90', '089526636325', 'https://drive.google.com/drive/folders/1ZDEnvvFnWZBh9c45POrG8Ms71vYx0T1O', 'All Management', '08979385688', 'MG', 'approved'),

-- 11. Retno Oktaviani (Acil Agency)
('2025-01-19 16:52:09', 'Retno Oktaviani', 'Acil Agency', 'Potong fee talent terlalu besar tanpa otak, nyalahin admin lain.', 'retno_oktaviani07', NULL, '08994010515', 'https://drive.google.com/drive/folders/1yxa_I7cv94UBgkr-LJ8Vs-oXuGQlbpi5', 'ALL MANAGEMENT', '089530906332', 'MG', 'approved'),

-- 12. Lilsha MG
('2025-02-14 20:38:16', 'Lilsha MG', 'Lilsha MG', 'Menyepelekan job under mg lain, playing victim, japri client, talent tidak mengerjakan job.', 'lilsha.mg', NULL, '081271773105', 'https://drive.google.com/drive/folders/1zVhWlcEt1bZi703_eaudEojwoIbhNVbK', 'KAS & ALL MG', '087778161001', 'MG', 'approved'),

-- 13. Mega Pratiwi
('2025-02-17 19:49:04', 'Mega Pratiwi', 'Bestie Inf', 'Mangkir Job Ajinomoto, cancel H-1, blokir admin.', 'eggaperdhana', NULL, '085886841338', 'https://drive.google.com/drive/folders/17-2CX0miow4zesc0ka988xgj6-813HTF', 'Bestie Inf', '087890333220', 'KOL', 'approved'),

-- 14. Julia Pandiangan
('2025-02-21 12:32:12', 'Julia Pandiangan', 'Birth Club Indonesia', 'Izin keluar grup job alasan memori full padahal belum lapor draft, hapus postingan kerjasama.', 'julia_pandiangan', NULL, '081361501043', NULL, 'Birth Club Indonesia', '085312561991', 'KOL', 'approved'),

-- 15. Fadhilaa
('2025-02-23 23:09:26', 'Fadhilaa', 'Cesa Inf', 'Nilep fee talent, fee 100k dipotong jadi 50k, ubah broadcast fee.', '-', NULL, '088233193593', NULL, 'Cesa Inf', '089507343576', 'MG', 'approved'),

-- 16. Farha Tiana
('2025-04-08 13:52:11', 'Farha Tiana', 'Girlsup MG', 'Tidak update draft, alasan berduka tapi posting VT lain, fee talent lain terhambat karena dia.', '-', 'user1326531085941316331', '08993069532', 'https://drive.google.com/drive/folders/1TX8dHIv8shaDxfApqFBD6rhEZJYoxb5G', 'MSM / Girls Up', '-', 'KOL', 'approved'),

-- 17. Surianti Lustriana Boang Manalu
('2025-05-02 17:28:54', 'Surianti Lustriana', 'Arsas MG', 'Produk sudah diterima tapi tidak draft, HP alasan kecebur tapi update tiktok.', '_yyy.yannaa', 'sobat.shopping_', '089528818000', 'https://drive.google.com/drive/folders/1KC4e1M6suKo1WyEFGrtSMkqii5-SvA3o', 'Tim Handle Project BYNONS', '087761941352', 'KOL', 'approved'),

-- 18. Rafi Manaf
('2025-06-02 23:46:56', 'Rafi Manaf', 'Amertaa MG', 'Cancel sepihak job Kahf dengan alasan produk tidak dikirim padahal di brief sudah jelas beli sendiri.', 'rafimnaf', 'rafimnaf', '085179943824', 'https://drive.google.com/drive/folders/1RE6GywnC1r8pEfqcbcU_MfvcTQ-UM', 'Amertaa MG', '082244383883', 'KOL', 'approved'),

-- 19. Nasya Cahya Tirana (Weach MG)
('2025-06-08 09:18:23', 'Nasya Cahya Tirana', 'Weach Mg', 'Meminta jadi PIC, tidak share ulang broadcast ke talent, mengeluarkan admin/kol dari grup seenaknya.', 'nasyatirana_', 'nsytirana_', '-', 'https://drive.google.com/drive/folders/1hVFBj7Cpfq4nQ31u54KHsH2Yub2Ve5so', 'WW MANAGEMENT', '085947710627', 'MG', 'approved'),

-- 20. Raymond Sianipar
('2025-06-27 10:21:22', 'Raymond Sianipar', 'Luxury Inf', 'Sudah di blacklist sebelumnya, bawa kabur uang, manipulasi job barter jadi paid.', 'rx_mnd', 'raymnd_', '082272159230', 'https://drive.google.com/drive/folders/10VCDmthyPH0EgYgB4xRA4GWNMnhR3P6B', 'ALL MG', '-', 'MG', 'approved'),

-- 21. Anisa Chaca
('2025-06-29 12:23:54', 'Anisa Chaca', 'Kirana MG', 'Tidak hadir visit PRJ, lost contact, baru muncul setelah event selesai dengan alasan skripsi.', 'anisa.3764', 'anisachaca01', '089512546144', 'https://drive.google.com/drive/folders/16utEoTk-EVualUts2BNe4B5yKqaqbQA', 'Kirana MG', '83135350111', 'KOL', 'approved'),

-- 22. Zara (Zara Management)
('2025-08-06 14:32:25', 'Zara', 'Stitch Management', 'Copy paste konsep management Stitch hampir 90%, mendirikan MG baru dengan hasil curian ide.', 'zaraa_freelance', NULL, '082361151594', 'https://drive.google.com/drive/folders/1fHdXFieziAvLcLy90w7FJ2_EQcgdBD7G', 'Stitch Management', '085777370984', 'MG', 'approved'),

-- 23. Delly Oktavia
('2025-08-20 15:33:01', 'Delly Oktavia', 'Rins Inf', 'Ngaret parah, slow respon, tapi kalau fee gercep. Tidak mau tau kesalahan.', 'oktoviadelly', 'oktoviadelly_', '082122533801', 'https://drive.google.com/drive/folders/1dKEX9IS2ic_2UzON6ET-SDlGKGxrvIJR', 'Rins inf', '085694205571', 'KOL', 'approved'),

-- 24. Hary Suwady (Satumakna)
('2025-09-29 13:48:55', 'Hary Suwady', 'Satumakna', 'Menjelekkan admin lain, menuduh nilep duit talent tanpa bukti, DM brand sembarangan.', 'hary_suwady21', NULL, '89509330019', 'https://drive.google.com/drive/folders/19054IbNJTlt6GIqfdSsMLzeCY4-idNNY', 'Satumakna', '085187193314', 'MG', 'approved'),

-- 25. Elvin Lerman
('2025-10-01 01:59:35', 'Elvin Lerman', 'Elvinch MG', 'Pelecehan verbal, penghinaan, dan ancaman doa buruk terhadap admin terkait potongan fee.', 'elvinlerman_', 'elvinlerman', '0895326437750', 'https://drive.google.com/drive/folders/1yXxxtMRYCKOGjwKM9I2noxt4lOPrf2CL', 'CH MG', '081262857129', 'KOL', 'approved'),

-- 26. Rizki Andhika
('2025-10-12 05:51:21', 'Rizki Andhika', 'Rahma', 'Melanggar brief (do & dont), memberikan komentar negatif tentang brand di story sebelum review.', 'dhikafein.healing', 'dhikafein.healing', '087782839591', 'https://drive.google.com/drive/folders/1hVb42BT4tdqCD-9T93Tx4J5BbpRkjwWc', 'Rahma', '0895358904993', 'KOL', 'approved'),

-- 27. Syifa Nadiba (Diba)
('2025-11-30 17:56:49', 'Syifa Nadiba', '-', 'Minta full payment di awal, produk sampai, tapi tidak ada draft sama sekali. Menghilang.', NULL, 'ccdiba', '+6285269201717', 'https://drive.google.com/drive/folders/1edk60LIuUfHqEtnBSqiKT0BXQpYf8Imp', 'Freelance pribadi', '+6287821665670', 'KOL', 'approved');

-- 3. Insert ke blacklist juga (biar muncul di search publik)
INSERT INTO blacklist (nama, no_hp, instagram, tiktok, kategori, alasan, jumlah_laporan)
SELECT 
    nama, 
    no_hp, 
    instagram, 
    tiktok, 
    kategori, 
    kronologi, 
    1
FROM reports WHERE status = 'approved';
