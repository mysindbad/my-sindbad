# دليل نشر تطبيق My Sindbad على Google Play Store عبر PWABuilder

## 1. توليد حزمة Android (AAB)
1. افتح موقع [PWABuilder.com](https://www.pwabuilder.com/).
2. أدخل رابط التطبيق الحي: `https://my-sindbad.vercel.app/`.
3. اضغط على **Start** وتأكد من حصول الـ PWA على تقييم مرتفع في جميع الفحوصات (Manifest, Service Worker, HTTPS).
4. اختر منصة **Android** واضغط **Package**.
5. أدخل خيارات الحزمة:
   - Package ID: `com.mysindbad.app`
   - App Name: `My Sindbad`
   - Key Options: اختر توليد شهادة توقيع جديدة وتنزيل ملف التوقيع (Keystore).
6. حمّل حزمة **AAB** وانخسخ بصمة الشهادة الرقمية **SHA-256 Certificate Fingerprint**.

## 2. تحديث Asset Links
1. انسخ بصمة SHA-256 المستخرجة من PWABuilder.
2. استبدل قيمة `sha256_cert_fingerprint` داخل ملف `public/.well-known/assetlinks.json`.
3. ادفع التغيير إلى فرع `main` وانسخ الرابط للتأكد من وصوله عبر:
   `https://my-sindbad.vercel.app/.well-known/assetlinks.json`

## 3. إعداد الحساب ورفع التطبيق في Play Console
1. قم بإنشاء حساب مطور Google Play Console (رسوم 25$ لمرة واحدة).
2. أنشئ تطبيقاً جديداً باختيار اسم التطبيق واللغة الرئيسية (العربية - ar).
3. انتقل إلى **Testing -> Internal testing** وأنشئ إصداراً جديداً.
4. ارفع ملف الـ **AAB** المُنزّل من PWABuilder.

## 4. بطاقة المتاجر (Store Listing) والسلامة
1. **وصف التطبيق**: أضف الوصف القصير والطويل باللغتين العربية والإنجليزية.
2. **الصور**: ارفع لقطتي شاشة بمقاس 1080×1920 على الأقل + Feature Graphic بمقاس 1024×500 + أيقونة التطبيق 512×512.
3. **رابط سياسة الخصوصية**: أدخل الرابط التالي:
   `https://my-sindbad.vercel.app/privacy.html`
4. **نموذج أمان البيانات (Data Safety)**: أجب بـ No لمشاركة البيانات مع أطراف ثالثة واذكر أن التخزين محلي.

## 5. الترقية إلى الإنتاج (Production)
1. بعد اختبار الإصدار الداخلي، اختر **Promote Release** إلى **Production**.
2. قدّم التطبيق للمراجعة النهائية لدى فريق Google Play.
