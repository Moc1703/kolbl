'use client'

export default function DisclaimerPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-8 border-b-2 border-neutral-800 pb-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-2">
          <span className="text-neutral-400">⚖️</span> DISCLAIMER
        </h1>
        <p className="text-neutral-500 font-mono text-sm uppercase tracking-wider">Syarat & Ketentuan Penggunaan</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
            <span>📋</span> Tentang Database Ini
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Website ini merupakan <strong className="text-neutral-300">database informasi</strong> yang dikumpulkan dari laporan komunitas mengenai KOL (Key Opinion Leader) dan Management yang pernah bermasalah dalam kerjasama endorsement/paid promote.
          </p>
        </div>

        <div className="bg-yellow-900/10 border border-yellow-900/40 rounded-sm p-5">
          <h2 className="font-bold text-yellow-500 mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
            <span>⚠️</span> Peringatan Penting
          </h2>
          <ul className="text-sm text-yellow-600/80 space-y-2">
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>Informasi yang tersedia bersifat <strong className="text-yellow-500">referensi</strong>, bukan keputusan mutlak.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>Keputusan untuk bekerjasama atau tidak <strong className="text-yellow-500">sepenuhnya tanggung jawab Anda</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-500">•</span>
              <span>Kami tidak bertanggung jawab atas kerugian yang timbul dari keputusan Anda.</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-950/20 border border-blue-900/40 rounded-sm p-5">
          <h2 className="font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
            <span>🔍</span> Validasi Mandiri
          </h2>
          <p className="text-sm text-blue-400/70 leading-relaxed mb-3">
            Sebelum mengambil keputusan, <strong className="text-blue-400">pastikan untuk memvalidasi informasi</strong> secara mandiri:
          </p>
          <ul className="text-sm text-blue-400/70 space-y-2">
            <li className="flex gap-2"><span className="text-blue-500">✓</span><span>Cek bukti-bukti yang dilampirkan</span></li>
            <li className="flex gap-2"><span className="text-blue-500">✓</span><span>Tanyakan ke komunitas/grup terpercaya</span></li>
            <li className="flex gap-2"><span className="text-blue-500">✓</span><span>Hubungi pihak terkait untuk klarifikasi</span></li>
            <li className="flex gap-2"><span className="text-blue-500">✓</span><span>Pertimbangkan kemungkinan masalah sudah diselesaikan</span></li>
          </ul>
        </div>

        <div className="bg-green-950/20 border border-green-900/40 rounded-sm p-5">
          <h2 className="font-bold text-green-500 mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
            <span>🤝</span> Tujuan Positif
          </h2>
          <p className="text-sm text-green-400/70 leading-relaxed">
            Database ini dibuat dengan tujuan <strong className="text-green-400">membantu komunitas</strong> agar lebih berhati-hati dalam memilih partner kerjasama. Bukan untuk menghakimi, tapi sebagai <strong className="text-green-400">early warning system</strong>.
          </p>
        </div>

        <div className="bg-purple-950/20 border border-purple-900/40 rounded-sm p-5">
          <h2 className="font-bold text-purple-400 mb-3 flex items-center gap-2 uppercase tracking-wide text-sm">
            <span>🔓</span> Hak Banding
          </h2>
          <p className="text-sm text-purple-400/70 leading-relaxed">
            Bagi yang merasa masalahnya sudah diselesaikan atau terdapat kesalahan informasi, dapat mengajukan <strong className="text-purple-400">banding/unblacklist</strong> melalui menu yang tersedia. Tim admin akan mereview setiap ajuan dengan fair.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
          <p className="text-xs text-neutral-500 text-center leading-relaxed font-mono uppercase tracking-widest">
            Dengan menggunakan website ini, Anda dianggap telah membaca, memahami, dan menyetujui disclaimer di atas.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <a
          href="/"
          className="block w-full py-3 bg-neutral-800 border border-neutral-700 text-white rounded-sm font-bold text-center uppercase tracking-widest text-sm hover:bg-neutral-700 transition-colors"
        >
          Kembali ke Home
        </a>
      </div>
    </div>
  )
}
