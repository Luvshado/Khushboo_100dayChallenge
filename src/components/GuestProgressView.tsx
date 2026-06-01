import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Calendar, 
  Flame, 
  Hourglass, 
  CheckCircle,
  TrendingUp,
  Heart,
  Activity,
  Sparkles
} from "lucide-react";
import { DailyEntry } from "../types";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, setDoc, doc, query, orderBy } from "firebase/firestore";

interface GuestProgressViewProps {
  entries: { [day: number]: DailyEntry };
  activeDay: number;
  totalStats: {
    earnings: number;
    daysLeft: number;
    pace: number;
    streak: number;
  };
  successCriteria: {
    consistency: boolean;
    sincerity: boolean;
    quality: boolean;
    approval: boolean;
  };
  onExitGuestMode?: () => void;
}

export default function GuestProgressView({
  entries,
  activeDay,
  totalStats,
  successCriteria,
  onExitGuestMode
}: GuestProgressViewProps) {
  const [joined, setJoined] = useState(false);

  // Dynamic calculations representing genuine alignment across buckets
  const completedEntries = Object.values(entries) as DailyEntry[];
  const hasEntries = completedEntries.length > 0;

  // Life Score Adherence (Exceptions left out of 7 total capacity + physical active rate)
  const lifeScore = Math.min(100, Math.max(70, Math.round(
    hasEntries
      ? ((completedEntries.filter(e => e.dietExceptionsUsed <= 2).length / completedEntries.length) * 70) + 
        ((completedEntries.filter(e => e.physicalDuration >= 20).length / completedEntries.length) * 30)
      : 86
  )));

  // Happiness Score Adherence (Social connected frequency + streak score factor)
  const happinessScore = Math.min(100, Math.max(70, Math.round(
    hasEntries
      ? ((completedEntries.filter(e => e.socialConnection !== "none").length / completedEntries.length) * 50) + 
        (Math.min(100, (totalStats.streak / 14) * 50))
      : 88
  )));

  // Authenticity Score Adherence (Write times, publications and read pages)
  const authenticityScore = Math.min(100, Math.max(70, Math.round(
    hasEntries
      ? ((completedEntries.filter(e => e.writeDuration >= 20).length / completedEntries.length) * 45) + 
        ((completedEntries.filter(e => e.readPages >= 10).length / completedEntries.length) * 35) +
        ((completedEntries.filter(e => e.contentCreated).length / completedEntries.length) * 20)
      : 90
  )));

  const defaultBoosts = [
    {
      id: "1",
      name: "Aarav",
      message: "You are absolutely crushing your 100-Day Challenge! Sending massive strength and focus your way!",
      timestamp: "2026-05-25T12:00:00Z"
    },
    {
      id: "2",
      name: "Anonymous",
      message: "Your discipline and beautiful creative art inspire everyone around us. Keep taking it one step at a time! ✨",
      timestamp: "2026-05-28T09:30:00Z"
    }
  ];

  // Energy boosts state with storage support
  const [energyBoosts, setEnergyBoosts] = useState<{ id: string; name: string; message: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem("finding_khushboo_energy_boosts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return defaultBoosts;
  });

  const [senderName, setSenderName] = useState("");
  const [energyMessage, setEnergyMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Sync energy boosts from Firebase in real-time if live db is running
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    try {
      const q = query(collection(db, "energyBoosts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded: { id: string; name: string; message: string; timestamp: string }[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id) {
            loaded.push({
              id: data.id,
              name: data.name || "Anonymous",
              message: data.message || "",
              timestamp: data.timestamp || new Date().toISOString()
            });
          }
        });

        // Set live boosts, merging standard fallback defaults if firestore is clean
        if (loaded.length > 0) {
          setEnergyBoosts(loaded);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, "energyBoosts");
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firestore sync error for boosts:", e);
    }
  }, []);

  const handleSendEnergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!energyMessage.trim()) return;

    const newBoost = {
      id: Date.now().toString(),
      name: isAnonymous ? "Anonymous" : (senderName.trim() || "Supporter"),
      message: energyMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = [newBoost, ...energyBoosts];
    setEnergyBoosts(updated);
    localStorage.setItem("finding_khushboo_energy_boosts", JSON.stringify(updated));

    // Persist to live cloud firestore if active
    if (isFirebaseConfigured && db) {
      setDoc(doc(db, "energyBoosts", newBoost.id), newBoost)
        .catch((err) => handleFirestoreError(err, OperationType.CREATE, `energyBoosts/${newBoost.id}`));
    }

    // Reset controls
    setSenderName("");
    setEnergyMessage("");
    setIsAnonymous(false);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto font-sans text-on-background pb-12">
      {/* Dynamic Welcome Alert */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-medium"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            <strong>Secure Public Viewer Mode:</strong> You are viewing Khushboo's progress on her 100-Day Ascent. Private logs, entries, and reflection sanctuaries are encrypted and locked.
          </span>
        </div>
        {onExitGuestMode && (
          <button 
            type="button"
            onClick={onExitGuestMode}
            className="px-3 py-1 bg-primary hover:bg-primary/20 text-white font-bold rounded-lg border border-primary/40 transition-colors text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer active:scale-95"
          >
            Owner Login
          </button>
        )}
      </motion.div>

      {/* Guest Banner Greeting */}
      <header className="space-y-3.5 text-center py-6">
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white leading-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          100-Day Challenge
        </h1>
        <div className="max-w-xl mx-auto flex items-center justify-center gap-2.5">
          <span className="h-px bg-white/10 w-8"></span>
          <p className="text-on-surface-variant text-sm font-medium tracking-wide">
            Journey Progress for <strong className="text-primary italic font-serif">Khushboo</strong>
          </p>
          <span className="h-px bg-white/10 w-8"></span>
        </div>
      </header>

      {/* Bento Grid layout of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-1">Ascent Day</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-white">{activeDay}</span>
            <span className="text-on-surface-variant/75 text-xs">/ 100</span>
          </div>
          <p className="text-[10px] text-on-surface-variant/80 italic mt-2">Current challenge phase</p>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-1 font-sans flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-secondary animate-pulse" />
            Streak
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-3xl font-bold text-secondary">{totalStats.streak}</span>
            <span className="text-on-surface-variant/75 text-xs">Days Done</span>
          </div>
          <p className="text-[10px] text-on-surface-variant/80 italic mt-2">Hobby & discipline streak</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-tertiary" />
            Remaining
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-3xl font-bold text-tertiary">{totalStats.daysLeft}</span>
            <span className="text-on-surface-variant/75 text-xs">Days Left</span>
          </div>
          <p className="text-[10px] text-on-surface-variant/80 italic mt-2">Countdown to Sep 9, 2026</p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block mb-1">Pace Score</span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-3xl font-bold text-primary">{totalStats.pace}%</span>
            <span className="text-on-surface-variant/75 text-xs">Adherence</span>
          </div>
          <p className="text-[10px] text-on-surface-variant/80 italic mt-2">Consistency factor index</p>
        </div>
      </div>

      {/* Middle Grid: Progress and Destination Reward */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Three Buckets Pace Scores */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Cultivation Pace Metrics
            </h3>
            <p className="text-xs text-on-surface-variant/85 leading-relaxed font-sans">
              These scores reflect Khushboo's alignment with her 100-day container parameters across life, happiness, and authentic output.
            </p>
          </div>

          <div className="space-y-4">
            {/* Life Pace Score */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-primary" />
                  Life Alignment
                </span>
                <span className="text-primary font-serif font-bold text-base">{lifeScore}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${lifeScore}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-on-surface-variant/70 italic leading-none">Diet discipline & physical tracking adherence</p>
            </div>

            {/* Happiness Pace Score */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-secondary" />
                  Happiness Alignment
                </span>
                <span className="text-secondary font-serif font-bold text-base">{happinessScore}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${happinessScore}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-on-surface-variant/70 italic leading-none">Social cycle commitment & hobby cultivation streak</p>
            </div>

            {/* Authenticity Pace Score */}
            <div className="space-y-1.5 font-sans">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-tertiary" />
                  Authenticity Alignment
                </span>
                <span className="text-tertiary font-serif font-bold text-base">{authenticityScore}%</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-tertiary h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${authenticityScore}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-on-surface-variant/70 italic leading-none">Self-introspection write logs, publications, & pages read</p>
            </div>
          </div>
        </div>

        {/* Right Side: Destination Reward -> A Trip to Somewhere (Would you join her?) */}
        <div className="relative rounded-2xl overflow-hidden min-h-[260px] shadow-2xl border border-white/5 group">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img 
            alt="Trip to Somewhere" 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[2000ms]"
          />
          
          <div className="absolute bottom-0 left-0 p-6 z-20 w-full bg-gradient-to-t from-black/95 via-black/40 to-transparent">
            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full font-sans text-[10px] font-bold text-white border border-white/30 mb-2 leading-none uppercase tracking-wider">
              Goal / Challenge Reward
            </span>
            <h3 className="font-serif text-2xl font-bold text-white shadow-sm">
              A Trip to Somewhere
            </h3>
            <p className="text-white/70 text-xs mt-1.5 font-sans leading-relaxed">
              Upon successful compliance of the 100-day challenge sequence, her ultimate reward is an inspiring trek exploration.
            </p>
            
            <div className="mt-3.5 flex items-center justify-between">
              <span className="text-secondary font-bold text-xs font-sans tracking-wide">
                Would you join her?
              </span>
              {joined ? (
                <span className="text-primary font-bold text-[10px] uppercase tracking-wider font-sans bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/25">
                  Pack your bags! 🎒✈️
                </span>
              ) : (
                <button 
                  type="button"
                  onClick={() => setJoined(true)}
                  className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/95 text-[10px] uppercase font-bold text-black rounded-lg transition-all font-sans cursor-pointer shadow-md shadow-secondary/35 active:scale-95"
                >
                  Yes, let's go!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Give Khushboo Energy Lounge Section */}
      <section className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 bg-gradient-to-br from-secondary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/15 blur-3xl rounded-full pointer-events-none"></div>
        
        <h3 className="font-serif text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Flame className="w-5 h-5 text-secondary shrink-0 animate-bounce" style={{ animationDuration: "3s" }} />
          Give Khushboo Energy
        </h3>
        <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed mb-6">
          Share your love, strength, or words of encouragement here to fuel Khushboo's 100-day ascent sequence. Share with your name or anonymously!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Submission Form */}
          <form onSubmit={handleSendEnergy} className="space-y-4 font-sans bg-surface-container/20 p-5 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Send Encouragement</h4>
            
            <div className="space-y-1">
              <label htmlFor="sender-name" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block pl-1">Name</label>
              <input 
                id="sender-name"
                type="text"
                disabled={isAnonymous}
                placeholder={isAnonymous ? "Sending Anonymously..." : "Your name..."}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-surface-container-high/60 border border-outline-variant focus:border-secondary px-3.5 py-2.5 rounded-xl text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-2.5 pl-1">
              <input 
                type="checkbox" 
                id="anon-checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary/30 cursor-pointer"
              />
              <label htmlFor="anon-checkbox" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer select-none">
                Send Anonymously
              </label>
            </div>

            <div className="space-y-1">
              <label htmlFor="energy-msg" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block pl-1">Your Message</label>
              <textarea 
                id="energy-msg"
                rows={3}
                required
                placeholder="Type some encouraging words..."
                value={energyMessage}
                onChange={(e) => setEnergyMessage(e.target.value)}
                className="w-full bg-surface-container-high/60 border border-outline-variant focus:border-secondary px-3.5 py-2.5 rounded-xl text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-secondary hover:bg-secondary/95 text-[11px] font-bold text-black rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-secondary/10"
            >
              <Flame className="w-3.5 h-3.5" />
              Send Energy Boost
            </button>
          </form>

          {/* List of Energy Cards */}
          <div className="space-y-3 max-h-[305px] overflow-y-auto pr-2 custom-scrollbar">
            {energyBoosts.length === 0 ? (
              <p className="text-xs text-on-surface-variant/50 italic text-center py-8">Be the first to send Khushboo some energy!</p>
            ) : (
              energyBoosts.map((boost) => (
                <div key={boost.id} className="p-4 rounded-xl bg-surface-container-low/50 border border-white/5 space-y-2 relative">
                  <div className="flex justify-between items-center text-[10px] font-sans">
                    <span className="font-bold text-secondary">{boost.name}</span>
                    <span className="text-on-surface-variant/60">
                      {new Date(boost.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed font-sans font-light">
                    {boost.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Progress Calendar Grid representing abstract compliance pattern */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5">
        <h3 className="font-serif text-xl font-bold text-white mb-3.5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          100-Day Sequence Overview
        </h3>
        
        <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed mb-6">
          This calendar displays which days represent successfully logged progress cycles. Tap-checking individual day details is strictly restricted to protect log integrity and diary privacy.
        </p>

        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 100 }).map((_, idx) => {
            const dNum = idx + 1;
            const isCompleted = !!entries[dNum];
            const isActive = activeDay === dNum;
            
            return (
              <div 
                key={dNum}
                className={`h-9.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                  isCompleted 
                    ? "bg-primary/20 border border-primary/40 text-primary font-bold text-xs" 
                    : "bg-surface-container-low/40 border border-white/5 text-on-surface-variant/30 text-[10px]"
                } ${
                  isActive ? "ring-2 ring-secondary text-secondary font-extrabold" : ""
                }`}
                title={isCompleted ? `Day ${dNum} Log Complete` : `Day ${dNum} Incomplete`}
              >
                <span>{dNum}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/5 text-[10px] font-bold font-sans text-on-surface-variant uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-3 h-3 rounded bg-primary/20 border border-primary/40"></span>
            Logged Node Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-surface-container-low/40 border border-white/5"></span>
            Upcoming/Incomplete Day
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-3.5 h-3.5 rounded border border-secondary ring-2 ring-secondary/25"></span>
            Active Day Sequence
          </div>
        </div>
      </div>

      {/* Success Criteria List */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <h3 className="font-serif text-lg font-bold text-white mb-4">Core Success Criteria Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 bg-surface-container/30 p-3.5 rounded-xl border border-white/5">
            <CheckCircle className={`w-5 h-5 ${successCriteria.consistency ? "text-primary fill-primary/10" : "text-white/20"}`} />
            <div>
              <span className="text-xs font-bold text-white block mb-0.5">High Consistency (Pace)</span>
              <span className="text-[10px] text-on-surface-variant">Exceptional daily pace score is steadily maintained.</span>
            </div>
          </div>
          
          <div className="flex gap-3 bg-surface-container/30 p-3.5 rounded-xl border border-white/5">
            <CheckCircle className={`w-5 h-5 ${successCriteria.sincerity ? "text-primary fill-primary/10" : "text-white/20"}`} />
            <div>
              <span className="text-xs font-bold text-white block mb-0.5">Deep Sincerity Metric</span>
              <span className="text-[10px] text-on-surface-variant">Comprehensive self-introspection and soul log frequency.</span>
            </div>
          </div>

          <div className="flex gap-3 bg-surface-container/30 p-3.5 rounded-xl border border-white/5">
            <CheckCircle className={`w-5 h-5 ${successCriteria.quality ? "text-primary fill-primary/10" : "text-white/20"}`} />
            <div>
              <span className="text-xs font-bold text-white block mb-0.5">Quality Outputs</span>
              <span className="text-[10px] text-on-surface-variant">Creative portfolios, design logs and case study audits completed.</span>
            </div>
          </div>

          <div className="flex gap-3 bg-surface-container/30 p-3.5 rounded-xl border border-white/5">
            <CheckCircle className={`w-5 h-5 ${successCriteria.approval ? "text-primary fill-primary/10" : "text-white/20"}`} />
            <div>
              <span className="text-xs font-bold text-white block mb-0.5">Approval Criteria Met</span>
              <span className="text-[10px] text-on-surface-variant">All checklist validations have been cleared by internal compliance.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
