# DevyMae — Interactive 3D Personal Portfolio

## Menjalankan di VS Code
1. Ekstrak folder `devymae-portfolio`.
2. Buka folder tersebut di VS Code: **File → Open Folder**.
3. Buka `index.html`.
4. Jalankan melalui server lokal yang sudah tersedia, misalnya Live Server jika sudah terpasang (klik kanan `index.html` → **Open with Live Server**).

Jika `index.html` dibuka langsung, browser tertentu dapat membatasi pemrosesan video lokal; foto PNG akan tetap tampil sebagai fallback. Efek Three.js memerlukan koneksi internet karena pustaka Three.js dimuat dari CDN.

## Struktur
- `index.html` — struktur halaman dan konten portofolio.
- `css/style.css` — seluruh gaya visual navy futuristik.
- `js/script.js` — interaksi, tilt, scroll reveal, dan dekorasi Three.js.
- `assets/images/avatar-devymae.png` — gambar karakter 3D sementara.
- `assets/images/avatar-devymae-walk.mp4` — video avatar berjalan.
- `assets/models/` — tempat model 3D `.glb` jika nanti ditambahkan.

## Catatan penting
Karakter berjalan menggunakan video MP4. Karena latar video hitam, halaman menghapus area hitam yang tersambung ke tepi frame agar transparan tanpa menghapus bagian gelap yang terpisah, seperti pakaian. Hasilnya bergantung pada kontras tepi video. Orb, ring, dan partikel di sekitarnya bergerak sebagai motion graphic Three.js. Untuk karakter 3D yang dapat diputar dengan gerakan sendi realistis, diperlukan model `.glb` ber-rig beserta animasi berjalan, lalu integrasi GLTFLoader dan AnimationMixer.
