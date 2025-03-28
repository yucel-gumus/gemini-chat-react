# Ceminay - Gemini AI Sohbet Uygulaması

Google'ın Gemini AI modelleri kullanılarak geliştirilen modern bir sohbet ve görüntü analizi uygulaması.

## Özellikler

- **Metin Sohbeti**: Gemini AI ile akıllı sohbetler
- **Görüntü Analizi**: Resimleri yükleyerek analiz etme ve sorular sorma
- **Karanlık/Aydınlık Tema**: Sistem tercihini otomatik algılayan tema seçeneği
- **Responsive Tasarım**: Mobil, tablet ve masaüstü cihazlarda sorunsuz çalışır
- **Sunucusuz Backend**: Netlify Functions ile Gemini API entegrasyonu

## Teknoloji Altyapısı

- React.js (18+)
- CSS custom properties ile dinamik tema desteği
- Google Generative AI SDK
- FontAwesome ikonları
- Netlify (hosting ve sunucusuz fonksiyonlar)

## Başlangıç

### Gereksinimler

- Node.js 14+ ve npm
- Google AI Studio'dan alınmış Gemini API anahtarı (https://aistudio.google.com/ adresinden edinebilirsiniz)

### Kurulum

1. Projeyi klonlayın
```
git clone https://github.com/yucel-gumus/gemini-chat-react.git
cd gemini-chat-react
```

2. Bağımlılıkları yükleyin
```
npm install
cd netlify/functions && npm install && cd ../..
```

3. Ortam değişkenlerini ayarlayın
Kök dizinde `.env` dosyası oluşturun ve API anahtarınızı ekleyin:
```
REACT_APP_GEMINI_API_KEY=size_ait_api_anahtari
```

### Geliştirme

Uygulamayı yerel olarak çalıştırmak için:
```
npm start
```

Netlify Functions'ı yerel olarak çalıştırmak için:
```
npm install -g netlify-cli
netlify dev
```

## Netlify'da Yayınlama

Bu proje Netlify'da yayınlanacak şekilde yapılandırılmıştır. Bu sayede hem frontend hem de backend kısmı herhangi bir ek sunucu gerektirmeden çalışabilir.

### Adım Adım Deployment Süreci

1. GitHub reponuzu oluşturun veya var olanı kullanın
   - Reponun public olması gerekmez, Netlify ile özel repolar da bağlanabilir

2. Netlify'da hesap oluşturun ve giriş yapın
   - https://app.netlify.com/ adresinden ücretsiz kaydolabilirsiniz

3. Netlify'da "New site from Git" seçeneğini tıklayın
   - GitHub hesabınızı bağlayın ve reponuzu seçin

4. Build ayarlarını yapılandırın:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

5. "Show advanced" butonunu tıklayıp ortam değişkenlerini ekleyin:
   - Key: `GEMINI_API_KEY` 
   - Value: `size_ait_api_anahtari`
   - (Bu değişken Netlify Functions tarafından kullanılacaktır)

6. "Deploy site" butonuna tıklayın ve kurulumun tamamlanmasını bekleyin

7. (İsteğe bağlı) Özel domain ayarlayın:
   - Site Settings > Domain management bölümünden özel domain ekleyebilirsiniz

### Netlify CLI ile Hızlı Deployment

Netlify CLI kullanarak tek komutla deployment yapabilirsiniz:

```bash
# Netlify CLI'yi global olarak yükleyin
npm install -g netlify-cli

# Oturum açın
netlify login

# Siteyi bağlayın (yeni site oluşturur)
netlify init

# Deploy edin
netlify deploy --prod
```

### Ortam Değişkeni Güncelleme

API anahtarınızı değiştirmeniz gerekirse:

1. Netlify Dashboard'a gidin
2. Site Settings > Build & deploy > Environment > Environment variables
3. `GEMINI_API_KEY` değişkenini güncelleyin
4. "Trigger deploy" ile yeni bir deployment başlatın

## Kullanım

- **Metin Sohbeti**: "Chat" sekmesini seçin ve sorunuzu yazın
- **Görüntü Analizi**: 
  - "Vision" sekmesini seçin
  - Sürükle-bırak yöntemiyle veya dosya seçiciyi kullanarak bir görüntü yükleyin
  - Görüntü hakkında soru sorun

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

## İletişim

Yücel Gümüş - yucelgmus@gmail.com

Proje Bağlantısı: [https://github.com/yucel-gumus/gemini-chat-react](https://github.com/yucel-gumus/gemini-chat-react)

## Canlı Demo

Canlı Demo: [https://gemini-chat-image.netlify.app/](https://gemini-chat-image.netlify.app/) 