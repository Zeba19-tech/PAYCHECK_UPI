import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Search,
  Link as LinkIcon,
  MessageSquareText,
  Image as ImageIcon,
  ArrowRight,
  Bot,
  Phone,
  Flag,
  Send,
  CheckCircle2,
  AlertTriangle,
  Languages,
  Mail,
  Star,
  X,
  Menu
} from "lucide-react";

import UpiChecker from "./pages/UpiChecker";
import LinkChecker from "./pages/LinkChecker";
import MessageAnalyzer from "./pages/MessageAnalyzer";
import ScreenshotScanner from "./pages/ScreenshotScanner";
import API, { checkBackendHealth } from "./services/api";
import { unlockSiren, playSiren, isSirenUnlocked } from "./services/siren";
import "./App.css";
import ReportCenter from "./pages/ReportCenter";
import Dashboard from "./pages/Dashboard";

const translations = {
  en: {
    nav: ["Home", "Check","Dashboard", "Learn", "About", "Help"],
    heroEyebrow: "Digital Payment Safety",
    heroTitle: "Think Before You Click.",
    heroTitle2: "Verify Before You Pay.",
    heroText:
      "PayCheck UPI helps identify suspicious UPI IDs, links, messages and payment screenshots before you make a transaction.",
    checkNow: "Check Now",
    learn: "Learn About Scams",
    safetyCard: "Your Payment Safety Check",
    safetySub: "Analyze before you act.",
    center: "PAYCHECK UPI SAFETY CENTER",
    where: "What do you want to check?",
    choose:
      "Choose a safety tool and verify suspicious payment information before taking action.",
    cards: [
      [
        "Check UPI ID",
        "Verify UPI IDs and detect suspicious patterns.",
        "Check UPI ID"
      ],
      [
        "Scan Link",
        "Analyze suspicious URLs and payment links.",
        "Scan Link"
      ],
      [
        "Analyze Message",
        "Detect scam patterns in SMS, WhatsApp and other messages.",
        "Analyze Message"
      ],
      [
        "Scan Screenshot",
        "Use OCR to analyze visible payment details.",
        "Scan Screenshot"
      ]
    ],
    learnLabel: "STAY AWARE",
    learnTitle: "Know the scam before the scam knows you.",
    learnText:
      "Learn simple safety practices that can help you recognize common UPI scams and protect your money.",
    aboutLabel: "ABOUT PAYCHECK UPI",
    aboutTitle: "Security before transaction.",
    aboutText:
      "PayCheck UPI is an AI-assisted preventive digital-payment safety platform designed to help users identify suspicious payment signals before they act.",
    helpLabel: "GET HELP",
    helpTitle: "If you suspect fraud, act quickly.",
    report: "Report Cyber Fraud",
    feedback: "Send Feedback",
    contact: "Contact Us",
    assistant: "AI Safety Assistant"
  },

  hi: {
    nav: ["होम", "जाँच", "डैशबोर्ड", "सीखें", "हमारे बारे में", "मदद"],
    heroEyebrow: "डिजिटल भुगतान सुरक्षा",
    heroTitle: "क्लिक करने से पहले सोचें।",
    heroTitle2: "भुगतान करने से पहले जाँचें।",
    heroText:
      "PayCheck UPI भुगतान से पहले संदिग्ध UPI ID, लिंक, संदेश और स्क्रीनशॉट की जाँच करने में मदद करता है।",
    checkNow: "अभी जाँचें",
    learn: "घोटालों के बारे में सीखें",
    safetyCard: "आपकी भुगतान सुरक्षा जाँच",
    safetySub: "कार्रवाई से पहले जाँचें।",
    center: "PAYCHECK UPI सुरक्षा केंद्र",
    where: "आप क्या जाँचना चाहते हैं?",
    choose:
      "किसी सुरक्षा टूल को चुनें और भुगतान से पहले जानकारी सत्यापित करें।",
    cards: [
      [
        "UPI ID जाँचें",
        "UPI ID में संदिग्ध पैटर्न खोजें।",
        "UPI ID जाँचें"
      ],
      [
        "लिंक स्कैन करें",
        "संदिग्ध URL और भुगतान लिंक की जाँच करें।",
        "लिंक स्कैन करें"
      ],
      [
        "संदेश जाँचें",
        "SMS और WhatsApp में घोटाले के पैटर्न खोजें।",
        "संदेश जाँचें"
      ],
      [
        "स्क्रीनशॉट स्कैन करें",
        "भुगतान स्क्रीनशॉट के टेक्स्ट की जाँच करें।",
        "स्क्रीनशॉट स्कैन करें"
      ]
    ],
    learnLabel: "सावधान रहें",
    learnTitle:
      "घोटाले को पहचानें, उससे पहले कि वह आपको पहचाने।",
    learnText:
      "सामान्य UPI घोटालों को पहचानने और पैसे सुरक्षित रखने के आसान तरीके सीखें।",
    aboutLabel: "PAYCHECK UPI के बारे में",
    aboutTitle: "लेन-देन से पहले सुरक्षा।",
    aboutText:
      "PayCheck UPI एक preventive digital-payment safety platform है जो भुगतान से पहले संदिग्ध संकेत पहचानने में मदद करता है।",
    helpLabel: "मदद लें",
    helpTitle:
      "धोखाधड़ी का संदेह हो तो जल्दी कार्रवाई करें।",
    report: "साइबर फ्रॉड रिपोर्ट करें",
    feedback: "फीडबैक भेजें",
    contact: "संपर्क करें",
    assistant: "AI सुरक्षा सहायक"
  },

  te: {
    nav: ["హోమ్", "చెక్", "డ్యాష్‌బోర్డ్", "నేర్చుకోండి", "మా గురించి", "సహాయం"],
    heroEyebrow: "డిజిటల్ చెల్లింపు భద్రత",
    heroTitle: "క్లిక్ చేసే ముందు ఆలోచించండి.",
    heroTitle2: "చెల్లించే ముందు ధృవీకరించండి.",
    heroText:
      "చెల్లింపుకు ముందు అనుమానాస్పద UPI IDs, లింకులు, మెసేజ్‌లు మరియు స్క్రీన్‌షాట్‌లను గుర్తించడంలో PayCheck UPI సహాయపడుతుంది.",
    checkNow: "ఇప్పుడే చెక్ చేయండి",
    learn: "స్కామ్‌ల గురించి నేర్చుకోండి",
    safetyCard: "మీ చెల్లింపు భద్రత చెక్",
    safetySub: "చర్యకు ముందు విశ్లేషించండి.",
    center: "PAYCHECK UPI భద్రతా కేంద్రం",
    where: "మీరు ఏమి చెక్ చేయాలనుకుంటున్నారు?",
    choose:
      "సేఫ్టీ టూల్ ఎంచుకుని చెల్లింపుకు ముందు సమాచారాన్ని ధృవీకరించండి.",
    cards: [
      [
        "UPI ID చెక్",
        "UPI IDలో అనుమానాస్పద నమూనాలను గుర్తించండి.",
        "UPI ID చెక్"
      ],
      [
        "లింక్ స్కాన్",
        "అనుమానాస్పద URLలు మరియు చెల్లింపు లింకులను విశ్లేషించండి.",
        "లింక్ స్కాన్"
      ],
      [
        "మెసేజ్ విశ్లేషణ",
        "SMS, WhatsAppలో స్కామ్ నమూనాలను గుర్తించండి.",
        "మెసేజ్ చెక్"
      ],
      [
        "స్క్రీన్‌షాట్ స్కాన్",
        "చెల్లింపు స్క్రీన్‌షాట్‌లోని టెక్స్ట్‌ను OCRతో విశ్లేషించండి.",
        "స్క్రీన్‌షాట్ స్కాన్"
      ]
    ],
    learnLabel: "అవగాహన",
    learnTitle:
      "స్కామ్ మీను గుర్తించే ముందు మీరు స్కామ్‌ను గుర్తించండి.",
    learnText:
      "సాధారణ UPI స్కామ్‌లను గుర్తించి మీ డబ్బును రక్షించుకోవడానికి సులభమైన భద్రతా పద్ధతులను తెలుసుకోండి.",
    aboutLabel: "PAYCHECK UPI గురించి",
    aboutTitle: "లావాదేవీకి ముందు భద్రత.",
    aboutText:
      "PayCheck UPI చెల్లింపుకు ముందు అనుమానాస్పద సంకేతాలను గుర్తించడంలో సహాయపడే preventive digital-payment safety platform.",
    helpLabel: "సహాయం పొందండి",
    helpTitle:
      "మోసం అనుమానం ఉంటే వెంటనే చర్య తీసుకోండి.",
    report: "సైబర్ ఫ్రాడ్ రిపోర్ట్",
    feedback: "ఫీడ్‌బ్యాక్ పంపండి",
    contact: "సంప్రదించండి",
    assistant: "AI భద్రతా సహాయకుడు"
  }
};

