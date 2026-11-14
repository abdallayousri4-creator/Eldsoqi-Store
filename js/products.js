/* ==========================================================================
   Eldsoqi Store — Centralized data & shared helpers
   All prices are in Egyptian Pounds (EGP / جنيه).
   priceStatus:
     confirmed  → سعر مؤكد من المتجر
     from       → سعر يبدأ من (حسب القيمة/المواصفات/النوع)
     estimated  → سعر تقديري (بانتظار تأكيد صاحب المتجر)
     pending    → السعر قيد التأكيد
   ========================================================================== */

(function (global) {
  "use strict";

  var CONFIG = {
    brandName: "Eldsoqi Store",
    currency: "جنيه",
    cartKey: "eldsoqi_cart_v1",
    defaultMessage: "مرحبًا، أود الاستفسار عن منتجات Eldsoqi Store.",
    whatsapp: [
      {
        id: "wa-1",
        label: "واتساب 1",
        number: "201207206391",
        display: "+20 120 720 6391",
        local: "01207206391"
      },
      {
        id: "wa-2",
        label: "واتساب 2",
        number: "201112610206",
        display: "+20 111 261 0206",
        local: "01112610206"
      }
    ]
  };

  /* ملاحظة: الترتيب هنا هو نفس الترتيب المطلوب تمامًا — لا يتم إعادة ترتيبه أبجديًا. */
  var CATEGORIES = [
    { id: "avo-meter", name: "الأفو (AVO Meter)", nameEn: "AVO Meter", icon: "meter" },
    { id: "transistor", name: "الترانزستور", nameEn: "Transistor", icon: "chip" },
    { id: "soldering-kit", name: "بكج الكاوية", nameEn: "Soldering Kit", icon: "iron" },
    { id: "variable-resistor", name: "المقاومة المتغيرة", nameEn: "Variable Resistor", icon: "knob" },
    { id: "power-supply", name: "الباور سبلاي", nameEn: "Power Supply", icon: "power" },
    { id: "breadboard", name: "البريد بورد", nameEn: "Breadboard", icon: "board" },
    { id: "capacitors", name: "المكثفات", nameEn: "Capacitors", icon: "capacitor" },
    { id: "coils", name: "الملفات", nameEn: "Coils", icon: "coil" },
    { id: "resistors", name: "المقاومات", nameEn: "Resistors", icon: "resistor" },
    { id: "type-c-charger", name: "دائرة شحن Type-C", nameEn: "Type-C Charging Module", icon: "usb" },
    { id: "mini-fan", name: "مروحة وجه صغيرة", nameEn: "Mini Fan", icon: "fan" },
    { id: "battery", name: "البطارية", nameEn: "Battery", icon: "battery" },
    { id: "flashlight", name: "الكشاف", nameEn: "Flashlight", icon: "flashlight" },
    { id: "led", name: "الليد", nameEn: "LED", icon: "led" },
    { id: "other-items", name: "بعض العناصر الأخرى", nameEn: "Other Components", icon: "parts" }
  ];

  var P = "assets/products/";

  var PRODUCTS = [
    {
      id: "avo-1",
      categoryId: "avo-meter",
      name: "أفو ميتر — النوع الأول",
      nameEn: "AVO Meter — Type 1",
      desc: "أفو ميتر لقياس الجهد والتيار والمقاومة، مناسب للورش والطلاب والمشاريع الإلكترونية.",
      images: [P + "avo-meter/IMG-20261011-WA0031.jpg", P + "avo-meter/IMG-20261011-WA0032.jpg", P + "avo-meter/IMG-20261011-WA0033.jpg"],
      imageAlt: "جهاز أفو ميتر — النوع الأول",
      price: 290,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [
        { label: "الفئة", value: "أجهزة قياس (AVO Meter)" },
        { label: "الاستخدام", value: "قياس الجهد والتيار والمقاومة" },
        { label: "البيع", value: "قطعة واحدة" }
      ],
      keywords: "avo avometer multimeter افو أفو ميتر قياس جهد تيار مقاومة",
      badges: ["الأكثر مبيعًا"],
      featured: true,
      bestSeller: true,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "avo-2",
      categoryId: "avo-meter",
      name: "أفو ميتر — النوع الثاني",
      nameEn: "AVO Meter — Type 2",
      desc: "أفو ميتر من فئة أعلى لتنفيذ القياسات الإلكترونية، مناسب للفنيين وأصحاب المشاريع.",
      images: [P + "avo-meter/IMG-20261011-WA0034.jpg", P + "avo-meter/IMG-20261011-WA0037.jpg", P + "avo-meter/IMG-20261112-WA0023.jpg"],
      imageAlt: "جهاز أفو ميتر — النوع الثاني",
      price: 550,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [
        { label: "الفئة", value: "أجهزة قياس (AVO Meter)" },
        { label: "الاستخدام", value: "قياسات إلكترونية متنوعة" },
        { label: "البيع", value: "قطعة واحدة" }
      ],
      keywords: "avo avometer multimeter افو أفو ميتر قياس",
      badges: [],
      featured: true,
      bestSeller: false,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "transistor",
      categoryId: "transistor",
      name: "ترانزستور",
      nameEn: "Transistor",
      desc: "ترانزستور يُستخدم في دوائر التكبير والتحكم والتوصيل، متوفر بسعر القطعة.",
      images: [P + "transistor/IMG-20261112-WA0016.jpg", P + "transistor/IMG-20261112-WA0019.jpg"],
      imageAlt: "ترانزستور إلكتروني",
      price: 5,
      priceStatus: "confirmed",
      unit: "للقطعة",
      variants: [],
      specs: [
        { label: "البيع", value: "بالقطعة" },
        { label: "الاستخدام", value: "دوائر التكبير والتحكم" }
      ],
      keywords: "transistor ترانزستور ترانزيستور",
      badges: ["سعر القطعة"],
      featured: false,
      bestSeller: true,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "soldering-kit",
      categoryId: "soldering-kit",
      name: "بكج الكاوية — 60 وات مع القصدير والمعجون",
      nameEn: "Soldering Kit 60W",
      desc: "بكج كامل يضم كاوية لحام 60 وات مع القصدير والمعجون، جاهز لبدء أعمال اللحام.",
      images: [P + "soldering-kit/IMG-20261011-WA0041.jpg", P + "soldering-kit/IMG-20261011-WA0043.jpg", P + "soldering-kit/IMG-20261011-WA0045.jpg", P + "soldering-kit/IMG-20261112-WA0017.jpg"],
      imageAlt: "بكج كاوية لحام 60 وات مع القصدير والمعجون",
      price: 160,
      priceStatus: "confirmed",
      unit: "للبكج",
      variants: [],
      specs: [
        { label: "القدرة", value: "60 وات" },
        { label: "المحتويات", value: "كاوية لحام + قصدير + معجون" },
        { label: "النوع", value: "بكج كامل" }
      ],
      keywords: "soldering iron kit كاوية لحام قصدير معجون بكج 60 وات",
      badges: ["بكج كامل"],
      featured: true,
      bestSeller: true,
      newArrival: false,
      offer: true,
      stock: "in"
    },
    {
      id: "variable-resistor",
      categoryId: "variable-resistor",
      name: "مقاومة متغيرة",
      nameEn: "Variable Resistor",
      desc: "مقاومة متغيرة للتحكم في قيمة المقاومة داخل الدوائر، ويختلف السعر حسب القيمة.",
      images: [P + "variable-resistor/IMG-20261011-WA0035.jpg"],
      imageAlt: "مقاومة متغيرة",
      price: 10,
      priceStatus: "from",
      priceNote: "السعر حسب القيمة المطلوبة",
      unit: "",
      variants: [],
      specs: [
        { label: "السعر", value: "حسب القيمة" },
        { label: "الاستخدام", value: "التحكم في قيمة المقاومة" }
      ],
      keywords: "variable resistor potentiometer مقاومة متغيرة بوتنشيومتر",
      badges: [],
      featured: false,
      bestSeller: false,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "power-supply",
      categoryId: "power-supply",
      name: "باور سبلاي",
      nameEn: "Power Supply",
      desc: "باور سبلاي لتغذية الدوائر والمشاريع الإلكترونية، والسعر حسب المواصفات والجهد والتيار.",
      images: [P + "power-supply/IMG-20261112-WA0024.jpg"],
      imageAlt: "باور سبلاي",
      price: 380,
      priceStatus: "from",
      priceNote: "السعر حسب المواصفات والجهد والتيار",
      unit: "",
      variants: [],
      specs: [
        { label: "السعر", value: "حسب المواصفات والجهد والتيار" },
        { label: "الاستخدام", value: "تغذية الدوائر والمشاريع" }
      ],
      keywords: "power supply باور سبلاي مصدر طاقة تغذية",
      badges: [],
      featured: true,
      bestSeller: false,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "breadboard",
      categoryId: "breadboard",
      name: "بريد بورد",
      nameEn: "Breadboard",
      desc: "بريد بورد لتوصيل الدوائر الإلكترونية بدون لحام، متوفر بالمقاس الصغير والكبير.",
      images: [P + "breadboard/IMG-20261112-WA0020.jpg"],
      imageAlt: "بريد بورد",
      price: 10,
      priceStatus: "confirmed",
      unit: "",
      variants: [
        { id: "bb-small", label: "صغيرة", price: 10 },
        { id: "bb-large", label: "كبيرة", price: 20 }
      ],
      specs: [
        { label: "المقاسات", value: "صغير / كبير" },
        { label: "التوصيل", value: "بدون لحام" }
      ],
      keywords: "breadboard بريد بورد بورد توصيل بدون لحام",
      badges: [],
      featured: true,
      bestSeller: true,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "capacitors",
      categoryId: "capacitors",
      name: "مكثفات",
      nameEn: "Capacitors",
      desc: "مكثفات بقيم وأنواع متنوعة تُستخدم في تنعيم الجهد وتخزين الشحنات داخل الدوائر، تبدأ من 3 جنيهات.",
      images: [P + "capacitors/IMG-20261011-WA0044.jpg", P + "capacitors/IMG-20261112-WA0015.jpg"],
      imageAlt: "مكثفات إلكترونية",
      price: 3,
      priceStatus: "from",
      priceNote: "السعر حسب النوع والقيمة",
      unit: "",
      variants: [],
      specs: [
        { label: "السعر", value: "حسب النوع والقيمة" },
        { label: "الاستخدام", value: "تنعيم الجهد وتخزين الشحنات" }
      ],
      keywords: "capacitor capacitors مكثفات مكثف سيراميك الكتروليتي",
      badges: [],
      featured: false,
      bestSeller: false,
      newArrival: true,
      offer: false,
      stock: "in"
    },
    {
      id: "coils",
      categoryId: "coils",
      name: "ملفات",
      nameEn: "Coils",
      desc: "ملفات إلكترونية بعدة أنواع تُستخدم في دوائر الفلترة والتنعيم، ويبدأ السعر من 5 جنيهات.",
      images: [P + "coils/IMG-20261112-WA0018.jpg", P + "coils/IMG-20261112-WA0021.jpg"],
      imageAlt: "ملفات إلكترونية",
      price: 5,
      priceStatus: "from",
      priceNote: "من 5 إلى 15 جنيهًا حسب النوع",
      unit: "",
      variants: [],
      specs: [
        { label: "السعر", value: "من 5 إلى 15 جنيهًا حسب النوع" },
        { label: "الاستخدام", value: "الفلترة والتنعيم" }
      ],
      keywords: "coil coils inductor ملف ملفات",
      badges: [],
      featured: false,
      bestSeller: false,
      newArrival: true,
      offer: false,
      stock: "in"
    },
    {
      id: "resistors",
      categoryId: "resistors",
      name: "مقاومات",
      nameEn: "Resistors",
      desc: "مقاومات إلكترونية بسعر 0.25 جنيه للقطعة، مناسبة لجميع الدوائر والمشاريع.",
      images: [P + "resistors/IMG-20261112-WA0014.jpg"],
      imageAlt: "مقاومات إلكترونية",
      price: 0.25,
      priceStatus: "confirmed",
      unit: "للقطعة",
      variants: [
        { id: "single", label: "قطعة واحدة", price: 0.25 },
        { id: "pack-100", label: "باكيت 100 قطعة", price: 25 }
      ],
      specs: [
        { label: "السعر", value: "0.25 جنيه للقطعة" },
        { label: "الاستخدام", value: "تنظيم التيار داخل الدوائر" }
      ],
      keywords: "resistor resistors مقاومة مقاومات",
      badges: ["سعر القطعة"],
      featured: false,
      bestSeller: true,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "type-c-charger",
      categoryId: "type-c-charger",
      name: "دائرة شحن Type-C",
      nameEn: "Type-C Charging Module",
      desc: "دائرة شحن بمنفذ USB Type-C لشحن البطاريات وتغذية المشاريع الإلكترونية.",
      images: [P + "type-c-charger/IMG-20261011-WA0036.jpg"],
      imageAlt: "دائرة شحن Type-C",
      price: 22,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [
        { label: "المنفذ", value: "USB Type-C" },
        { label: "الاستخدام", value: "شحن وتغذية الدوائر" }
      ],
      keywords: "type-c usb charging module دائرة شحن تايب سي usb-c",
      badges: ["جديد"],
      featured: true,
      bestSeller: false,
      newArrival: true,
      offer: false,
      stock: "in"
    },
    {
      id: "mini-fan",
      categoryId: "mini-fan",
      name: "مروحة وجه صغيرة",
      nameEn: "Mini Fan",
      desc: "مروحة وجه صغيرة للتبريد داخل الأجهزة والدوائر الإلكترونية.",
      images: [P + "mini-fan/IMG-20261113-WA0007.jpg"],
      imageAlt: "مروحة وجه صغيرة",
      price: 120,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [{ label: "الاستخدام", value: "تبريد الدوائر والأجهزة" }],
      keywords: "mini fan مروحة تبريد",
      badges: ["جديد"],
      featured: true,
      bestSeller: false,
      newArrival: true,
      offer: true,
      stock: "in"
    },
    {
      id: "battery",
      categoryId: "battery",
      name: "البطارية",
      nameEn: "Battery",
      desc: "بطارية لتشغيل الدوائر والمشاريع الإلكترونية.",
      images: [P + "battery/IMG-20261112-WA0025.jpg"],
      imageAlt: "بطارية",
      price: 45,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [{ label: "الاستخدام", value: "تشغيل الدوائر والمشاريع" }],
      keywords: "battery بطارية بطاريات",
      badges: [],
      featured: false,
      bestSeller: false,
      newArrival: true,
      offer: false,
      stock: "in"
    },
    {
      id: "flashlight",
      categoryId: "flashlight",
      name: "الكشاف",
      nameEn: "Flashlight",
      desc: "كشاف إضاءة عملي للاستخدام اليومي وأعمال الصيانة.",
      images: [P + "flashlight/IMG-20261113-WA0006.jpg"],
      imageAlt: "كشاف إضاءة",
      price: 150,
      priceStatus: "confirmed",
      unit: "",
      variants: [],
      specs: [{ label: "الاستخدام", value: "الإضاءة وأعمال الصيانة" }],
      keywords: "flashlight torch كشاف اضاءة",
      badges: [],
      featured: false,
      bestSeller: false,
      newArrival: true,
      offer: false,
      stock: "in"
    },
    {
      id: "led",
      categoryId: "led",
      name: "ليد LED",
      nameEn: "LED",
      desc: "ليد LED للاستخدام في دوائر الإضاءة والمؤشرات، بسعر 0.75 جنيه للقطعة.",
      images: [P + "led/IMG-20261011-WA0040.jpg", P + "led/IMG-20261112-WA0022.jpg"],
      imageAlt: "ليد LED",
      price: 0.75,
      priceStatus: "confirmed",
      unit: "للقطعة",
      variants: [
        { id: "led-single", label: "قطعة واحدة", price: 0.75 },
        { id: "led-pack-100", label: "باكيت 100 قطعة", price: 75 }
      ],
      specs: [
        { label: "السعر", value: "0.75 جنيه للقطعة" },
        { label: "الاستخدام", value: "الإضاءة والمؤشرات" }
      ],
      keywords: "led ليد لمبة مؤشر",
      badges: ["سعر القطعة"],
      featured: true,
      bestSeller: true,
      newArrival: false,
      offer: false,
      stock: "in"
    },
    {
      id: "other-items",
      categoryId: "other-items",
      name: "عناصر إلكترونية متنوعة",
      nameEn: "Other Components",
      desc: "مجموعة من العناصر الإلكترونية الإضافية. تواصل معنا لتأكيد نوع العنصر المتوفر وسعره.",
      images: [P + "other-items/IMG-20261011-WA0038.jpg", P + "other-items/IMG-20261011-WA0039.jpg", P + "other-items/IMG-20261011-WA0042.jpg", P + "other-items/IMG-20261113-WA0005.jpg"],
      imageAlt: "عناصر إلكترونية متنوعة",
      price: null,
      priceStatus: "pending",
      unit: "",
      variants: [],
      specs: [
        { label: "السعر", value: "قيد التأكيد" },
        { label: "التوفر", value: "حسب المتوفر" }
      ],
      keywords: "other components عناصر اخرى مكونات إلكترونية",
      badges: ["قيد التأكيد"],
      featured: false,
      bestSeller: false,
      newArrival: false,
      offer: false,
      stock: "unknown"
    }
  ];

  var VIDEOS = [
    {
      id: "ac-power",
      title: "القدرة في التيار المتردد",
      subtitle: "AC Power",
      desc: "شرح تعليمي مبسط لمفهوم القدرة في دوائر التيار المتردد.",
      src: "assets/educational-videos/ac-power.mp4",
      poster: "assets/educational-videos/ac-power-thumb.jpg",
      duration: "1:33",
      category: "شرح تعليمي"
    },
    {
      id: "analog-power",
      title: "القدرة في الإلكترونيات التناظرية",
      subtitle: "Analog Electronics Power",
      desc: "شرح تعليمي لمفهوم القدرة في الإلكترونيات التناظرية.",
      src: "assets/educational-videos/analog-power.mp4",
      poster: "assets/educational-videos/analog-power-thumb.jpg",
      duration: "6:54",
      category: "شرح تعليمي"
    }
  ];

  var PROJECTS = [
    {
      id: "diode-circuit",
      title: "دائرة بسيطة باستخدام الدايود",
      category: "دوائر إلكترونية",
      desc: "تطبيق عملي لتوصيل دائرة بسيطة باستخدام الدايود، موثّق بالفيديو خطوة بخطوة.",
      cover: "assets/projects/diode-circuit-cover.jpg",
      video: "assets/projects/diode-circuit.mp4",
      duration: "0:23",
      gallery: ["assets/projects/diode-circuit-cover.jpg"]
    },
    {
      id: "simple-fan",
      title: "مروحة بسيطة",
      category: "تطبيقات عملية",
      desc: "مشروع مروحة بسيطة يوضح فكرة التشغيل العملي للمكونات الإلكترونية.",
      cover: "assets/projects/simple-fan-cover.jpg",
      video: "assets/projects/simple-fan.mp4",
      duration: "0:25",
      gallery: ["assets/projects/simple-fan-cover.jpg"]
    }
  ];

  /* ---------------------------- Shared helpers ---------------------------- */

  function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) return "قيد التأكيد";
    var rounded = Math.round(value * 100) / 100;
    var text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
    return text;
  }

  function formatMoney(value) {
    return formatPrice(value) + " " + CONFIG.currency;
  }

  function round2(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function categoryById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return null;
  }

  function categoryIndex(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return i;
    }
    return 999;
  }

  function productIndex(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return i;
    }
    return 999;
  }

  function getVariant(product, variantId) {
    if (!product || !product.variants || !product.variants.length) return null;
    if (!variantId) return product.variants[0];
    for (var i = 0; i < product.variants.length; i++) {
      if (product.variants[i].id === variantId) return product.variants[i];
    }
    return product.variants[0];
  }

  function priceOf(product, variantId) {
    var variant = getVariant(product, variantId);
    if (variant) return variant.price;
    return product.price;
  }

  function unitLabel(product, variantId) {
    var variant = getVariant(product, variantId);
    if (variant && product.variants.length > 1) return variant.label;
    return product.unit || "للقطعة";
  }

  function normalizeArabic(text) {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function whatsappLink(number, message) {
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message || CONFIG.defaultMessage);
  }

  function waNumber() {
    return CONFIG.whatsapp[0].number;
  }

  function productInquiryMessage(product) {
    return "مرحبًا، أود الاستفسار عن: " + product.name + " — من متجر Eldsoqi Store.";
  }

  global.Eldsoqi = global.Eldsoqi || {};
  global.Eldsoqi.Data = {
    CONFIG: CONFIG,
    CATEGORIES: CATEGORIES,
    PRODUCTS: PRODUCTS,
    VIDEOS: VIDEOS,
    PROJECTS: PROJECTS,
    formatPrice: formatPrice,
    formatMoney: formatMoney,
    round2: round2,
    productById: productById,
    categoryById: categoryById,
    categoryIndex: categoryIndex,
    productIndex: productIndex,
    getVariant: getVariant,
    priceOf: priceOf,
    unitLabel: unitLabel,
    normalizeArabic: normalizeArabic,
    escapeHtml: escapeHtml,
    whatsappLink: whatsappLink,
    waNumber: waNumber,
    productInquiryMessage: productInquiryMessage
  };
})(window);
