# CipherPlay: Laboratorium & Toolkit Kriptografi Klasik

**CipherPlay** adalah aplikasi web *front-end* sederhana dan interaktif yang berfungsi sebagai laboratorium untuk mempelajari, mempraktikkan, dan menganalisis sandi kriptografi klasik.

Proyek ini dibangun menggunakan **HTML, Tailwind CSS, dan Vanilla JavaScript**, menjadikannya alat yang ringan, cepat, dan mudah dipahami logikanya.

---

## ✨ Fitur Utama

CipherPlay dibagi menjadi dua modul utama, masing-masing dengan fungsionalitas yang berbeda:

### 1. 🧪 Cipher Lab (Enkripsi & Dekripsi)

Memungkinkan pengguna untuk mengenkripsi dan mendekripsi pesan secara langsung menggunakan berbagai metode sandi klasik.

| Cipher | Kategori | Kunci | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Caesar Cipher** | Substitusi Monoalfabetik | Angka (0 - 25) | Menggeser setiap huruf sejumlah posisi tetap. |
| **Vigenère Cipher** | Substitusi Polialfabetik | Kata Kunci (Huruf A-Z) | Menggunakan kata kunci untuk melakukan serangkaian geseran yang berbeda. |
| **Rail Fence Cipher** | Transposisi | Angka (Rails/Rel) | Menyusun teks dalam pola zig-zag untuk menyusun kembali karakter. |

### 2. 🔍 Cryptanalysis Toolkit (Alat Analisis)

Menyediakan alat dasar yang krusial untuk memecahkan sandi tanpa mengetahui kuncinya.

* **Frequency Analysis (Analisis Frekuensi):** Menghitung dan memvisualisasikan persentase kemunculan setiap huruf dalam *ciphertext* yang diinput. Hasil hanya menampilkan huruf yang benar-benar muncul, diurutkan dari yang paling sering ke paling jarang. 
    * *Fungsi:* Alat utama untuk memecahkan sandi substitusi monoalfabetik (seperti Caesar).
* **Caesar Brute-Force:** Secara otomatis mendekripsi *ciphertext* menggunakan semua 26 kemungkinan kunci (geseran) Caesar, memungkinkan analis untuk menemukan Plaintext yang benar secara visual.

---

## 🛠️ Teknologi yang Digunakan

* **HTML5:** Struktur dasar halaman web.
* **Tailwind CSS:** Framework CSS yang digunakan untuk *styling* cepat, modern, dan responsif.
* **Vanilla JavaScript (ES6+):** Implementasi seluruh logika enkripsi, dekripsi, validasi input, dan analisis.

## 🚀 Cara Menggunakan (Lokal)

Karena CipherPlay adalah aplikasi *front-end* murni, Anda dapat menjalankannya dengan sangat mudah:

1.  **Clone** repositori ini.
2.  Buka *file* `index.html` langsung di *browser* apa pun (Chrome, Firefox, dll.).

Semua fungsionalitas akan berjalan secara lokal di *browser* Anda tanpa memerlukan instalasi server atau dependensi tambahan.

## 💡 Logika Kunci & Pemrosesan

Semua fungsi kriptografi mengandalkan manipulasi indeks huruf (A=0, B=1, ..., Z=25). Teks input secara otomatis dibersihkan oleh fungsi `cleanInput()` untuk memastikan hanya huruf kapital A-Z yang diproses, menghilangkan spasi, angka, dan tanda baca.
