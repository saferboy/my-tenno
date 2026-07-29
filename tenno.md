📄 TEXNIK DIZAYN HUJJATI (TDD)
Loyiha nomi: TENNO LOG (Warframe Progress Tracker)
Versiya: 1.1.0 (MVP+ — kengaytirilgan)
Arxitektura turi: Desktop Client (Offline-first)
Muallif: Senior Dev Team

## 1. UMUMIY KONTSEPTSIYA (Executive Summary)
TENNO LOG — Warframe o'yinchilari uchun mo'ljallangan, o'yin ichidagi progressni (qurollar, Warframe'lar, missiyalar, riven'lar, nightwave) kuzatib boruvchi mahalliy (local) desktop ilovasi.
Asosiy maqsad: O'yinchiga "grind" jarayonida qaysi buyumlar max qilingani, qaysilari sotilgani va qaysi missiyalar bajarilganini vizual, qulay va Warframe estetikasiga mos tarzda ko'rsatish.

## 2. TIZIM ARXITEKTURASI (System Architecture)
Electron ilovasi ikkita asosiy qismga bo'linadi. Ularning o'zaro aloqasi qat'iy qoidalarga asoslanadi.

### 2.1. Main Process (Node.js Backend)
Vazifasi: Operatsion tizim bilan ishlash, fayl tizimi, SQLite bazasini boshqarish, warframe-items JSON ma'lumotlarini o'qish.
Xavfsizlik: UI dan to'liq izolyatsiya qilingan.

### 2.2. Renderer Process (React Frontend)
Vazifasi: Foydalanuvchi interfeysi (UI), animatsiyalar, holatni (state) boshqarish.
Xavfsizlik: Node.js API lariga to'g'ridan-to'g'ri ruxsat yo'q. Faqat Preload Script orqali yaratilgan xavfsiz ko'priklar (Context Bridge) orqali Main Process bilan gaplashadi.

### 2.3. IPC (Inter-Process Communication) Oqimi
1. React (UI) foydalanuvchi qurolni "Max" qildi tugmasini bosadi.
2. React `window.api.updateItemStatus(id, true)` deb Preload orqali xabar yuboradi.
3. Preload script buni IPC channel (`ipcRenderer.invoke`) orqali Main Process'ga uzatadi.
4. Main Process SQLite bazasini yangilaydi va "Muvaffaqiyatli" deb javob qaytaradi.
5. React o'z holatini (State) yangilaydi va UI'ga aks ettiradi.

## 3. TEXNOLOGIYALAR STACKI (Tech Stack)

