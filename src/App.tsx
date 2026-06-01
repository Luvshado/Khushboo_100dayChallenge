import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  PenSquare, 
  History, 
  Compass, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import DailyEntryView from "./components/DailyEntryView";
import HistoryLogView from "./components/HistoryLogView";
import SanctuaryView from "./components/SanctuaryView";
import GuestProgressView from "./components/GuestProgressView";
import GuestCalendarView from "./components/GuestCalendarView";
import { DailyEntry, INITIAL_ENTRIES } from "./types";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, onSnapshot, setDoc, doc, deleteDoc } from "firebase/firestore";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("daily-entry");
  
  // Hardlock Guest Mode under custom URL query-string constraint
  const isLockedGuest = window.location.search.includes("guest=true");
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return isLockedGuest;
  });
  
  const [activeDay, setActiveDay] = useState<number>(1);
  const [entries, setEntries] = useState<{ [day: number]: DailyEntry }>(() => {
    // True reset to zero starting on Day 1 (June 1st, 2026)
    const hasBeenReset = localStorage.getItem("finding_khushboo_reset_june1");
    if (!hasBeenReset) {
      localStorage.removeItem("finding_khushboo_entries");
      localStorage.removeItem("finding_khushboo_criteria");
      localStorage.setItem("finding_khushboo_reset_june1", "true");
      return INITIAL_ENTRIES; 
    }

    const saved = localStorage.getItem("finding_khushboo_entries");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse logs history, fallback to defaults.", e);
      }
    }
    return INITIAL_ENTRIES;
  });

  const [successCriteria, setSuccessCriteria] = useState(() => {
    const saved = localStorage.getItem("finding_khushboo_criteria");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      consistency: true,
      sincerity: true,
      quality: false,
      approval: false
    };
  });

  // Timezone-safe custom date string generator starting exactly on today (June 1st, 2026)
  const getChallengeDateString = (dayNum: number) => {
    const d = new Date(2026, 5, dayNum); // Month 5 in JS is June
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    return `${yr}-${mo}-${dy}`;
  };

  // Keep localStorage updated as fallback
  useEffect(() => {
    localStorage.setItem("finding_khushboo_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("finding_khushboo_criteria", JSON.stringify(successCriteria));
  }, [successCriteria]);

  // Real-time Firestore sync listener
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    try {
      const unsubscribe = onSnapshot(collection(db, "entries"), (snapshot) => {
        const loaded: { [day: number]: DailyEntry } = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DailyEntry;
          if (data && data.day) {
            loaded[data.day] = data;
          }
        });
        
        // If we got items from Firestore, populate entries
        if (Object.keys(loaded).length > 0) {
          setEntries((prev) => ({ ...prev, ...loaded }));
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, "entries");
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firestore sync error:", e);
    }
  }, []);

  // Handle saving daily entry with secure backend audit logger & live Firestore replication
  const handleSaveEntry = (updated: DailyEntry) => {
    const exists = !!entries[updated.day];
    const logAction = exists ? "update" : "create";
    const now = new Date().toISOString();

    const entryWithAudit: DailyEntry = {
      ...updated,
      createdAt: updated.createdAt || now,
      updatedAt: now
    };

    setEntries((prev) => ({
      ...prev,
      [updated.day]: entryWithAudit
    }));

    // Replicate write into live Firestore cloud database if configured
    if (isFirebaseConfigured && db) {
      const docId = String(updated.day);
      setDoc(doc(db, "entries", docId), entryWithAudit)
        .catch((err) => handleFirestoreError(err, OperationType.WRITE, `entries/${docId}`));
    }

    // Post real-time event log to the backend server
    fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        day: updated.day,
        action: logAction,
        clientTimestamp: now
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Recorded on backend time logs successfully:", data);
      })
      .catch((err) => {
        console.error("Failed to log entry event in server memory:", err);
      });

    // Animate transition to main status board
    setTimeout(() => {
      setActiveTab("dashboard");
    }, 800);
  };

  // Delete logging day with server event notification & Firestore sync
  const handleDeleteEntry = (day: number) => {
    setEntries((prev) => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, "entries", String(day)))
        .catch((err) => handleFirestoreError(err, OperationType.DELETE, `entries/${day}`));
    }

    fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        day,
        action: "delete",
        clientTimestamp: new Date().toISOString()
      })
    })
      .then((res) => res.json())
      .catch((err) => console.error("Failed to post delete notice to backend log:", err));
  };

  // Toggle success criteria checkmark on dashboard
  const handleToggleCriteria = (id: "consistency" | "sincerity" | "quality" | "approval") => {
    setSuccessCriteria((prev: any) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pre-generate part of 100 days history starting on June 1st, 2026
  const handleGenerateMockHistory = () => {
    const freshLogs: { [day: number]: DailyEntry } = { ...entries };
    
    const defaultWritingOutputs = [
      "Keep painting, let it flow.",
      "Soulful reflection on twilight skies.",
      "Mindful focus on daily rhythms.",
      "Designing responsive grids for Khushboo.",
      "Reflecting on 100-day development."
    ];

    const workOptions: DailyEntry["workFocus"][] = ["Case Study", "Client Project", "Upskilling", "None"];
    const textPostOptions: DailyEntry["contentType"][] = ["Text Post", "Video", "Carousel", "None"];

    for (let dayNum = 1; dayNum <= 20; dayNum++) {
      const isDietOk = Math.random() > 0.35;
      const exceptionsInput = isDietOk ? 0 : Math.floor(Math.random() * 3) + 1;
      const earningsRand = Math.random() > 0.4 ? (Math.floor(Math.random() * 8) + 1) * 100 : 0;
      
      const entryObj: DailyEntry = {
        day: dayNum,
        date: getChallengeDateString(dayNum),
        dietFollowed: isDietOk,
        dietExceptionsUsed: exceptionsInput,
        workFocus: workOptions[Math.floor(Math.random() * workOptions.length)],
        physicalActivity: Math.random() > 0.5 ? ["Walk"] : ["Workout", "Walk"],
        physicalDuration: Math.random() > 0.4 ? 45 : 30,
        socialConnection: Math.random() > 0.5 ? "friend" : "none",
        creativeOutput: defaultWritingOutputs[dayNum % defaultWritingOutputs.length],
        creativeTags: ["Design", "Art"],
        writeDuration: Math.round((Math.random() * 40 + 20) / 5) * 5,
        writeType: Math.random() > 0.5 ? "Journal" : "Brain Dump",
        contentCreated: Math.random() > 0.4,
        contentType: textPostOptions[Math.floor(Math.random() * 3)],
        contentFormatList: ["Text Post"],
        contentPlatforms: ["LinkedIn"],
        readPages: Math.floor(Math.random() * 15) + 10,
        readType: "Book",
        readDocTitleOrLink: "Deep Work by Cal Newport",
        earnings: earningsRand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      freshLogs[dayNum] = entryObj;

      // Replicate mock data into Firestore if live
      if (isFirebaseConfigured && db) {
        setDoc(doc(db, "entries", String(dayNum)), entryObj)
          .catch((err) => console.error("Could not write mock day into Firestore:", err));
      }
    }

    setEntries(freshLogs);
  };

  // Totalized variables
  const activeEntry: DailyEntry = entries[activeDay] || {
    day: activeDay,
    date: getChallengeDateString(activeDay),
    dietFollowed: true,
    dietExceptionsUsed: 0,
    workFocus: "None",
    physicalActivity: [],
    physicalDuration: 0,
    socialConnection: "none",
    creativeOutput: "",
    creativeTags: ["Art"],
    writeDuration: 0,
    writeType: "Journal",
    contentCreated: false,
    contentType: "None",
    contentFormatList: [],
    contentPlatforms: [],
    readPages: 0,
    earnings: 0
  };

  // Sum of all entries' earnings + Base initial (Reset everything to ₹0 today!)
  const baseEarnings = 0;
  const currentEarnings = (Object.values(entries) as DailyEntry[]).reduce((sum: number, item: DailyEntry) => {
    return sum + Number(item.earnings || 0);
  }, baseEarnings);

  // Remaining Days
  const daysLeft = Math.max(0, 100 - activeDay);

  // Dynamic Pace metric: derived from exceptions left & completed criteria
  const pacePercentage = Math.round(
    80 + 
    (successCriteria.consistency ? 2 : 0) + 
    (successCriteria.sincerity ? 3 : 0) + 
    (successCriteria.quality ? 2 : 0) - 
    (activeEntry.dietExceptionsUsed * 1)
  );

  const totalStats = {
    earnings: currentEarnings,
    daysLeft,
    pace: pacePercentage,
    streak: Math.max(1, Object.keys(entries).length) // hobby cultivation index
  };

  // BYPASS-PROOF LOCK: If user loaded with hard locked guest query param, 
  // do NOT render any owner view or navigation container under any condition.
  if (isLockedGuest) {
    return (
      <div className="bg-background text-on-background min-h-screen relative font-sans leading-relaxed selection:bg-secondary/35 selection:text-white pb-32">
        <div className="aurora-bg">
          <div className="aurora-container">
            <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-primary/20 blur-3xl animate-[pulse_12s_infinite]"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-secondary/15 blur-3xl animate-[pulse_15s_infinite]"></div>
          </div>
        </div>

        <Header 
          activeTab={activeTab === "daily-entry" ? "dashboard" : activeTab} 
          setActiveTab={setActiveTab} 
          day={activeDay}
          isGuestMode={true}
        />

        <main className="pt-32 px-4 md:px-12 max-w-7xl mx-auto space-y-gutter relative z-10 w-full mb-12">
          <AnimatePresence mode="wait">
            {activeTab === "history" ? (
              <motion.div
                key="guest-calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GuestCalendarView 
                  entries={entries} 
                  activeDay={activeDay} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="guest-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GuestProgressView 
                  entries={entries} 
                  activeDay={activeDay} 
                  totalStats={totalStats} 
                  successCriteria={successCriteria}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container/85 backdrop-blur-3xl border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] rounded-t-2xl pb-safe">
          <div className="flex justify-around items-center h-16 pt-2">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "dashboard" || activeTab === "daily-entry"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "history"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">100-Day Grid</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen relative font-sans leading-relaxed selection:bg-secondary/35 selection:text-white pb-32">
      
      {/* Aurora Floating Backdrop Blurs */}
      <div className="aurora-bg">
        <div className="aurora-container">
          <div className="absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-primary/20 blur-3xl animate-[pulse_12s_infinite]"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[65vw] h-[65vw] rounded-full bg-secondary/15 blur-3xl animate-[pulse_15s_infinite]"></div>
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[45vw] h-[45vw] rounded-full bg-tertiary/10 blur-3xl animate-[pulse_18s_infinite]"></div>
        </div>
      </div>

      {/* Shared Header component (Hide guest toggle/preview buttons if visitor matches guest link) */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        day={activeDay}
        isGuestMode={isGuestMode}
        onToggleGuestMode={isLockedGuest ? undefined : () => setIsGuestMode(!isGuestMode)}
      />

      {/* Main Container Viewport */}
      <main className="pt-32 px-4 md:px-12 max-w-7xl mx-auto space-y-gutter relative z-10 w-full mb-12">
        {isGuestMode ? (
          <AnimatePresence mode="wait">
            {activeTab === "history" ? (
              <motion.div
                key="guest-calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GuestCalendarView 
                  entries={entries} 
                  activeDay={activeDay} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="guest-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GuestProgressView 
                  entries={entries} 
                  activeDay={activeDay} 
                  totalStats={totalStats} 
                  successCriteria={successCriteria}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardView 
                  activeEntry={activeEntry}
                  onUpdateEntry={(day, data) => {
                    setEntries(prev => {
                      const current = prev[day] || { day } as DailyEntry;
                      return { ...prev, [day]: { ...current, ...data } };
                    });
                  }}
                  successCriteria={successCriteria}
                  onToggleCriteria={handleToggleCriteria}
                  totalStats={totalStats}
                  onNavigate={setActiveTab}
                />
              </motion.div>
            )}

            {activeTab === "daily-entry" && (
              <motion.div
                key="daily-entry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <DailyEntryView 
                  activeDay={activeDay}
                  entry={activeEntry}
                  onSave={handleSaveEntry}
                  cumulativeEarnings={currentEarnings}
                />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryLogView 
                  entries={entries}
                  onDeleteEntry={handleDeleteEntry}
                  onSelectActiveDay={(day) => {
                    setActiveDay(day);
                  }}
                  activeDay={activeDay}
                  onGenerateMockHistory={handleGenerateMockHistory}
                />
              </motion.div>
            )}

            {activeTab === "sanctuary" && (
              <motion.div
                key="sanctuary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <SanctuaryView activeEntry={activeEntry} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Floating Navigation (Shared Component - Mobile Only overlay) */}
      {isGuestMode ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container/85 backdrop-blur-3xl border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] rounded-t-2xl pb-safe">
          <div className="flex justify-around items-center h-16 pt-2">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "dashboard" || activeTab === "daily-entry"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "history"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">100-Day Grid</span>
            </button>
          </div>
        </nav>
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container/85 backdrop-blur-3xl border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] rounded-t-2xl pb-safe">
          <div className="flex justify-around items-center h-16 pt-2">
            
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "dashboard"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">Status</span>
            </button>

            <button 
              onClick={() => setActiveTab("daily-entry")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "daily-entry"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <PenSquare className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">Log Today</span>
            </button>

            <button 
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "history"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">All Logs</span>
            </button>

            <button 
              onClick={() => setActiveTab("sanctuary")}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl cursor-pointer transition-all active:scale-95 ${
                activeTab === "sanctuary"
                  ? "bg-primary/15 text-primary scale-105"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-bold font-sans mt-1">Sanctum</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
