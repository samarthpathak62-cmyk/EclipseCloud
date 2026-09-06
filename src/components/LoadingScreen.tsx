import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Sparkles, ShieldCheck, Zap, CheckCircle2, Wifi, Activity } from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';
import { useAuth } from '../firebase/authContext';

interface LoadingScreenProps {
  onFinish: () => void;
}

interface LoadingStage {
  progress: number;
  text: string;
  subtext: string;
  icon: React.ReactNode;
}

const STAGES: LoadingStage[] = [
  {
    progress: 20,
    text: 'Initializing Cloud Infrastructure...',
    subtext: 'Establishing secure websocket to Minecraft server nodes',
    icon: <Server className="w-4 h-4 text-emerald-400" />,
  },
  {
    progress: 45,
    text: 'Syncing Website & Gateway Configurations...',
    subtext: 'Loading real-time announcements, branding & Discord links',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
  },
  {
    progress: 72,
    text: 'Fetching Server Plans & Hardware Specs...',
    subtext: 'Pulling latest AMD Ryzen 9 & DDR5 NVMe allocation tiers',
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
  },
  {
    progress: 90,
    text: 'Verifying Security & Player Permissions...',
    subtext: 'Checking role access, active sessions & Firestore rules',
    icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  },
  {
    progress: 100,
    text: 'All Systems Synchronized & Updated!',
    subtext: 'Ready to launch your Minecraft experience',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  const { websiteSettings, loading: settingsLoading } = useSettings();
  const { loading: authLoading } = useAuth();
  const [currentProgress, setCurrentProgress] = useState(15);
  const [stageIndex, setStageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const brandName = websiteSettings?.websiteName || 'Eclipse Cloud';

  // Smoothly increment progress and synchronize with real loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const isDataLoaded = !settingsLoading && !authLoading;

    if (!isDataLoaded) {
      // Simulate progressive stepping while backend loads
      timer = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev < 35) {
            setStageIndex(0);
            return prev + 6;
          } else if (prev < 65) {
            setStageIndex(1);
            return prev + 5;
          } else if (prev < 85) {
            setStageIndex(2);
            return prev + 4;
          } else if (prev < 92) {
            setStageIndex(3);
            return prev + 1;
          }
          return prev;
        });
      }, 140);
    } else {
      // When both settings & auth have resolved from Firestore
      setStageIndex(3);
      setCurrentProgress(94);

      // Brief delay to hit 100% cleanly
      const completionTimer = setTimeout(() => {
        setStageIndex(4);
        setCurrentProgress(100);

        // Allow user to see 100% state for 350ms before unmounting
        const exitTimer = setTimeout(() => {
          setIsFinished(true);
          onFinish();
        }, 350);

        return () => clearTimeout(exitTimer);
      }, 250);

      return () => clearTimeout(completionTimer);
    }

    return () => clearInterval(timer);
  }, [settingsLoading, authLoading, onFinish]);

  // Safety fallback: Never keep the user waiting longer than 3.5s
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setCurrentProgress(100);
      setStageIndex(4);
      setTimeout(() => {
        setIsFinished(true);
        onFinish();
      }, 200);
    }, 3500);

    return () => clearTimeout(safetyTimeout);
  }, [onFinish]);

  const currentStage = STAGES[stageIndex] || STAGES[STAGES.length - 1];

  return (
    <div
      id="app-loading-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-950 text-slate-100 select-none overflow-hidden"
    >
      {/* Background Animated Pixel Grid & Glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[300px] bg-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-mc-grid opacity-60" />
      </div>

      {/* Top Bar: Cluster Status & Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs text-slate-400">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Nodes Online
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-mono text-[11px]">18ms Latency</span>
        </div>

        <button
          onClick={() => {
            setIsFinished(true);
            onFinish();
          }}
          className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-mono underline underline-offset-4"
        >
          Skip &gt;&gt;
        </button>
      </div>

      {/* Center Hero: 3D Animated Minecraft Server Cube & Branding */}
      <div className="flex flex-col items-center text-center max-w-md w-full my-auto space-y-7">
        {/* Isometric Animated Server Cube */}
        <div className="relative">
          {/* Pulsing Aura */}
          <motion.div
            animate={{
              scale: [0.9, 1.15, 0.9],
              opacity: [0.35, 0.6, 0.35],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 -m-6 bg-gradient-to-tr from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-2xl pointer-events-none"
          />

          {/* Floating Cube Container */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotateZ: [-1, 1, -1],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/25 flex items-center justify-center p-3"
          >
            {/* Minecraft Block Style Face Inset */}
            <div className="absolute inset-1 rounded-xl border border-emerald-400/20 bg-emerald-950/20 flex items-center justify-center">
              {websiteSettings?.logoUrl ? (
                <img
                  src={websiteSettings.logoUrl}
                  alt={brandName}
                  className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                />
              ) : (
                <div className="relative">
                  <Server className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
              )}
            </div>

            {/* Corner Decorative Circuit Accent Marks */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-emerald-400/80 rounded-xs" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400/80 rounded-xs" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-emerald-400/80 rounded-xs" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-emerald-400/80 rounded-xs" />
          </motion.div>
        </div>

        {/* Brand Typography */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>{brandName}</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>High-Performance Minecraft Hosting</span>
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              {currentStage.icon}
              <span className="text-slate-300 font-semibold">{currentStage.text}</span>
            </span>
            <span className="text-emerald-400 font-bold">{Math.round(currentProgress)}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-md shadow-emerald-500/50"
              style={{ width: `${currentProgress}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-mono text-left truncate">
            &gt; {currentStage.subtext}
          </p>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="w-full max-w-4xl border-t border-slate-900 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-400">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>DDoS Guard: Filtered</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline text-slate-400">
            Engine: AMD Ryzen 9 7950X3D
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Data Sync Active</span>
        </div>
      </div>
    </div>
  );
};