| Qatlam (Layer) | Texnologiya | Nima uchun aynan shu? (Senior tanlovi) |
|---|---|---|
| Build Tool | Vite | Webpack'dan 10x tez. HMR soniyalarda ishlaydi. |
| Frontend | React 18 + TypeScript | TS murakkab Warframe ma'lumotlarida xatolarni oldini oladi. |
| State Mgmt | Zustand | Redux'dan ancha yengil, boilerplate kam. |
| Styling | Tailwind CSS | Utility-first. Neon/qora dizaynni tez yig'ish uchun qulay. |
| Animations | Framer Motion | "Orokin" uslubidagi silliq animatsiyalar uchun. |
| Desktop | Electron | Kross-platform (hozircha Windows .exe ga fokus). |
| Database | better-sqlite3 | Synchronous, Node.js'da eng tez va ishonchli local DB. |
| Data Source | warframe-items | WFCD tomonidan qo'llab-quvvatlanadigan eng to'liq JSON baza. |
| Auto-Update | electron-updater | GitHub Releases orqali avtomatik yangilanish uchun (bo'shliq #3 yechimi). |
| Unit Test | Vitest | Vite bilan zero-config integratsiya, tez ishlaydi. |
| E2E/IPC Test | Playwright (Electron mode) | Main↔Renderer IPC oqimini va UI'ni end-to-end tekshirish uchun (bo'shliq #4 yechimi). |
| Fuzzy Search | Fuse.js | Arsenal qidiruvida yozuvdagi xatolarga chidamli qidiruv uchun. |

## 4. MA'LUMOTLAR ARXITEKTURASI (Data Architecture)
Bizda ikki xil ma'lumot bor. Ularni aralashtirib yubormaslik kerak.

### 4.1. Master Data (O'zgarmas / O'qish uchun)
Manba: `warframe-items` JSON fayli.
Saqlash: SQLite'ga saqlamaymiz! Dastur ishga tushganda JSON o'qiladi va Zustand (React State) xotirasiga joylashtiriladi.
Sabab: Qurollarni qidirish (search) va filter qilish juda tez bo'lishi kerak. Bazadan so'rov yuborishdan ko'ra, RAM'dan o'qish 100 marta tezroq.

**4.1.1. Versiyalash va Yangilanish strategiyasi (bo'shliq #1 yechimi)**
- Har bir `warframe-items` snapshot bilan birga `dataVersion` (masalan, patch raqami yoki hash) saqlanadi.
- Dastur ishga tushganda joriy JSON versiyasi foydalanuvchi bazasidagi oxirgi ko'rilgan versiya bilan solishtiriladi.
- Agar item o'chirilgan yoki ID o'zgargan bo'lsa (masalan Warframe rework'i tufayli), u "Orphaned Item" sifatida belgilanadi — foydalanuvchi ma'lumoti yo'qolmaydi, faqat UI'da "bu buyum eskirgan/o'zgargan" degan ogohlantirish bilan ko'rsatiladi.
- JSON fayli build vaqtida (`npm run fetch-items`) WFCD repozitoriyasidan qo'lda yoki skript orqali yangilanadi; internet talab qilinmaydi, chunki fayl app bundle ichida keladi.

### 4.2. User Data (Foydalanuvchi / O'qish va Yozish)
Manba: Foydalanuvchi kiritgan ma'lumotlar.
Saqlash: `tennolog.db` (SQLite fayli). Dastur papkasida `AppData/Roaming/TennoLog/` ichida saqlanadi.

**4.2.1. Schema Migratsiyasi (bo'shliq #2 yechimi)**
- Bazada `schema_version` jadvali saqlanadi (bitta qator, joriy versiya raqami bilan).
- Har bir yangi versiya uchun alohida migratsiya skripti (`migrations/001_init.sql`, `002_add_riven_table.sql`, ...) yoziladi va dastur ishga tushganda ketma-ket, tranzaksiya ichida qo'llaniladi.
- Migratsiyadan oldin avtomatik backup olinadi (4.2.2 ga qarang) — muvaffaqiyatsiz migratsiya holatida bazani avtomatik qaytarish (rollback) mumkin.

**4.2.2. Backup va Versiyalash (bo'shliq #5 yechimi)**
- Har bir muhim yozish operatsiyasidan so'ng emas, balki dastur yopilganda va har bir migratsiyadan oldin avtomatik backup olinadi.
- Backup fayllari rotatsiya qilinadi: oxirgi 5 ta backup (`tennolog.backup.<timestamp>.db`) saqlanadi, eskilari avtomatik o'chiriladi.
- "Export Backup" tugmasi orqali foydalanuvchi bazani `.db` yoki `.json` formatida qo'lda ham eksport qila oladi.
- "Restore from Backup" funksiyasi — foydalanuvchi ro'yxatdan oxirgi 5 backup'dan birini tanlab, joriy bazani almashtirishi mumkin.

## 5. ILOVA MODULLARI VA FUNKSIYALAR (UI/UX)
Dastur 6 ta asosiy sahifadan (View) iborat bo'ladi. Sidebar orqali navigatsiya qilinadi.

### 5.1. Dashboard (Boshqaruv paneli)
Maqsad: Umumiy statistikani ko'rsatish.
Elementlar:
- Katta raqamlar: "Max qilingan qurollar: 45/300", "Yig'ilgan Frame'lar: 12/50".
- Progress bar'lar (Umumiy kolleksiya foizi).
- So'nggi qo'shilgan/o'zgargan 5 ta buyum (Recent Activity).
- Bugungi Nightwave va Daily/Weekly vazifalarning qisqacha ko'rinishi (5.4 bilan bog'liq).

### 5.2. Arsenal (Inventar) — Eng katta modul
Maqsad: Qurol va Frame'larni boshqarish.
Elementlar:
- Tepada: Qidiruv qatori (Fuse.js asosida fuzzy search) va Filterlar (Turi: Primary/Secondary/Melee, Status: Maxed/Owned).
- Asosiy qism: Grid (katakli) ko'rinish. Har bir katakda (Card) qurolning rasmi, nomi va statusini bildiruvchi rangli ramka bo'ladi.
- Modal/Drawer: Katakka bosilganda o'ng tomondan chiqadigan panel (Drawer) ochiladi. U yerda qurolni "Max" qilish, sotilganligini belgilash, rank kiritish mumkin.
- UX Yechimi: 1000+ elementni bir vaqtda DOM'ga chiqarmaslik uchun Virtualization (react-window yoki @tanstack/virtual) ishlatamiz.

### 5.3. Mission Tracker (Missiyalar kuzatuvi)
Maqsad: Star chart yoki maxsus missiyalarni belgilab borish.
Elementlar:
- Kategoriyalar bo'yicha ajratilgan checkbox'lar ro'yxati (masalan: "Void Fissures", "Steel Path Missions").
- Bajarilgan missiyalar chizilgan (strikethrough) ko'rinishda bo'ladi.

### 5.4. Nightwave & Daily/Weekly Tracker (yangi modul)
Maqsad: Nightwave mavsumi va kunlik/haftalik challenge'larni kuzatish.
Elementlar:
- Joriy Nightwave mavsumi challenge'lari ro'yxati, bajarilganlarini belgilash.
- Kundalik reset countdown (soat/kunlar), haftalik reset countdown.
- Dashboard'dagi qisqa ko'rinish bilan sinxron.

### 5.5. Riven Mod Tracker (yangi modul)
Maqsad: Riven mod'larning roll tarixi va statistikasini kuzatish.
Elementlar:
- Har bir riven uchun: qurol nomi, dispozitsiya (disposition), joriy statlari, roll tarixi (necha marta re-roll qilingani).
- Kerakli/maqsadli statlarni belgilash ("min-max" maqsad), progressni vizual ko'rsatish.
- Saqlash: alohida `rivens` jadvali `tennolog.db` ichida (User Data qismida).

### 5.6. Companion & Focus Tracker (yangi modul)
Maqsad: Kubrow/Kavat/Moa progressini va Focus School darajalarini kuzatish.
Elementlar:
- Companion'lar ro'yxati, ularning DNA stabilligi va max holati.
- Focus School'lar bo'yicha yig'ilgan Focus va daraja (rank) ko'rsatkichi.

### 5.7. Mini Overlay Oyna (yangi funksiya)
Maqsad: O'yin ustida doim yuqorida turuvchi (`always-on-top`) kichik widget.
Elementlar:
- Bugungi bajarilmagan Daily/Nightwave vazifalar ro'yxati.
- Electron'ning alohida `BrowserWindow` (transparent, frameless, always-on-top) orqali amalga oshiriladi.
- Asosiy oynadan mustaqil yoqilib/o'chirilishi mumkin (Settings orqali).

### 5.8. Profile Export/Import — "Share Code" (yangi funksiya)
Maqsad: Foydalanuvchi o'z kolleksiyasini boshqa kompyuterga yoki do'stiga ko'rsatishi.
Elementlar:
- "Generate Share Code" tugmasi — joriy progress ma'lumotlarini siqilgan (compressed) base64 kodga aylantiradi (Cloud Sync'gacha oraliq, offline yechim).
- "Import from Code" — boshqa foydalanuvchi kodini kiritib, uning kolleksiyasini **faqat ko'rish (read-only)** rejimida ko'rish mumkin (o'z bazasi bilan aralashtirilmaydi).

## 6. GRAFIK DIZAYN VA UI QOIDALARI (Design System)
Dastur ko'rinishidan xuddi Orbiter ichidagi terminalga o'xshashi kerak.

### 6.1. Ranglar (Tailwind Config)
Neon-qora Orokin palitrasi: fon uchun qora/to'q ko'k gradientlar, aksentlar uchun oltin va och-ko'k neon ranglar, status ranglari (Maxed = oltin, Owned = ko'k, Not Owned = kulrang).

### 6.2. Shakllar va Chegaralar
- To'g'ri to'rtburchaklar yo'q.
- Barcha kartalar va tugmalar `clip-path: polygon(...)` yoki maxsus SVG border'lar orqali burchaklari kesilgan (chamfered) ko'rinishda bo'ladi.

### 6.3. Tipografiya
- Sarlavhalar: Rajdhani yoki Orbitron (katta, kengaytirilgan shrift).
- Matn: Inter yoki Roboto (toza, o'qishga qulay).

### 6.4. Animatsiyalar (Framer Motion)
- Sahifa o'zgarganda elementlar biroz "glitch" bo'lib paydo bo'ladi.
- Qurol "Max" qilinganda, karta atrofidagi ramka oqdan oltin rangga o'tib, yengil "pulse" (nur sochish) effekti beradi.

## 7. XAVFSIZLIK VA ISHONCHLILIK (Security & Reliability)

### 7.1. Context Isolation — aniq sozlamalar (bo'shliq #6 yechimi)
BrowserWindow yaratilganda quyidagi sozlamalar **majburiy**:
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- `webSecurity: true` (hech qachon `false` qilinmaydi)
- Content-Security-Policy header: faqat `self` manbadan skript/style yuklashga ruxsat, `unsafe-inline`/`unsafe-eval` taqiqlanadi.
- Preload script faqat oldindan belgilangan, cheklangan API metodlarini (`contextBridge.exposeInMainWorld`) ochadi — to'liq `ipcRenderer` obyekti hech qachon uzatilmaydi.

Bu zararli kodlar brauzer orqali kompyuterga kirishini oldini oladi.

### 7.2. Ma'lumotlarni saqlash (Backup)
4.2.2-bandga qarang: avtomatik rotatsiyali backup (oxirgi 5 ta) + qo'lda "Export Backup"/"Restore from Backup" funksiyalari.

### 7.3. Xatolarni boshqarish (Error Handling)
- Agar `warframe-items` JSON fayli buzilgan bo'lsa yoki SQLite bazasi bloklanib qolsa (locked), dastur "qotib" qolmasligi kerak.
- Barcha xatolar try-catch ichida ushlanadi va foydalanuvchiga chiroyli "Error Modal" orqali ko'rsatiladi.
- Kritik xatolar (masalan, baza ochilmasa) log faylga (`AppData/Roaming/TennoLog/logs/`) yoziladi — internetga hech narsa yuborilmaydi (offline-first falsafasiga mos).

### 7.4. Testlash strategiyasi (bo'shliq #4 yechimi)
- **Unit testlar (Vitest):** Zustand store logikasi, ma'lumotlarni transformatsiya qiluvchi funksiyalar, migratsiya skriptlari uchun.
- **IPC integratsiya testlari (Playwright, Electron mode):** Main↔Renderer orqali `updateItemStatus`, backup/restore kabi kritik oqimlarni end-to-end tekshirish.
- **CI:** Har bir pull request'da avtomatik test ishga tushiriladi (GitHub Actions).

## 8. AVTOMATIK YANGILANISH (Auto-Update) — bo'shliq #3 yechimi
- `electron-builder` + `electron-updater` birgalikda ishlatiladi.
- Yangi versiyalar GitHub Releases orqali tarqatiladi (`publish: { provider: "github" }`).
- Dastur ishga tushganda fonda yangi versiya borligini tekshiradi, topilsa foydalanuvchiga ogohlantirish ko'rsatadi va bir tugma bilan yuklab o'rnatadi.
- Bu offline-first falsafasiga zid emas: tekshiruv faqat internet mavjud bo'lganda, foydalanuvchi ruxsati bilan ishlaydi; asosiy funksionallik internetsiz to'liq ishlayveradi.

## 9. ISHLAB CHIQISH YO'L XARITASI (Development Roadmap)
Loyihani 6 ta faza (Sprint) ga bo'lamiz:

🟢 **1-Faza: Poydevor (Setup & Architecture)**
- Vite + React + TS + Electron muhitini o'rnatish (contextIsolation/sandbox sozlamalari bilan).
- Tailwind CSS va Warframe Design System (ranglar, shriftlar) ni sozlash.
- better-sqlite3 ni ulash, `schema_version` jadvali va birinchi migratsiya skriptini yozish.
- `warframe-items` JSON ni loyihaga yuklash va o'qish mexanizmini yaratish (dataVersion bilan birga).

🟡 **2-Faza: Ma'lumotlar Oqimi (Data Flow & IPC)**
- Preload script va Context Bridge ni yozish.
- Zustand store ni yaratish (Master data ni xotiraga olish, Fuse.js indeksini qurish).
- React dan Main process ga ma'lumot yuborish/olish (CRUD) ni test qilish.
- Avtomatik backup rotatsiyasi mexanizmini yozish.

🟠 **3-Faza: Asosiy UI va Arsenal (Core UI)**
- Sidebar va Layout yaratish.
- Dashboard sahifasini chizish.
- Arsenal sahifasi: Virtualized Grid, Qidiruv, Filterlar.
- Qurol kartochkalari (Cards) va ularning status ranglarini sozlash.

🔴 **4-Faza: Funksionallik va Missiyalar (Features)**
- Qurolni tahrirlash paneli (Drawer/Modal).
- Missiyalar trackeri sahifasi va logikasi.
- Nightwave/Daily-Weekly tracker moduli.
- Riven Mod Tracker moduli.
- Companion & Focus Tracker moduli.
- Ma'lumotlarni eksport/import qilish funksiyasi (Share Code bilan).

🟣 **5-Faza: Polish, Overlay va Packaging**
- Framer Motion animatsiyalarini qo'shish.
- Glitch effektlari, neon glow'lar, ovoz effektlari (ixtiyoriy).
- Mini Overlay oynasini amalga oshirish.
- `electron-builder` orqali .exe faylni paketlash (Build).
- Windows'da test qilish va xatolarni tuzatish.

⚪ **6-Faza: Test, Auto-Update va Chiqarish (Release)**
- Vitest unit testlarini va Playwright IPC/e2e testlarini yozish.
- GitHub Actions CI pipeline'ini sozlash.
- `electron-updater` bilan avtomatik yangilanishni ulash va GitHub Releases orqali sinash.
- Birinchi ommaviy relizni chiqarish.

## 10. LOYIHA PAPKA STRUKTURASI (Project Structure)
```
tenno-log/
├── src/
│   ├── main/            # Electron Main process
│   │   ├── db/          # better-sqlite3, migrations/
│   │   ├── ipc/         # IPC handler'lar
│   │   └── updater/     # electron-updater sozlamalari
│   ├── preload/         # Context Bridge
│   └── renderer/        # React ilovasi
│       ├── components/
│       ├── store/       # Zustand
│       ├── views/       # Dashboard, Arsenal, Missions, Nightwave, Rivens, Companion
│       └── overlay/     # Mini overlay oyna UI
├── data/                # warframe-items JSON snapshot
├── migrations/          # SQLite migratsiya skriptlari
├── tests/
│   ├── unit/            # Vitest
│   └── e2e/             # Playwright
└── electron-builder.yml
```

## 11. KELAJAK UCHUN REJALAR (V2.0 Ideas)
Hozircha MVP+ ga fokuslanamiz, lekin arxitekturani shunday quramizki, kelajakda quyidagilarni qo'shish oson bo'lsin:
- **Cloud Sync:** Firebase yoki Supabase orqali o'z ma'lumotlarini boshqa kompyuterda sinxronlash (5.8-band "Share Code" shu tomon birinchi qadam).
- **Build Planner:** "Men Nyx'ni yig'moqchiman, qanday resurslar kerak?" degan kalkulyator.
- **Market Tracker:** Warframe Market API (agar ochiq bo'lsa) yoki qo'lda kiritish orqali sotilgan buyumlar narxini va foydani hisoblash.
- **Relic Tracker:** Ochilgan Relic'lar va ularning natijalarini kuzatish.
- **Mobile Companion App:** Share Code'ni skanerlab, telefonda progressni ko'rish (read-only).

## 12. MUHIM ESLATMALAR
- **API Cheklovi:** Warframe'ning rasmiy API'si o'yinchi inventarini taqdim etmaydi. Shuning uchun barcha ma'lumotlar qo'lda kiritiladi.
- **Master Data Yangilanishi:** `warframe-items` JSON har bir yangi patch'dan keyin yangilanishi kerak; versiyalash va "orphaned item" mexanizmi 4.1.1-bandda tavsiflangan.
- **Offline-First:** Dastur to'liq offline ishlaydi. Internet faqat auto-update tekshiruvi uchun ixtiyoriy ravishda ishlatiladi.
- **Windows Priority:** Dastur birinchi navbatda Windows uchun yaratiladi (.exe). Keyinchalik macOS va Linux qo'llab-quvvatlanishi mumkin.

## 13. XULOSA
Bu hujjat TENNO LOG loyihasining to'liq texnik ko'rsatmasi hisoblanadi. Har qanday qaror qabul qilishdan oldin ushbu hujjatga murojaat qilish tavsiya etiladi.

**Keyingi qadam:** 1-Faza (Poydevor) ni boshlash uchun muhitni sozlash va dastlabki kodlarni yozish.
