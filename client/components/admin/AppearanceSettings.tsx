import { useState, useEffect, createContext, useContext } from "react";
import { 
  Upload, Image as ImageIcon, Type, Palette, LayoutTemplate, Info, 
  Save, Sparkles, Check, Trash2, RotateCcw
} from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import { compressImage } from "@/lib/imageCompressor";

// ─── Local Form State Context ───────────────────────────────────────────────

interface FormContextType {
  formSettings: Record<string, string>;
  updateField: (key: string, value: string) => void;
}

const FormSettingsContext = createContext<FormContextType>({
  formSettings: {},
  updateField: () => {},
});

// ─── helpers & styling ───────────────────────────────────────────────────────

const inputCls =
  "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm bg-white";
const labelCls = "block text-sm font-medium mb-1 text-gray-700";
const sectionCls = "border rounded-xl p-5 space-y-4 bg-gray-50 shadow-sm";
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
  const { formSettings, updateField } = useContext(FormSettingsContext);
  const value = formSettings[settingKey] ?? "";

  if (rows) {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <textarea
          className={inputCls}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => updateField(settingKey, e.target.value)}
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
        onChange={(e) => updateField(settingKey, e.target.value)}
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
  const { formSettings, updateField } = useContext(FormSettingsContext);
  const value = formSettings[settingKey] ?? "";
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const processedFile = await compressImage(file);
      const fd = new FormData();
      fd.append("image", processedFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        updateField(settingKey, data.data.path);
      } else {
        alert("Gagal upload gambar: " + (data.error || "Server error"));
      }
    } catch {
      alert("Error saat upload gambar");
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
          placeholder={placeholder || "URL gambar atau upload via tombol di samping"}
          value={value}
          onChange={(e) => updateField(settingKey, e.target.value)}
        />
        <label className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 text-sm whitespace-nowrap shadow-sm">
          <Upload className="w-4 h-4" />
          {uploading ? "Mengunggah..." : "Upload"}
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
        {value && (
          <button
            type="button"
            onClick={() => updateField(settingKey, "")}
            className="px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-sm"
            title="Hapus gambar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 relative w-fit">
          <img
            src={value}
            alt="preview"
            className="h-24 w-auto rounded-lg object-cover border shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

function ColorField({ label, settingKey }: { label: string; settingKey: string }) {
  const { formSettings, updateField } = useContext(FormSettingsContext);
  const value = formSettings[settingKey] ?? "#d97706";
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          className="h-10 w-14 border rounded cursor-pointer p-0.5 bg-white"
          value={value}
          onChange={(e) => updateField(settingKey, e.target.value)}
        />
        <input
          type="text"
          className={inputCls}
          value={value}
          onChange={(e) => updateField(settingKey, e.target.value)}
        />
      </div>
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
        <ImageField label="Logo Website (Gambar / Foto Logo)" settingKey="site-logo" placeholder="Upload file logo (.png, .jpg, .svg) atau tempel URL..." />
        <Field label="Huruf Logo (Fallback jika tanpa gambar)" settingKey="logo-letter" placeholder="G" />
        <Field label="Tagline" settingKey="tagline" placeholder="Mewujudkan Pernikahan Impian Anda" />
        <Field label="Deskripsi Singkat" settingKey="description" placeholder="Deskripsi website..." rows={2} />
        <Field label="Copyright Footer" settingKey="footer-copyright" placeholder="© 2025 Galeria Wedding. All rights reserved." />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Palette className="w-4 h-4 text-primary" /> Warna Tema</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Warna Primer", key: "primary-color" },
            { label: "Warna Sekunder", key: "secondary-color" },
            { label: "Warna Aksen", key: "accent-color" },
            { label: "Warna Background", key: "background-color" },
          ].map(({ label, key }) => (
            <ColorField key={key} label={label} settingKey={key} />
          ))}
        </div>

        {/* Panduan Informasi Warna */}
        <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs leading-relaxed text-slate-600">
          <p className="font-semibold text-primary flex items-center gap-1.5 text-sm mb-1">
            <Info className="w-4 h-4" /> Panduan Memilih Warna Website:
          </p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>
              <strong className="text-slate-800">Warna Primer:</strong> Warna utama identitas brand Anda untuk tombol utama, link penting, dan fokus visual.
            </li>
            <li>
              <strong className="text-slate-800">Warna Sekunder:</strong> Warna pendukung untuk latar belakang atau penyeimbang visual.
            </li>
            <li>
              <strong className="text-slate-800">Warna Aksen:</strong> Warna sorotan untuk badge promo, rating, ikon aktif, dll.
            </li>
            <li>
              <strong className="text-slate-800">Warna Background:</strong> Warna dasar untuk latar belakang halaman.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PanelHero() {
  const { formSettings, updateField } = useContext(FormSettingsContext);

  // Hero images stored as JSON array in setting 'hero-images'
  const heroImages: string[] = (() => {
    try {
      const raw = formSettings["hero-images"];
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const setSlotImage = (index: number, url: string) => {
    const updated = [...heroImages];
    while (updated.length <= index) {
      updated.push("");
    }
    updated[index] = url;
    // Remove empty slots from end
    while (updated.length > 0 && !updated[updated.length - 1]) {
      updated.pop();
    }
    updateField("hero-images", JSON.stringify(updated));
  };

  const removeSlotImage = (index: number) => {
    const updated = [...heroImages];
    updated.splice(index, 1);
    updateField("hero-images", JSON.stringify(updated));
  };

  const setDefault5Images = () => {
    const default5 = [
      "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1506574216779-a79c4a5b86c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ];
    updateField("hero-images", JSON.stringify(default5));
  };

  const handleSlotUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const processedFile = await compressImage(file);
      const fd = new FormData();
      fd.append("image", processedFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setSlotImage(index, data.data.path);
      } else {
        alert("Gagal upload gambar: " + (data.error || "Server error"));
      }
    } catch {
      alert("Terjadi kesalahan saat upload gambar");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Teks Hero Utama (Beranda)</p>
        <Field label="Judul Utama Hero" settingKey="hero-title" placeholder="Your Perfect Wedding Awaits" />
        <Field label="Subjudul Hero" settingKey="hero-subtitle" placeholder="Create unforgettable memories with our premium wedding planning and design services" rows={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teks Tombol Utama" settingKey="hero-button-primary" placeholder="Start Planning" />
          <Field label="Teks Tombol Kedua" settingKey="hero-button-secondary" placeholder="View Gallery" />
        </div>
      </div>

      {/* 5 Slot Gambar Slideshow Hero */}
      <div className={sectionCls}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <p className={headingCls}><ImageIcon className="w-4 h-4 text-primary" /> 5 Gambar Slideshow Hero (Home)</p>
            <p className="text-xs text-gray-500">Gambar akan berganti otomatis secara sinematik dengan efek paralaks di Beranda.</p>
          </div>
          <button
            type="button"
            onClick={setDefault5Images}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pakai 5 Gambar Rekomendasi</span>
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const currentImg = heroImages[slotIdx] || "";
            const isUploading = uploadingIndex === slotIdx;

            return (
              <div
                key={slotIdx}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              >
                {/* Thumbnail Preview */}
                <div className="w-28 h-20 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                  {currentImg ? (
                    <img src={currentImg} alt={`Hero slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium text-center px-1">Slot {slotIdx + 1}<br/>Kosong</span>
                  )}
                  <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    #{slotIdx + 1}
                  </span>
                </div>

                {/* Input & Controls */}
                <div className="flex-1 w-full space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Gambar {slotIdx + 1} {slotIdx === 0 ? "(Slide Pertama / Utama)" : ""}
                    </span>
                    {currentImg && (
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Aktif
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder={`URL Gambar ${slotIdx + 1} (https://... atau /uploads/...)`}
                      className="w-full p-2 border rounded-lg text-xs bg-slate-50 focus:bg-white font-mono"
                      value={currentImg}
                      onChange={(e) => setSlotImage(slotIdx, e.target.value)}
                    />
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <label className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 text-xs font-medium whitespace-nowrap shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? "..." : "Upload"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleSlotUpload(slotIdx, f);
                          }}
                        />
                      </label>

                      {currentImg && (
                        <button
                          type="button"
                          onClick={() => removeSlotImage(slotIdx)}
                          className="px-2.5 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-xs"
                          title="Hapus gambar slot ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <div key={n} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/50 rounded-lg border mb-3 last:mb-0">
            <div className="sm:col-span-2"><p className="font-semibold text-xs text-primary font-serif">Layanan {n}</p></div>
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
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Informasi Kontak (Beranda & Footer)</p>
        <Field label="Nomor Telepon" settingKey="phone" placeholder="+62 812 3456 7890" />
        <Field label="WhatsApp Utama (angka saja, contoh: 6281234567890)" settingKey="whatsapp" placeholder="6281234567890" />
        <Field label="Format Pesan WhatsApp Otomatis (Floating Button)" settingKey="whatsapp-message" placeholder="Halo! Saya tertarik dengan layanan wedding organizer Galeria Wedding..." rows={2} />
        <Field label="Email Resmi" settingKey="email" placeholder="info@galeriawedding.com" />
        <Field label="Alamat Kantor Lengkap" settingKey="address" placeholder="Jl. Contoh No. 123, Purwokerto, Jawa Tengah" rows={2} />
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Jam Operasional Kantor</p>
        <Field label="Senin – Jumat" settingKey="hours-weekday" placeholder="08.00 – 17.00 WIB" />
        <Field label="Sabtu" settingKey="hours-saturday" placeholder="08.00 – 15.00 WIB" />
        <Field label="Minggu / Libur" settingKey="hours-sunday" placeholder="Tutup" />
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Lokasi Google Maps</p>
        <Field label="Query Google Maps" settingKey="maps-query" placeholder="Galeria Wedding Purwokerto" />
        <p className="text-xs text-gray-400">Nama tempat atau alamat lengkap untuk pencarian di Google Maps.</p>
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> Sosial Media</p>
        <Field label="Instagram URL" settingKey="instagram" placeholder="https://instagram.com/galeriawedding" />
        <Field label="Facebook URL" settingKey="facebook" placeholder="https://facebook.com/galeriawedding" />
        <Field label="YouTube URL" settingKey="youtube" placeholder="https://youtube.com/@galeriawedding" />
        <Field label="TikTok URL" settingKey="tiktok" placeholder="https://tiktok.com/@galeriawedding" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
  { id: "hero",      label: "Hero (5 Gambar)" },
  { id: "about",     label: "About" },
  { id: "contact",   label: "Kontak & Lokasi" },
  { id: "wedding",   label: "Halaman Wedding" },
  { id: "printing",  label: "Halaman Percetakan" },
  { id: "umrah",     label: "Halaman Umrah & Haji" },
];

export default function AppearanceSettings() {
  const { updateSettings, settings } = useSettings();
  const [formSettings, setFormSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormSettings(prev => {
        // If not yet populated, populate from settings
        if (Object.keys(prev).length === 0) {
          return { ...settings };
        }
        return prev;
      });
    }
  }, [settings]);

  const updateField = (key: string, value: string) => {
    setFormSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateSettings(formSettings);
      if (result.success) {
        setSaved(true);
        setHasChanges(false);
        alert("✓ Pengaturan tampilan, logo, dan teks berhasil disimpan!");
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Gagal menyimpan perubahan: " + (result.error || "Unknown error"));
      }
    } catch (e: any) {
      alert("Terjadi kesalahan saat menyimpan: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Kembalikan perubahan ke data terakhir yang tersimpan di server?")) {
      setFormSettings({ ...settings });
      setHasChanges(false);
    }
  };

  return (
    <FormSettingsContext.Provider value={{ formSettings, updateField }}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">Pengaturan Tampilan Website</h3>
              {hasChanges && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Ada perubahan belum disimpan
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Ubah teks, nama brand, 5 foto hero, warna, dan konten semua halaman secara langsung.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all disabled:opacity-50"
              >
                Batal
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
                saved
                  ? "bg-emerald-600 text-white"
                  : hasChanges
                  ? "bg-primary text-white hover:bg-primary/90 ring-2 ring-primary/30"
                  : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>✓ Perubahan Tersimpan</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap gap-1.5 mb-6 border-b pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="max-h-[68vh] overflow-y-auto pr-1">
          {activeTab === "general" && <PanelGeneral />}
          {activeTab === "hero"    && <PanelHero />}
          {activeTab === "about"   && <PanelAbout />}
          {activeTab === "contact" && <PanelContact />}
          {activeTab === "wedding" && <PanelWedding />}
          {activeTab === "printing" && <PanelPrinting />}
          {activeTab === "umrah"   && <PanelUmrah />}
        </div>
      </div>
    </FormSettingsContext.Provider>
  );
}
