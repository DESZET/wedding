import { useState } from "react";
import { Upload, Image as ImageIcon, Type, Palette, LayoutTemplate, Info } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";

// ─── helpers ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm";
const labelCls = "block text-sm font-medium mb-1 text-gray-700";
const sectionCls = "border rounded-xl p-5 space-y-4 bg-gray-50";
const headingCls = "font-semibold text-gray-800 flex items-center gap-2 mb-1";

function Field({
  label,
  settingKey,
  placeholder,
  type = "text",
  rows,
}: {
  label: string;
  settingKey: string;
  placeholder?: string;
  type?: string;
  rows?: number;
}) {
  const { settings, updateSettings } = useSettings();
  const value = settings[settingKey] ?? "";
  const update = (v: string) => updateSettings({ ...settings, [settingKey]: v });

  if (rows) {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <textarea
          className={inputCls}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => update(e.target.value)}
        />
      </div>
    );
  }
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        className={inputCls}
        placeholder={placeholder}
        value={value}
        onChange={(e) => update(e.target.value)}
      />
    </div>
  );
}

function ImageField({
  label,
  settingKey,
  placeholder,
}: {
  label: string;
  settingKey: string;
  placeholder?: string;
}) {
  const { settings, updateSettings } = useSettings();
  const value = settings[settingKey] ?? "";
  const update = (v: string) => updateSettings({ ...settings, [settingKey]: v });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) update(data.data.path);
      else alert("Gagal upload gambar");
    } catch {
      alert("Error upload gambar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          className={inputCls}
          placeholder={placeholder || "URL gambar atau upload di bawah"}
          value={value}
          onChange={(e) => update(e.target.value)}
        />
        <label className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 text-sm whitespace-nowrap">
          <Upload className="w-4 h-4" />
          {uploading ? "..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
        </label>
      </div>
      {value && (
        <img
          src={value}
          alt="preview"
          className="mt-2 h-24 w-auto rounded-lg object-cover border"
        />
      )}
    </div>
  );
}

// ─── sub-panels ─────────────────────────────────────────────────────────────

function PanelGeneral() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Identitas Website</p>
        <Field label="Nama Website / Brand" settingKey="site-name" placeholder="Galeria Wedding" />
        <Field label="Huruf Logo" settingKey="logo-letter" placeholder="G" />
        <Field label="Tagline" settingKey="tagline" placeholder="Mewujudkan Pernikahan Impian Anda" />
        <Field label="Deskripsi Singkat" settingKey="description" placeholder="Deskripsi website..." rows={2} />
        <Field label="Copyright Footer" settingKey="footer-copyright" placeholder="© 2025 Galeria Wedding. All rights reserved." />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Palette className="w-4 h-4 text-primary" /> Warna Tema</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Warna Primer", key: "primary-color" },
            { label: "Warna Sekunder", key: "secondary-color" },
            { label: "Warna Aksen", key: "accent-color" },
            { label: "Warna Background", key: "background-color" },
          ].map(({ label, key }) => (
            <ColorField key={key} label={label} settingKey={key} />
          ))}
        </div>

        {/* Panduan Informasi Warna (Premium Glassmorphic Info Banner) */}
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-primary flex items-center gap-1.5 text-sm mb-1">
            <Info className="w-4 h-4" /> Panduan Memilih Warna Website:
          </p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>
              <strong className="text-slate-800">Warna Primer:</strong> Warna utama identitas brand Anda. Digunakan untuk tombol utama, link penting, dan fokus visual utama (default: kuning/amber hangat).
            </li>
            <li>
              <strong className="text-slate-800">Warna Sekunder:</strong> Warna pendukung untuk latar belakang gelap atau bagian penyeimbang visual (seperti banner atau footer).
            </li>
            <li>
              <strong className="text-slate-800">Warna Aksen:</strong> Warna sorotan cerah untuk menarik perhatian mata secara cepat (seperti badge promo, ikon aktif, bintang rating, dll).
            </li>
            <li>
              <strong className="text-slate-800">Warna Background:</strong> Warna dasar untuk latar belakang keseluruhan halaman website Anda (default: putih bersih atau krem lembut).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, settingKey }: { label: string; settingKey: string }) {
  const { settings, updateSettings } = useSettings();
  const value = settings[settingKey] ?? "#8B5CF6";
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          className="h-10 w-14 border rounded cursor-pointer"
          value={value}
          onChange={(e) => updateSettings({ ...settings, [settingKey]: e.target.value })}
        />
        <input
          type="text"
          className={inputCls}
          value={value}
          onChange={(e) => updateSettings({ ...settings, [settingKey]: e.target.value })}
        />
      </div>
    </div>
  );
}

