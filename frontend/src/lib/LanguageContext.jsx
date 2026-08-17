import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // English defaults (handled by fallback parameter in t())
  },
  hi: {
    // Sidebar
    "Dashboard Overview": "डैशबोर्ड अवलोकन",
    "My Vendor Profile": "मेरा विक्रेता प्रोफाइल",
    "My Certificate": "मेरा प्रमाणपत्र",
    "Designated Zones": "नामित क्षेत्र",
    "Vendor Directory": "विक्रेता निर्देशिका",
    "AI Zone Optimizer": "एआई जोन ऑप्टिमाइजर",
    "Certificate Portal": "प्रमाणपत्र पोर्टल",
    "Mobile Inspector": "मोबाइल निरीक्षक",
    "Executive Analytics": "कार्यकारी विश्लेषण",
    "Sarvam AI Voice": "सर्वम एआई आवाज",
    "Tap for Multilingual Voice": "बहुभाषी आवाज के लिए टैप करें",
    "Admin & Governance": "प्रशासन और शासन",
    "Vendor Services": "विक्रेता सेवाएं",
    "OFFICER ADMIN PORTAL": "अधिकारी प्रशासन पोर्टल",
    "CITIZEN CIVIC PORTAL": "नागरिक पोर्टल",
    "QR Live": "क्यूआर लाइव",

    // Navbar
    "OFFICER ACCESS": "अधिकारी पहुंच",
    "PUBLIC CIVIC PORTAL": "सार्वजनिक नागरिक पोर्टल",
    "Search vendor, zone ID...": "विक्रेता, जोन आईडी खोजें...",
    "Sign Out": "साइन आउट",
    "Viksit Vyapari System": "विकसित व्यापारी प्रणाली",

    // Dashboard Overview
    "Total Registered Vendors": "कुल पंजीकृत विक्रेता",
    "Designated Vending Zones": "नामित विक्रेता क्षेत्र",
    "Permit Compliance Rate": "परमिट अनुपालन दर",
    "PM SVANidhi Micro-Credit": "पीएम स्वनिधि माइक्रो-क्रेडिट",
    "All Vendors Verified": "सभी विक्रेता सत्यापित",
    "Zone A & B Active": "जोन ए और बी सक्रिय",
    "Active Beneficiaries": "सक्रिय लाभार्थी",
    "Live GIS Civic Vending Map": "लाइव जीआईएस नागरिक विक्रेता मानचित्र",
    "Showing": "दर्शाता हुआ",
    "Dynamic Vendor Pins": "गतिशील विक्रेता पिन",
    "Quick Actions": "त्वरित कार्रवाई",
    "Officer Controls": "अधिकारी नियंत्रण",
    "Citizen Services": "नागरिक सेवाएं",
    "Issue Certificate": "प्रमाणपत्र जारी करें",
    "Re-Zone Area": "क्षेत्र का पुनर्गठन करें",
    "Inspect Field": "क्षेत्र निरीक्षण",
    "Recent Civic Activity": "हालिया नागरिक गतिविधि",
    "Render API Feed": "लाइव एपीआई फीड",

    // Certificate Management
    "Digital Vending Certificate & QR Permit Portal": "डिजिटल विक्रेता प्रमाणपत्र और क्यूआर परमिट पोर्टल",
    "My Digital Vending Permit": "मेरा डिजिटल विक्रेता परमिट",
    "Live Dynamic Smart Vending License Viewer": "लाइव स्मार्ट लाइसेंस दर्शक",
    "Your Official Smart Vending License Card": "आपका आधिकारिक स्मार्ट विक्रेता लाइसेंस कार्ड",
    "Print License": "लाइसेंस प्रिंट करें",
    "Print Permit": "परमिट प्रिंट करें",
    "NAGPUR MUNICIPAL CORPORATION": "नागपुर नगर निगम",
    "OFFICIAL VENDING CERTIFICATE & PERMIT": "आधिकारिक विक्रेता प्रमाणपत्र और परमिट",
    "Permit Holder Name": "परमिट धारक का नाम",
    "Vending Certificate ID": "विक्रेता प्रमाणपत्र आईडी",
    "Stall Trade Name": "स्टाल व्यापार का नाम",
    "Permit Serial Number": "परमिट क्रमांक",
    "Designated Vending Zone": "नामित विक्रेता क्षेत्र",
    "Authorized Vending Category": "अधिकृत विक्रेता श्रेणी",
    "Issue Date": "जारी करने की तिथि",
    "Expiration Date": "समाप्ति तिथि",
    "OFFICIALLY VERIFIED CIVIC PERMIT": "आधिकारिक रूप से सत्यापित नागरिक परमिट",
    "PENDING APPROVAL": "मंजूरी लंबित",
    "QR Code Security": "क्यूआर कोड सुरक्षा",
    "License Status": "लाइसेंस स्थिति",
    "Annual Renewal Fee": "वार्षिक नवीनीकरण शुल्क",
    "Paid": "भुगतान किया",
    "PM SVANidhi Linked": "पीएम स्वनिधि से लिंक्ड",
    "Download High-Res Certificate": "प्रमाणपत्र डाउनलोड करें",

    // AI Zone Optimizer
    "AI Zone Optimization Engine (FastAPI Connected)": "एआई जोन ऑप्टिमाइज़ेशन इंजन (फास्टएपीआई)",
    "Nagpur Municipal Corp - Designated Zones": "नागपुर नगर निगम - नामित क्षेत्र",
    "Vending Zone Capacity & Foot-Traffic Re-Balancing": "विक्रेता क्षेत्र क्षमता और यातायात पुनर्संतुलन",
    "Designated Vending Zones & Pedestrian Maps": "नामित विक्रेता क्षेत्र और पैदल यात्री मानचित्र",
    "Interactive Pedestrian Traffic & Vending Density Map": "इंटरएक्टिव पैदल यात्री यातायात और विक्रेता घनत्व मानचित्र",
    "Vending Zones & Safety Guidelines": "विक्रेता क्षेत्र और सुरक्षा दिशानिर्देश",
    "Smart Vending Best Practices": "स्मार्ट विक्रेता सर्वोत्तम प्रथाएं",
    "Nagpur Smart City Vending System Active and Regulated.": "नागपुर स्मार्ट सिटी विक्रेता प्रणाली सक्रिय और विनियमित।",
    "Optimization Controls": "ऑप्टिमाइज़ेशन नियंत्रण",
    "Target Vending Density": "लक्ष्य विक्रेता घनत्व",
    "Peak Hour Traffic Sensitivity": "व्यस्त समय यातायात संवेदनशीलता",
    "FastAPI AI Model Calculation": "फास्टएपीआई एआई मॉडल गणना",
    "Approve & Execute AI Re-Zoning Plan": "एआई री-जोनिंग योजना को मंजूरी दें",
    "Calculating FastAPI Model...": "गणना की जा रही है...",

    // Login
    "Viksit Vyapari Civic Portal": "विकसित व्यापारी नागरिक पोर्टल",
    "Sign In to Portal": "पोर्टल में साइन इन करें",
    "Create Account": "खाता बनाएं",
    "Role-based access for Municipal Officers & Registered Citizens": "अधिकारी और नागरिकों के लिए भूमिका आधारित पहुंच",
    "Citizen / Vendor": "नागरिक / विक्रेता",
    "Authority / Officer": "अधिकारी / अधिकारी",
    "Sign In": "साइन इन",
    "Register": "पंजीकरण",
    "Full Name": "पूरा नाम",
    "Department / Authority ID": "विभाग / अधिकारी आईडी",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Processing...": "प्रक्रिया जारी है...",
    "Sign In as Citizen": "नागरिक के रूप में साइन इन करें",
    "Sign In as Officer": "अधिकारी के रूप में साइन इन करें",
    "Register Account": "खाता पंजीकृत करें",
    "Instant 1-Click Demo Login:": "त्वरित 1-क्लिक डेमो लॉगिन:",
    "Officer Access": "अधिकारी लॉगिन",
    "Citizen Access": "नागरिक लॉगिन",
  },
  mr: {
    // Sidebar
    "Dashboard Overview": "डैशबोर्ड विहंगावलोकन",
    "My Vendor Profile": "माझे विक्रेता प्रोफाइल",
    "My Certificate": "माझे प्रमाणपत्र",
    "Designated Zones": "नियुक्त फेरीवाला क्षेत्र",
    "Vendor Directory": "विक्रेता निर्देशिका",
    "AI Zone Optimizer": "एआय झोन ऑप्टिमायझर",
    "Certificate Portal": "प्रमाणपत्र पोर्टल",
    "Mobile Inspector": "मोबाईल निरीक्षक",
    "Executive Analytics": "कार्यकारी विश्लेषण",
    "Sarvam AI Voice": "सर्वम एआय आवाज",
    "Tap for Multilingual Voice": "बहुभाषिक आवाजासाठी टॅप करा",
    "Admin & Governance": "प्रशासन आणि शासन",
    "Vendor Services": "विक्रेता सेवा",
    "OFFICER ADMIN PORTAL": "अधिकारी प्रशासन पोर्टल",
    "CITIZEN CIVIC PORTAL": "नागरी नागरिक पोर्टल",
    "QR Live": "क्यूआर लाइव्ह",

    // Navbar
    "OFFICER ACCESS": "अधिकारी प्रवेश",
    "PUBLIC CIVIC PORTAL": "सार्वजनिक नागरी पोर्टल",
    "Search vendor, zone ID...": "विक्रेता, झोन आयडी शोधा...",
    "Sign Out": "बाहेर पडा",
    "Viksit Vyapari System": "विकसित व्यापारी प्रणाली",

    // Dashboard Overview
    "Total Registered Vendors": "एकूण नोंदणीकृत विक्रेते",
    "Designated Vending Zones": "नियुक्त फेरीवाला क्षेत्र",
    "Permit Compliance Rate": "परवाना अनुपालन दर",
    "PM SVANidhi Micro-Credit": "पीएम स्वनिधी कर्ज योजना",
    "All Vendors Verified": "सर्व विक्रेते सत्यापित",
    "Zone A & B Active": "झोन अ आणि ब सक्रिय",
    "Active Beneficiaries": "सक्रिय लाभार्थी",
    "Live GIS Civic Vending Map": "थेट जीआयएस नागरी फेरीवाला नकाशा",
    "Showing": "दर्शवित आहे",
    "Dynamic Vendor Pins": "थेट फेरीवाला पिन्स",
    "Quick Actions": "त्वरित कृती",
    "Officer Controls": "अधिकारी नियंत्रणे",
    "Citizen Services": "नागरिक सेवा",
    "Issue Certificate": "प्रमाणपत्र जारी करा",
    "Re-Zone Area": "क्षेत्राचे पुनर्रचना करा",
    "Inspect Field": "क्षेत्र तपासणी",
    "Recent Civic Activity": "अलीकडील नागरी क्रियाकलाप",
    "Render API Feed": "थेट एपीआय फीड",

    // Certificate Management
    "Digital Vending Certificate & QR Permit Portal": "डिजिटल फेरीवाला प्रमाणपत्र आणि क्यूआर परवाना पोर्टल",
    "My Digital Vending Permit": "माझा डिजिटल परवाना",
    "Live Dynamic Smart Vending License Viewer": "थेट स्मार्ट परवाना दर्शक",
    "Your Official Smart Vending License Card": "अधिकृत स्मार्ट फेरीवाला परवाना कार्ड",
    "Print License": "परवाना मुद्रित करा",
    "Print Permit": "परवाना मुद्रित करा",
    "NAGPUR MUNICIPAL CORPORATION": "नागपूर महानगरपालिका",
    "OFFICIAL VENDING CERTIFICATE & PERMIT": "अधिकृत फेरीवाला प्रमाणपत्र आणि परवाना",
    "Permit Holder Name": "परवानाधारकाचे नाव",
    "Vending Certificate ID": "फेरीवाला प्रमाणपत्र आयडी",
    "Stall Trade Name": "स्टॉल / व्यवसायाचे नाव",
    "Permit Serial Number": "परवाना अनुक्रमांक",
    "Designated Vending Zone": "नियुक्त फेरीवाला क्षेत्र",
    "Authorized Vending Category": "अधिकृत फेरीवाला श्रेणी",
    "Issue Date": "जारी केल्याची तारीख",
    "Expiration Date": "मुदत संपण्याची तारीख",
    "OFFICIALLY VERIFIED CIVIC PERMIT": "सत्यापित नागरी परवाना",
    "PENDING APPROVAL": "मंजुरी प्रलंबित",
    "QR Code Security": "क्यूआर कोड सुरक्षा",
    "License Status": "परवाना स्थिती",
    "Annual Renewal Fee": "वार्षिक नूतनीकरण शुल्क",
    "Paid": "भरलेले",
    "PM SVANidhi Linked": "पीएम स्वनिधीशी जोडलेले",
    "Download High-Res Certificate": "प्रमाणपत्र डाउनलोड करा",

    // AI Zone Optimizer
    "AI Zone Optimization Engine (FastAPI Connected)": "एआय झोन ऑप्टिमायझेशन इंजिन (फास्टएपीआय)",
    "Nagpur Municipal Corp - Designated Zones": "नागपूर महानगरपालिका - नियुक्त क्षेत्र",
    "Vending Zone Capacity & Foot-Traffic Re-Balancing": "फेरीवाला क्षमता आणि पादचारी गर्दी नियंत्रण",
    "Designated Vending Zones & Pedestrian Maps": "नियुक्त फेरीवाला क्षेत्र आणि पादचारी नकाशे",
    "Interactive Pedestrian Traffic & Vending Density Map": "पादचारी रहदारी आणि फेरीवाला नकाशा",
    "Vending Zones & Safety Guidelines": "फेरीवाला क्षेत्र आणि सुरक्षा मार्गदर्शक तत्त्वे",
    "Smart Vending Best Practices": "स्मार्ट फेरीवाला सर्वोत्तम पद्धती",
    "Nagpur Smart City Vending System Active and Regulated.": "नागपूर स्मार्ट सिटी फेरीवाला प्रणाली सक्रिय.",
    "Optimization Controls": "ऑप्टिमायझेशन नियंत्रणे",
    "Target Vending Density": "लक्ष्य फेरीवाला घनत्व",
    "Peak Hour Traffic Sensitivity": "गर्दीच्या वेळेची संवेदनशीलता",
    "FastAPI AI Model Calculation": "फास्टएपीआय एआय मॉडेल गणना",
    "Approve & Execute AI Re-Zoning Plan": "एआय झोनिंग योजनेला मंजुरी द्या",
    "Calculating FastAPI Model...": "गणना करत आहे...",

    // Login
    "Viksit Vyapari Civic Portal": "विकसित व्यापारी नागरी पोर्टल",
    "Sign In to Portal": "पोर्टलवर लॉग इन करा",
    "Create Account": "खाते तयार करा",
    "Role-based access for Municipal Officers & Registered Citizens": "अधिकारी आणि नागरिकांसाठी भूमिका-आधारित प्रवेश",
    "Citizen / Vendor": "नागरिक / फेरीवाला",
    "Authority / Officer": "अधिकारी",
    "Sign In": "साइन इन करा",
    "Register": "नोंदणी करा",
    "Full Name": "पूर्ण नाव",
    "Department / Authority ID": "विभाग / अधिकारी आयडी",
    "Email Address": "ईमेल पत्ता",
    "Password": "पासवर्ड",
    "Processing...": "प्रक्रिया सुरू आहे...",
    "Sign In as Citizen": "नागरिक म्हणून प्रवेश करा",
    "Sign In as Officer": "अधिकारी म्हणून प्रवेश करा",
    "Register Account": "खाते नोंदणीकृत करा",
    "Instant 1-Click Demo Login:": "झटपट १-क्लिक डेमो लॉगिन:",
    "Officer Access": "अधिकारी लॉगिन",
    "Citizen Access": "नागरिक लॉगिन",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('vv_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('vv_lang', language);
  }, [language]);

  const t = (key, defaultText) => {
    const textMap = translations[language];
    if (textMap && textMap[key]) {
      return textMap[key];
    }
    return defaultText !== undefined ? defaultText : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
