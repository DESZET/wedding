import { RequestHandler } from "express";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const API_URL = "https://models.github.ai/inference/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const TIMEOUT_S = 30000;

const SYSTEM_PROMPT = `Kamu adalah asisten virtual Galeria Wedding Organizer yang ramah dan profesional. 
Nama kamu adalah "Galeria AI". Kamu membantu calon pelanggan dengan informasi tentang:

1. LAYANAN WEDDING: Paket pernikahan (Silver Rp 8jt, Gold Rp 15jt, Platinum Rp 25jt), dekorasi, dokumentasi, catering, koordinator hari H
2. LAYANAN UMRAH & HAJI: Paket Umrah Reguler 9 Hari (Rp 26jt), Paket Umrah Plus Turki 15 Hari (Rp 42jt), Paket Haji Furoda 2025 (Rp 275jt)
3. LAYANAN PERCETAKAN: Undangan pernikahan, sablon kaos, banner, ID card, kartu nama, brosur, stiker
4. INFO KONTAK: WhatsApp 085329077987, melayani Senin-Sabtu 08.00-20.00 WIB

Panduan menjawab:
- Gunakan Bahasa Indonesia yang ramah, hangat, dan natural
- Untuk harga final selalu sarankan konsultasi langsung via WhatsApp 085329077987
- Jika pertanyaan di luar layanan kami, arahkan kembali ke layanan Galeria
- Jangan memberikan info yang tidak kamu tahu — sampaikan dengan jujur
- Respons ringkas dan to-the-point, maksimal 3-4 kalimat
- Gunakan emoji yang relevan untuk membuat percakapan lebih hidup`;

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: "messages array required" });
    }

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      return res.json({ success: true, reply: getRuleBasedReply(lastMsg) });
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
        return res.json({ success: true, reply: getRuleBasedReply(lastMsg) });
      }

      const data = await response.json() as any;
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "Maaf, saya tidak bisa memproses pesan Anda saat ini. Silakan hubungi kami di WhatsApp 085329077987 🙏";

      return res.json({ success: true, reply });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        console.error("GitHub Models timeout");
      } else {
        console.error("Fetch error:", fetchErr);
      }
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      return res.json({ success: true, reply: getRuleBasedReply(lastMsg) });
    }
  } catch (error) {
    console.error("Chat handler error:", error);
    res.status(500).json({ success: false, error: "Chat service unavailable" });
  }
};

function getRuleBasedReply(msg: string): string {
  if (msg.includes("harga") || msg.includes("paket") || msg.includes("biaya")) {
    return "Kami memiliki beberapa paket menarik! Paket Wedding mulai Rp 8jt (Silver), Rp 15jt (Gold), hingga Rp 25jt (Platinum). Paket Umrah mulai Rp 26jt dan percetakan mulai Rp 5.000/pcs. Untuk harga final, hubungi kami di WhatsApp 085329077987 ya! 😊";
  }
  if (msg.includes("wedding") || msg.includes("nikah") || msg.includes("pernikahan")) {
    return "Galeria Wedding Organizer siap mewujudkan pernikahan impian Anda! 🤍 Kami menyediakan dekorasi, MC, dokumentasi, catering, dan koordinator hari H. Ada 3 paket: Silver, Gold, dan Platinum. Hubungi kami di WhatsApp 085329077987 untuk konsultasi gratis!";
  }
  if (msg.includes("umrah") || msg.includes("haji")) {
    return "Kami menyediakan paket Umrah dan Haji berkualitas! 🕋 Mulai Umrah Reguler 9 hari (Rp 26jt), Umrah Plus Turki 15 hari (Rp 42jt), hingga Haji Furoda 2025 (Rp 275jt). Semua include hotel, tiket, visa & pembimbing. Info lengkap via WhatsApp 085329077987.";
  }
  if (msg.includes("cetak") || msg.includes("undangan") || msg.includes("printing") || msg.includes("percetakan")) {
    return "Layanan percetakan kami meliputi undangan pernikahan, sablon kaos, banner, ID card, kartu nama, brosur, dan stiker! 🖨️ Kualitas premium, harga terjangkau. Konsultasikan kebutuhan Anda via WhatsApp 085329077987.";
  }
  if (msg.includes("kontak") || msg.includes("hubungi") || msg.includes("wa") || msg.includes("whatsapp")) {
    return "Hubungi kami di WhatsApp 085329077987 📱 Tim kami siap membantu Senin–Sabtu pukul 08.00–20.00 WIB. Klik tombol WhatsApp hijau di pojok kanan bawah untuk chat langsung!";
  }
  if (msg.includes("halo") || msg.includes("hai") || msg.includes("hello") || msg.includes("hi") || msg.length < 10) {
    return "Halo! Selamat datang di Galeria Wedding Organizer 👋 Saya Galeria AI, asisten virtual kami. Saya bisa membantu informasi tentang paket wedding, umrah & haji, dan percetakan. Ada yang bisa saya bantu?";
  }
  return "Terima kasih sudah menghubungi Galeria Wedding Organizer! 😊 Kami melayani wedding organizer, umrah & haji, serta percetakan. Untuk info lengkap silakan hubungi WhatsApp 085329077987 atau tanyakan apa yang ingin Anda ketahui.";
}