function PanelHero() {
  const { settings, updateSettings } = useSettings();

  // Hero images stored as JSON array
  const heroImages: string[] = (() => {
    try { return JSON.parse(settings["hero-images"] || "[]"); } catch { return []; }
  })();

  const [uploading, setUploading] = useState(false);

  const addImage = (url: string) => {
    const next = [...heroImages, url];
    updateSettings({ ...settings, "hero-images": JSON.stringify(next) });
  };

  const removeImage = (i: number) => {
    const next = heroImages.filter((_, idx) => idx !== i);
    updateSettings({ ...settings, "hero-images": JSON.stringify(next) });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) addImage(data.data.path);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Teks Hero</p>
        <Field label="Judul Utama" settingKey="hero-title" placeholder="Your Perfect Wedding Awaits" />
        <Field label="Subjudul" settingKey="hero-subtitle" placeholder="Create unforgettable memories..." rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tombol Utama" settingKey="hero-button-primary" placeholder="Start Planning" />
          <Field label="Tombol Kedua" settingKey="hero-button-secondary" placeholder="View Gallery" />
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><ImageIcon className="w-4 h-4 text-primary" /> Gambar Slideshow Hero (maks 5)</p>
        <div className="flex flex-wrap gap-3 mb-3">
          {heroImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} className="w-24 h-16 object-cover rounded-lg border" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >×</button>
            </div>
          ))}
        </div>
        {heroImages.length < 5 && (
          <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 w-fit text-sm">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Gambar"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </label>
        )}
      </div>
    </div>
  );
}

