// config.js
const CONFIG = {
    // الرابط الأساسي للفلاشة على الراوتر
    BASE_URL: "http://192.168.100.1:56001/web/mdb/",
    
    // مفتاح API لموقع TMDB (مجاني) لجلب البوسترات والمعلومات
    TMDB_KEY: "8883656113b28b69389286f784e186e8", 
    
    // الامتدادات التي سيقوم البرنامج بفحصها تلقائياً
    EXTENSIONS: ['mkv', 'mp4', 'avi', 'mov', 'mp3'],

    // خريطة الأفلام: (الرقم على الفلاشة : الاسم الحقيقي للبحث عنه)
    LIBRARY_MAP: {
        "25": "Interstellar",
        "26": "The Dark Knight",
        "27": "Inception",
        "28": "Avatar",
        "29": "The Godfather",
        "30": "Finding Nemo"
    }
};