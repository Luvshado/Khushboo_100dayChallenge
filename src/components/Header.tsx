import { Calendar, Bell, Sparkles, LayoutDashboard, PenSquare, History, Compass, Eye, EyeOff, Globe } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  day: number;
  isGuestMode?: boolean;
  onToggleGuestMode?: () => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  day, 
  isGuestMode = false, 
  onToggleGuestMode 
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?guest=true`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center px-4 md:px-12 py-3.5 max-w-7xl mx-auto w-full">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-primary via-secondary to-tertiary opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
            <span className="relative font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight italic transition duration-300">
              Finding Khushboo
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-tertiary animate-pulse" />
        </div>

        {/* Navigation Links based on mode */}
        {isGuestMode ? (
          /* Desktop Navigation Links for Guests */
          <div className="hidden md:flex items-center gap-1.5 bg-surface-container-low/60 rounded-full p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "dashboard" || activeTab === "daily-entry"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "history"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              100-Day Sequence
            </button>
          </div>
        ) : (
          /* Desktop Navigation Links */
          <div className="hidden md:flex items-center gap-1.5 bg-surface-container-low/60 rounded-full p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("daily-entry")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "daily-entry"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <PenSquare className="w-4 h-4" />
              Daily Entry
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "dashboard"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "history"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              Day Logs
            </button>

            <button
              onClick={() => setActiveTab("sanctuary")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${
                activeTab === "sanctuary"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" />
              Sanctuary
            </button>
          </div>
        )}

        {/* Quick actions & Toggle workspace views */}
        <div className="flex items-center gap-4">
          {/* Share Guest Link Button */}
          <button 
            onClick={handleShareLink}
            className={`px-3 py-1.5 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
              copied 
                ? "bg-primary text-on-primary shadow-sm" 
                : "bg-surface-container-high hover:bg-surface-container-highest text-white/95 border border-white/5"
            }`}
          >
            {copied ? "Link Copied ✓" : "Share Guest Link"}
          </button>

          {/* Interactive Guest Mode Toggle Switch */}
          {onToggleGuestMode && (
            <button 
              type="button"
              onClick={onToggleGuestMode}
              title={isGuestMode ? "Back to Owner Space" : "Preview Guest Mode"}
              className="px-2.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest hover:text-primary transition-all rounded-lg border border-white/5 flex items-center gap-2 text-xs font-bold cursor-pointer font-sans"
            >
              {isGuestMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-secondary" />
                  <span className="hidden sm:inline">Owner View</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Guest Preview</span>
                </>
              )}
            </button>
          )}

          <button 
            onClick={() => setActiveTab("history")}
            className="text-on-surface-variant hover:text-primary transition-colors p-2.5 rounded-xl hover:bg-white/5 flex items-center gap-2 border border-white/5 bg-surface-container-high/40 group hidden sm:flex cursor-pointer text-xs font-bold"
          >
            <Calendar className="w-4 h-4 text-primary shrink-0 animate-pulse" />
            <span className="text-white/85 select-none font-sans">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </button>

          {/* User profile with serene style */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors duration-300">
              <img 
                alt="Khushboo Profile" 
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyicuu4EESQFE4ATBcCmXyT9eNWw_KE-StJq46ZjoU4TIbefMEuxJCfz0VFpuhBws6kcarWbU-DT4YNiuHtfoFi0zcYyLm4VQf8rFUOZDgHfldsqA0jA7XNLfZkdFi-htuRPaBI6iY_azmzRrulPuU3KUcH2rxB7vpK48xaSRE0DNHUWtTk_Sif4fEg2tP3cey9MpSVgwI9Q3UWJ8Xh8p4M0SLx_98fuKFgyL3umL_ud5ykIARro_c2M0H961M9XW3LqNE1imbSTvo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-sans text-xs font-semibold text-white/90 hidden lg:block">
              {isGuestMode ? "Guest View" : `Day ${day} active`}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