function PanelAbout() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Header & Cerita Utama (About)</p>
        <Field label="Badge Kecil Hero About" settingKey="about-hero-badge" placeholder="Kreator Pernikahan Impian Anda" />
        <Field label="Judul Utama Section" settingKey="about-hero-title" placeholder="Seni Merajut Kisah Cinta Menjadi Kenangan Abadi" />
        <Field label="Paragraf 1 (Cerita Utama)" settingKey="about-paragraph-1" rows={3} placeholder="Di Galeria Wedding, kami percaya..." />
        <Field label="Paragraf 2 (Kutipan/Quote)" settingKey="about-paragraph-2" rows={3} placeholder="Kami tidak membuat replika pernikahan orang lain..." />
        <Field label="Paragraf 3 (Penutup)" settingKey="about-paragraph-3" rows={3} placeholder="Didukung oleh tim lapangan bersertifikat..." />
        
        {/* Floating Badge Fields */}
        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <Field label="Angka Badge Melayang (Kiri Gambar)" settingKey="about-badge-value" placeholder="10+" />
          <Field label="Teks Badge Melayang (Kiri Gambar)" settingKey="about-badge-label" placeholder="Tahun Dedikasi" />
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><ImageIcon className="w-4 h-4 text-primary" /> Gambar About</p>
        <div className="space-y-4">
          <div>
            <ImageField label="Gambar Kiri (Foto Collage Frame)" settingKey="about-image-1" />
            <Field label="Deskripsi / Alt Gambar Kiri" settingKey="about-image-1-alt" placeholder="Seni Pernikahan Galeria Wedding" />
          </div>
          <div className="border-t pt-4">
            <ImageField label="Gambar Kanan (Foto Layanan Pendampingan)" settingKey="about-image-2" />
            <Field label="Deskripsi / Alt Gambar Kanan" settingKey="about-image-2-alt" placeholder="Mitra Vendor Pernikahan Terbaik" />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Pilar Layanan Utama Kami (3 Kartu Keunggulan)</p>
        <Field label="Judul Bagian Pilar" settingKey="about-pillar-title" placeholder="Pilar Layanan Utama Kami" />
        <Field label="Subjudul Bagian Pilar" settingKey="about-pillar-desc" placeholder="Karakteristik kerja yang membedakan kami..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          <div className="p-3 bg-white/50 rounded-lg space-y-2 border">
            <p className="font-semibold text-xs text-primary">Kartu Pilar 1</p>
            <Field label="Judul Pilar 1" settingKey="about-pillar-1-title" placeholder="Desain Orisinal & Estetik" />
            <Field label="Deskripsi Pilar 1" settingKey="about-pillar-1-desc" rows={2} placeholder="Kami menentang dekorasi templatis..." />
          </div>

          <div className="p-3 bg-white/50 rounded-lg space-y-2 border">
            <p className="font-semibold text-xs text-primary">Kartu Pilar 2</p>
            <Field label="Judul Pilar 2" settingKey="about-pillar-2-title" placeholder="Perencanaan Tanpa Hambatan" />
            <Field label="Deskripsi Pilar 2" settingKey="about-pillar-2-desc" rows={2} placeholder="Dari koordinasi vendor katering..." />
          </div>

          <div className="p-3 bg-white/50 rounded-lg space-y-2 border">
            <p className="font-semibold text-xs text-primary">Kartu Pilar 3</p>
            <Field label="Judul Pilar 3" settingKey="about-pillar-3-title" placeholder="Komitmen Anggaran Transparan" />
            <Field label="Deskripsi Pilar 3" settingKey="about-pillar-3-desc" rows={2} placeholder="Tidak ada biaya tersembunyi..." />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> Statistik Mini</p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <Field label={`Nilai ${n}`} settingKey={`about-stat-${n}-value`} placeholder={["500+", "10+", "98%"][n - 1]} />
              <Field label={`Label ${n}`} settingKey={`about-stat-${n}-label`} placeholder={["Resepsi Sukses", "Tahun Pengalaman", "Kepuasan Klien"][n - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Layanan Pendampingan Menyeluruh</p>
        <Field label="Judul Bagian Pendampingan" settingKey="about-services-title" placeholder="Pendampingan Menyeluruh" />
        <Field label="Deskripsi Bagian Pendampingan" settingKey="about-services-desc" placeholder="Kami merancang sistem kerja terintegrasi..." rows={2} />
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-2 gap-3 p-3 bg-white/50 rounded-lg border mb-3 last:mb-0 animate-fade-in">
            <div className="col-span-2"><p className="font-semibold text-xs text-primary font-serif">Layanan {n}</p></div>
            <Field label={`Judul Layanan ${n}`} settingKey={`about-service-${n}-title`} placeholder={["Konsultasi Tanpa Batas", "Mitra Vendor Kredibel", "Manajemen Hari H yang Solid"][n - 1]} />
            <Field label={`Deskripsi Layanan ${n}`} settingKey={`about-service-${n}-desc`} rows={2} placeholder="Deskripsi layanan pendampingan..." />
          </div>
        ))}
      </div>
    </div>
  );
}



function PanelContact() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Informasi Kontak</p>
        <Field label="Nomor Telepon" settingKey="phone" placeholder="+62 812 3456 7890" />
        <Field label="WhatsApp Utama (angka saja)" settingKey="whatsapp" placeholder="6281234567890" />
        <Field label="Format Pesan WhatsApp Otomatis (Floating Button)" settingKey="whatsapp-message" placeholder="Halo! Saya tertarik dengan layanan wedding organizer Galeria Wedding..." rows={2} />
        <Field label="Email" settingKey="email" placeholder="info@galeriawedding.com" />
        <Field label="Alamat" settingKey="address" placeholder="Jl. Contoh No. 123, Purwokerto" rows={2} />
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Jam Operasional</p>
        <Field label="Senin – Jumat" settingKey="hours-weekday" placeholder="08.00 – 17.00 WIB" />
        <Field label="Sabtu" settingKey="hours-saturday" placeholder="08.00 – 15.00 WIB" />
        <Field label="Minggu / Libur" settingKey="hours-sunday" placeholder="Tutup" />
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Lokasi Maps</p>
        <Field label="Query Google Maps" settingKey="maps-query" placeholder="Galeria Wedding Purwokerto" />
        <p className="text-xs text-gray-400">Nama toko atau alamat lengkap untuk pencarian di Google Maps.</p>
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Sosial Media</p>
        <Field label="Instagram URL" settingKey="instagram" placeholder="https://instagram.com/galeriawedding" />
        <Field label="Facebook URL" settingKey="facebook" placeholder="https://facebook.com/galeriawedding" />
        <Field label="YouTube URL" settingKey="youtube" placeholder="https://youtube.com/@galeriawedding" />
      </div>
    </div>
  );
}

