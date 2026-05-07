/**
 * SUEZ STREAM - Configuration File
 */

export const CONFIG = {
    // 1. إعدادات الشبكة (تم التحديث لتتطابق مع راوترك)
    NETWORK: {
        ROUTER_IP: '192.168.100.1', // الـ IP الخاص براوترك
        ROUTER_PORT: '56001',     // البورت
    },

    // 2. مسار مجلد الفلاشة داخل الراوتر
    USB_PATHS:[
        '/web/mdb/', // المسار الصحيح الذي يوجد به ملف 25.mkv
    ],

    // 3. الامتدادات المدعومة (تم إضافة mkv)
    SUPPORTED_FORMATS:[
        '.mp4',
        '.webm',
        '.m4v',
        '.mkv', // إضافة دعم ملفات MKV
        '.avi'
    ],

    // 4. إعدادات توليد البوسترات
    THUMBNAIL: {
        SEEK_TIME: 10,        
        QUALITY: 0.7,         
        WIDTH_PROXY: 480      
    },

    // 5. إعدادات بيئة التطوير (لتجربة المنصة قبل ربطها بالراوتر الفعلي)
    DEV_MODE: {
        ENABLED: false, // اجعلها false عند الاستخدام الفعلي على الراوتر
        MOCK_DATA:[
            // بيانات وهمية للاختبار لضمان عمل الواجهة الرسومية
            { 
                name: 'Inception_1080p.mp4', 
                url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', 
                size: '2.1 GB',
                date: '2023-10-01'
            },
            { 
                name: 'Interstellar_Bluray.mp4', 
                url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/1080/Jellyfish_1080_10s_5MB.mp4', 
                size: '3.4 GB',
                date: '2023-11-15'
            },
            { 
                name: 'The_Matrix_1999.mp4', 
                url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4', 
                size: '1.8 GB',
                date: '2024-01-20'
            }
        ]
    }
};

/**
 * دالة مساعدة لتوليد الرابط الأساسي (Base URL) للراوتر
 * @returns {string} مثال: http://192.168.1.1:56001
 */
export const getBaseUrl = () => {
    return `http://${CONFIG.NETWORK.ROUTER_IP}:${CONFIG.NETWORK.ROUTER_PORT}`;
};

/**
 * دالة مساعدة للتحقق مما إذا كان الملف مدعوماً بناءً على امتداده
 * @param {string} filename اسم الملف
 * @returns {boolean}
 */
export const isSupportedFormat = (filename) => {
    const lowerName = filename.toLowerCase();
    return CONFIG.SUPPORTED_FORMATS.some(ext => lowerName.endsWith(ext));
};