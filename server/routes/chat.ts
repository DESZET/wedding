import { RequestHandler } from "express";
import { dbAll } from "../database";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const API_URL = "https://models.github.ai/inference/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const TIMEOUT_S = 30000;

const formatRupiah = (num: number) => {
  if (!num) return "Rp 0";
  return "Rp " + Number(num).toLocaleString("id-ID");
};

interface DynamicContext {
  siteName: string;
  waNumber: string;
  phone: string;
  address: string;
  hours: string;
  weddingSummary: string;
  umrahSummary: string;
  hajiSummary: string;
  printingSummary: string;
}

async function loadDynamicContext(): Promise<DynamicContext> {
  // 1. Settings
  const settingsRows = await dbAll("SELECT key, value FROM settings").catch(() => []);
  const settings: Record<string, string> = {};
  settingsRows.forEach((s: any) => {
    if (s.key) settings[s.key] = s.value;
  });

  const siteName = settings["site-name"] || "Galeria Wedding & Business";
  const waNumber = settings["whatsapp"] || settings["phone"] || "085329077987";
  const phone = settings["phone"] || waNumber;
  const address = settings["address"] || "Purwokerto, Jawa Tengah";
  const hours = `${settings["hours-weekday"] || "Senin-Jumat 08.00-17.00 WIB"}, ${settings["hours-saturday"] || "Sabtu 08.00-15.00 WIB"}`;

  // 2. Wedding Packages
  const weddingPkgs = await dbAll("SELECT name, price, discount_price, description FROM packages WHERE is_active = 1 ORDER BY price ASC").catch(() => []);
  const weddingSummary = weddingPkgs.length > 0
    ? weddingPkgs.map((p: any) => {
        const priceStr = p.discount_price && p.discount_price < p.price
          ? `${formatRupiah(p.discount_price)} (Harga normal: ${formatRupiah(p.price)})`
          : formatRupiah(p.price);
        return `• ${p.name}: ${priceStr}${p.description ? ` (${p.description})` : ''}`;
      }).join("\n")
    : "• Paket Wedding: Konsultasi paket custom dan harga terbaik via WhatsApp.";

  // 3. Umrah Packages
  const umrahPkgs = await dbAll("SELECT name, price, discount_price, duration, package_type FROM umrah_packages WHERE is_active = 1 AND (package_type IS NULL OR package_type = 'umrah') ORDER BY price ASC").catch(() => []);
  const umrahSummary = umrahPkgs.length > 0
    ? umrahPkgs.map((p: any) => {
        const priceStr = p.discount_price && p.discount_price < p.price
          ? `${formatRupiah(p.discount_price)} (Normal: ${formatRupiah(p.price)})`
          : formatRupiah(p.price);
        return `• ${p.name} (${p.duration || 9} Hari): ${priceStr}`;
      }).join("\n")
    : "• Paket Umrah Reguler & Plus: Info jadwal & biaya langsung via WhatsApp.";

  // 4. Haji Packages
  const hajiPkgs = await dbAll("SELECT name, price, discount_price, quota_year FROM haji_packages WHERE is_active = 1 ORDER BY price ASC").catch(() => []);
  const hajiSummary = hajiPkgs.length > 0
    ? hajiPkgs.map((p: any) => {
        const priceStr = p.discount_price && p.discount_price < p.price
          ? `${formatRupiah(p.discount_price)} (Normal: ${formatRupiah(p.price)})`
          : formatRupiah(p.price);
        return `• ${p.name} (${p.quota_year || 'Tahun Ini'}): ${priceStr}`;
      }).join("\n")
    : "• Paket Haji Khusus & Furoda: Konsultasi kuota dan pendaftaran via WhatsApp.";

  // 5. Printing Products
  const printingProds = await dbAll("SELECT name, price, discount_price, min_order, estimated_time FROM printing_products WHERE is_active = 1 ORDER BY price ASC").catch(() => []);
  const printingSummary = printingProds.length > 0
    ? printingProds.slice(0, 8).map((p: any) => {
        const priceStr = p.discount_price && p.discount_price < p.price
          ? `${formatRupiah(p.discount_price)} (Normal: ${formatRupiah(p.price)})`
          : formatRupiah(p.price);
        return `• ${p.name}: ${priceStr}/pcs (Min. order ${p.min_order || 1} pcs, Est: ${p.estimated_time || '3-5 hari'})`;
      }).join("\n")
    : "• Layanan Percetakan: Undangan, sablon kaos, banner, souvenir custom, ID card, dan brosur.";

  return {
    siteName,
    waNumber,
    phone,
    address,
    hours,
    weddingSummary,
    umrahSummary,
    hajiSummary,
    printingSummary,
  };
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: "messages array required" });
    }

    // Load real-time database context (settings, live package prices, live contacts)
    const ctx = await loadDynamicContext();

    const SYSTEM_PROMPT = `Kamu adalah asisten virtual resmi ${ctx.siteName} yang ramah, sopan, informatif dan profesional.
Nama kamu adalah "Galeria AI". Kamu membantu calon pelanggan dengan informasi TERKINI dan NYATA dari sistem kami:

1. DAFTAR PAKET WEDDING TERKINI:
${ctx.weddingSummary}

2. DAFTAR PAKET UMRAH & HAJI TERKINI:
${ctx.umrahSummary}
${ctx.hajiSummary}

3. DAFTAR LAYANAN PERCETAKAN TERKINI:
${ctx.printingSummary}

4. INFO KONTAK & OPERASIONAL:
• Nama Brand: ${ctx.siteName}
• WhatsApp Resmi: ${ctx.waNumber}
• Telepon: ${ctx.phone}
• Alamat Kantor: ${ctx.address}
• Jam Operasional: ${ctx.hours}

Panduan menjawab:
- Gunakan Bahasa Indonesia yang ramah, hangat, sopan, dan natural.
- Selalu sebutkan harga sesuai dengan data terkini di atas.
- Untuk konsultasi kustom, diskon khusus, dan booking tanggal, selalu arahkan untuk chat langsung ke WhatsApp ${ctx.waNumber}.
- Jika ditanya nomor kontak/alamat/jam buka, berikan data nomor WhatsApp ${ctx.waNumber} dan alamat ${ctx.address}.
- Respons padat, jelas, informatif (maksimal 3-4 kalimat).
- Gunakan emoji relevan (🤍, 🕋, 🖨️, ✨, 📱).`;

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      return res.json({ success: true, reply: getDynamicRuleBasedReply(lastMsg, ctx) });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_S);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-10),
          ],
          max_tokens: 350,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const err = await response.text();
        console.error("GitHub Models error:", response.status, err);
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
        return res.json({ success: true, reply: getDynamicRuleBasedReply(lastMsg, ctx) });
      }

      const data = await response.json() as any;
      const reply = data.choices?.[0]?.message?.content?.trim()
        || `Maaf, saya tidak bisa memproses pesan Anda saat ini. Silakan hubungi kami langsung via WhatsApp di ${ctx.waNumber} 🙏`;

      return res.json({ success: true, reply });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.error("Fetch/Model error, falling back to dynamic rules:", fetchErr);
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      return res.json({ success: true, reply: getDynamicRuleBasedReply(lastMsg, ctx) });
    }
  } catch (error) {
    console.error("Chat handler error:", error);
    res.status(500).json({ success: false, error: "Chat service unavailable" });
  }
};