function PanelWedding() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Hero Halaman Wedding & Kontak WhatsApp</p>
        <Field label="Badge Hero" settingKey="wedding-hero-badge" placeholder="Penyelenggara Pernikahan Premium" />
        <Field label="Judul Utama" settingKey="wedding-hero-title" placeholder="Wujudkan Pernikahan Impian Sempurna & Berkesan" />
        <Field label="Subjudul" settingKey="wedding-hero-subtitle" placeholder="Nikmati perjalanan menuju hari bahagia..." rows={3} />
        <Field label="WhatsApp Khusus Halaman Wedding (opsional, angka saja)" settingKey="wedding-whatsapp" placeholder="Contoh: 6285329077987" />
        <Field label="Format Pesan Konsultasi Anggaran" settingKey="wedding-whatsapp-message" placeholder="Halo! Saya tertarik untuk berkonsultasi mengenai paket pernikahan..." rows={2} />
        <Field label="Format Pesan Tombol Pilih Paket (mendukung {packageName} & {packagePrice})" settingKey="wedding-whatsapp-pkg-message" placeholder="Halo, saya tertarik dengan paket {packageName} seharga {packagePrice}..." rows={2} />
        <Field label="Format Pesan Tombol Konsultasi Paket (mendukung {packageName})" settingKey="wedding-whatsapp-consult-message" placeholder="Halo, saya ingin berkonsultasi tentang paket {packageName}..." rows={2} />
        <ImageField label="Gambar Latar Belakang Hero" settingKey="wedding-hero-bg" />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> Statistik Halaman Wedding (4 Kartu Statistik)</p>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Statistik {n}</p>
              <Field label="Angka" settingKey={`wedding-stat-${n}-val`} placeholder={["500+", "10+", "98%", "100%"][n - 1]} />
              <Field label="Label" settingKey={`wedding-stat-${n}-lbl`} placeholder={["Pernikahan Sukses", "Tahun Pengalaman", "Kepuasan Klien", "Vendor Berlisensi"][n - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Alur Proses Perencanaan (3 Langkah)</p>
        <Field label="Judul Bagian Proses" settingKey="wedding-process-title" placeholder="Langkah Mudah Mewujudkannya" />
        <Field label="Deskripsi Bagian Proses" settingKey="wedding-process-desc" placeholder="Alur perencanaan terstruktur..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Langkah {n}</p>
              <Field label="Judul Langkah" settingKey={`wedding-proc-${n}-title`} placeholder={["Konsultasi Konsep", "Pemilihan Vendor", "Koordinasi Hari H"][n - 1]} />
              <Field label="Deskripsi Langkah" settingKey={`wedding-proc-${n}-desc`} rows={2} placeholder="Deskripsi detail..." />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Mengapa Memilih Kami? (4 Kartu Keunggulan)</p>
        <Field label="Judul Bagian Keunggulan" settingKey="wedding-why-title" placeholder="Mengapa Memilih Galeria Wedding?" />
        <Field label="Deskripsi Bagian Keunggulan" settingKey="wedding-why-desc" placeholder="Komitmen penuh kami dalam merancang..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Keunggulan {n}</p>
              <Field label="Judul Keunggulan" settingKey={`wedding-why-${n}-title`} placeholder={["Kustomisasi Desain & Paket", "Jaringan Vendor Premium", "Tim Organizer Terlatih", "Transparansi Biaya & Kontrak"][n - 1]} />
              <Field label="Deskripsi Keunggulan" settingKey={`wedding-why-${n}-desc`} rows={2} placeholder="Deskripsi..." />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Ajakan Bertindak (CTA)</p>
        <Field label="Judul CTA" settingKey="wedding-cta-title" placeholder="Siap Mewujudkan Pernikahan Impian Anda?" />
        <Field label="Deskripsi CTA" settingKey="wedding-cta-desc" placeholder="Konsultasikan konsep tema impian..." rows={3} />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> FAQ Halaman Wedding (4 Tanya Jawab)</p>
        <Field label="Judul FAQ" settingKey="wedding-faq-title" placeholder="Pertanyaan Umum" />
        <Field label="Subjudul FAQ" settingKey="wedding-faq-subtitle" placeholder="Jawaban lengkap seputar perencanaan pernikahan..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">FAQ {n}</p>
              <Field label="Pertanyaan" settingKey={`wedding-faq-${n}-q`} placeholder={[
                "Apakah item di dalam paket pernikahan bisa diubah atau dikustomisasi?",
                "Kapan waktu terbaik untuk mulai menggunakan jasa wedding organizer?",
                "Apakah Galeria Wedding melayani pernikahan di luar kota?",
                "Bagaimana sistem pembayaran dan terminasi kontrak?"
              ][n - 1]} />
              <Field label="Jawaban" settingKey={`wedding-faq-${n}-a`} rows={3} placeholder={[
                "Tentu saja! Kami sangat fleksibel. Semua paket pernikahan kami bersifat kustomisasi penuh...",
                "Waktu terbaik adalah sekitar 6 hingga 12 bulan sebelum hari pernikahan...",
                "Ya, kami sangat senang melayani pernikahan destinasi di luar kota maupun luar pulau...",
                "Pembayaran dilakukan secara bertahap untuk kemudahan Anda: Booking fee awal..."
              ][n - 1]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelPrinting() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Hero Halaman Percetakan & Kontak WhatsApp</p>
        <Field label="Badge Hero" settingKey="printing-hero-badge" placeholder="✨ Percetakan Digital Terbaik" />
        <Field label="Judul Utama" settingKey="printing-hero-title" placeholder="Percetakan & Desain Profesional" />
        <Field label="Subjudul" settingKey="printing-hero-subtitle" placeholder="Layanan percetakan lengkap..." rows={3} />
        <Field label="WhatsApp Khusus Halaman Percetakan (opsional, angka saja)" settingKey="printing-whatsapp" placeholder="Contoh: 6285329077987" />
        <Field label="Format Pesan Konsultasi Umum Percetakan" settingKey="printing-whatsapp-message" placeholder="Halo! Saya ingin bertanya mengenai layanan percetakan di Galeria Wedding." rows={2} />
        <Field label="Format Pesan Tombol Pesan Langsung (mendukung {productName} & {categoryName})" settingKey="printing-direct-message" placeholder="*Halo Admin Percetakan Galeria Wedding!* 👋\n\nSaya ingin memesan produk percetakan:\n\n*📦 Produk:* {productName}..." rows={3} />
        <Field label="Pembuka Pesan Detail Order (Intro)" settingKey="printing-order-intro" placeholder="*Halo Admin Percetakan Galeria Wedding!* 👋\n\nSaya ingin memesan produk percetakan:" rows={2} />
        <Field label="Penutup Pesan Detail Order (Outro)" settingKey="printing-order-outro" placeholder="Mohon informasikan langkah selanjutnya. Terima kasih! 😊" rows={2} />
        <ImageField label="Gambar Latar Belakang Hero" settingKey="printing-hero-bg" />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> Statistik Halaman Percetakan (4 Kartu Statistik)</p>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Statistik {n}</p>
              <Field label="Angka" settingKey={`printing-stat-${n}-val`} placeholder={["500+", "2,000+", "3-5", "100%"][n - 1]} />
              <Field label="Label" settingKey={`printing-stat-${n}-lbl`} placeholder={["Klien Percetakan", "Order Terselesaikan", "Hari Pengerjaan", "Garansi Kualitas"][n - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Cara Memesan (3 Langkah)</p>
        <Field label="Judul Bagian Cara Memesan" settingKey="printing-proc-header" placeholder="Cara Memesan" />
        <Field label="Deskripsi Bagian Cara Memesan" settingKey="printing-proc-subheader" placeholder="Proses pemesanan yang mudah..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Langkah {n}</p>
              <Field label="Judul Langkah" settingKey={`printing-proc-${n}-title`} placeholder={["Pilih Produk", "Konfirmasi WhatsApp", "Produk Dikirim"][n - 1]} />
              <Field label="Deskripsi Langkah" settingKey={`printing-proc-${n}-desc`} rows={2} placeholder="Deskripsi..." />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> FAQ Halaman Percetakan (5 Tanya Jawab)</p>
        <Field label="Judul FAQ" settingKey="printing-faq-title" placeholder="FAQ Percetakan" />
        <Field label="Subjudul FAQ" settingKey="printing-faq-subtitle" placeholder="Pertanyaan yang sering diajukan" rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">FAQ {n}</p>
              <Field label="Pertanyaan" settingKey={`printing-faq-${n}-q`} placeholder={[
                "Berapa lama waktu pengerjaan?",
                "Bagaimana cara pembayaran?",
                "Apakah ada biaya desain?",
                "Bagaimana jika desain tidak sesuai?",
                "Apakah ada pengiriman ke seluruh Indonesia?"
              ][n - 1]} />
              <Field label="Jawaban" settingKey={`printing-faq-${n}-a`} rows={3} placeholder={[
                "Waktu pengerjaan bervariasi tergantung jenis produk. Undangan 3-5 hari, kaos 5-7 hari, banner 2-3 hari...",
                "Pembayaran dilakukan via transfer bank (BCA, Mandiri, BRI) atau COD untuk area tertentu. DP minimal 50%...",
                "Desain gratis untuk order minimal Rp 300.000. Untuk order di bawah itu, biaya desain mulai dari...",
                "Kami memberikan 2x revisi gratis. Setelah itu, revisi tambahan dikenakan biaya Rp 25.000 per revisi...",
                "Ya, kami melayani pengiriman ke seluruh Indonesia dengan kurir pilihan (JNE, J&T, SiCepat, GoSend)..."
              ][n - 1]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelUmrah() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Hero Halaman Umrah & Haji & Kontak WhatsApp</p>
        <Field label="Badge Hero" settingKey="umrah-hero-badge" placeholder="Travel Terpercaya Sejak 2005" />
        <Field label="Judul Utama" settingKey="umrah-hero-title" placeholder="Journey of a Lifetime" />
        <Field label="Subjudul" settingKey="umrah-hero-subtitle" placeholder="Menyempurnakan ibadah Anda..." rows={3} />
        <Field label="WhatsApp Khusus Halaman Umrah & Haji (opsional, angka saja)" settingKey="umrah-whatsapp" placeholder="Contoh: 6285329077987" />
        <Field label="Format Pesan Tombol Pesan Paket (mendukung {packageType}, {packageName}, & {packagePrice})" settingKey="umrah-booking-message" placeholder="Halo! Saya tertarik dengan paket {packageType}: {packageName}..." rows={3} />
        <ImageField label="Poster Video Latar Belakang" settingKey="umrah-hero-poster" />
        <Field label="URL Video Latar Belakang" settingKey="umrah-hero-video" placeholder="/umrah-hero-video.mp4" />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> Statistik Halaman Umrah & Haji (4 Kartu Statistik)</p>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Statistik {n}</p>
              <Field label="Angka" settingKey={`umrah-stat-${n}-val`} placeholder={["10,000+", "98.5%", "18+", "100%"][n - 1]} />
              <Field label="Label" settingKey={`umrah-stat-${n}-lbl`} placeholder={["Jamaah Berangkat", "Kepuasan Jamaah", "Tahun Pengalaman", "Legal & Terpercaya"][n - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Mengapa Memilih Kami? (4 Kartu Keunggulan)</p>
        <Field label="Judul Keunggulan" settingKey="umrah-why-title" placeholder="Mengapa Memilih Kami?" />
        <Field label="Deskripsi Keunggulan" settingKey="umrah-why-desc" placeholder="Komitmen kami adalah memberikan pengalaman ibadah yang sempurna..." rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">Kartu {n}</p>
              <Field label="Judul" settingKey={`umrah-why-${n}-title`} placeholder={["Legal & Terpercaya", "Akomodasi Premium", "Bimbingan Eksklusif", "Layanan 24/7"][n - 1]} />
              <Field label="Deskripsi" settingKey={`umrah-why-${n}-desc`} rows={2} placeholder={[
                "Berizin resmi Kemenag RI dengan sertifikasi lengkap",
                "Hotel bintang 4 & 5 dekat Masjidil Haram & Nabawi",
                "Dibimbing ustadz/ustadzah kompeten berpengalaman",
                "Tim pendamping siap membantu selama perjalanan"
              ][n - 1]} />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Fitur 1" settingKey={`umrah-why-${n}-f1`} placeholder={["Izin PPIU No. 123/2023", "Jarak <500m", "Talaqqi Quran", "Medical Support"][n - 1]} />
                <Field label="Fitur 2" settingKey={`umrah-why-${n}-f2`} placeholder={["Sertifikat Halal", "Free WiFi", "Bimbingan Manasik", "Customer Care"][n - 1]} />
                <Field label="Fitur 3" settingKey={`umrah-why-${n}-f3`} placeholder={["Asuransi Lengkap", "Breakfast Buffet", "Konsultasi Ibadah", "Emergency Response"][n - 1]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> FAQ Halaman Umrah & Haji (4 Tanya Jawab)</p>
        <Field label="Judul FAQ" settingKey="umrah-faq-title" placeholder="Pertanyaan Umum" />
        <Field label="Subjudul FAQ" settingKey="umrah-faq-subtitle" placeholder="Temukan jawaban untuk pertanyaan yang sering diajukan" rows={2} />
        
        <div className="border-t pt-4 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3 bg-white/50 rounded-lg border space-y-2">
              <p className="font-semibold text-xs text-primary">FAQ {n}</p>
              <Field label="Pertanyaan" settingKey={`umrah-faq-${n}-q`} placeholder={[
                "Apa saja persyaratan pendaftaran Umrah?",
                "Apakah harga paket sudah termasuk visa dan tiket pesawat?",
                "Bagaimana jika saya ingin sekamar berdua atau bertiga saja?",
                "Bagaimana sistem pembatalan dan pengembalian dana?"
              ][n - 1]} />
              <Field label="Jawaban" settingKey={`umrah-faq-${n}-a`} rows={3} placeholder={[
                "Persyaratan utama meliputi paspor asli dengan masa berlaku minimal 6 bulan, foto kopi KTP & KK...",
                "Ya, semua paket Umrah dan Haji kami bersifat all-inclusive (all-in). Sudah termasuk tiket pesawat PP...",
                "Sangat bisa. Default harga paket biasanya didasarkan pada kamar Quad (sekamar berempat)...",
                "Pembatalan setelah booking seat dikenakan biaya administrasi. Pembatalan 30 hari sebelum keberangkatan..."
              ][n - 1]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

const TABS = [
  { id: "general",   label: "Umum & Warna" },
  { id: "hero",      label: "Hero" },
  { id: "about",     label: "About" },
  { id: "contact",   label: "Kontak & Lokasi" },
  { id: "wedding",   label: "Halaman Wedding" },
  { id: "printing",  label: "Halaman Percetakan" },
  { id: "umrah",     label: "Halaman Umrah & Haji" },
];

export default function AppearanceSettings() {
  const { updateSettings, settings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings(settings);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert("Gagal menyimpan: " + (result.error || "Unknown error"));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Tampilan Website</h3>
          <p className="text-sm text-gray-500">Ubah teks, gambar, dan warna di semua halaman</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
          }`}
        >
          {saving ? "Menyimpan..." : saved ? "✓ Tersimpan" : "Simpan Semua"}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap gap-1 mb-6 border-b pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="max-h-[65vh] overflow-y-auto pr-1">
        {activeTab === "general" && <PanelGeneral />}
        {activeTab === "hero"    && <PanelHero />}
        {activeTab === "about"   && <PanelAbout />}
        {activeTab === "contact" && <PanelContact />}
        {activeTab === "wedding" && <PanelWedding />}
        {activeTab === "printing" && <PanelPrinting />}
        {activeTab === "umrah"   && <PanelUmrah />}
      </div>
    </div>
  );
}
