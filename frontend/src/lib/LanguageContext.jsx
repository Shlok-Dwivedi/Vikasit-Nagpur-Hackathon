import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {},
  mr: {
    "Viksit Vyapari System": "विकसित व्यापारी प्रणाली",
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
    "Citizen Access": "नागरिक लॉगिन"
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
