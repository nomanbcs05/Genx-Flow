import React, { useState } from "react";
import { Download, X, Smartphone, Monitor, CheckCircle, Info, Share, PlusSquare, ArrowUpRight } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallProps {
  showModalOnly?: boolean;
  onCloseModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallProps> = ({ showModalOnly, onCloseModal }) => {
  const {
    isInstallable,
    isInstalled,
    isDismissed,
    isIOS,
    isAndroid,
    deferredPrompt,
    triggerInstall,
    dismissBanner,
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(showModalOnly || false);

  React.useEffect(() => {
    if (showModalOnly !== undefined) {
      setShowGuideModal(showModalOnly);
    }
  }, [showModalOnly]);

  const handleCloseGuide = () => {
    setShowGuideModal(false);
    if (onCloseModal) onCloseModal();
  };

  // If already installed as PWA, don't show prompt banner
  if (isInstalled && !showModalOnly) {
    return null;
  }

  return (
    <>
      {/* Floating Banner for Mobile & Desktop when installable and not dismissed */}
      {!isInstalled && !isDismissed && !showModalOnly && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 dark:bg-slate-900/95 border border-blue-500/30 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  Install StockFlow App
                  <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded-full">
                    PWA
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  {isAndroid
                    ? "Install for native Android app experience with offline access & fast launch."
                    : "Install on phone or desktop for quick access and full screen mode."}
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded-lg transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-800">
            {deferredPrompt ? (
              <button
                onClick={triggerInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-blue-500/25 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                Install Now
              </button>
            ) : (
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex-1 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                Install App Guide
              </button>
            )}

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              Instructions
            </button>
          </div>
        </div>
      )}

      {/* Detailed Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  SF
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Install StockFlow ERP</h3>
                  <p className="text-xs text-slate-400">PWA for Android, iOS & Desktop</p>
                </div>
              </div>
              <button
                onClick={handleCloseGuide}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deferredPrompt && (
              <div className="mt-5 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-center">
                <p className="text-sm text-blue-200 mb-3">
                  Direct browser installation is supported on this device!
                </p>
                <button
                  onClick={() => {
                    triggerInstall();
                    handleCloseGuide();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  Install 1-Click App
                </button>
              </div>
            )}

            {/* Android Instructions */}
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <h4 className="font-semibold text-sm text-emerald-400 flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4" />
                  Android Phone (Chrome / Edge / Samsung Internet)
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4">
                  <li>Tap the <strong>three dots menu (⋮)</strong> at top right of Chrome/browser.</li>
                  <li>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm by tapping <strong>"Install"</strong>.</li>
                  <li>StockFlow ERP will be added to your Android home screen & app drawer!</li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <h4 className="font-semibold text-sm text-sky-400 flex items-center gap-2 mb-2">
                  <Share className="w-4 h-4" />
                  iPhone / iPad (Safari)
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4">
                  <li>Tap the <strong>Share button</strong> <Share className="w-3.5 h-3.5 inline text-blue-400" /> at bottom of Safari.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-300" />.</li>
                  <li>Tap <strong>"Add"</strong> in top right corner.</li>
                </ol>
              </div>

              {/* Desktop Instructions */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                <h4 className="font-semibold text-sm text-indigo-400 flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4" />
                  Desktop (Chrome / Edge / Brave)
                </h4>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4">
                  <li>Click the <strong>Install icon</strong> <Download className="w-3.5 h-3.5 inline text-blue-400" /> in browser address bar.</li>
                  <li>Or click the 3-dots menu &gt; <strong>Save and Share &gt; Install StockFlow ERP</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleCloseGuide}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
