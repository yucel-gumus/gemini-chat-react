# 🤖 Gemini Chat React Uygulaması

Google'ın Gemini AI API'sini kullanarak hem metin hem de görüntü işleme yetenekleri sunan modern bir React uygulaması.

## ✨ Özellikler

- **💬 Gemini Chat**: Google'ın Gemini AI ile doğal dil konuşmaları yapabilme
- **🖼️ Gemini Vision**: Resim yükleyip resimler hakkında sorular sorabilme
- **🌓 Karanlık Mod**: Açık ve koyu temalar arasında geçiş yapabilme
- **📱 Duyarlı Tasarım**: Masaüstü ve mobil cihazlarda sorunsuz çalışma
- **⚡ Gerçek Zamanlı Geri Bildirim**: Yükleme durumları ve hatalar için görsel göstergeler
- **🔄 Sürükle ve Bırak**: Kolay resim yükleme

## 🛠️ Kullanılan Teknolojiler

- React 18
- React Router
- Axios
- Font Awesome
- Google Generative AI SDK
- CSS

## 🚀 Kurulum ve Çalıştırma

```bash
# Depoyu klonlayın
git clone https://github.com/kullaniciadi/gemini-chat-react.git
cd gemini-chat-react

# Bağımlılıkları yükleyin
npm install

# .env dosyası oluşturun
echo "REACT_APP_GEMINI_API_KEY=api_anahtariniz_buraya" > .env

# Uygulamayı başlatın
npm start
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📝 Kullanım

### 💬 Gemini Chat

1. Chat sekmesine gidin
2. Mesajınızı yazın ve gönderin
3. AI yanıtını bekleyin

### 🖼️ Gemini Vision

1. Vision sekmesine gidin
2. Bir resim yükleyin
3. Resim hakkında bir soru sorun
4. AI analizini bekleyin

## 📁 Proje Yapısı

```
gemini-chat-react/
├── public/              # Genel varlıklar
├── src/                 # Kaynak dosyaları
│   ├── App.js           # Ana uygulama ve yönlendirme
│   ├── GeminiComponent.js # Metin sohbet bileşeni
│   ├── GeminiVision.js  # Görüntü analiz bileşeni
│   ├── index.css        # Genel stiller
│   └── index.js         # Uygulama giriş noktası
├── .env                 # Ortam değişkenleri
└── package.json         # Proje bağımlılıkları
```

## 🔌 API Entegrasyonu

API uç noktaları:
- `/api/generateContent` - Metin tabanlı konuşmalar için
- `/api/generateImage` - Görüntü analizi için

## 🎨 Özelleştirme

- `index.css` içindeki renk şemasını değiştirme
- `App.js` içinde yeni rotalar ekleme
- Ek Gemini API özellikleriyle işlevselliği genişletme

## 📄 Lisans

MIT Lisansı

---

<div align="center">
  <p>❤️ ile yapıldı | © 2025 Gemini Chat React</p>
</div>