function getDynamicRuleBasedReply(msg: string, ctx: DynamicContext): string {
  if (msg.includes("harga") || msg.includes("paket") || msg.includes("biaya") || msg.includes("pricelist")) {
    return `Berikut ringkasan paket & harga terkini di ${ctx.siteName}:\n\n💍 Wedding:\n${ctx.weddingSummary}\n\n🕋 Umrah & Haji:\n${ctx.umrahSummary}\n\n🖨️ Percetakan:\n${ctx.printingSummary}\n\nUntuk konsultasi kustom dan penawaran terbaik, silakan hubungi WhatsApp kami di ${ctx.waNumber} ya! 😊`;
  }
  if (msg.includes("wedding") || msg.includes("nikah") || msg.includes("pernikahan") || msg.includes("wo") || msg.includes("organizer")) {
    return `${ctx.siteName} siap mewujudkan pernikahan impian Anda! 🤍\n\nPaket Wedding kami:\n${ctx.weddingSummary}\n\nHubungi kami via WhatsApp ${ctx.waNumber} untuk konsultasi gratis dan kustomisasi acara!`;
  }
  if (msg.includes("umrah") || msg.includes("umroh") || msg.includes("haji")) {
    return `Kami menyediakan paket Umrah & Haji resmi berizin Kemenag RI 🕋\n\n${ctx.umrahSummary}\n${ctx.hajiSummary}\n\nSemua paket mencakup tiket, hotel dekat masjid, visa & mutawwif. Info jadwal & kuota via WhatsApp ${ctx.waNumber}.`;
  }
  if (msg.includes("cetak") || msg.includes("undangan") || msg.includes("printing") || msg.includes("percetakan") || msg.includes("kaos") || msg.includes("banner") || msg.includes("souvenir")) {
    return `Layanan Percetakan ${ctx.siteName} menyediakan cetak undangan premium, sablon kaos, banner, souvenir, photobook, ID card, dan stiker 🖨️\n\nProduk populer:\n${ctx.printingSummary}\n\nKonsultasi desain & pemesanan via WhatsApp ${ctx.waNumber}.`;
  }
  if (msg.includes("kontak") || msg.includes("hubungi") || msg.includes("wa") || msg.includes("whatsapp") || msg.includes("nomor") || msg.includes("alamat") || msg.includes("lokasi") || msg.includes("buka") || msg.includes("jam")) {
    return `📍 Alamat Kantor: ${ctx.address}\n📱 WhatsApp / Telepon: ${ctx.waNumber}\n⏰ Jam Operasional: ${ctx.hours}\n\nSilakan hubungi WhatsApp kami untuk respon cepat dari tim kami!`;
  }
  if (msg.includes("halo") || msg.includes("hai") || msg.includes("hello") || msg.includes("hi") || msg.length < 10) {
    return `Halo! Selamat datang di ${ctx.siteName} 👋 Saya Galeria AI. Kami siap melayani Paket Wedding Organizer, Travel Umrah & Haji, serta Layanan Percetakan.\n\nAda yang bisa kami bantu hari ini?`;
  }
  return `Terima kasih sudah menghubungi ${ctx.siteName}! 😊 Kami siap melayani Paket Wedding, Umrah & Haji, serta Percetakan.\n\nUntuk info lengkap atau tanya-tanya, Anda bisa langsung chat WhatsApp kami di ${ctx.waNumber} atau tanyakan di sini.`;
}
