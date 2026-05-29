import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function LocationMap() {
  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Lokasi & Kontak Kami</h2>
        <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
          Kunjungi kantor kami atau hubungi tim profesional kami untuk konsultasi gratis.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9846838281786!2d107.6099386!3d-6.9271279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e3b3b3b3b3b3%3A0x0!2sGaleria%20Wedding%20Organizer!5e0!3m2!1sid!2sid!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <MapPin className="text-red-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Alamat</h3>
                <p className="text-gray-600">
                  Jl. Contoh No. 123, Kota, Provinsi 12345
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Phone className="text-blue-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Telepon</h3>
                <p className="text-gray-600">+62 812 3456 7890</p>
                <p className="text-gray-600">+62 821 9876 5432</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Mail className="text-green-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-gray-600">info@galeriawedding.com</p>
                <p className="text-gray-600">support@galeriawedding.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Clock className="text-purple-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg mb-1">Jam Operasional</h3>
                <p className="text-gray-600">Senin - Jumat: 09:00 - 18:00</p>
                <p className="text-gray-600">Sabtu: 10:00 - 16:00</p>
                <p className="text-gray-600">Minggu: Tutup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
