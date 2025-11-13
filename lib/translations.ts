export type Language = "uz-lat" | "uz-cyr" | "ru"

export interface Translations {
  // Navigation
  title: string
  subtitle: string
  upload: string
  preview: string
  statistics: string
  visualization: string
  ai: string
  language: string
  settings: string
  theme: string
  lightMode: string
  darkMode: string
  
  // File Upload
  uploadFile: string
  dragDropFile: string
  selectFile: string
  fileUploaded: string
  uploading: string
  sampleData: string
  useSample: string
  loadSample: string
  
  // Data Preview
  rowsPerPage: string
  columns: string
  totalRows: string
  totalColumns: string
  fileSize: string
  missingValues: string
  
  // Statistics
  selectColumns: string
  mean: string
  median: string
  stdDev: string
  min: string
  max: string
  count: string
  correlationMatrix: string
  variables: string
  coefficient: string
  interpretation: string
  
  // Visualization
  chartType: string
  barChart: string
  lineChart: string
  pieChart: string
  scatterChart: string
  chartTitle: string
  xAxis: string
  yAxis: string
  colors: string
  legend: string
  grid: string
  enabled: string
  automatic: string
  
  // AI Assistant
  aiAssistant: string
  aiDescription: string
  askQuestion: string
  analyzing: string
  exampleQuestions: string
  question1: string
  question2: string
  question3: string
  question4: string
  
  // Common
  pleaseUploadFile: string
  goToUpload: string
  dataVisualization: string
  chartWillDisplay: string
}

