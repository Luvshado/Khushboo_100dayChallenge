import { motion } from "motion/react";
import { 
  Droplet, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Plus, 
  Check, 
  Square,
  AlertCircle
} from "lucide-react";
import { DailyEntry } from "../types";

interface DashboardViewProps {
  activeEntry: DailyEntry;
  onUpdateEntry: (day: number, data: Partial<DailyEntry>) => void;
  successCriteria: {
    consistency: boolean;
    sincerity: boolean;
    quality: boolean;
    approval: boolean;
  };
  onToggleCriteria: (id: "consistency" | "sincerity" | "quality" | "approval") => void;
  totalStats: {
    earnings: number;
    daysLeft: number;
    pace: number;
    streak: number;
  };
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  activeEntry,
  onUpdateEntry,
  successCriteria,
  onToggleCriteria,
  totalStats,
  onNavigate
}: DashboardViewProps) {
  
  // Handlers to toggle exception on Diet Discipline
  const handleToggleException = (index: number) => {
    // There are 7 total exception bubbles shown (e.g., 2 used, 5 remaining)
    const totalSlots = 7;
    const currentUsed = activeEntry.dietExceptionsUsed;
    let nextUsed = currentUsed;

    if (index < currentUsed) {
      // Tapping an used exception toggles it back to unused
      nextUsed = currentUsed - 1;
    } else if (index === currentUsed) {
      // Tapping the first unused exception claims it
      nextUsed = currentUsed + 1;
    }
    
    // Clamp to 0..totalSlots
    nextUsed = Math.max(0, Math.min(totalSlots, nextUsed));
    onUpdateEntry(activeEntry.day, { 
      dietExceptionsUsed: nextUsed,
      dietFollowed: nextUsed === 0
    });
  };

  // Remaining calculation
  const totalSlots = 7;
  const remainingExceptions = Math.max(0, totalSlots - activeEntry.dietExceptionsUsed);

  // Social cycle helper
  const handleToggleSocial = () => {
    const commitment = activeEntry.socialConnection === "friend" ? "none" : "friend";
    onUpdateEntry(activeEntry.day, { socialConnection: commitment });
  };

  // Workout streak handler
  const handleIncrementStreak = () => {
    // Increase read pages or writing minutes just as demo or change
    const nextPages = activeEntry.readPages + 5;
    onUpdateEntry(activeEntry.day, { readPages: nextPages });
  };

  return (
    <div className="space-y-12">
      {/* Hero Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8"
      >
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white glow-text leading-tight">
              Day {activeEntry.day}
            </h1>
            <span className="font-serif text-2xl text-on-surface-variant font-medium">/ 100</span>
          </div>
          <p className="font-sans text-md md:text-lg font-medium text-primary mt-2">
            The Journey to Sept 9, 2026
          </p>
        </div>

        {/* Global Progress Metrics Panel */}
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-6 w-full md:w-auto shadow-2xl">
          <div className="flex-1 text-center min-w-[100px]">
            <div className="font-sans text-4xl font-extrabold text-tertiary glow-text-tertiary">
              {totalStats.daysLeft}
            </div>
            <div className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              Days Left
            </div>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="flex-1 text-center min-w-[100px]">
            <div className="font-sans text-4xl font-extrabold text-secondary glow-text-secondary">
              {totalStats.pace}%
            </div>
            <div className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              Pace
            </div>
          </div>
        </div>
      </motion.header>

      {/* The Three Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bucket 1: Life */}
        <motion.section 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-primary/10 text-primary">
              <Droplet className="w-5 h-5 fill-primary" />
            </div>
            <h2 className="font-serif text-xl font-bold text-primary tracking-wide">
              Life
            </h2>
          </div>

          {/* Diet Discipline Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-300">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
            <h3 className="font-sans text-md font-bold text-white mb-1">
              Diet Discipline
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              {remainingExceptions} exceptions remaining
            </p>
            
            {/* Clickable exceptions list */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalSlots }).map((_, index) => {
                const isClaimedException = index < activeEntry.dietExceptionsUsed;
                return (
                  <button
                    key={index}
                    onClick={() => handleToggleException(index)}
                    aria-label={`Exception bubble ${index + 1}`}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      isClaimedException
                        ? "border-primary/50 bg-primary/20 text-primary hover:bg-primary/30"
                        : "border-outline-variant hover:border-primary/40 text-on-surface-variant bg-transparent"
                    }`}
                  >
                    {isClaimedException ? (
                      <span className="font-bold text-xs">✕</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-white/20"></span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-on-surface-variant/70 mt-3 italic">
              *Tap circles to claim exceptions or reset.
            </p>
          </div>

          {/* Work Focus Progress Card */}
          <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-sans text-md font-bold text-white">
                Work Focus
              </h3>
              <span className="text-[10px] bg-surface-container-highest border border-white/5 py-0.5 px-2 rounded-full font-bold text-primary">
                {activeEntry.workFocus !== "None" ? "In Progress" : "Break Day"}
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              {activeEntry.workFocus !== "None" 
                ? `Bi-weekly Case Study: ${activeEntry.workFocus === "Case Study" ? "UX Audits" : activeEntry.workFocus}`
                : "No focus item set for today."
              }
            </p>
            
            {/* Elegant visual tracker bar */}
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-500 rounded-full" 
                style={{ width: activeEntry.workFocus !== "None" ? "50%" : "0%" }}
              ></div>
            </div>
          </div>
        </motion.section>

        {/* Bucket 2: Happiness */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-secondary/10 text-secondary">
              <Heart className="w-5 h-5 fill-secondary" />
            </div>
            <h2 className="font-serif text-xl font-bold text-secondary tracking-wide">
              Happiness
            </h2>
          </div>

          {/* Socialize Progress tracker */}
          <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 border-t-secondary/30 border-t">
            <h3 className="font-sans text-md font-bold text-white mb-1">
              Socialize
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              3-day cycle commitment
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-surface-container-high h-12 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-secondary/20 transition-all duration-500"
                  style={{ width: activeEntry.socialConnection !== "none" ? "66.6%" : "33.3%" }}
                ></div>
                <span className="relative font-bold text-sm text-white/90 z-10 font-sans">
                  {activeEntry.socialConnection !== "none" ? "Day 2 / 3" : "Day 1 / 3"}
                </span>
              </div>
              
              <button 
                onClick={handleToggleSocial}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  activeEntry.socialConnection !== "none"
                    ? "bg-secondary text-primary-fixed shadow-md shadow-secondary/45 scale-105"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-white/15"
                }`}
              >
                <Check className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>
          </div>

          {/* Hobby Cultivation */}
          <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300">
            <h3 className="font-sans text-md font-bold text-white mb-2">
              Hobby Cultivation
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-sans text-4xl font-extrabold text-secondary glow-text-secondary leading-none">
                {totalStats.streak}
              </span>
              <span className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Day Streak
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant/90 italic leading-relaxed">
              "{activeEntry.creativeOutput || "Keep painting, let it flow."}"
            </p>
            
            {/* List of creative tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(activeEntry.creativeTags || ["Design", "Art"]).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold font-sans">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Bucket 3: Authenticity */}
        <motion.section 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded bg-tertiary/10 text-tertiary">
              <Sparkles className="w-5 h-5 fill-tertiary" />
            </div>
            <h2 className="font-serif text-xl font-bold text-tertiary tracking-wide">
              Authenticity
            </h2>
          </div>

          {/* Deep Writing Card with Progress Circle */}
          <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 border-t-tertiary/30 border-t">
            <h3 className="font-sans text-md font-bold text-white mb-1">
              Deep Writing
            </h3>
            <p className="font-sans text-xs text-on-surface-variant mb-4">
              60 mins + Journaling
            </p>
            
            <div className="flex justify-between items-center">
              {/* Circular progress path */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    className="stroke-tertiary/20" 
                    strokeWidth="4" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    className="stroke-tertiary transition-all duration-500" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray="163.36"
                    strokeDashoffset={(163.36 * (1 - Math.min(100, (activeEntry.writeDuration / 60) * 100) / 100)).toString()}
                  />
                </svg>
                <span className="absolute text-xs font-bold text-white font-sans">
                  {activeEntry.writeDuration}m
                </span>
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-tertiary font-bold bg-tertiary/10 border border-tertiary/25 py-0.5 px-2 rounded-full font-sans uppercase tracking-[0.05em]">
                  {activeEntry.writeType || "Journal"}
                </span>
                <button 
                  onClick={() => onNavigate("daily-entry")}
                  className="px-3.5 py-1.5 bg-surface-container-highest hover:bg-tertiary/10 hover:text-tertiary rounded-lg text-white transition-all text-xs font-bold font-sans tracking-wide"
                >
                  Log Session
                </button>
              </div>
            </div>
          </div>

          {/* Content & Read Card */}
          <div className="glass-panel rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-sans text-md font-bold text-white mb-0.5">
                  Content &amp; Read
                </h3>
                <p className="font-sans text-xs text-on-surface-variant">
                  Daily Post &amp; 20 Pages
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-tertiary" />
            </div>

            {/* Configurable state tags and actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button 
                onClick={() => onUpdateEntry(activeEntry.day, { contentCreated: !activeEntry.contentCreated })}
                className={`px-3 py-1 rounded-full font-sans text-xs font-bold border transition-colors cursor-pointer ${
                  activeEntry.contentCreated
                    ? "bg-tertiary/20 border-tertiary text-tertiary shadow-sm shadow-tertiary/10"
                    : "bg-surface-container-high/50 border-white/10 text-on-surface-variant"
                }`}
              >
                {activeEntry.contentCreated ? `Post Done: ${activeEntry.contentType}` : "No Post"}
              </button>

              <button 
                onClick={() => onNavigate("daily-entry")}
                className={`px-3 py-1 rounded-full font-sans text-xs font-bold border transition-colors cursor-pointer bg-surface-container-high/50 border-white/10 text-on-surface-variant hover:border-tertiary/50`}
              >
                {activeEntry.readPages > 0 ? `Read: ${activeEntry.readPages} Pages` : "Reading..."}
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Progress & Rewards (The Horizon) */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="font-serif text-3xl font-bold text-white mb-6">
          The Horizon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Progress Columns */}
          <div className="space-y-6">
            <div>
              <h3 className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                Financial Milestone
              </h3>
              
              <div className="flex justify-between items-end mb-2">
                <span className="font-sans text-3xl font-extrabold text-white">
                  ₹{Number(totalStats.earnings).toLocaleString("en-IN")}
                </span>
                <span className="font-sans text-xs font-semibold text-on-surface-variant">
                  / ₹50,000
                </span>
              </div>

              {/* Grand high-contrast gradient progress tracking bar */}
              <div className="h-3.5 bg-surface-container-high rounded-full overflow-hidden mb-5">
                <div 
                  className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary transition-all duration-750 rounded-full" 
                  style={{ width: `${Math.min(100, (totalStats.earnings / 50000) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Success criteria checklists */}
            <div>
              <h3 className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Success Criteria</span>
                <span className="text-[10px] text-primary lowercase tracking-normal">
                  (Tap to check milestones)
                </span>
              </h3>
              
              <ul className="space-y-3 font-sans text-sm">
                <li 
                  onClick={() => onToggleCriteria("consistency")}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="flex-shrink-0">
                    {successCriteria.consistency ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/15 transition-all" />
                    ) : (
                      <Circle className="w-5 h-5 text-surface-variant group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className={`transition-colors font-medium ${successCriteria.consistency ? "text-primary stroke-1" : "text-on-surface-variant"}`}>
                    Consistency
                  </span>
                </li>

                <li 
                  onClick={() => onToggleCriteria("sincerity")}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="flex-shrink-0">
                    {successCriteria.sincerity ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/15 transition-all" />
                    ) : (
                      <Circle className="w-5 h-5 text-surface-variant group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className={`transition-colors font-medium ${successCriteria.sincerity ? "text-primary" : "text-on-surface-variant"}`}>
                    Sincerity
                  </span>
                </li>

                <li 
                  onClick={() => onToggleCriteria("quality")}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="flex-shrink-0">
                    {successCriteria.quality ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/15 transition-all" />
                    ) : (
                      <Circle className="w-5 h-5 text-surface-variant group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className={`transition-colors font-medium ${successCriteria.quality ? "text-primary" : "text-on-surface-variant"}`}>
                    Quality
                  </span>
                </li>

                <li 
                  onClick={() => onToggleCriteria("approval")}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="flex-shrink-0">
                    {successCriteria.approval ? (
                      <CheckCircle2 className="w-5 h-5 text-primary fill-primary/15 transition-all" />
                    ) : (
                      <Circle className="w-5 h-5 text-surface-variant group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className={`transition-colors font-medium ${successCriteria.approval ? "text-primary" : "text-on-surface-variant"}`}>
                    Approval
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reward Block */}
          <div className="relative rounded-2xl overflow-hidden group min-h-[250px] shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-black/45 z-10 group-hover:bg-black/30 transition-colors duration-500"></div>
            <img 
              alt="Ultimate Destination Reward Italy, Europe" 
              referrerPolicy="no-referrer"
              src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=1200" 
              className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2000ms]"
            />
            
            <div className="absolute bottom-0 left-0 p-6 z-20 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full font-sans text-[11px] font-bold text-white border border-white/30 mb-2 leading-none uppercase tracking-wider">
                Ultimate Reward
              </span>
              <h3 className="font-serif text-2xl font-bold text-white shadow-sm leading-tight">
                Trip to Europe's Italy (₹1 Lakh)
              </h3>
              <p className="text-white/60 text-xs mt-1.5 font-sans">
                Accumulate consistency factors to unlock the ultimate Amalfi Coast and historic Rome exploration.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