function App() {
  const [lang, setLang] = useState("en");
  const [backendStatus, setBackendStatus] = useState("CHECKING");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi! I’m your PayCheck Safety Assistant. Ask me things like “How do I make a UPI payment?”, “What is a UPI PIN?”, “Is this link suspicious?”, or “How do I report fraud?”."
    }
  ]);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportSent, setReportSent] = useState(false);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const [notice, setNotice] = useState("");

  const [sirenArmed, setSirenArmed] = useState(
    sessionStorage.getItem("paycheck_siren_armed") === "true"
  );

  const t = translations[lang];

  /*
   * ---------------------------------------------------------
   * RISK EVENT → GLOBAL SIREN
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const handleRisk = async (event) => {
      const level = String(
        event.detail?.riskLevel || ""
      )
        .trim()
        .toUpperCase();

      const score = Number(event.detail?.score || 0);

      console.log("🚨 PayCheck Risk Event:", {
        level,
        score,
        armed: sirenArmed,
        stored: sessionStorage.getItem(
          "paycheck_siren_armed"
        ),
        unlocked: isSirenUnlocked()
      });

      if (level !== "HIGH") {
        return;
      }

      if (!isSirenUnlocked()) {
        console.log(
          "⚠️ Siren audio is locked by browser."
        );
        return;
      }

      console.log(
        "🔊 HIGH risk detected — playing siren."
      );

      try {
        await playSiren();
      } catch (error) {
        console.error(
          "❌ Siren playback failed:",
          error
        );
      }
    };

    window.addEventListener(
      "paycheck:risk",
      handleRisk
    );

    return () => {
      window.removeEventListener(
        "paycheck:risk",
        handleRisk
      );
    };
  }, [sirenArmed]);

  /*
   * ---------------------------------------------------------
   * BACKEND HEALTH
   * ---------------------------------------------------------
   */
  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendStatus("ONLINE"))
      .catch(() => setBackendStatus("OFFLINE"));
  }, []);

  /*
   * ---------------------------------------------------------
   * SIREN CONTROLS
   * ---------------------------------------------------------
   */
  const armSiren = async () => {
    const ok = await unlockSiren();
    const armed = ok || isSirenUnlocked();

    setSirenArmed(armed);

    if (armed) {
      sessionStorage.setItem(
        "paycheck_siren_armed",
        "true"
      );

      setNotice(
        "Safety siren armed. It will sound automatically for HIGH-risk results."
      );
    } else {
      sessionStorage.removeItem(
        "paycheck_siren_armed"
      );

      setNotice(
        "This browser does not allow audio alerts."
      );
    }
  };

  const testSiren = async () => {
    const ok = await unlockSiren();

    if (ok) {
      await playSiren();

      setSirenArmed(true);

      sessionStorage.setItem(
        "paycheck_siren_armed",
        "true"
      );

      setNotice(
        "Safety siren is working and armed."
      );
    } else {
      setNotice(
        "This browser does not allow audio alerts."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */
  const goTo = (id) => {
    setMobileOpen(false);

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }, 50);
  };

  /*
   * ---------------------------------------------------------
   * CHATBOT → TOOL INTEGRATION
   *
   * This sends detected values to the appropriate scanner.
   * Scanner pages will listen for "paycheck:prefill".
   * ---------------------------------------------------------
   */
  const openChatTool = (
  tool,
  value = "",
  closeChat = true
) => {
  const cleanValue = String(value || "").trim();

  const targetMap = {
    upiChecker: "upi-checker",
    linkScanner: "link-checker",
    messageAnalyzer: "message-analyzer",
    screenshotScanner: "screenshot-scanner"
  };

  const targetId = targetMap[tool];
if (!targetId) {
  console.warn("Unknown PayCheck AI tool:", tool);
  return;
}

  // Close chatbot
  if (closeChat) {
    setChatOpen(false);
  }

  

  /*
   * Give React time to close the chatbot first.
   * Then locate the exact scanner section and scroll
   * the MAIN PAGE to it.
   */
  setTimeout(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      console.warn(
        "PayCheck target not found:",
        targetId
      );
      return;
    }

    const navbar = document.querySelector(".navbar");

    const navbarHeight =
      navbar?.getBoundingClientRect().height || 80;

    const rect = target.getBoundingClientRect();

    const currentScroll =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;

    const targetTop =
      currentScroll +
      rect.top -
      navbarHeight -
      25;

    console.log(
      "🚀 Navigating chatbot →",
      targetId,
      "position:",
      targetTop
    );

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    /*
     * Send the detected value AFTER navigation starts.
     * This prevents the scanner's prefill handler from
     * competing with the main-page scroll.
     */
    setTimeout(() => {
  window.dispatchEvent(
    new CustomEvent("paycheck:prefill", {
      detail: {
        tool,
        value: cleanValue,
        source: "AI Safety Assistant"
      }
    })
  );
}, 500);

  }, 300);
};
  /*
   * ---------------------------------------------------------
   * REPORT
   * ---------------------------------------------------------
   */
  const openReport = (data) => {
    setReportData(data);
    setReportSent(false);
    setReportOpen(true);
  };
