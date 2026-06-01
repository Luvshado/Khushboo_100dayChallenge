import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle, 
  Settings, 
  Activity, 
  Heart, 
  Sparkles, 
  TrendingUp,
  UserPlus,
  BookOpen,
  Edit,
  PenTool,
  Coins
} from "lucide-react";
import { DailyEntry } from "../types";

interface DailyEntryViewProps {
  activeDay: number;
  entry: DailyEntry;
  onSave: (entry: DailyEntry) => void;
  cumulativeEarnings: number;
}

export default function DailyEntryView({
  activeDay,
  entry,
  onSave,
  cumulativeEarnings
}: DailyEntryViewProps) {
  // Local state for all fields
  const [dietFollowed, setDietFollowed] = useState(entry.dietFollowed);
  const [dietExceptionsUsed, setDietExceptionsUsed] = useState(entry.dietExceptionsUsed);
  const [workFocus, setWorkFocus] = useState<DailyEntry["workFocus"]>(entry.workFocus);
  const [workFocusDetails, setWorkFocusDetails] = useState(entry.workFocusDetails || "");
  const [physicalActivity, setPhysicalActivity] = useState<DailyEntry["physicalActivity"]>(entry.physicalActivity || []);
  const [physicalActivityOther, setPhysicalActivityOther] = useState(entry.physicalActivityOther || "");
  const [physicalDuration, setPhysicalDuration] = useState(entry.physicalDuration);
  
  const [socialConnection, setSocialConnection] = useState<DailyEntry["socialConnection"]>(entry.socialConnection);
  const [creativeOutput, setCreativeOutput] = useState(entry.creativeOutput);
  const [creativeTags, setCreativeTags] = useState<DailyEntry["creativeTags"]>(entry.creativeTags || []);
  
  const [writeDuration, setWriteDuration] = useState(entry.writeDuration);
  const [writeType, setWriteType] = useState<DailyEntry["writeType"]>(entry.writeType);
  const [contentCreated, setContentCreated] = useState(entry.contentCreated);
  const [contentType, setContentType] = useState<DailyEntry["contentType"]>(entry.contentType);
  const [contentFormatList, setContentFormatList] = useState<("Text Post" | "Video" | "Carousel")[]>(entry.contentFormatList || []);
  const [contentPlatforms, setContentPlatforms] = useState<("LinkedIn" | "Instagram" | "Medium" | "YouTube" | "Twitter" | "Threads")[]>(entry.contentPlatforms || []);
  const [readPages, setReadPages] = useState(entry.readPages);
  const [readType, setReadType] = useState<"Book" | "Report/Paper">(entry.readType || "Book");
  const [readDocTitleOrLink, setReadDocTitleOrLink] = useState(entry.readDocTitleOrLink || "");
  
  const [earnings, setEarnings] = useState(entry.earnings === 12500 ? 500 : entry.earnings || 0); // avoid confusing cumulative setup

  const [savingFeedback, setSavingFeedback] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Sync state with active entry
  React.useEffect(() => {
    setDietFollowed(entry.dietFollowed);
    setDietExceptionsUsed(entry.dietExceptionsUsed);
    setWorkFocus(entry.workFocus);
    setWorkFocusDetails(entry.workFocusDetails || "");
    setPhysicalActivity(entry.physicalActivity || []);
    setPhysicalActivityOther(entry.physicalActivityOther || "");
    setPhysicalDuration(entry.physicalDuration);
    setSocialConnection(entry.socialConnection);
    setCreativeOutput(entry.creativeOutput);
    setCreativeTags(entry.creativeTags || []);
    setWriteDuration(entry.writeDuration);
    setWriteType(entry.writeType);
    setContentCreated(entry.contentCreated);
    setContentType(entry.contentType);
    setContentFormatList(entry.contentFormatList || []);
    setContentPlatforms(entry.contentPlatforms || []);
    setReadPages(entry.readPages);
    setReadType(entry.readType || "Book");
    setReadDocTitleOrLink(entry.readDocTitleOrLink || "");
    setEarnings(entry.earnings === 12500 ? 500 : entry.earnings || 0);
  }, [activeDay, entry]);

  // Toggle physical activity list
  const handleToggleActivity = (act: DailyEntry["physicalActivity"][number]) => {
    if (physicalActivity.includes(act)) {
      setPhysicalActivity(physicalActivity.filter(item => item !== act));
    } else {
      setPhysicalActivity([...physicalActivity, act]);
    }
  };

  // Toggle creative tag list
  const handleToggleTag = (tag: DailyEntry["creativeTags"][number]) => {
    if (creativeTags.includes(tag)) {
      setCreativeTags(creativeTags.filter(item => item !== tag));
    } else {
      setCreativeTags([...creativeTags, tag]);
    }
  };

  // Toggle Content Platform
  const handleTogglePlatform = (plat: any) => {
    if (contentPlatforms.includes(plat)) {
      setContentPlatforms(contentPlatforms.filter(item => item !== plat));
    } else {
      setContentPlatforms([...contentPlatforms, plat]);
    }
  };

  // Toggle Content Format
  const handleToggleFormat = (fmt: any) => {
    if (contentFormatList.includes(fmt)) {
      setContentFormatList(contentFormatList.filter(item => item !== fmt));
    } else {
      setContentFormatList([...contentFormatList, fmt]);
    }
  };

  // Trigger save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeedback(true);
    
    // Automatically set the contentType based on formats chosen
    let computedContentType: DailyEntry["contentType"] = "None";
    if (contentCreated) {
      if (contentFormatList.length > 1) {
        computedContentType = "Multi-Format";
      } else if (contentFormatList.length === 1) {
        computedContentType = contentFormatList[0] as DailyEntry["contentType"];
      } else {
        computedContentType = "Text Post"; // Default fallback
      }
    }

    const updatedEntry: DailyEntry = {
      day: activeDay,
      date: entry.date || new Date().toISOString().split('T')[0],
      dietFollowed,
      dietExceptionsUsed: dietFollowed ? 0 : dietExceptionsUsed,
      workFocus,
      workFocusDetails: workFocus !== "None" ? workFocusDetails : "",
      physicalActivity,
      physicalActivityOther: physicalActivity.includes("Other") ? physicalActivityOther : "",
      physicalDuration,
      socialConnection,
      creativeOutput,
      creativeTags,
      writeDuration,
      writeType,
      contentCreated,
      contentType: computedContentType,
      contentFormatList,
      contentPlatforms,
      readPages,
      readType,
      readDocTitleOrLink: readType === "Report/Paper" ? readDocTitleOrLink : "",
      earnings: Number(earnings)
    };

    onSave(updatedEntry);

    setTimeout(() => {
      setSavingFeedback(false);
    }, 1500);
  };

  // Dynamic preview calculation
  const newCumulativePreview = Math.max(0, cumulativeEarnings - (entry.earnings || 0) + Number(earnings));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      {/* Page Header */}
      <header className="space-y-3 pt-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary leading-tight">
          Daily Entry
        </h1>
        <p className="font-sans text-md font-medium text-on-surface-variant flex items-center gap-1.5">
          <span>Log your progress and reflections for Day </span>
          <span className="text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20 text-xs">
            {activeDay}
          </span>
          <span>.</span>
        </p>
      </header>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Section 1: Life Bucket */}
        <section className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <h2 className="font-serif text-2xl font-bold text-primary-fixed mb-6 flex items-center gap-2 relative z-10">
            <Activity className="w-5 h-5 text-primary" />
            Life
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Diet */}
            <div className="space-y-4">
              <label htmlFor="diet-toggle" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Diet Status
              </label>
              
              <div className="flex items-center justify-between bg-surface-container-high/60 rounded-xl p-4 border border-white/5">
                <span className="font-sans text-sm font-semibold text-white/95">
                  Followed Plan
                </span>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="diet-toggle"
                    checked={dietFollowed}
                    onChange={(e) => {
                      setDietFollowed(e.target.checked);
                      if (e.target.checked) setDietExceptionsUsed(0);
                    }}
                    className="sr-only"
                  />
                  <label 
                    htmlFor="diet-toggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${
                      dietFollowed ? "bg-primary" : "bg-surface-variant"
                    }`}
                  >
                    <span 
                      className={`block w-4 h-4 rounded-full bg-white shadow-md transform transition-transform my-1 mx-1 ${
                        dietFollowed ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs text-on-surface-variant px-1.5">
                <span>Diet Plan adherence today</span>
                <span>
                  Exceptions active: <strong className="text-primary">{dietExceptionsUsed}</strong>
                </span>
              </div>

              {/* Exception Counters beneath followed plan */}
              <div className="p-4 bg-surface-container/60 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wide block">
                    Diet Exception (7 Counters)
                  </label>
                  {dietExceptionsUsed > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDietExceptionsUsed(0);
                      }}
                      className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                    >
                      Clear Counter
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isActive = dietExceptionsUsed === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setDietExceptionsUsed(num);
                          setDietFollowed(false); // clicking sets plan to inactive automatically
                        }}
                        className={`w-8 h-8 rounded-full font-bold text-xs border transition-all cursor-pointer ${
                          isActive 
                            ? "bg-primary border-primary text-on-primary scale-115 shadow-md font-extrabold" 
                            : "bg-surface-variant border-outline-variant hover:border-primary-container text-on-surface hover:bg-neutral-850"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-[9px] text-on-surface-variant/70 italic leading-relaxed">
                  Active Exception Counter: <strong>{dietExceptionsUsed > 0 ? `${dietExceptionsUsed} / 7` : "None"}</strong>. Clicking a counter automatically sets "Followed Plan" to inactive.
                </p>
              </div>
            </div>

            {/* Work */}
            <div className="space-y-4">
              <label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Work Focus
              </label>
              <div className="flex flex-wrap gap-2.5">
                {(["Case Study", "Client Project", "Upskilling", "None"] as const).map((focus) => {
                  const isActive = workFocus === focus;
                  return (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => setWorkFocus(focus)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/5"
                          : "border-outline-variant bg-surface-container-high/50 text-on-surface hover:border-primary/45"
                      }`}
                    >
                      {focus}
                    </button>
                  );
                })}
              </div>

              {/* Text area for details of Case Study, Project, or Upskilling */}
              {workFocus !== "None" && (
                <div className="space-y-1.5 pt-2">
                  <label htmlFor="work-focus-details" className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wide block pl-1">
                    Details of {workFocus}
                  </label>
                  <textarea
                    id="work-focus-details"
                    rows={2}
                    placeholder={`Describe details or notes about your ${workFocus.toLowerCase()} today...`}
                    value={workFocusDetails}
                    onChange={(e) => setWorkFocusDetails(e.target.value)}
                    className="w-full bg-surface-container-high/60 border border-outline-variant focus:border-primary px-3.5 py-2.5 rounded-xl text-on-surface text-xs focus:outline-none placeholder:text-on-surface-variant/45 transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            {/* Physical Activity */}
            <div className="space-y-4 md:col-span-2 pt-2">
              <label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Physical Activity
              </label>
              <div className="flex flex-wrap gap-2.5 mb-2">
                {(["Walk", "Workout", "Swim", "Dance", "Other"] as const).map((act) => {
                  const isSelected = physicalActivity.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleToggleActivity(act)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/5"
                          : "border-outline-variant bg-surface-container-high/50 text-on-surface hover:border-primary/45"
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>

              {physicalActivity.includes("Other") && (
                <div className="pb-2">
                  <label htmlFor="physical-other" className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1.5 pl-1">
                    Describe other physical activity
                  </label>
                  <input 
                    id="physical-other"
                    type="text" 
                    placeholder="Enter what you did (yoga, cycling, etc.)..."
                    value={physicalActivityOther}
                    onChange={(e) => setPhysicalActivityOther(e.target.value)}
                    className="w-full max-w-md bg-surface-container-high/60 border border-outline-variant focus:border-primary px-3.5 py-3 rounded-xl text-on-surface text-xs focus:outline-none placeholder:text-on-surface-variant/45 transition-colors"
                  />
                </div>
              )}
              
              <div className="space-y-3 bg-surface-container-high/35 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                  <span>Duration</span>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded">
                    {physicalDuration} mins
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  step="5"
                  value={physicalDuration}
                  onChange={(e) => setPhysicalDuration(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Happiness Bucket */}
        <section className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-secondary/5 to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <h2 className="font-serif text-2xl font-bold text-secondary-fixed mb-6 flex items-center gap-2 relative z-10">
            <Heart className="w-5 h-5 text-secondary fill-secondary/20" />
            Happiness
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Social Connection */}
            <div className="space-y-4">
              <label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Social Connection
              </label>
              
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setSocialConnection("new")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    socialConnection === "new"
                      ? "bg-secondary-container/15 border-secondary text-secondary"
                      : "bg-surface-container-high/40 border-transparent hover:border-secondary/40 text-on-surface"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-semibold">Met someone new</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSocialConnection("friend")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    socialConnection === "friend"
                      ? "bg-secondary-container/20 border-secondary text-secondary"
                      : "bg-surface-container-high/40 border-transparent hover:border-secondary/40 text-on-surface"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Met friend/acquaintance</span>
                </button>
              </div>
            </div>

            {/* Creative Hobby */}
            <div className="space-y-4">
              <label htmlFor="reflections" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Creative Output
              </label>
              <input 
                id="reflections"
                type="text" 
                placeholder="What did you create today?"
                value={creativeOutput}
                onChange={(e) => setCreativeOutput(e.target.value)}
                className="w-full bg-surface-container-high/60 border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary/20 px-4 py-3 rounded-xl text-on-surface text-sm placeholder:text-on-surface-variant/45 transition-colors focus:outline-none"
              />
              
              <div className="pt-2">
                <span className="font-sans text-xs font-bold text-on-surface-variant/80 block mb-2">
                  Topic tag:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(["Writing", "Design", "Music", "Art", "Coding", ...creativeTags])).map((tag) => {
                    const isSelected = creativeTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-secondary/15 border-secondary text-secondary"
                            : "bg-surface-container/50 border-white/5 text-on-surface-variant hover:border-secondary/30"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}

                  {isAddingTag ? (
                    <div className="flex items-center gap-1.5 bg-surface-container/50 border border-secondary px-2.5 py-0.5 rounded-full">
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Tag name..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onBlur={() => {
                          if (!customTagInput.trim()) {
                            setIsAddingTag(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (customTagInput.trim()) {
                              const nt = customTagInput.trim();
                              if (!creativeTags.includes(nt)) {
                                setCreativeTags([...creativeTags, nt]);
                              }
                              setCustomTagInput("");
                              setIsAddingTag(false);
                            }
                          } else if (e.key === "Escape") {
                            setIsAddingTag(false);
                            setCustomTagInput("");
                          }
                        }}
                        className="bg-transparent border-none text-xs text-white max-w-[80px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customTagInput.trim()) {
                            const nt = customTagInput.trim();
                            if (!creativeTags.includes(nt)) {
                              setCreativeTags([...creativeTags, nt]);
                            }
                          }
                          setCustomTagInput("");
                          setIsAddingTag(false);
                        }}
                        className="text-[10px] text-secondary font-bold hover:text-white"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="px-3 py-1 bg-surface-container/30 hover:bg-surface-container-high/60 border border-dashed border-white/10 text-primary font-bold text-xs rounded-full cursor-pointer transition-colors"
                    >
                      + Add your own tag
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Authenticity Bucket */}
        <section className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-tertiary/5 to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <h2 className="font-serif text-2xl font-bold text-tertiary-fixed mb-6 flex items-center gap-2 relative z-10">
            <Sparkles className="w-5 h-5 text-tertiary" />
            Authenticity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Write column */}
            <div className="space-y-4 bg-surface-container-high/35 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <label htmlFor="write-duration" className="font-sans text-xs font-bold text-on-surface px-1 text-on-surface-variant uppercase tracking-wider block flex items-center gap-1.5 mb-2.5">
                  <PenTool className="w-3.5 h-3.5 text-tertiary" />
                  Write
                </label>
                <div className="flex items-center justify-between mb-4">
                  <input 
                    type="number" 
                    id="write-duration"
                    value={writeDuration || ""}
                    onChange={(e) => setWriteDuration(Number(e.target.value))}
                    min="0"
                    max="180"
                    placeholder="45"
                    className="w-16 bg-surface-variant focus:border-tertiary focus:ring-1 focus:ring-tertiary/20 rounded-lg p-2 text-center text-on-surface font-semibold text-sm transition-colors border border-outline-variant focus:outline-none"
                  />
                  <span className="text-on-surface-variant text-xs font-medium pr-1">/ 60 mins</span>
                </div>
              </div>
              
              <div className="flex bg-surface-variant/60 rounded-lg p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setWriteType("Journal")}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    writeType === "Journal"
                      ? "bg-tertiary-container/30 border border-tertiary/20 text-tertiary shadow-sm"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Journal
                </button>
                <button
                  type="button"
                  onClick={() => setWriteType("Brain Dump")}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    writeType === "Brain Dump"
                      ? "bg-tertiary-container/30 border border-tertiary/20 text-tertiary shadow-sm"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Dump
                </button>
              </div>
            </div>

            {/* Content column */}
            <div className="space-y-4 bg-surface-container-high/35 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-tertiary" />
                  Content Log
                </label>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <span className="text-sm font-semibold text-white/95">Post Done</span>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="content-toggle"
                      checked={contentCreated}
                      onChange={(e) => {
                        setContentCreated(e.target.checked);
                      }}
                      className="sr-only"
                    />
                    <label 
                      htmlFor="content-toggle"
                      className={`block overflow-hidden h-5.5 rounded-full cursor-pointer transition-colors ${
                        contentCreated ? "bg-tertiary" : "bg-surface-variant"
                      }`}
                    >
                      <span 
                        className={`block w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform my-1 mx-1 ${
                          contentCreated ? "translate-x-4" : "translate-x-0"
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>

                {contentCreated && (
                  <div className="space-y-3.5 mt-3 pt-3 border-t border-white/5 font-sans">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Platforms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(["LinkedIn", "Instagram", "Medium", "YouTube", "Twitter", "Threads"] as const).map((plat) => {
                          const isPlatSelected = contentPlatforms.includes(plat);
                          return (
                            <button
                              key={plat}
                              type="button"
                              onClick={() => handleTogglePlatform(plat)}
                              className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                                isPlatSelected
                                  ? "bg-tertiary/20 border-tertiary text-tertiary"
                                  : "bg-surface-variant/40 border-outline-variant text-on-surface-variant hover:text-white"
                              }`}
                            >
                              {plat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Formats</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(["Text Post", "Video", "Carousel"] as const).map((fmt) => {
                          const isFmtSelected = contentFormatList.includes(fmt);
                          return (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => handleToggleFormat(fmt)}
                              className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                                isFmtSelected
                                  ? "bg-tertiary/20 border-tertiary text-tertiary"
                                  : "bg-surface-variant/40 border-outline-variant text-on-surface-variant hover:text-white"
                              }`}
                            >
                              {fmt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {contentFormatList.length > 0 && (
                      <div className="text-[9px] text-on-surface-variant/80 italic mt-1 leading-none">
                        Format: {contentFormatList.length > 1 ? "Multi-Format Post ✓" : contentFormatList[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {!contentCreated && (
                <div className="text-[10px] text-on-surface-variant/45 italic text-center py-2">
                  No publication tracked today
                </div>
              )}
            </div>

            {/* Reading Column */}
            <div className="space-y-4 bg-surface-container-high/35 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
              <div>
                <label className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-tertiary" />
                  Reading Logs
                </label>

                {/* Toggle readType */}
                <div className="flex bg-surface-variant/60 rounded-lg p-1 border border-white/5 mb-3">
                  <button
                    type="button"
                    onClick={() => setReadType("Book")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      readType === "Book"
                        ? "bg-tertiary-container/30 border border-tertiary/20 text-tertiary shadow-sm"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadType("Report/Paper")}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      readType === "Report/Paper"
                        ? "bg-tertiary-container/30 border border-tertiary/20 text-tertiary shadow-sm"
                        : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Paper/Doc
                  </button>
                </div>

                {readType === "Book" ? (
                  <div className="space-y-2">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider pl-1 font-sans">Pages Counter</p>
                    <div className="flex items-center gap-3 justify-center py-1">
                      <input 
                        type="number" 
                        id="read-input"
                        placeholder="0"
                        value={readPages || ""}
                        onChange={(e) => setReadPages(Number(e.target.value))}
                        className="w-16 bg-transparent border-b border-outline-variant focus:border-tertiary text-center font-serif text-3xl font-extrabold text-white transition-colors focus:outline-none"
                      />
                      <span className="text-on-surface-variant text-sm font-semibold">Pages</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    <div className="space-y-1">
                      <label htmlFor="read-doc" className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider pl-1 block">Doc Title or Link</label>
                      <input 
                        id="read-doc"
                        type="text" 
                        placeholder="Title or paper url..." 
                        value={readDocTitleOrLink}
                        onChange={(e) => setReadDocTitleOrLink(e.target.value)}
                        className="w-full bg-surface-variant border border-outline-variant focus:border-tertiary px-3 py-2 rounded-lg text-xs text-white placeholder:text-white/30 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="read-pages-paper" className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider pl-1 block">Pages read</label>
                      <div className="flex items-center gap-2">
                        <input 
                          id="read-pages-paper"
                          type="number" 
                          placeholder="0"
                          value={readPages || ""}
                          onChange={(e) => setReadPages(Number(e.target.value))}
                          className="w-14 bg-surface-variant border border-outline-variant focus:border-tertiary px-2 py-1 rounded-lg text-xs text-center text-white font-bold focus:outline-none"
                        />
                        <span className="text-on-surface-variant text-xs">pages</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-center text-on-surface-variant/70 italic pt-2 border-t border-white/5">
                Daily goal: 20 Pages min
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Financial Growth */}
        <section className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <h2 className="font-serif text-2xl font-bold text-primary-fixed mb-6 flex items-center gap-2 relative z-10">
            <Coins className="w-5 h-5 text-primary" />
            Financial Growth
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 w-full">
              <label htmlFor="earnings-input" className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3 pl-1">
                Earnings Today (Rs)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-xl">₹</span>
                <input 
                  type="number" 
                  id="earnings-input"
                  placeholder="Enter amount"
                  value={earnings || ""}
                  onChange={(e) => setEarnings(Number(e.target.value))}
                  className="w-full bg-surface-container-high/60 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20 pl-10 pr-4 py-4 rounded-xl text-on-surface font-serif text-2xl font-extrabold placeholder:text-on-surface-variant/30 transition-colors focus:outline-none"
                />
              </div>
            </div>

            {/* Reactive Projection visual helper */}
            <div className="flex-1 w-full flex items-center justify-center md:justify-end bg-surface-container-high/30 p-4 rounded-xl border border-white/5">
              <div className="text-right">
                <div className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Progress to 50k Goal
                </div>
                <div className="font-sans text-2xl md:text-3xl font-extrabold text-primary flex items-baseline justify-end gap-1.5 leading-none">
                  <span>₹{newCumulativePreview.toLocaleString("en-IN")}</span>
                  <span className="text-on-surface-variant font-sans text-[11px] uppercase tracking-wider font-semibold">
                    / 50k
                  </span>
                </div>
                
                {/* Visual bar mini */}
                <div className="w-48 bg-surface-variant h-1.5 rounded-full mt-2.5 overflow-hidden ml-auto">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (newCumulativePreview / 50000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Submit Button with Glow */}
        <div className="flex justify-center pt-4">
          <button 
            type="submit"
            disabled={savingFeedback}
            className={`w-full max-w-md font-sans text-sm font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer ${
              savingFeedback
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-primary hover:bg-primary-fixed text-on-primary shadow-primary/20 hover:shadow-primary/40 active:scale-95"
            }`}
          >
            <CheckCircle className={`w-4 h-4 fill-current ${savingFeedback ? "animate-bounce" : ""}`} />
            {savingFeedback ? "Daily Entry Successfully Saved!" : "Save Daily Entry"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
