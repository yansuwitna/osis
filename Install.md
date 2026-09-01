# 📘 Panduan Instalasi & Deployment E-VOTING Digital
*(PILKOSIS · PKS · MPK)*

Dokumen ini berisi panduan lengkap instalasi dan deployment aplikasi **E-VOTING Digital** baik pada komputer lokal (offline/LAN) maupun server online (**VPS Linux Ubuntu/Debian**).

---

## 📑 DAFTAR ISI
1. [Metode A: Instalasi di Komputer / Laptop Lokal (XAMPP / LAN Offline)](#-metode-a-instalasi-di-komputer--laptop-lokal-xampp--lan-offline)
2. [Metode B: Instalasi di Cloud VPS (Ubuntu 20.04 / 22.04 / 24.04 & Debian)](#-metode-b-instalasi-di-cloud-vps-ubuntu-2004--2204--2404--debian)
3. [📦 Panduan Menggunakan NVM (Node Version Manager)](#-panduan-menggunakan-nvm-node-version-manager)
4. [👤 Panduan Menambahkan User Biasa Menjadi Sudoer di Debian](#-panduan-menambahkan-user-biasa-menjadi-sudoer-di-debian)
5. [🛠️ PEMECAHAN MASALAH (TROUBLESHOOTING VPS & SERVER)](#️-pemecahan-masalah-troubleshooting-vps--server)
6. [Informasi Kredensial Default](#-informasi-kredensial-default)
7. [Checklist Persiapan Panitia Pemilihan](#-checklist-persiapan-panitia-pemilihan)

---

## 🖥️ METODE A: Instalasi di Komputer / Laptop Lokal (XAMPP / LAN Offline)

### 1. Kebutuhan Sistem
- **Node.js**: Versi `18.x`, `20.x`, atau `22.x LTS` ([Unduh Node.js](https://nodejs.org))
- **Database MySQL / MariaDB**: Menggunakan **XAMPP** atau **Laragon** ([Unduh XAMPP](https://www.apachefriends.org))
- **Web Browser**: Chrome, Edge, atau Firefox

### 2. Langkah-Langkah Instalasi Lokal
1. **Siapkan Folder Project**:
   Salin folder project `osis` ke direktori lokal (contoh: `C:\xampp\htdocs\osis`).
2. **Buat Database di MySQL**:
   - Jalankan modul **Apache** dan **MySQL** di XAMPP Control Panel.
   - Buka browser: `http://localhost/phpmyadmin`.
   - Buat database baru dengan nama: `db_osis`.
3. **Konfigurasi File `.env`**:
   Buka file `.env` di folder project dan pastikan isinya:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/db_osis"
   DB_HOST="localhost"
   DB_PORT="3306"
   DB_USER="root"
   DB_PASSWORD=""
   DB_NAME="db_osis"
   ```
4. **Install Dependencies & Migrasi Database**:
   Buka terminal di folder project, jalankan:
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   ```
5. **Jalankan Aplikasi**:
   - **Mode Development (Uji Coba):**
     ```bash
     npm run dev
     ```
     Akses di: `http://localhost:3000`
   - **Mode Production (Disarankan saat Hari H):**
     ```bash
     npm run build
     npm run start
     ```
     Akses di: `http://localhost:3000`

6. **Akses Jaringan LAN / Wi-Fi (Bilik Suara & HP Pemilih)**:
   - Cek IP server dengan perintah `ipconfig` (contoh: `192.168.1.100`).
   - Komputer pemilih dapat mengakses via: `http://192.168.1.100:3000`.

---

## ☁️ METODE B: Instalasi di Cloud VPS (Ubuntu 20.04 / 22.04 / 24.04 & Debian)

Panduan ini menggunakan stack standar industri: **Node.js + MariaDB/MySQL + PM2 (Process Manager) + Nginx (Reverse Proxy) + SSL Certbot (HTTPS)**.

---

### Langkah 1: Update Server & Install Paket Dasar
Login ke VPS Anda via SSH:
```bash
ssh root@ip_server_vps_anda
```

Update repositori dan install paket esensial:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw unzip nginx mariadb-server
```

---

### Langkah 2: Install Node.js (v20 LTS)
Gunakan NodeSource untuk menginstal Node.js versi 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
*Verifikasi instalasi:*
```bash
node -v   # Output contoh: v20.x.x
npm -v    # Output contoh: 10.x.x
```

Install PM2 secara global untuk menjaga aplikasi tetap berjalan 24/7 di latar belakang:
```bash
sudo npm install -g pm2
```

---

### Langkah 3: Konfigurasi Database MariaDB / MySQL di VPS
1. Amankan database:
   ```bash
   sudo mysql_secure_installation
   ```
   *(Ikuti petunjuk di layar, set password root jika diminta)*.

2. Masuk ke MySQL console:
   ```bash
   sudo mysql -u root
   ```

3. Buat database dan user khusus aplikasi:
   ```sql
   CREATE DATABASE db_osis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'osisuser'@'localhost' IDENTIFIED BY 'PasswordKuatOsis2026!';
   GRANT ALL PRIVILEGES ON db_osis.* TO 'osisuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

### Langkah 4: Upload / Clone Project ke VPS
Masuk ke direktori web:
```bash
cd /var/www
```

Clone repositori Git Anda atau unggah folder project `osis`:
```bash
git clone <URL_GIT_REPOSITORY_ANDA> osis
cd osis
```

---

### Langkah 5: Konfigurasi File `.env` di VPS
Buat file konfigurasi `.env`:
```bash
nano .env
```
Isi dengan konfigurasi database yang telah dibuat pada Langkah 3:
```env
DATABASE_URL="mysql://osisuser:PasswordKuatOsis2026!@localhost:3306/db_osis"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="osisuser"
DB_PASSWORD="PasswordKuatOsis2026!"
DB_NAME="db_osis"
```
*(Tekan `Ctrl + O` lalu `Enter` untuk menyimpan, lalu `Ctrl + X` untuk keluar)*.

---

### Langkah 6: Atur Izin Folder Upload di VPS
Pastikan folder `public` dan `public/uploads` memiliki hak akses tulis agar proses upload logo, TTD, dan foto kandidat berjalan lancar:
```bash
mkdir -p public/uploads
sudo chown -R $USER:$USER public
sudo chmod -R 775 public
sudo chmod -R 775 public/uploads
```

---

### Langkah 7: Install Dependencies, Migrasi Database, & Build
Jalankan perintah berikut:
```bash
# 1. Install seluruh paket node
npm install

# 2. Sinkronkan tabel database
npx prisma db push

# 3. Generate prisma client
npx prisma generate

# 4. Build aplikasi Next.js untuk production
npm run build
```

---

### Langkah 8: Jalankan Aplikasi Menggunakan PM2
Jalankan aplikasi menggunakan PM2 agar otomatis restart saat server reboot atau crash:

```bash
pm2 start npm --name "evoting-osis" -- start
pm2 save
pm2 startup
```
*(Salin dan jalankan perintah startup yang ditampilkan oleh PM2 jika ada)*.

*Perintah berguna PM2:*
- Cek status: `pm2 status`
- Lihat log error: `pm2 logs evoting-osis`
- Restart aplikasi: `pm2 restart evoting-osis`

---

### Langkah 9: Konfigurasi Nginx Reverse Proxy (Termasuk SSE Live Streaming & Upload 50M)
Buat file konfigurasi Nginx baru untuk domain/IP Anda:
```bash
sudo nano /etc/nginx/sites-available/evoting
```

Tempel konfigurasi berikut (Ganti `pilkosis.namasekolah.sch.id` dengan domain atau IP VPS Anda):
```nginx
server {
    listen 80;
    server_name pilkosis.namasekolah.sch.id;

    # Naikkan batas upload agar foto/logo beresolusi tinggi tidak ditolak
    client_max_body_size 50M;

    # Konfigurasi Server-Sent Events (SSE) Live Quick Count Real-Time
    location /api/live-stream {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Akses Langsung File Upload (Foto Kandidat & Aset Statis)
    location /uploads/ {
        alias /var/www/osis/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri $uri/ =404;
    }

    # Konfigurasi Aplikasi Utama
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/evoting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Langkah 10: Pasang SSL Gratis (HTTPS) dengan Certbot *(Opsional jika memakai Domain)*
Jika Anda telah mengarahkan domain/subdomain ke IP VPS:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pilkosis.namasekolah.sch.id
```
Pilih opsi redirect HTTP ke HTTPS otomatis.

---

### Langkah 11: Atur Firewall (UFW)
Buka port HTTP, HTTPS, dan SSH:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 📦 PANDUAN MENGGUNAKAN NVM (NODE VERSION MANAGER)

**NVM** adalah alat terbaik untuk mengelola dan berpindah versi Node.js dengan cepat di VPS Linux tanpa merusak paket sistem.

### 1. Cara Install NVM
Jalankan perintah berikut di terminal Linux/VPS Anda:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Setelah proses selesai, muat ulang konfigurasi shell:
```bash
source ~/.bashrc
```

*Verifikasi instalasi NVM:*
```bash
nvm --version   # Contoh output: 0.40.1
```

---

### 2. Perintah Penting & Penggunaan NVM Sehari-hari

| Kebutuhan | Perintah Terminal |
|---|---|
| **Install Node.js versi 20 LTS** | `nvm install 20` |
| **Install versi LTS terbaru** | `nvm install --lts` |
| **Gunakan versi Node.js tertentu** | `nvm use 20` |
| **Jadikan versi 20 sebagai default permanen** | `nvm alias default 20` |
| **Lihat daftar versi Node.js yang terpasang** | `nvm ls` |
| **Lihat semua versi Node.js yang tersedia** | `nvm ls-remote` |
| **Cek versi Node.js yang sedang aktif** | `node -v` |

> 💡 **Tips PM2 dengan NVM:** Jika Anda menginstal Node.js lewat NVM, jalankan PM2 dengan user yang sama dan instal PM2 secara global: `npm install -g pm2`.

---

## 👤 PANDUAN MENAMBAHKAN USER BIASA MENJADI SUDOER DI DEBIAN

Pada instalasi Debian bawaan (*fresh install*), user biasa seringkali belum memiliki hak akses `sudo` (muncul pesan error: *"user is not in the sudoers file. This incident will be reported"*).

Berikut cara memberikan hak akses `sudo` penuh kepada user biasa di Debian:

---

### 1. Masuk Sebagai Root
Buka terminal dan beralih ke akun `root`:
```bash
su -
```
*(Masukkan password root Anda saat diminta)*.

---

### 2. Install Paket `sudo` (Jika belum terpasang)
```bash
apt update && apt install sudo -y
```

---

### 3. Tambahkan User Biasa ke Group `sudo`
Ganti `nama_user` dengan username akun Anda:
```bash
usermod -aG sudo nama_user
```
*Contoh:* `usermod -aG sudo osisadmin`

---

### 4. (Alternatif) Tambahkan Langsung ke File `/etc/sudoers`
Jika ingin memberikan hak sudo tanpa password atau memastikan user terdaftar:
```bash
visudo
```
Gulir ke bawah ke bagian `User privilege specification`, lalu tambahkan baris berikut di bawah `root`:
```text
nama_user   ALL=(ALL:ALL) ALL
```
*(Tekan `Ctrl + O`, `Enter`, lalu `Ctrl + X` untuk menyimpan)*.

---

### 5. Uji Coba Akses Sudo
Beralih kembali ke user biasa Anda:
```bash
su - nama_user
```
Coba jalankan perintah `sudo`:
```bash
sudo whoami
```
*Jika output menampilkan `root`, maka user Anda telah berhasil 100% menjadi **sudoer**!* 🎉

---

## 🛠️ PEMECAHAN MASALAH (TROUBLESHOOTING VPS & SERVER)

Berikut solusi untuk masalah umum yang sering dijumpai saat deployment di VPS Linux:

### 1. ❌ Gagal Upload Logo OSIS, Logo Sekolah, Tanda Tangan (TTD), atau Foto Kandidat di VPS
- **Gejala:** Muncul pesan error *"Izin akses folder public di VPS ditolak (Permission Denied / EACCES)"* atau upload gagal tersimpan.
- **Penyebab:** Folder `public` atau `public/uploads` dibuat oleh user `root` sehingga proses Node.js / PM2 tidak memiliki izin tulis (*write permission*).
- **Solusi:** Jalankan perintah perbaikan izin berikut di terminal VPS:
  ```bash
  cd /var/www/osis
  mkdir -p public/uploads
  sudo chown -R $USER:$USER public
  sudo chmod -R 775 public
  sudo chmod -R 775 public/uploads
  ```

---

### 2. ❌ Error `413 Request Entity Too Large` saat Upload Gambar
- **Gejala:** File gambar resolusi tinggi (di atas 1 MB) langsung gagal diupload dengan error 413.
- **Penyebab:** Batas upload bawaan Nginx hanya 1 MB.
- **Solusi:** Tambahkan baris `client_max_body_size 50M;` di file konfigurasi Nginx (`/etc/nginx/sites-available/evoting` atau `/etc/nginx/nginx.conf`), lalu muat ulang Nginx:
  ```bash
  sudo nginx -t
  sudo systemctl reload nginx
  ```

---

### 3. ❌ Layar Live Quick Count (`/results` / `/hasil`) Tidak Mengalirkan Suara Seketika di VPS (Cloudflare / PM2 / Nginx)
- **Gejala:** Suara yang dicoblos tidak langsung bertambah di layar Quick Count secara real-time.
- **Penyebab & Solusi:**
  1. **Cloudflare Proxy Buffering:**
     - Masuk ke dashboard **Cloudflare** -> Domain Anda -> **Rules** -> **Page Rules** (atau **Cache Rules**).
     - Buat Rule untuk URL: `*domainanda.com/api/live-stream*`
     - Set: **Cache Level: Bypass**, **Rocket Loader: Off**, **Auto Minify: Off**, **Disable Performance**.
  2. **PM2 Mode (Cluster vs Fork):**
     - Jika menjalankan PM2 dengan mode cluster (`-i max`), jalankan dengan mode standar (fork) agar in-memory event bus terhubung:
       ```bash
       pm2 delete evoting-osis
       pm2 start npm --name "evoting-osis" -- start
       pm2 save
       ```
     - *(Aplikasi kini juga dilengkapi hybrid background sync cadangan setiap 5 detik)*.
  3. **Proxy Buffering Nginx:**
     - Pastikan blok `location /api/live-stream` di `/etc/nginx/sites-available/evoting` memiliki `proxy_buffering off;` dan `proxy_cache off;`.
     - Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

---

### 4. ❌ Error Koneksi Database `P1001: Can't reach database server`
- **Gejala:** Aplikasi error saat diakses di browser atau saat menjalankan migrasi `prisma db push`.
- **Penyebab:** Layanan MySQL/MariaDB belum berjalan atau kredensial di file `.env` salah.
- **Solusi:**
  1. Cek status database: `sudo systemctl status mariadb` atau `sudo systemctl status mysql`.
  2. Jika mati, nyalakan: `sudo systemctl start mariadb`.
  3. Cek kembali username, password, dan nama database di file `.env`.

---

## 🔐 INFORMASI KREDENSIAL DEFAULT

- **URL Login Admin:** `/admin/login`
- **Username Default:** `admin`
- **Password Default:** `admin`

> ⚠️ **PENTING:** Segera ganti kata sandi default setelah login pertama kali melalui menu **`🔑 Ubah Password`** (`/admin/password`).

---

## 📋 CHECKLIST PERSIAPAN PANITIA PEMILIHAN

1. [ ] **Logo & Favicon:** Upload Logo OSIS, Logo Sekolah, dan TTD Ketua Panitia di `/admin/logos`.
2. [ ] **Pengaturan:** Atur Nama Sekolah, Hari/Tanggal, Waktu TPS, Tempat, dan Lokasi TTD di `/admin/settings`.
3. [ ] **Data Panitia:** Isi nama Ketua Panitia, Sekretaris, dan Kepala Sekolah di `/admin/committee`.
4. [ ] **Kelola Kandidat:** Input nomor urut, nama paslon, visi misi, foto, dan aktifkan status kandidat di `/admin/candidates`.
5. [ ] **Data Pemilih:** Upload daftar siswa/DPT via template Excel di `/admin/upload-voters`.
6. [ ] **Cetak Dokumen:** Cetak Surat Panggilan Pemilih (10 kartu/lembar A4), Cetak Token (30/60 token per lembar A4), & Cetak DPT di `/admin/invitations`, `/admin/tokens`, & `/admin/voters`.
7. [ ] **Layar Quick Count:** Siapkan proyektor aula untuk membuka `/results` (Mode Layar Penuh).
8. [ ] **Backup:** Unduh file cadangan database awal sebelum pemilihan dimulai di `/admin/backup`.