export const translations: Record<Language, Translations> = {
  "uz-lat": {
    title: "Ma'lumotlar Tahlilchisi",
    subtitle: "O'zbekiston Respublikasi Markaziy Banki",
    upload: "Fayl Yuklash",
    preview: "Ma'lumotlarni Ko'rish",
    statistics: "Statistika",
    visualization: "Vizualizatsiya",
    ai: "AI Yordamchi",
    language: "Til",
    settings: "Sozlamalar",
    theme: "Mavzu",
    lightMode: "Yorug'lik",
    darkMode: "Qorong'u",
    uploadFile: "Ma'lumotlar faylini yuklang",
    dragDropFile: "Faylni bu yerga sudrab tashlang yoki tanlash uchun bosing (CSV, XLSX)",
    selectFile: "Fayl tanlash",
    fileUploaded: "Fayl muvaffaqiyatli yuklandi",
    uploading: "Fayl yuklanmoqda",
    sampleData: "Namuna ma'lumotlar",
    useSample: "Platformani sinab ko'rish uchun ushbu namunadan foydalaning:",
    loadSample: "Namunani yuklash",
    rowsPerPage: "Sahifadagi qatorlar soni",
    columns: "Ustunlar",
    totalRows: "Jami qatorlar",
    totalColumns: "Ustunlar soni",
    fileSize: "Hajm",
    missingValues: "Yetishmayotgan qiymatlar",
    selectColumns: "Tahlil uchun ustunlarni tanlang",
    mean: "O'rtacha",
    median: "Median",
    stdDev: "Standart og'ish",
    min: "Minimum",
    max: "Maksimum",
    count: "Soni",
    correlationMatrix: "Korrelyatsiya matritsasi",
    variables: "O'zgaruvchilar",
    coefficient: "Koeffitsient",
    interpretation: "Tushuntirish",
    chartType: "Grafik turi",
    barChart: "Stolbchali diagramma",
    lineChart: "Chiziqli grafik",
    pieChart: "Pirog diagrammasi",
    scatterChart: "Nuqtali diagramma",
    chartTitle: "Sarlavha",
    xAxis: "X o'qi",
    yAxis: "Y o'qi",
    colors: "Ranglar",
    legend: "Leyenda",
    grid: "Panjara",
    enabled: "Yoqilgan",
    automatic: "Avtomatik",
    aiAssistant: "Ma'lumotlar tahlili uchun AI yordamchi",
    aiDescription: "Ma'lumotlaringiz bo'yicha tushunchalar, trendlar tushuntirishlari va tavsiyalar olish uchun sun'iy intellektdan foydalaning.",
    askQuestion: "Tahlil haqida savol bering...",
    analyzing: "Tahlil qilmoqdaman...",
    exampleQuestions: "Savol misollari",
    question1: "Ma'lumotlarda qanday asosiy tendentsiyalarni ko'ryapsiz?",
    question2: "Qaysi hududlar eng yaxshi natijani ko'rsatmoqda?",
    question3: "Ma'lumotlarda anomaliyalar yoki chetga chiqishlar bormi?",
    question4: "Keyingi davr uchun prognoz qanday?",
    pleaseUploadFile: "Iltimos, tahlil qilish uchun fayl yuklang",
    goToUpload: "Yuklashga o'tish",
    dataVisualization: "Ma'lumotlarni vizualizatsiya qilish",
    chartWillDisplay: "Tanlangan ma'lumotlar uchun \"{type}\" turidagi grafik bu yerda ko'rsatiladi",
  },
  "uz-cyr": {
    title: "Маълумотлар Таҳлилчиси",
    subtitle: "Ўзбекистон Республикаси Марказий Банки",
    upload: "Файл Юклаш",
    preview: "Маълумотларни Кўриш",
    statistics: "Статистика",
    visualization: "Визуализация",
    ai: "AI Ёрдамчи",
    language: "Тил",
    settings: "Созламалар",
    theme: "Мавзу",
    lightMode: "Ёруғлик",
    darkMode: "Қоронғу",
    uploadFile: "Маълумотлар файлини юкланг",
    dragDropFile: "Файлни бу ерга судраб ташланг ёки танлаш учун босинг (CSV, XLSX)",
    selectFile: "Файл танлаш",
    fileUploaded: "Файл муваффақиятли юкланди",
    uploading: "Файл юкланмоқда",
    sampleData: "Намуна маълумотлар",
    useSample: "Платформани синаб кўриш учун ушбу намунадан фойдаланинг:",
    loadSample: "Намунани юклаш",
    rowsPerPage: "Саҳифадаги қatorlar сони",
    columns: "Устунлар",
    totalRows: "Жами қatorlar",
    totalColumns: "Устунлар сони",
    fileSize: "Ҳажм",
    missingValues: "Етишмаяотган қийматлар",
    selectColumns: "Таҳлил учун устунларни танланг",
    mean: "Ўртача",
    median: "Медиан",
    stdDev: "Стандарт оғиш",
    min: "Минимум",
    max: "Максимум",
    count: "Сони",
    correlationMatrix: "Корреляция матритсаси",
    variables: "Ўзгарувчилар",
    coefficient: "Коэффициент",
    interpretation: "Тушунтириш",
    chartType: "График тури",
    barChart: "Столбчали диаграмма",
    lineChart: "Чизиқли график",
    pieChart: "Пирог диаграммаси",
    scatterChart: "Нуқтали диаграмма",
    chartTitle: "Сарлавҳа",
    xAxis: "X ўқи",
    yAxis: "Y ўқи",
    colors: "Ранглар",
    legend: "Лейенда",
    grid: "Панжара",
    enabled: "Ёқилган",
    automatic: "Автоматик",
    aiAssistant: "Маълумотлар таҳлили учун AI ёрдамчи",
    aiDescription: "Маълумотларингиз бўйича тушунчалар, тендлар тушунтиришлари ва тавсиялар олиш учун сунъий интеллектдан фойдаланинг.",
    askQuestion: "Таҳлил ҳақида савол беринг...",
    analyzing: "Таҳлил қилмоқдаман...",
    exampleQuestions: "Савол мисоллари",
    question1: "Маълумотларда қандай асосий тенденцияларни кўряпсиз?",
    question2: "Қайси ҳудудлар энг яхши натижани кўрсатмоқда?",
    question3: "Маълумотларда аномалиялар ёки четга чиқишлар борми?",
    question4: "Кейинги давр учун прогноз қандай?",
    pleaseUploadFile: "Илтимос, таҳлил қилиш учун файл юкланг",
    goToUpload: "Юклашга ўтиш",
    dataVisualization: "Маълумотларни визуализация қилиш",
    chartWillDisplay: "Танланган маълумотлар учун \"{type}\" туридаги график бу ерда кўрсатилади",
  },
  ru: {
    title: "Аналитик Данных",
    subtitle: "Центральный банк Узбекистана",
    upload: "Загрузить Файл",
    preview: "Просмотр Данных",
    statistics: "Статистика",
    visualization: "Визуализация",
    ai: "AI Помощник",
    language: "Язык",
    settings: "Параметры",
    theme: "Тема",
    lightMode: "Светлая",
    darkMode: "Темная",
    uploadFile: "Загрузите файл с данными",
    dragDropFile: "Перетащите файл сюда или нажмите для выбора (CSV, XLSX)",
    selectFile: "Выбрать файл",
    fileUploaded: "Файл успешно загружен",
    uploading: "Загрузка файла",
    sampleData: "Образец данных",
    useSample: "Используйте этот пример для тестирования платформы:",
    loadSample: "Загрузить образец",
    rowsPerPage: "Количество строк",
    columns: "Столбцы",
    totalRows: "Всего строк",
    totalColumns: "Столбцов",
    fileSize: "Размер",
    missingValues: "Пропусков",
    selectColumns: "Выберите столбцы для анализа",
    mean: "Среднее",
    median: "Медиана",
    stdDev: "Стд. Откл.",
    min: "Мин.",
    max: "Макс.",
    count: "Кол-во",
    correlationMatrix: "Корреляционная матрица",
    variables: "Переменные",
    coefficient: "Коэффициент",
    interpretation: "Интерпретация",
    chartType: "Тип графика",
    barChart: "Столбчатая диаграмма",
    lineChart: "Линейный график",
    pieChart: "Круговая диаграмма",
    scatterChart: "Точечная диаграмма",
    chartTitle: "Заголовок",
    xAxis: "Ось X",
    yAxis: "Ось Y",
    colors: "Цвета",
    legend: "Легенда",
    grid: "Сетка",
    enabled: "Включена",
    automatic: "Автоматическое",
    aiAssistant: "AI Помощник для анализа данных",
    aiDescription: "Используйте искусственный интеллект для получения insights, объяснения трендов и рекомендаций по вашим данным.",
    askQuestion: "Задайте вопрос об анализе...",
    analyzing: "Анализирую...",
    exampleQuestions: "Примеры вопросов",
    question1: "Какие основные тренды вы видите в данных?",
    question2: "Какие регионы показывают лучший результат?",
    question3: "Есть ли аномалии или выбросы в данных?",
    question4: "Какой прогноз на следующий период?",
    pleaseUploadFile: "Пожалуйста, загрузите файл для анализа",
    goToUpload: "Перейти к загрузке",
    dataVisualization: "Визуализация данных",
    chartWillDisplay: "Здесь отобразится график типа \"{type}\" для выбранных данных",
  },
}

