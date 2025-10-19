import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Calendar, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Section, SectionHeader, SectionTitle, SectionDescription } from '@/components/sections/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { schoolInfo } from '@/data/school';

const steps = [
  {
    number: 1,
    title: "Pengambilan Formulir",
    description: "Ambil formulir pendaftaran di sekolah atau download dari website resmi",
    icon: FileText
  },
  {
    number: 2,
    title: "Melengkapi Berkas",
    description: "Siapkan dan lengkapi semua dokumen persyaratan yang diminta",
    icon: CheckCircle
  },
  {
    number: 3,
    title: "Pendaftaran",
    description: "Daftar online atau langsung ke sekolah sesuai jadwal gelombang",
    icon: UserPlus
  },
  {
    number: 4,
    title: "Tes & Wawancara",
    description: "Mengikuti tes akademik dan wawancara sesuai jadwal yang ditentukan",
    icon: Calendar
  },
  {
    number: 5,
    title: "Pengumuman",
    description: "Pengumuman hasil seleksi akan diinformasikan melalui website dan telepon",
    icon: AlertCircle
  },
  {
    number: 6,
    title: "Daftar Ulang",
    description: "Calon siswa yang diterima melakukan daftar ulang dan pembayaran",
    icon: DollarSign
  }
];

const requirements = [
  "Lulus SMP/MTs dengan nilai rata-rata minimal 7.5",
  "Fotokopi ijazah dan SKHUN yang dilegalisir",
  "Fotokopi rapor semester 1-5",
  "Surat keterangan berkelakuan baik dari sekolah asal",
  "Fotokopi akta kelahiran",
  "Fotokopi Kartu Keluarga dan KTP orang tua",
  "Pas foto terbaru ukuran 3x4 sebanyak 6 lembar",
  "Surat keterangan sehat dari dokter",
  "Formulir pendaftaran yang telah diisi lengkap"
];

const importantDates = [
  { event: "Pembukaan Pendaftaran Gelombang 1", date: "1 Oktober 2025" },
  { event: "Penutupan Pendaftaran Gelombang 1", date: "30 November 2025" },
  { event: "Tes Akademik & Wawancara Gelombang 1", date: "5-10 Desember 2025" },
  { event: "Pengumuman Hasil Gelombang 1", date: "15 Desember 2025" },
  { event: "Daftar Ulang Gelombang 1", date: "16-20 Desember 2025" },
  { event: "Pembukaan Pendaftaran Gelombang 2", date: "2 Januari 2026" },
];

export function PCPDB() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <>
      <SEO 
        title="PCPDB - SMA Katolik St. Louis 1 Surabaya"
        description="Informasi Penerimaan Calon Peserta Didik Baru (PCPDB) SMA Katolik St. Louis 1 Surabaya tahun ajaran 2025/2026. Jadwal, persyaratan, dan cara pendaftaran."
        keywords="PCPDB, pendaftaran siswa baru, SMA St. Louis 1, tahun ajaran 2025/2026, persyaratan pendaftaran"
      />

      <div className="min-h-screen pt-20">
        <Section>
          <SectionHeader>
            <SectionTitle as="h1">
              PCPDB 
              <span className="gradient-text">2025/2026</span>
            </SectionTitle>
            <SectionDescription>
              Penerimaan Calon Peserta Didik Baru SMA Katolik St. Louis 1 Surabaya 
              Tahun Ajaran 2025/2026. Bergabunglah dengan tradisi keunggulan pendidikan kami.
            </SectionDescription>
          </SectionHeader>

          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-school-accent/10 to-school-accent-dark/10 border-school-accent/20">
              <CardContent className="p-8 text-center">
                <UserPlus className="w-16 h-16 text-school-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-school-text mb-2">
                  Pendaftaran Dibuka!
                </h3>
                <p className="text-school-text-muted mb-4">
                  Kuota tersedia: <span className="font-bold text-school-accent">300 siswa</span> 
                  untuk tahun ajaran 2025/2026
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-school-accent hover:bg-school-accent-dark text-school-primary">
                    Daftar Sekarang
                  </Button>
                  <Button variant="outline">
                    Download Formulir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Registration Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-school-text text-center mb-8">
              Alur Pendaftaran
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-school-secondary/50 border-school-accent/20 card-hover">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-school-accent rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-school-primary font-bold">{step.number}</span>
                      </div>
                      <step.icon className="w-8 h-8 text-school-accent mx-auto mb-3" />
                      <h4 className="text-lg font-bold text-school-text mb-2">
                        {step.title}
                      </h4>
                      <p className="text-school-text-muted text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Requirements and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full bg-school-secondary/50 border-school-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-school-text">
                    <FileText className="w-6 h-6 text-school-accent mr-2" />
                    Persyaratan Pendaftaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-school-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-school-text-muted text-sm leading-relaxed">
                          {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Important Dates */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full bg-school-secondary/50 border-school-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-school-text">
                    <Calendar className="w-6 h-6 text-school-accent mr-2" />
                    Jadwal Penting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importantDates.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-school-primary/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-school-text font-medium text-sm">
                            {item.event}
                          </p>
                        </div>
                        <div className="text-school-accent font-bold text-sm ml-4">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Fees Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <Card className="bg-school-secondary/50 border-school-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center text-school-text text-center justify-center">
                  <DollarSign className="w-6 h-6 text-school-accent mr-2" />
                  Informasi Biaya
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-school-accent/10 rounded-xl p-6 mb-4">
                  <p className="text-school-text-muted mb-2">
                    Informasi lengkap mengenai biaya pendidikan akan diberikan saat:
                  </p>
                  <ul className="text-school-text text-sm space-y-1">
                    <li>• Pengambilan formulir pendaftaran</li>
                    <li>• Sesi informasi dan konsultasi</li>
                    <li>• Kunjungan langsung ke sekolah</li>
                  </ul>
                </div>
                <p className="text-school-text-muted text-sm">
                  Tersedia berbagai program beasiswa dan keringanan biaya 
                  untuk siswa berprestasi dan kurang mampu.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-school-secondary/50 border-school-accent/20">
              <CardHeader>
                <CardTitle className="text-center text-school-text">
                  Informasi & Kontak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Phone className="w-8 h-8 text-school-accent mb-2" />
                    <h4 className="font-semibold text-school-text mb-1">Telepon</h4>
                    <p className="text-school-text-muted text-sm">
                      {schoolInfo.phone}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <Mail className="w-8 h-8 text-school-accent mb-2" />
                    <h4 className="font-semibold text-school-text mb-1">Email</h4>
                    <p className="text-school-text-muted text-sm">
                      {schoolInfo.email}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-school-accent mb-2" />
                    <h4 className="font-semibold text-school-text mb-1">Alamat</h4>
                    <p className="text-school-text-muted text-sm">
                      {schoolInfo.address}
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-school-text-muted text-sm mb-4">
                    Jam Layanan Administrasi: Senin-Jumat 07.00-15.00, Sabtu 07.00-12.00
                  </p>
                  <Button className="bg-school-accent hover:bg-school-accent-dark text-school-primary">
                    Kunjungi Sekolah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Section>
      </div>
    </>
  );
}