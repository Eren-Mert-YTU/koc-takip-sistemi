# Koç Takip Sistemi

Modern, haftalık Kanban (Grid) görünümlü, koçların öğrencilerine görev atamasını ve öğrencilerin kendi görevlerini takip etmesini sağlayan Next.js 15 tabanlı bir platform.

## Özellikler
- **Rol Tabanlı Yetkilendirme:** Koç (Admin) ve Öğrenci rolleri.
- **Kanban Görünümü:** Haftanın 7 gününe yayılmış yatay kaydırılabilir görev kartları.
- **Görev Yönetimi:** Koç tarafından gün bazlı görev (ders, kaynak, hedef) atama ve takip etme.
- **İlerleme Takibi:** Dinamik ve animasyonlu haftalık tamamlama yüzdesi (Progress Bar).
- **Modern Arayüz:** Glassmorphism tasarım, duyarlı (responsive) UI, estetik ve pürüzsüz animasyonlar.

---

## 🚀 Vercel Üzerinde Yayına Alma (Deployment)

Projemiz SQLite'tan **PostgreSQL** veritabanına geçirilmiştir, bu sayede Vercel gibi sunucusuz (serverless) ortamlarda sorunsuz çalışabilir.

### 1. Veritabanı (PostgreSQL) Oluşturma
Supabase, Neon, Render veya Vercel Postgres gibi ücretsiz PostgreSQL hizmeti sunan bir sağlayıcıda veritabanı oluşturun. Sağlayıcıdan size verilen bağlantı URL'sini (Connection String) kopyalayın. Örnek format:
`postgresql://kullanici_adi:sifre@host_adresi:5432/veritabani_adi?schema=public`

### 2. Vercel'de Projeyi Oluşturma
1. GitHub hesabınızda bu projenin bir reposunu oluşturup kodlarınızı yükleyin.
2. [Vercel](https://vercel.com/)'e giriş yapın ve "Add New Project" seçeneğine tıklayın.
3. GitHub reponuzu seçip projeyi içe aktarın (Import).

### 3. Ortam Değişkenlerini (Environment Variables) Ayarlama
Vercel projesinin ayarlarında (Settings > Environment Variables) şu değişkenleri ekleyin:

- `DATABASE_URL`: 1. adımda aldığınız PostgreSQL bağlantı URL'si.
- `NEXTAUTH_URL`: Yayınladığınız uygulamanın URL'si (ör. `https://projeniz.vercel.app`).
- `NEXTAUTH_SECRET`: Rastgele oluşturulmuş güvenli bir metin. (Terminalde `openssl rand -base64 32` komutu ile üretebilirsiniz).
- `ADMIN_EMAIL`: Yönetici (Koç) girişi için email (ör. `emert361@gmail.com`).
- `ADMIN_PASSWORD`: Yönetici şifresi (ör. `Eren123!`).

### 4. Build Komutunu Düzenleme (Gerekirse)
Vercel projenin bağımlılıklarını kurduktan sonra Prisma Client'ı oluşturmalı ve veritabanı şemasını senkronize etmelidir. 
`package.json` dosyanızdaki `build` komutunun şöyle olduğundan emin olun (veya Vercel ayarlarından Build Command kısmına yazın):
```bash
prisma generate && prisma db push && next build
```

> **Not:** Üretim ortamında `prisma migrate deploy` önerilse de, hızlı başlangıç için `prisma db push` da kullanılabilir.

### 5. Deploy
Ortam değişkenleri eklendikten sonra Vercel panelinden projeyi **Deploy** edin. Kurulum tamamlandığında uygulama hazır olacaktır!
