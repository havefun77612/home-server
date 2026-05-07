/**
 * SUEZ STREAM - Core Engine (Scraper)
 * مسؤول عن فحص الشبكة، قراءة مسارات الراوتر، واستخراج روابط الميديا.
 */

import { CONFIG, getBaseUrl, isSupportedFormat } from './config.js';

export const MediaScanner = {
    
    /**
     * الدالة الرئيسية لبدء عملية البحث عن الملفات
     * @returns {Promise<Array>} مصفوفة تحتوي على كائنات الأفلام المكتشفة
     */
    async scanForMedia() {
        // 1. التحقق مما إذا كنا في وضع التطوير (DEV_MODE)
        if (CONFIG.DEV_MODE.ENABLED) {
            console.log("🛠️ تعمل المنصة الآن في وضع التطوير (DEV_MODE). جاري تحميل البيانات الوهمية...");
            // محاكاة تأخير الشبكة لثانية ونصف لتجربة شكل التحميل
            return new Promise(resolve => {
                setTimeout(() => resolve(CONFIG.DEV_MODE.MOCK_DATA), 1500);
            });
        }

        // 2. وضع التشغيل الفعلي (الاتصال بالراوتر)
        console.log("🔍 جاري فحص الراوتر بحثاً عن ملفات الميديا...");
        const baseUrl = getBaseUrl();
        let discoveredMedia =[];

        // المرور على المسارات المحتملة للـ USB داخل الراوتر
        for (const path of CONFIG.USB_PATHS) {
            const targetUrl = `${baseUrl}${path}`;
            try {
                // جلب محتوى صفحة الـ HTTP الخاصة بالراوتر
                const response = await fetch(targetUrl);
                
                if (!response.ok) continue; // إذا كان المسار غير موجود، انتقل للمسار التالي
                
                const htmlText = await response.text();
                
                // تحليل الـ HTML لاستخراج الملفات
                const files = this.parseDirectoryHtml(htmlText, targetUrl);
                discoveredMedia = [...discoveredMedia, ...files];

            } catch (error) {
                console.warn(`⚠️ تعذر الوصول للمسار ${targetUrl}. قد يكون غير موجود أو محمي بـ CORS.`, error);
            }
        }

        return discoveredMedia;
    },

    /**
     * محلل الـ HTML (HTML Parser)
     * يبحث عن كل روابط <a> داخل صفحة الراوتر ويستخرج الملفات المدعومة
     * @param {string} html محتوى الصفحة
     * @param {string} parentUrl الرابط الأساسي للمجلد
     * @returns {Array} مصفوفة الملفات
     */
    parseDirectoryHtml(html, parentUrl) {
        const mediaList =[];
        // استخدام DOMParser لتحويل النص إلى هيكل HTML حقيقي يمكن البحث بداخله
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // استخراج جميع الروابط
        const links = doc.querySelectorAll('a');
        
        links.forEach(link => {
            let href = link.getAttribute('href');
            let filename = link.textContent.trim();

            // تجاهل الروابط التي تعود للخلف (Parent Directory)
            if (href === '../' || filename.includes('Parent Directory')) return;

            // إذا كان الملف مدعوماً (مثلاً ينتهي بـ .mp4)
            if (isSupportedFormat(filename)) {
                // معالجة الروابط لضمان أنها مسارات كاملة (Absolute URLs)
                const fullUrl = href.startsWith('http') ? href : `${parentUrl}${href}`;
                
                mediaList.push({
                    id: this.generateId(filename),
                    name: filename,
                    url: fullUrl,
                    // يمكننا لاحقاً استخراج الحجم والتاريخ إذا كان الراوتر يعرضهم في جدول
                    size: 'غير معروف', 
                    date: new Date().toLocaleDateString('ar-EG')
                });
            }
        });

        return mediaList;
    },

    /**
     * دالة مساعدة لتوليد معرف فريد (ID) لكل فيديو بناءً على اسمه
     */
    generateId(filename) {
        return 'm_' + Math.random().toString(36).substr(2, 9) + '_' + btoa(unescape(encodeURIComponent(filename))).substring(0, 10);
    }
};