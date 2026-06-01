import React from "react";
import { motion } from "motion/react";
import { Calendar, CheckCircle, Sparkles, Flame, Hourglass } from "lucide-react";
import { DailyEntry } from "../types";

interface GuestCalendarViewProps {
  entries: { [day: number]: DailyEntry };
  activeDay: number;
}

export default function GuestCalendarView({ entries, activeDay }: GuestCalendarViewProps) {
  return (
    <div className="space-y-10 max-w-4xl mx-auto font-sans text-on-background pb-12">
      {/* Calendar Header */}
      <header className="space-y-3.5 text-center py-6">
        <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-white leading-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Calendar className="w-10 h-10 text-primary shrink-0" />
          Sequence Calendar
        </h1>
        <div className="max-w-xl mx-auto flex items-center justify-center gap-2.5">
          <span className="h-px bg-white/10 w-8"></span>
          <p className="text-on-surface-variant text-sm font-medium tracking-wide">
            100-Day Ascent Progress Grid
          </p>
          <span className="h-px bg-white/10 w-8"></span>
        </div>
      </header>

      {/* Progress Calendar Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-2xl p-6 md:p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent shadow-2xl relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none"></div>

        <h3 className="font-serif text-xl font-bold text-white mb-3.5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          100-Day Progress Nodes
        </h3>
        
        <p className="text-xs text-on-surface-variant/80 font-sans leading-relaxed mb-6">
          This sequence calendar displays which nodes represent successfully logged progress cycles. Tap-checking individual day details is strictly restricted to protect log integrity and diary privacy.
        </p>

        <div className="grid grid-cols-10 gap-1.5 md:gap-2">
          {Array.from({ length: 100 }).map((_, idx) => {
            const dNum = idx + 1;
            const isCompleted = !!entries[dNum];
            const isActive = activeDay === dNum;
            
            return (
              <motion.div 
                key={dNum}
                whileHover={{ scale: 1.05 }}
                className={`h-11 rounded-lg flex flex-col items-center justify-center transition-all shadow-sm ${
                  isCompleted 
                    ? "bg-primary/20 border border-primary/40 text-primary font-bold text-xs" 
                    : "bg-surface-container-low/40 border border-white/5 text-on-surface-variant/30 text-[10px]"
                } ${
                  isActive ? "ring-2 ring-secondary text-secondary font-extrabold" : ""
                }`}
                title={isCompleted ? `Day ${dNum} Log Complete` : `Day ${dNum} Incomplete`}
              >
                <span>{dNum}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/5 text-[10px] font-bold font-sans text-on-surface-variant uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-3.5 h-3.5 rounded bg-primary/20 border border-primary/40"></span>
            Logged Node Completed
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-surface-container-low/40 border border-white/5"></span>
            Upcoming/Incomplete Day
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="w-3.5 h-3.5 rounded border border-secondary ring-2 ring-secondary/25"></span>
            Active Day Sequence
          </div>
        </div>
      </motion.div>

      {/* Aesthetic Motivation Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consistency is key</h4>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Every marked node represents self-discipline, routine alignment, and authentic habit cultivation.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
