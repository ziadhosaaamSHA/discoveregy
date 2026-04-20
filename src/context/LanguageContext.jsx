/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_STORAGE_KEY = "degy_language";
const RTL_LANGUAGES = new Set(["ar"]);

const TRANSLATIONS = {
  en: {
    meta: {
      title: "Discover Egypt - Travel & Adventure",
      description:
        "Discover Egypt - Travel, enjoy and live a new and full life with authentic Egyptian experiences",
    },
    common: {
      home: "Home",
      explore: "Explore",
      aboutUs: "About Us",
      bookmarks: "Bookmarks",
      login: "Login",
      signup: "Sign up",
      logout: "Log out",
      menu: "Menu",
      searchPrompt: "What's on your mind?",
      search: "Search",
      switchToArabic: "Switch to Arabic",
      switchToEnglish: "Switch to English",
      english: "EN",
      arabic: "AR",
      close: "Close",
      welcomeBack: "Welcome back",
      loading: "Loading...",
      selectLanguage: "Select language",
      cancel: "Cancel",
    },
    hero: {
      badge: "Best Destinations Around Egypt",
      title: "Travel, enjoy and live a new and full life",
      description:
        "Worem ipsum dolor sit amet, consectetur adipiscing elit. Worem ipsum dolor sit amet, consectetur adipiscing elit. Worem ipsum dolor sit amet,",
      cta: "Find out more",
      playDemo: "Play demo video",
      downloadNow: "Download Now!",
      alt: "Happy traveller with suitcase exploring Egypt",
    },
    about: {
      title: "About Us",
      downloads: "Total Downloads",
      ratings: "App Ratings",
      outOf: "out of 5",
      ratingsBadge: "32 Ratings",
      conversionRate: "Conversion Rate",
    },
    features: {
      title: "Our Features",
      items: [
        {
          title: "Exclusive Designs",
          description:
            "We work closely with talented ceramic artists to bring you exclusive and one-of-a-kind designs.",
          link: "Learn more",
        },
        {
          title: "Exclusive Designs",
          description:
            "We work closely with talented ceramic artists to bring you exclusive and one-of-a-kind designs.",
          link: "Learn more",
        },
        {
          title: "Exclusive Designs",
          description:
            "We work closely with talented ceramic artists to bring you exclusive and one-of-a-kind designs.",
          link: "Learn more",
        },
      ],
    },
    footer: {
      brandName: "Discover Egypt",
      brandDescription:
        "We bring authentic Egyptian experiences to the world with culture, history, and adventure.",
      usefulLinks: "Useful Links",
      resources: "Resources",
      becomeGuide: "Become a guide",
      support: "Support",
      help: "Help",
      contactUs: "Contact Us",
      copyright: "©2025 DiscoverEgypt",
    },
    auth: {
      loginTitle: "Login now",
      loginSubtitle: "Please sign in to continue our app",
      createAccountTitle: "Create Account",
      createAccountSubtitle: "Fill in your details to get started",
      tourist: "Tourist",
      guide: "Guide",
      firstNamePlaceholder: "First name",
      lastNamePlaceholder: "Last name",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      emailAddress: "Email address",
      phoneNumber: "Phone number",
      phonePlaceholder: "01xxxxxxxxx",
      gender: "Gender",
      dobPlaceholder: "Date of Birth",
      dobRequired: "Date of Birth is required",
      password: "Password",
      confirmPassword: "Confirm password",
      selectGender: "Gender",
      selectNationality: "Select nationality",
      selectLanguages: "Select languages you speak",
      licenseIdPlaceholder: "License ID",
      licenseIdRequired: "License ID is required",
      uploadLicenseImage: "Upload license image",
      licenseImageRequired: "License image is required",
      noAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
      signUp: "Sign up",
      forgotPassword: "Forgot Password?",
      loginButton: "Login",
      loginLoading: "Logging in...",
      createButton: "Create Account",
      createLoading: "Creating account...",
      orConnect: "Or connect",
      orConnectWith: "Or connect with",
      facebook: "Facebook",
      google: "Google",
      instagram: "Instagram",
      showPassword: "Show password",
      hidePassword: "Hide password",
      invalidEmail: "Invalid email",
      emailRequired: "Email is required",
      passwordMin6: "Min 6 characters",
      passwordRequired: "Password is required",
      loginError: "Invalid email or password",
      emailExists: "Email already exists",
      bookingInstructions: "Fill in your details to complete your booking",
      nameRequired: "Name is required",
      phoneInvalid: "Invalid phone number",
      phoneRequired: "Phone number is required",
      genderRequired: "Gender is required",
      confirmRequired: "Confirm your password",
      passwordsMatch: "Passwords must match",
      nationalityRequired: "Nationality is required",
      languagesRequired: "Languages are required",
      selectAtLeastOneLanguage: "Select at least one language",
      nationalityEgyptian: "Egyptian",
      genderMale: "Male",
      genderFemale: "Female",
    },
    search: {
      placeholder: "Search destinations...",
      ariaLabel: "Search destinations",
      noResultsTitle: "No destinations found",
      noResultsHint: 'Try searching for "Luxor", "Cairo", or "Pyramids"',
      resultsFound: "{{count}} destination{{suffix}} found{{query}}",
    },
    bookmarks: {
      title: "My Bookmarks ({{count}})",
      emptyTitle: "No bookmarks yet",
      emptyBody:
        "Start exploring and save your favorite destinations!",
      exploreDestinations: "Explore Destinations",
      removeBookmark: "Remove {{name}} from bookmarks",
    },
    destination: {
      notFound: "Destination not found",
      goBackHome: "Go back home",
      details: "Details",
      description: "Description",
      comments: "Comments",
      reviews: "reviews",
      bookNow: "Book now",
      call: "Call",
      viewLocation: "View location",
      verified: "Verified",
      photos: "Photos",
      currentActivities: "Current Activities",
      popularAttractions: "Popular Attractions",
    },
    booking: {
      title: "Book Your Trip",
      confirmedTitle: "Booking Confirmed!",
      thankYou: "Thank You!",
      submitted: "Your booking request for {{name}} has been submitted.",
      contactSoon: "We will contact you shortly to confirm your reservation.",
      done: "Done",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      address: "Address",
      tripDate: "Trip Date",
      paymentMethod: "Payment Method",
      submit: "Submit",
      submitting: "Submitting...",
      namePlaceholder: "Enter your full name",
      phonePlaceholder: "01xxxxxxxxx",
      addressPlaceholder: "Enter your full address",
      selectPayment: "Select a payment method",
      paymentRequired: "Payment method is required",
      bookingInstructions: "Fill in your details to complete your booking",
      paymentOptions: {
        instapay: { name: "InstaPay", description: "Pay via InstaPay" },
        vodafone_cash: {
          name: "Vodafone Cash",
          description: "Pay via Vodafone Cash",
        },
      },
    },
    validation: {
      nameMin2: "Min 2 characters",
      invalidEmail: "Invalid email",
      phoneInvalid: "Invalid phone number",
      required: "This field is required",
      passwordMin6: "Min 6 characters",
      confirmMatch: "Passwords must match",
      ageNumber: "Must be a number",
      ageMin: "Must be at least 16",
      ageMax: "Invalid age",
      addressMin: "Please enter a complete address",
      futureDate: "Date must be in the future",
      paymentMethodRequired: "Payment method is required",
      selectOneLanguage: "Select at least one language",
      selectNationality: "Nationality is required",
    },
  },
  ar: {
    meta: {
      title: "اكتشف مصر - السفر والمغامرة",
      description:
        "اكتشف مصر - سافر واستمتع وعش حياة جديدة ومتكاملة مع تجارب مصرية أصيلة",
    },
    common: {
      home: "الرئيسية",
      explore: "استكشف",
      aboutUs: "من نحن",
      bookmarks: "المحفوظات",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      menu: "القائمة",
      searchPrompt: "ما الذي يدور في بالك؟",
      search: "بحث",
      switchToArabic: "التبديل إلى العربية",
      switchToEnglish: "التبديل إلى الإنجليزية",
      english: "EN",
      arabic: "AR",
      close: "إغلاق",
      welcomeBack: "مرحبًا بعودتك",
      loading: "جارٍ التحميل...",
      selectLanguage: "اختر اللغة",
      cancel: "إلغاء",
    },
    hero: {
      badge: "أفضل الوجهات حول مصر",
      title: "سافر واستمتع وعش حياة جديدة ومليئة بالطاقة",
      description:
        "نص تجريبي طويل يصف رحلة مميزة وتجربة ممتعة مع محتوى حقيقي وأجواء سياحية ملهمة.",
      cta: "اعرف المزيد",
      playDemo: "تشغيل الفيديو التجريبي",
      downloadNow: "حمّل الآن!",
      alt: "مسافر سعيد يحمل حقيبة ويستكشف مصر",
    },
    about: {
      title: "من نحن",
      downloads: "إجمالي التنزيلات",
      ratings: "تقييم التطبيق",
      outOf: "من 5",
      ratingsBadge: "32 تقييمًا",
      conversionRate: "معدل التحويل",
    },
    features: {
      title: "مميزاتنا",
      items: [
        {
          title: "تصاميم حصرية",
          description:
            "نعمل عن قرب مع فنانين موهوبين لتقديم تصاميم حصرية وفريدة من نوعها.",
          link: "اعرف المزيد",
        },
        {
          title: "تصاميم حصرية",
          description:
            "نعمل عن قرب مع فنانين موهوبين لتقديم تصاميم حصرية وفريدة من نوعها.",
          link: "اعرف المزيد",
        },
        {
          title: "تصاميم حصرية",
          description:
            "نعمل عن قرب مع فنانين موهوبين لتقديم تصاميم حصرية وفريدة من نوعها.",
          link: "اعرف المزيد",
        },
      ],
    },
    footer: {
      brandName: "اكتشف مصر",
      brandDescription:
        "نقدم التجارب المصرية الأصيلة للعالم من خلال الثقافة والتاريخ والمغامرة.",
      usefulLinks: "روابط مفيدة",
      resources: "الموارد",
      becomeGuide: "كن دليلًا سياحيًا",
      support: "الدعم",
      help: "المساعدة",
      contactUs: "تواصل معنا",
      copyright: "©2025 اكتشف مصر",
    },
    auth: {
      loginTitle: "سجّل الدخول الآن",
      loginSubtitle: "يرجى تسجيل الدخول للمتابعة في التطبيق",
      createAccountTitle: "إنشاء حساب",
      createAccountSubtitle: "أدخل بياناتك للبدء",
      tourist: "سائح",
      guide: "دليل",
      firstNamePlaceholder: "الاسم الأول",
      lastNamePlaceholder: "الاسم الأخير",
      firstNameRequired: "الاسم الأول مطلوب",
      lastNameRequired: "الاسم الأخير مطلوب",
      emailAddress: "البريد الإلكتروني",
      phoneNumber: "رقم الهاتف",
      phonePlaceholder: "01xxxxxxxxx",
      gender: "النوع",
      dobPlaceholder: "تاريخ الميلاد",
      dobRequired: "تاريخ الميلاد مطلوب",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      selectGender: "النوع",
      selectNationality: "اختر الجنسية",
      selectLanguages: "اختر اللغات التي تتحدثها",
      licenseIdPlaceholder: "رقم الترخيص",
      licenseIdRequired: "رقم الترخيص مطلوب",
      uploadLicenseImage: "رفع صورة الترخيص",
      licenseImageRequired: "صورة الترخيص مطلوبة",
      noAccount: "ليس لديك حساب؟",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      forgotPassword: "هل نسيت كلمة المرور؟",
      loginButton: "تسجيل الدخول",
      loginLoading: "جارٍ تسجيل الدخول...",
      createButton: "إنشاء حساب",
      createLoading: "جارٍ إنشاء الحساب...",
      orConnect: "أو اتصل عبر",
      orConnectWith: "أو اتصل عبر",
      facebook: "فيسبوك",
      google: "جوجل",
      instagram: "إنستغرام",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      invalidEmail: "البريد الإلكتروني غير صحيح",
      emailRequired: "البريد الإلكتروني مطلوب",
      passwordMin6: "6 أحرف على الأقل",
      passwordRequired: "كلمة المرور مطلوبة",
      loginError: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      emailExists: "البريد الإلكتروني موجود بالفعل",
      bookingInstructions: "أدخل بياناتك لإكمال عملية الحجز",
      nameRequired: "الاسم مطلوب",
      phoneInvalid: "رقم الهاتف غير صحيح",
      phoneRequired: "رقم الهاتف مطلوب",
      genderRequired: "النوع مطلوب",
      confirmRequired: "يرجى تأكيد كلمة المرور",
      passwordsMatch: "كلمتا المرور غير متطابقتين",
      nationalityRequired: "الجنسية مطلوبة",
      languagesRequired: "اللغات مطلوبة",
      selectAtLeastOneLanguage: "اختر لغة واحدة على الأقل",
      nationalityEgyptian: "مصري",
      genderMale: "ذكر",
      genderFemale: "أنثى",
    },
    booking: {
      bookingInstructions: "أدخل بياناتك لإكمال عملية الحجز",
    },
    search: {
      placeholder: "ابحث عن الوجهات...",
      ariaLabel: "البحث عن الوجهات",
      noResultsTitle: "لا توجد وجهات",
      noResultsHint: 'جرّب البحث عن "الأقصر" أو "القاهرة" أو "الأهرامات"',
      resultsFound: "تم العثور على {{count}} وجهة{{suffix}}{{query}}",
    },
    bookmarks: {
      title: "محفوظاتي ({{count}})",
      emptyTitle: "لا توجد محفوظات حتى الآن",
      emptyBody: "ابدأ الاستكشاف واحفظ وجهاتك المفضلة!",
      exploreDestinations: "استكشف الوجهات",
      removeBookmark: "إزالة {{name}} من المحفوظات",
    },
    destination: {
      notFound: "الوجهة غير موجودة",
      goBackHome: "العودة للرئيسية",
      details: "التفاصيل",
      description: "الوصف",
      comments: "التعليقات",
      reviews: "تقييمات",
      bookNow: "احجز الآن",
      call: "اتصال",
      viewLocation: "عرض الموقع",
      verified: "موثّق",
      photos: "صور",
      currentActivities: "الأنشطة الحالية",
      popularAttractions: "مناطق الجذب الشهيرة",
    },
    booking: {
      title: "احجز رحلتك",
      confirmedTitle: "تم تأكيد الحجز!",
      thankYou: "شكرًا لك!",
      submitted: "تم إرسال طلب الحجز الخاص بك إلى {{name}}.",
      contactSoon: "سنتواصل معك قريبًا لتأكيد الحجز.",
      done: "تم",
      fullName: "الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      address: "العنوان",
      tripDate: "تاريخ الرحلة",
      paymentMethod: "طريقة الدفع",
      submit: "إرسال طلب الحجز",
      submitting: "جارٍ الإرسال...",
      namePlaceholder: "أدخل اسمك الكامل",
      phonePlaceholder: "01xxxxxxxxx",
      addressPlaceholder: "أدخل عنوانك الكامل",
      selectPayment: "اختر طريقة الدفع",
      paymentRequired: "طريقة الدفع مطلوبة",
      bookingInstructions: "أدخل بياناتك لإكمال عملية الحجز",
      paymentOptions: {
        instapay: { name: "إنستا باي", description: "ادفع عبر إنستا باي" },
        vodafone_cash: {
          name: "فودافون كاش",
          description: "ادفع عبر فودافون كاش",
        },
      },
    },
    validation: {
      nameMin2: "حرفان على الأقل",
      invalidEmail: "البريد الإلكتروني غير صحيح",
      phoneInvalid: "رقم الهاتف غير صحيح",
      required: "هذه الخانة مطلوبة",
      passwordMin6: "6 أحرف على الأقل",
      confirmMatch: "كلمتا المرور غير متطابقتين",
      ageNumber: "يجب أن يكون رقمًا",
      ageMin: "يجب ألا يقل العمر عن 16",
      ageMax: "العمر غير صالح",
      addressMin: "يرجى إدخال عنوان كامل",
      futureDate: "يجب أن يكون التاريخ في المستقبل",
      paymentMethodRequired: "طريقة الدفع مطلوبة",
      selectOneLanguage: "اختر لغة واحدة على الأقل",
      selectNationality: "الجنسية مطلوبة",
    },
  },
};

const LanguageContext = createContext(null);

function getNested(value, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), value);
}

function interpolate(text, vars) {
  if (typeof text !== "string" || !vars) return text;
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
    vars[key] === undefined ? "" : String(vars[key])
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "ar" ? "ar" : "en";
  });

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage === "ar" ? "ar" : "en");
  };

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";

    const meta = TRANSLATIONS[language].meta;
    document.title = meta.title;

    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute("content", meta.description);
  }, [language]);

  const value = useMemo(() => {
    const current = TRANSLATIONS[language];
    const fallback = TRANSLATIONS.en;

    const t = (key, vars) => {
      const raw = getNested(current, key) ?? getNested(fallback, key) ?? key;
      return interpolate(raw, vars);
    };

    return {
      language,
      isRTL: RTL_LANGUAGES.has(language),
      setLanguage,
      t,
      translations: current,
      supportedLanguages: [
        { code: "en", label: current.common.english },
        { code: "ar", label: current.common.arabic },
      ],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