const submitReport = async (e) => {
  e.preventDefault();

  try {
    const reason = e.target.reason.value.trim();

    await API.post("/report", {
      reporterName: "Anonymous",
      contact: "",
      scamType: reportData?.type || "Unknown Scam",
      suspiciousValue: reportData?.value || "Unknown",
      amount: 0,
      description:
        reason ||
        "I suspect this activity may be a scam.",
      riskLevel:
        reportData?.riskLevel || "UNKNOWN",
      evidence: reportData?.value || ""
    });

    setReportSent(true);

  } catch (error) {
    console.error("Report submission error:", error);

    setNotice(
      "Report could not be saved. Please use the official cybercrime reporting portal for an actual incident."
    );
  }
};
  /*
   * ---------------------------------------------------------
   * CHATBOT
   * ---------------------------------------------------------
   */
  const sendChat = async (e) => {
    e?.preventDefault();

    const message = chatInput.trim();

    if (!message) {
      return;
    }

    setChatMessages((prev) => [
  ...prev,
  {
    role: "user",
    text: message,
  
  }
]);

    setChatInput("");

    try {
      console.log("💬 Sending chat:", message);

      const response = await API.post("/chat", {
        message
      });

      console.log(
        "✅ Chat response:",
        response.data
      );

      const data = response.data?.data;

      if (!data) {
        throw new Error(
          "Invalid chatbot response"
        );
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
          riskLevel: data.riskLevel,
          riskScore: data.riskScore,
          confidence: data.confidence,
          scamType: data.scamType,
          indicators: data.indicators || [],
          recommendedActions:
            data.recommendedActions || [],
          entities: data.entities || {},
          toolSuggestions:
            data.toolSuggestions || {
              upiChecker: false,
              linkScanner: false,
              screenshotScanner: false,
              messageAnalyzer: false
            }
        }
      ]);

      /*
       * HIGH-risk chatbot responses also participate
       * in the global PayCheck risk system.
       */
      if (
        String(data.riskLevel || "")
          .toUpperCase() === "HIGH"
      ) {
        window.dispatchEvent(
          new CustomEvent("paycheck:risk", {
            detail: {
              riskLevel: data.riskLevel,
              score: data.riskScore || 0
            }
          })
        );
      }
    } catch (error) {
      console.error(
        "❌ Chat request failed:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error.response?.data?.message ||
            "The safety assistant is temporarily unavailable. Please use the Safety Center tools or official reporting channels."
        }
      ]);
    }
  };

  return (
    <div className="app">

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="navbar">
        <div
          className="brand"
          onClick={() => goTo("home")}
        >
          <div className="brand-icon">
            <ShieldCheck size={27} />
          </div>

          <div>
            <h2>
              PayCheck <span>UPI</span>
            </h2>
            <p>SecureSix</p>
          </div>
        </div>

        <button
          className="mobile-menu"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          aria-label="Open menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

        <nav
          className={
            mobileOpen ? "open" : ""
          }
        >
          {t.nav.map((item, index) => (
            <button
              key={item}
              onClick={() =>
  goTo(
    [
      "home",
      "check",
      "dashboard",
      "learn",
      "about",
      "help"
    ][index]
  )
}
              
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <Languages size={17} />

          <select
            value={lang}
            onChange={(e) =>
              setLang(e.target.value)
            }
            aria-label="Language"
          >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="te">తె</option>
          </select>
        </div>
      </header>

      <main>

        {/* ===================================================
            HERO
        =================================================== */}
        <section
          className="hero"
          id="home"
        >
          <div className="hero-content">

            <div className="trust-badge">
              <ShieldCheck size={17} />
              {t.heroEyebrow}
            </div>

            <h1>
              {t.heroTitle}
              <br />
              <span>{t.heroTitle2}</span>
            </h1>

            <p>{t.heroText}</p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() =>
                  goTo("check")
                }
              >
                {t.checkNow}
                <ArrowRight size={18} />
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  goTo("learn")
                }
              >
                {t.learn}
              </button>
            </div>

            <div className="hero-safety-controls">

              <button
                className={`siren-btn ${
                  sirenArmed
                    ? "armed"
                    : ""
                }`}
                onClick={armSiren}
              >
                <AlertTriangle size={17} />

                {sirenArmed
                  ? "Siren Armed"
                  : "Arm Safety Siren"}
              </button>

              <button
                className="siren-test"
                onClick={testSiren}
              >
                Test Siren
              </button>

            </div>

            <div className="hero-stats">
              <div>
                <strong>4</strong>
                <span>Safety checks</span>
              </div>

              <div>
                <strong>0–100</strong>
                <span>Risk score</span>
              </div>

              <div>
                <strong>3</strong>
                <span>Languages</span>
              </div>
            </div>
          </div>

          <div className="security-card">
            <div className="security-glow"></div>

            <div className="shield-circle">
              <ShieldCheck size={64} />
            </div>

            <span className="security-small">
              SECURE SIX
            </span>

            <h3>{t.safetyCard}</h3>
            <p>{t.safetySub}</p>

            <div
              className={`safe-status ${backendStatus.toLowerCase()}`}
            >
              <span></span>
              Backend: {backendStatus}
            </div>

            <div className="mini-check">
              <CheckCircle2 size={17} />
              Risk indicators
            </div>

            <div className="mini-check">
              <CheckCircle2 size={17} />
              Explainable warnings
            </div>

            <div className="mini-check">
              <CheckCircle2 size={17} />
              Scam reporting
            </div>
          </div>
        </section>

        {/* ===================================================
            SAFETY CENTER
        =================================================== */}
        <section
          className="check-section"
          id="check"
        >
          <div className="section-heading">
            <span>{t.center}</span>

            <h2>{t.where}</h2>

            <p>{t.choose}</p>
          </div>

          <div className="check-grid">

            {[
              {
                icon: <Search />,
                id: "upi-checker"
              },
              {
                icon: <LinkIcon />,
                id: "link-checker"
              },
              {
                icon: <MessageSquareText />,
                id: "message-analyzer"
              },
              {
                icon: <ImageIcon />,
                id: "screenshot-scanner"
              }
            ].map((card, index) => (

              <div
                className="check-card"
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  goTo(card.id)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    goTo(card.id);
                  }
                }}
              >
                <div className="card-icon">
                  {card.icon}
                </div>

                <h3>
                  {t.cards[index][0]}
                </h3>

                <p>
                  {t.cards[index][1]}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(card.id);
                  }}
                >
                  {t.cards[index][2]}
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* ===================================================
            SCANNERS
        =================================================== */}

        <UpiChecker
          onReport={openReport}
        />

        <LinkChecker
          onReport={openReport}
        />

        <MessageAnalyzer
          onReport={openReport}
        />

        <ScreenshotScanner
          onReport={openReport}
        />
        <div id="dashboard">
  <Dashboard />
