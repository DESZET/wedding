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
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Teks About</p>
        <Field label="Paragraf 1" settingKey="about-paragraph-1" rows={3} placeholder="Galeria Wedding adalah..." />
        <Field label="Paragraf 2" settingKey="about-paragraph-2" rows={3} placeholder="Kami percaya bahwa..." />
        <Field label="Paragraf 3" settingKey="about-paragraph-3" rows={3} placeholder="Tim kami yang berpengalaman..." />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><ImageIcon className="w-4 h-4 text-primary" /> Gambar About</p>
        <ImageField label="Gambar Kiri (Foto Tim)" settingKey="about-image-1" />
        <ImageField label="Gambar Kanan (Foto Layanan)" settingKey="about-image-2" />
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Info className="w-4 h-4 text-primary" /> Statistik Mini</p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <Field label={`Nilai ${n}`} settingKey={`about-stat-${n}-value`} placeholder={["500+", "10+", "98%"][n - 1]} />
              <Field label={`Label ${n}`} settingKey={`about-stat-${n}-label`} placeholder={["Pernikahan Sukses", "Tahun Pengalaman", "Kepuasan Klien"][n - 1]} />
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Layanan Premium</p>
        <Field label="Judul Bagian" settingKey="about-services-title" placeholder="Layanan Premium Kami" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-2 gap-3">
            <Field label={`Layanan ${n} — Judul`} settingKey={`about-service-${n}-title`} placeholder={["Konsultasi Gratis", "Vendor Terpercaya", "Koordinasi Lengkap"][n - 1]} />
            <Field label={`Layanan ${n} — Deskripsi`} settingKey={`about-service-${n}-desc`} placeholder="Deskripsi layanan..." />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelWhyChooseUs() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Header Section</p>
        <Field label="Judul" settingKey="why-title" placeholder="Mengapa Harus Pilih Kami?" />
        <Field label="Subjudul" settingKey="why-subtitle" placeholder="Galeria Wedding bukan hanya wedding organizer..." rows={2} />
      </div>
      <div className={sectionCls}>
        <p className={headingCls}><LayoutTemplate className="w-4 h-4 text-primary" /> 6 Kartu Keunggulan</p>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="grid grid-cols-2 gap-3 pb-3 border-b last:border-0">
            <Field label={`Kartu ${n} — Judul`} settingKey={`why-benefit-${n}-title`} placeholder={["10+ Tahun Pengalaman", "Passion & Dedikasi", "Terpercaya & Profesional", "Solusi Cepat & Efisien", "Network Vendor Terbaik", "Dukungan 24/7"][n - 1]} />
            <Field label={`Kartu ${n} — Deskripsi`} settingKey={`why-benefit-${n}-desc`} placeholder="Deskripsi keunggulan..." />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelStatistics() {
  return (
    <div className={sectionCls}>
      <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Section Statistik</p>
      <Field label="Judul" settingKey="stats-title" placeholder="Prestasi Kami dalam Angka" />
      <Field label="Subjudul" settingKey="stats-subtitle" placeholder="Kepercayaan klien adalah bukti kualitas layanan kami" />
      <p className="text-xs text-gray-400 mt-1">Data angka statistik dikelola di menu <strong>Statistics</strong> di sidebar.</p>
    </div>
  );
}

function PanelContact() {
  return (
    <div className="space-y-5">
      <div className={sectionCls}>
        <p className={headingCls}><Type className="w-4 h-4 text-primary" /> Informasi Kontak</p>
        <Field label="Nomor Telepon" settingKey="phone" placeholder="+62 812 3456 7890" />
        <Field label="WhatsApp (angka saja)" settingKey="whatsapp" placeholder="6281234567890" />
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

// ─── main component ──────────────────────────────────────────────────────────

const TABS = [
  { id: "general",   label: "Umum & Warna" },
  { id: "hero",      label: "Hero" },
  { id: "about",     label: "About" },
  { id: "why",       label: "Keunggulan" },
  { id: "stats",     label: "Statistik" },
  { id: "contact",   label: "Kontak & Lokasi" },
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
        {activeTab === "why"     && <PanelWhyChooseUs />}
        {activeTab === "stats"   && <PanelStatistics />}
        {activeTab === "contact" && <PanelContact />}
      </div>
    </div>
  );
}
