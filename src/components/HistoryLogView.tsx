import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  History, 
  Calendar, 
  Activity, 
  Heart, 
  Sparkles, 
  Trash2, 
  ChevronsRight, 
  RefreshCw, 
  Plus,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { DailyEntry } from "../types";

interface HistoryLogViewProps {
  entries: { [day: number]: DailyEntry };
  onDeleteEntry: (day: number) => void;
  onSelectActiveDay: (day: number) => void;
  activeDay: number;
  onGenerateMockHistory: () => void;
}

export default function HistoryLogView({
  entries,
  onDeleteEntry,
  onSelectActiveDay,
  activeDay,
  onGenerateMockHistory
}: HistoryLogViewProps) {
  const [selectedDayToView, setSelectedDayToView] = useState<number | null>(activeDay);
  const [backendLogs, setBackendLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    setLoadingLogs(true);
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logs) {
          setBackendLogs(data.logs);
        }
        setLoadingLogs(false);
      })
      .catch((err) => {
        console.error("Failed to load backend logs:", err);
        setLoadingLogs(false);
      });
  }, [entries]);

  // Filter out any entries we have logged
  const loggedDays = Object.keys(entries).map(Number).sort((a, b) => a - b);
  const selectedEntry = selectedDayToView ? entries[selectedDayToView] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Header with mock operations */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
            Journey Logs
          </h1>
          <p className="font-sans text-sm font-medium text-on-surface-variant mt-1.5">
            Visualize the full 100-Day schedule and review past daily logs.
          </p>
        </div>

        <button 
          onClick={onGenerateMockHistory}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/15 hover:from-primary/20 hover:to-secondary/25 text-white border border-white/10 rounded-full font-sans text-xs font-bold transition-all cursor-pointer shadow-sm shadow-primary/5 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Pre-populate full schedule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: 100 Days Grid View representing the path (Glass container) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              100-Day Ascent Calendar
            </h2>
            <div className="text-xs text-on-surface-variant/80 font-sans mb-5 leading-relaxed">
              Every card below represents one day on her developmental sequence. Teal nodes have complete data summaries. Tap nodes to focus dashboard parameters or review metrics.
            </div>

            {/* Grid of 100 days */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 100 }).map((_, i) => {
                const d = i + 1;
                const hasData = !!entries[d];
                const isActive = activeDay === d;
                const isViewed = selectedDayToView === d;

                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDayToView(d);
                    }}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative border ${
                      hasData 
                        ? "bg-primary/10 border-primary text-primary shadow-sm hover:bg-primary/20"
                        : "bg-surface-container-low/40 border-white/5 text-on-surface-variant/50 hover:border-white/20 hover:text-white"
                    } ${
                      isActive ? "ring-2 ring-secondary ring-offset-2 ring-offset-background scale-105 z-10" : ""
                    } ${
                      isViewed && !isActive ? "border-white/50 border scale-105" : ""
                    }`}
                  >
                    <span className="text-[11px] font-extrabold font-sans leading-none">{d}</span>
                    {hasData && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-white/10 text-[11px] font-sans font-bold text-on-surface-variant uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-lg bg-surface-container-low/40 border border-white/5"></span>
                Incomplete Log
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <span className="w-3 h-3 rounded-lg bg-primary/20 border border-primary"></span>
                Logged Entry
              </span>
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="w-3 h-3 rounded-md ring-2 ring-secondary ring-offset-1 ring-offset-background bg-primary/20 border border-primary"></span>
                Selected Active Day
              </span>
            </div>
          </div>

          {/* Secure Backend Server Time Audit Logs Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-surface-container-low/30 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded bg-primary/10 text-primary">
                <Activity className="w-5 h-5 text-primary stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Secure Backend Server Time Audit Logs
              </h3>
            </div>
            <p className="text-xs text-on-surface-variant/80 font-sans mb-4 leading-relaxed">
              Every creation, modification, or deletion is recorded with an absolute server-side hardware timestamp in server memory. This ensures maximum integrity and auditability of the 100-day journey.
            </p>

            {loadingLogs ? (
              <p className="text-xs text-on-surface-variant/60 italic font-sans animate-pulse">Loading backend audit logs...</p>
            ) : backendLogs.length === 0 ? (
              <p className="text-xs text-on-surface-variant/60 italic font-sans py-2">
                No server logs recorded yet in this session. Log some daily progress entries over the dashboard/entry hub to populate secure UTC snapshots!
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
                {backendLogs.map((log: any) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-sans transition-all hover:bg-neutral-900/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        log.action === "create" 
                          ? "bg-primary/25 text-primary" 
                          : log.action === "delete" 
                          ? "bg-red-400/20 text-red-400" 
                          : "bg-secondary/25 text-secondary"
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-white/90 font-semibold">Day {log.day} log</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant flex flex-col text-left sm:text-right">
                      <span className="text-neutral-300">
                        Server Time: <strong className="text-primary font-mono text-xs">{new Date(log.timestamp).toLocaleString("en-US", { timeZone: "UTC" })} UTC</strong>
                      </span>
                      {log.clientTimestamp && (
                        <span className="text-white/40 text-[9px]">
                          Client Time: <span className="font-mono">{new Date(log.clientTimestamp).toLocaleTimeString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Selected Day Detailed Viewer */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-t-secondary/35 border-t">
            <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-secondary" />
              Day Inspection Hub
            </h2>

            {selectedEntry ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-surface-container-high/40 p-4 rounded-xl border border-white/5">
                  <div>
                    <div className="font-serif text-2xl font-bold text-white leading-none">
                      Day {selectedEntry.day}
                    </div>
                    <div className="font-sans text-[11px] text-on-surface-variant/80 font-bold tracking-widest uppercase mt-1">
                      {selectedEntry.date || "2026-05-18"}
                    </div>
                  </div>
                  
                  {activeDay !== selectedEntry.day ? (
                    <button
                      onClick={() => onSelectActiveDay(selectedEntry.day)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-fixed text-on-primary font-sans text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm shadow-primary/25"
                    >
                      Make Active
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-secondary/15 border border-secondary/25 text-secondary rounded-lg font-sans text-[10px] font-extrabold uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </div>

                {/* Inspect buckets detail */}
                <div className="space-y-3 font-sans text-xs text-on-surface-variant">
                  {/* Diet Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Diet Adherence</span>
                    <span className="flex items-center gap-1 text-white">
                      {selectedEntry.dietFollowed ? (
                        <span className="text-primary font-bold">Followed plan ✓</span>
                      ) : (
                        <span className="text-on-surface-variant/90 font-medium">
                          Used {selectedEntry.dietExceptionsUsed} exceptions ✕
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Work focus Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Work Focus</span>
                    <span className="text-white font-bold">{selectedEntry.workFocus}</span>
                  </div>

                  {/* Physical Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Physical Training</span>
                    <span className="text-white font-bold align-right">
                      {selectedEntry.physicalActivity.length > 0 
                        ? `${selectedEntry.physicalActivity.join(", ")} (${selectedEntry.physicalDuration}m)`
                        : "Break day"
                      }
                    </span>
                  </div>

                  {/* Socialize Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Social Engagement</span>
                    <span className="text-white font-bold">
                      {selectedEntry.socialConnection === "friend" ? "Met Friend" : selectedEntry.socialConnection === "new" ? "Met Stranger" : "None"}
                    </span>
                  </div>

                  {/* Reflections Detail */}
                  <div className="flex flex-col gap-1 border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Creative Narrative</span>
                    <p className="text-white leading-normal italic text-xs pl-2 border-l border-secondary/35">
                      "{selectedEntry.creativeOutput || "Keep painting, let it flow."}"
                    </p>
                  </div>

                  {/* Deep writing Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Writing output</span>
                    <span className="text-tertiary font-bold">
                      {selectedEntry.writeDuration} mins ({selectedEntry.writeType})
                    </span>
                  </div>

                  {/* Page index Detail */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="font-semibold text-white/90">Read metrics</span>
                    <span className="text-white font-bold">
                      {selectedEntry.readPages || 0} pages completed
                    </span>
                  </div>

                  {/* Economic metrics Detail */}
                  <div className="flex justify-between items-center pb-2">
                    <span className="font-semibold text-white/90">Earning credits</span>
                    <span className="text-primary font-bold">
                      ₹{Number(selectedEntry.earnings || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex justify-between items-center">
                  <span className="text-[10px] text-on-surface-variant/80 font-sans italic">
                    Tap nodes in the grid to display another day.
                  </span>
                  
                  {selectedEntry.day !== 14 && selectedEntry.day !== 1 && (
                    <button
                      onClick={() => {
                        const dayNum = selectedEntry.day;
                        onDeleteEntry(dayNum);
                        setSelectedDayToView(activeDay);
                      }}
                      className="text-white/60 hover:text-red-400 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold font-sans rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant font-sans text-xs">
                Select any coded day node from the grid on the left to see tracked logs or focus dashboard criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