</div>
        <ReportCenter />

        {/* ===================================================
            LEARNING
        =================================================== */}
        <section
          className="learning-section"
          id="learn"
        >
          <div className="learning-copy">
            <span className="section-label">
              {t.learnLabel}
            </span>

            <h2>{t.learnTitle}</h2>

            <p>{t.learnText}</p>
          </div>

          <div className="tips-grid">

            <div className="tip-card">
              <ShieldCheck size={29} />

              <h3>
                Never share your UPI PIN
              </h3>

              <p>
                Your UPI PIN authorizes payments.
                It is not required just to receive
                money.
              </p>
            </div>

            <div className="tip-card">
              <AlertTriangle size={29} />

              <h3>
                Beware of urgency
              </h3>

              <p>
                Pressure, threats, rewards and
                account-blocking claims are common
                scam themes.
              </p>
            </div>

            <div className="tip-card">
              <Search size={29} />

              <h3>
                Verify independently
              </h3>

              <p>
                Use the official bank or app
                contact details instead of numbers
                or links sent by strangers.
              </p>
            </div>

          </div>
        </section>

        {/* ===================================================
            SAFETY LAB
        =================================================== */}
        <section className="safety-lab-section">

          <div className="section-heading">
            <span>
              PAYCHECK UPI SAFETY LAB
            </span>

            <h2>
              Small checks. Big protection.
            </h2>

            <p>
              Build safer payment habits with
              quick, practical lessons designed
              for real-world UPI situations.
            </p>
          </div>

          <div className="lab-grid">

            <article className="lab-card">
              <span>01</span>

              <h3>
                Check the name
              </h3>

              <p>
                Before authorizing a payment,
                compare the beneficiary name shown
                in your UPI app with the person or
                business you intended to pay.
              </p>
            </article>

            <article className="lab-card">
              <span>02</span>

              <h3>
                PIN means pay
              </h3>

              <p>
                Entering your UPI PIN authorizes
                a payment. Never enter it because
                someone says you need it to receive
                money.
              </p>
            </article>

            <article className="lab-card">
              <span>03</span>

              <h3>
                Pause on pressure
              </h3>

              <p>
                Urgency, threats, fake rewards and
                refund promises are reasons to stop
                and verify independently.
              </p>
            </article>

            <article className="lab-card">
              <span>04</span>

              <h3>
                QR is an action
              </h3>

              <p>
                Review what your UPI app displays
                after scanning a QR. Confirm the
                recipient and amount before
                authorizing.
              </p>
            </article>

            <article className="lab-card">
              <span>05</span>

              <h3>
                Keep evidence
              </h3>

              <p>
                Save transaction IDs, screenshots,
                messages, phone numbers and
                suspicious links if you need to
                report an incident.
              </p>
            </article>

            <article className="lab-card">
              <span>06</span>

              <h3>
                Report fast
              </h3>

              <p>
                If cyber financial fraud occurs in
                India, contact the official 1930
                cyber-fraud helpline promptly and
                preserve your evidence.
              </p>
            </article>

          </div>
        </section>

        {/* ===================================================
            ABOUT
        =================================================== */}
        <section
          className="about-section"
          id="about"
        >
          <div className="about-badge">
            <ShieldCheck size={24} />
          </div>

          <span className="section-label">
            {t.aboutLabel}
          </span>

          <h2>{t.aboutTitle}</h2>

          <p>{t.aboutText}</p>

          <div className="about-points">

            <div>
              <CheckCircle2 />
              <span>
                Pre-payment prevention
              </span>
            </div>

            <div>
              <CheckCircle2 />
              <span>
                Explainable risk indicators
              </span>
            </div>

            <div>
              <CheckCircle2 />
              <span>
                OCR-based screenshot analysis
              </span>
            </div>

            <div>
              <CheckCircle2 />
              <span>
                Awareness and reporting guidance
              </span>
            </div>

          </div>
        </section>

        {/* ===================================================
            HELP
        =================================================== */}
        <section
          className="help-section"
          id="help"
        >
          <div className="section-heading left">

            <span>{t.helpLabel}</span>

            <h2>{t.helpTitle}</h2>

          </div>

          <div className="help-grid">

            <a
              className="help-card urgent"
              href="tel:1930"
            >
              <div>
                <Phone />
              </div>

              <strong>1930</strong>

              <span>
                Cyber financial fraud helpline
              </span>

              <small>
                Report immediately if money has
                been lost.
              </small>
            </a>

            <a
              className="help-card"
              href="tel:112"
            >
              <div>
                <Phone />
              </div>

              <strong>112</strong>

              <span>
                Emergency police assistance
              </span>

              <small>
                Use for emergencies requiring
                immediate police assistance.
              </small>
            </a>

            <a
              className="help-card"
              href="tel:1091"
            >
              <div>
                <Phone />
              </div>

              <strong>1091</strong>

              <span>
                Women helpline
              </span>

              <small>
                Telangana government helpline
                listing.
              </small>
            </a>

            <a
              className="help-card"
              href="tel:1098"
            >
              <div>
                <Phone />
              </div>

              <strong>1098</strong>

              <span>
                Child helpline
              </span>

              <small>
                For child-related emergencies and
                support.
              </small>
            </a>

          </div>

          <div className="official-report">

            <div>
              <Flag size={25} />

              <div>
                <strong>
                  National Cyber Crime Reporting
                  Portal
                </strong>

                <p>
                  Use the official portal to report
                  cybercrime and suspicious
                  identifiers.
                </p>
              </div>
            </div>

            <a
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              Open Official Portal
              <ArrowRight size={17} />
            </a>

          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer>

        <div className="footer-main">

          <div>
            <div className="brand footer-brand">

              <div className="brand-icon">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h2>
                  PayCheck <span>UPI</span>
                </h2>

                <p>SecureSix</p>
              </div>

            </div>

            <p className="footer-tagline">
              Think Before You Click. Verify Before
              You Pay.
            </p>
          </div>

          <div className="footer-actions">

            <button
              onClick={() =>
                setFeedbackOpen(true)
              }
            >
              <Star size={17} />
              {t.feedback}
            </button>

            <button
              onClick={() =>
                setContactOpen(true)
              }
            >
              <Mail size={17} />
              {t.contact}
            </button>

            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
            >
              Project
            </a>

          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 SecureSix · PayCheck UPI
          </span>

          <span>
            Preventive safety prototype
          </span>
        </div>

      </footer>

      {/* =====================================================
          CHAT FAB
      ===================================================== */}
      <button
        className="chat-fab"
        onClick={() =>
          setChatOpen(!chatOpen)
        }
        aria-label="Open safety assistant"
      >
        {chatOpen ? <X /> : <Bot />}
      </button>

      {/* =====================================================
          CHAT PANEL
      ===================================================== */}
      {chatOpen && (
        <div className="chat-panel">

          <div className="chat-head">

            <div>
              <Bot size={20} />
              <strong>
                {t.assistant}
              </strong>
            </div>

            <button
              onClick={() =>
                setChatOpen(false)
              }
            >
              <X size={18} />
            </button>

          </div>

          <div className="chat-body">

            {chatMessages.map(
              (msg, index) => (

                <div
                  key={index}
                  className={`chat-message ${
                    msg.role === "user"
                      ? "chat-user"
                      : "chat-assistant"
                  }`}
                >

                  <div className="chat-message-content">
                    {msg.text}
                  </div>

                  {msg.role ===
                    "assistant" && (
                    <>

                      {/* =========================
                          RISK CARD
                      ========================= */}
                      {msg.riskLevel && (
                        <div
                          className={`chat-risk-card ${String(
                            msg.riskLevel
                          ).toLowerCase()}`}
                        >

                          <div className="chat-risk-header">

                            <strong>
                              {msg.riskLevel ===
                              "HIGH"
                                ? "🚨 High Risk"
                                : msg.riskLevel ===
                                  "MEDIUM"
                                ? "⚠️ Medium Risk"
                                : "🟢 Low Risk"}
                            </strong>

                            <span>
                              {msg.riskScore ??
                                0}
                              /100
                            </span>

                          </div>

                          <div className="chat-risk-bar">

                            <div
                              className="chat-risk-fill"
                              style={{
                                width: `${Math.min(
                                  msg.riskScore ||
                                    0,
                                  100
                                )}%`
                              }}
                            />

                          </div>

                          {msg.confidence && (
                            <small>
                              AI confidence:{" "}
                              {msg.confidence}%
                            </small>
                          )}

                        </div>
                      )}

                      {/* =========================
                          INDICATORS
                      ========================= */}
                      {msg.indicators
                        ?.length > 0 && (
                        <div className="chat-indicators">

                          <strong>
                            Why this may be risky:
                          </strong>

                          {msg.indicators.map(
                            (
                              indicator,
                              i
                            ) => (
                              <div
                                key={i}
                                className="chat-indicator"
                              >
                                ⚠️{" "}
                                {indicator}
                              </div>
                            )
                          )}

                        </div>
                      )}

                      {/* =========================
                          RECOMMENDED ACTIONS
                      ========================= */}
                      {msg
                        .recommendedActions
                        ?.length > 0 && (
                        <div className="chat-actions">

                          <strong>
                            Recommended actions:
                          </strong>

                          {msg.recommendedActions.map(
                            (
                              action,
                              i
                            ) => (
                              <div
                                key={i}
                                className="chat-action"
                              >
                                ✓{" "}
                                {action}
                              </div>
                            )
                          )}

                        </div>
                      )}

                      {/* =========================
    DETECTED ENTITIES
========================= */}
{msg.entities && (
  <div className="chat-detected">

    {msg.entities.upiIds?.length > 0 && (
      <div>
        <strong>UPI ID detected:</strong>

        {msg.entities.upiIds.map((upi, i) => (
          <span
            key={i}
            className="chat-entity"
          >
            {upi}
          </span>
        ))}
      </div>
    )}

    {msg.entities.urls?.length > 0 && (
      <div>
        <strong>Link detected:</strong>

        {msg.entities.urls.map((url, i) => (
          <span
            key={i}
            className="chat-entity"
          >
            {url}
          </span>
        ))}
      </div>
    )}

    {msg.entities.phoneNumbers?.length > 0 && (
      <div>
        <strong>Phone number detected:</strong>

        {msg.entities.phoneNumbers.map((phone, i) => (
          <span
            key={i}
            className="chat-entity"
          >
            {phone}
          </span>
        ))}
      </div>
    )}

    {msg.entities.amounts?.length > 0 && (
      <div>
        <strong>Amount detected:</strong>

        {msg.entities.amounts.map((amount, i) => (
          <span
            key={i}
            className="chat-entity"
          >
            {amount}
          </span>
        ))}
      </div>
    )}

  </div>
)}
                      {/* =========================
                          PAYCHECK TOOL ACTIONS
                      ========================= */}
                      {msg.toolSuggestions && (
                        <div className="chat-tool-actions">

                          {msg.toolSuggestions
                            .upiChecker && (
                            <button
                              type="button"
                              className="chat-tool-button"
                              onClick={() =>
                                openChatTool(
                                  "upiChecker",
                                  msg.entities
                                    ?.upiIds?.[0] ||
                                    ""
                                )
                              }
                            >
                              🔎 Check UPI ID
                            </button>
                          )}

                          {msg.toolSuggestions
                            .linkScanner && (
                            <button
                              type="button"
                              className="chat-tool-button"
                              onClick={() =>
                                openChatTool(
                                  "linkScanner",
                                  msg.entities
                                    ?.urls?.[0] ||
                                    ""
                                )
                              }
                            >
                              🔗 Scan Link
                            </button>
                          )}

                          {msg.toolSuggestions?.messageAnalyzer && (
  <button
    type="button"
    className="chat-tool-button"
    onClick={() =>
      openChatTool("messageAnalyzer", msg.text || "")
    }
  >
    📱 Analyze Message
  </button>
)}
                          {msg.toolSuggestions
                            .screenshotScanner && (
                            <button
                              type="button"
                              className="chat-tool-button"
                              onClick={() =>
                                openChatTool(
                                  "screenshotScanner"
                                )
                              }
                            >
                              🖼️ Scan Screenshot
                            </button>
                          )}

                        </div>
                      )}

                      {/* =========================
                          GOVERNMENT REPORTING
                      ========================= */}
                      {(msg.riskLevel ===
                        "HIGH" ||
                        msg.scamType ===
                          "after-scam" ||
                        msg.scamType ===
                          "report-scam") && (
                        <div className="chat-emergency-box">

                          <div className="chat-emergency-title">
                            🚨 Cyber Fraud Help
                          </div>

                          <p>
                            If money has been
                            lost through cyber
                            financial fraud,
                            report it
                            immediately.
                          </p>

                          <div className="chat-emergency-buttons">

                            <a
                              href="tel:1930"
                              className="chat-emergency-call"
                            >
                              📞 Call 1930
                            </a>

                            <a
                              href="https://www.cybercrime.gov.in/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-emergency-report"
                            >
                              🌐 Report Cyber
                              Crime
                            </a>

                          </div>

                        </div>
                      )}

                    </>
                  )}

                </div>
              )
            )}

          </div>

          <form
            className="chat-form"
            onSubmit={sendChat}
          >

            <input
              value={chatInput}
              onChange={(e) =>
                setChatInput(
                  e.target.value
                )
              }
              placeholder="Ask about UPI safety..."
            />

            <button type="submit">
              <Send size={18} />
            </button>

          </form>

        </div>
      )}

      {/* =====================================================
          REPORT MODAL
      ===================================================== */}
      {reportOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setReportOpen(false)
          }
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setReportOpen(false)
              }
            >
              <X />
            </button>

            <div className="modal-icon danger">
              <Flag />
            </div>

            <h3>
              Report Suspicious Activity
            </h3>

            {reportSent ? (
              <div className="success-state">

                <CheckCircle2 size={45} />

                <h4>
                  Report recorded
                </h4>

                <p>
                  Thank you for helping
                  improve scam awareness.
                </p>

                <a
                  href="https://cybercrime.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report an actual incident
                  officially
                </a>

              </div>
            ) : (
              <form
                onSubmit={submitReport}
              >

                <p className="modal-summary">
                  {reportData?.type}:{" "}
                  <strong>
                    {String(
                      reportData?.value ||
                        ""
                    ).slice(0, 100)}
                  </strong>
                </p>

                <label>
                  Why are you reporting
                  this?
                </label>

                <textarea
                  name="reason"
                  rows="4"
                  defaultValue="I suspect this may be a scam."
                />

                <button className="primary-action">
                  <Flag size={18} />
                  Submit Report
                </button>

              </form>
            )}

          </div>

        </div>
      )}

      {/* =====================================================
          FEEDBACK
      ===================================================== */}
      {feedbackOpen && (
        <FeedbackModal
          onClose={() =>
            setFeedbackOpen(false)
          }
          onNotice={setNotice}
        />
      )}

      {/* =====================================================
          CONTACT
      ===================================================== */}
      {contactOpen && (
        <ContactModal
          onClose={() =>
            setContactOpen(false)
          }
          onNotice={setNotice}
        />
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}
      {notice && (
        <div className="toast">

          <AlertTriangle size={18} />

          <span>{notice}</span>

          <button
            onClick={() =>
              setNotice("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   FEEDBACK MODAL
============================================================ */

function FeedbackModal({
  onClose,
  onNotice
}) {
  const submit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/feedback", {
        name: e.target.name.value,
        email: e.target.email.value,
        rating: e.target.rating.value,
        message: e.target.message.value
      });

      onClose();

      onNotice(
        "Thank you. Your feedback has been recorded."
      );
    } catch {
      onNotice(
        "Feedback could not be submitted."
      );
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >

      <div
        className="modal-card"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="modal-close"
          onClick={onClose}
        >
          <X />
        </button>

        <div className="modal-icon">
          <Star />
        </div>

        <h3>
          Share Feedback
        </h3>

        <form onSubmit={submit}>

          <label>Name</label>

          <input
            name="name"
            placeholder="Your name"
          />

          <label>Email</label>

          <input
            name="email"
            type="email"
            placeholder="you@example.com"
          />

          <label>Rating</label>

          <select
            name="rating"
            defaultValue="5"
          >
            <option value="5">
              5 — Excellent
            </option>

            <option value="4">
              4 — Good
            </option>

            <option value="3">
              3 — Okay
            </option>

            <option value="2">
              2 — Needs improvement
            </option>

            <option value="1">
              1 — Poor
            </option>
          </select>

          <label>Message</label>

          <textarea
            name="message"
            rows="4"
            required
            placeholder="Tell us what you think..."
          />

          <button className="primary-action">
            <Send size={18} />
            Send Feedback
          </button>

        </form>

      </div>

    </div>
  );
}

/* ============================================================
   CONTACT MODAL
============================================================ */

function ContactModal({
  onClose,
  onNotice
}) {
  const submit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/contact", {
        name: e.target.name.value,
        email: e.target.email.value,
        message: e.target.message.value
      });

      onClose();

      onNotice(
        "Your message has been received."
      );
    } catch {
      onNotice(
        "Your message could not be submitted."
      );
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >

      <div
        className="modal-card"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="modal-close"
          onClick={onClose}
        >
          <X />
        </button>

        <div className="modal-icon">
          <Mail />
        </div>

        <h3>
          Contact SecureSix
        </h3>

        <form onSubmit={submit}>

          <label>Name</label>

          <input
            name="name"
            placeholder="Your name"
            required
          />

          <label>Email</label>

          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />

          <label>Message</label>

          <textarea
            name="message"
            rows="5"
            required
            placeholder="Write your message..."
          />

          <button className="primary-action">
            <Send size={18} />
            Send Message
          </button>

        </form>

      </div>

    </div>
  );
}

export default App;