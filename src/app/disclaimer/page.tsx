'use client'

export default function DisclaimerPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">⚖️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Disclaimer</h1>
        <p className="text-gray-500 text-sm">Syarat & Ketentuan Penggunaan</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📋</span> Tentang Database Ini
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Website ini merupakan <strong>database informasi</strong> yang dikumpulkan dari laporan komunitas mengenai KOL (Key Opinion Leader) dan Management yang pernah bermasalah dalam kerjasama endorsement/paid promote.
          </p>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
          <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Peringatan Penting
          </h2>
          <ul className="text-sm text-amber-700 space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>Informasi yang tersedia bersifat <strong>referensi</strong>, bukan keputusan mutlak.</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Keputusan untuk bekerjasama atau tidak <strong>sepenuhnya tanggung jawab Anda</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Kami tidak bertanggung jawab atas kerugian yang timbul dari keputusan Anda.</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
          <h2 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span>🔍</span> Validasi Mandiri
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed mb-3">
            Sebelum mengambil keputusan, <strong>pastikan untuk memvalidasi informasi</strong> secara mandiri:
          </p>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Cek bukti-bukti yang dilampirkan</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Tanyakan ke komunitas/grup terpercaya</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Hubungi pihak terkait untuk klarifikasi</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Pertimbangkan kemungkinan masalah sudah diselesaikan</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
          <h2 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <span>🤝</span> Tujuan Positif
          </h2>
          <p className="text-sm text-green-700 leading-relaxed">
            Database ini dibuat dengan tujuan <strong>membantu komunitas</strong> agar lebih berhati-hati dalam memilih partner kerjasama. Bukan untuk menghakimi, tapi sebagai <strong>early warning system</strong> agar kejadian serupa tidak terulang.
          </p>
        </div>

        <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
          <h2 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <span>🔓</span> Hak Banding
          </h2>
          <p className="text-sm text-purple-700 leading-relaxed">
            Bagi yang merasa masalahnya sudah diselesaikan atau terdapat kesalahan informasi, dapat mengajukan <strong>banding/unblacklist</strong> melalui menu yang tersedia. Tim admin akan mereview setiap ajuan dengan fair.
          </p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-5">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            Dengan menggunakan website ini, Anda dianggap telah membaca, memahami, dan menyetujui disclaimer di atas.
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <a 
          href="/"
          className="block w-full py-3 bg-gray-800 text-white rounded-xl font-medium text-center"
        >
          Kembali ke Home
        </a>
      </div>
    </div>
  )
}
