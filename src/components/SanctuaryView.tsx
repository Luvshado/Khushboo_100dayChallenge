import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Compass, HelpCircle, Loader2, BookOpen, Quote, Smile } from "lucide-react";
import { DailyEntry } from "../types";

interface SanctuaryViewProps {
  activeEntry: DailyEntry;
}

// Low-opacity brand color Reflection Chips ("Scent of the Day")
const ESSENCE_CHIPS = [
  { id: "rose", label: "Serene Rose", color: "text-secondary border-secondary/20 bg-secondary/10" },
  { id: "jasmine", label: "Awakened Jasmine", color: "text-primary border-primary/20 bg-primary/10" },
  { id: "sandalwood", label: "Quiet Sandalwood", color: "text-tertiary border-tertiary/20 bg-tertiary/10" },
  { id: "lotus", label: "Mystical Lotus", color: "text-secondary border-secondary/20 bg-secondary/10" },
  { id: "marigold", label: "Vibrant Marigold", color: "text-tertiary border-tertiary/20 bg-tertiary/10" }
];

export default function SanctuaryView({ activeEntry }: SanctuaryViewProps) {
  const [selectedEssence, setSelectedEssence] = useState("rose");
  const [diaryNote, setDiaryNote] = useState("");
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReflection = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Find selected chip label
      const activeChip = ESSENCE_CHIPS.find(n => n.id === selectedEssence)?.label || "Serene Rose";
      
      const payload = {
        day: activeEntry.day,
        dietExceptionsUsed: activeEntry.dietExceptionsUsed,
        workFocus: activeEntry.workFocus,
        creativeOutput: diaryNote || activeEntry.creativeOutput || "Keep painting, let it flow.",
        writeDuration: activeEntry.writeDuration,
        readPages: activeEntry.readPages,
        earnings: activeEntry.earnings,
        essenceTheme: activeChip
      };

      const res = await fetch("/api/soulful-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Network error contacting the sanctuary server.");
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setReflectionText(data.text);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "The sanctuary is temporarily quiet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 max-w-4xl mx-auto pb-8"
    >
      <header className="space-y-3 pt-4 text-center">
        <div className="inline-flex p-3 rounded-full bg-gradient-to-tr from-primary/10 via-secondary/10 to-tertiary/10 text-tertiary animate-pulse mb-1">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
          Mindfulness Sanctuary
        </h1>
        <p className="font-sans text-md font-medium text-on-surface-variant max-w-xl mx-auto">
          Quiet the outer noise, Khushboo. Focus your heart's essence and unlock personalized guidance for Day {activeEntry.day}.
        </p>
      </header>

      {/* Grid containing prompts and diary note entry */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Inputs card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-secondary" />
              Scent &amp; Reflection Chips
            </h2>
            <p className="text-xs text-on-surface-variant/80 font-sans mb-4">
              Select the emotional aroma or "Scent of the Day" that speaks to your current developmental state:
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {ESSENCE_CHIPS.map((chip) => {
                const isSelected = selectedEssence === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedEssence(chip.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold font-sans transition-all cursor-pointer ${
                      isSelected 
                        ? `${chip.color} ring-1 ring-offset-1 ring-offset-background scale-105 font-extrabold shadow-md`
                        : "border-white/5 bg-surface-container-low/40 text-on-surface-variant/60 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <label htmlFor="sanctuary-diary" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Journal Reflection
              </label>
              <textarea
                id="sanctuary-diary"
                rows={4}
                placeholder="How is your spirit blooming today, Khushboo? Pen down a fleeting thought or note..."
                value={diaryNote}
                onChange={(e) => setDiaryNote(e.target.value)}
                className="w-full bg-surface-container-low/60 border border-outline-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary/20 p-3.5 rounded-xl text-on-surface text-xs leading-relaxed placeholder:text-on-surface-variant/45 transition-all focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={fetchReflection}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-primary via-secondary to-tertiary hover:from-primary-fixed hover:to-secondary-fixed text-on-primary font-sans text-xs font-extrabold py-3.5 px-6 rounded-full shadow-lg shadow-secondary/10 hover:shadow-secondary/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing Guidance...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Request Soulful Advice
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right reflection display layout */}
        <div className="md:col-span-3">
          <div className="glass-panel rounded-2xl p-6 md:p-8 h-full flex flex-col justify-between relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-tertiary/5 via-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Quote decoration */}
            <div className="absolute top-6 left-6 text-white/5 pointer-events-none">
              <Quote className="w-32 h-32 rotate-180" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-widest font-sans mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Ethereal Reflection</span>
              </div>

              {reflectionText ? (
                /* Journal quote layout as requested: uses body-lg and italic Playfair Display for quotes */
                <div className="space-y-4">
                  <div className="font-serif text-lg md:text-xl font-medium text-white/95 leading-relaxed italic pl-4 border-l-2 border-tertiary/40">
                    "{reflectionText.split('\n\n')[0]}"
                  </div>
                  {reflectionText.split('\n\n')[1] && (
                    <div className="font-sans text-sm text-on-surface-variant leading-relaxed pl-4">
                      {reflectionText.split('\n\n')[1]}
                    </div>
                  )}
                </div>
              ) : errorMsg ? (
                <div className="text-red-300 font-sans text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  {errorMsg}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="font-serif text-[19px] text-white/40 leading-relaxed italic pl-4 border-l-2 border-white/10">
                    "Take a deep breath, Khushboo. Focus your thoughts inside the left panel and click 'Request Soulful Advice' to generate a real-time spiritual guide about your Day {activeEntry.day} progression."
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 border-t border-white/5 pt-5 mt-6 flex justify-between items-center text-[10px] text-on-surface-variant uppercase tracking-wider font-sans font-bold">
              <span>Finding Khushboo AI Sanctum</span>
              <span className="text-tertiary">Powered by Gemini 3.5</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
