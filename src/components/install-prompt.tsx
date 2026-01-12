"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("pwa-prompt-dismissed")
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => {
        setShowPrompt(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 2500)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    if (isIOS && isSafari) {
      setTimeout(() => {
        setShowIOSPrompt(true)
        setShowPrompt(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 2500)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setShowPrompt(false)
      setDismissed(true)
      sessionStorage.setItem("pwa-prompt-dismissed", "true")
    }, 300)
  }

  if (!showPrompt || dismissed) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "bg-black/40 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={handleDismiss}
    >
      <div 
        className={`w-full max-w-sm transform transition-all duration-300 ease-out ${
          isAnimating 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-8 opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-white via-white to-neutral-50 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/50">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-200/40 to-orange-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-rose-200/30 to-pink-300/20 rounded-full blur-2xl" />
          
          {/* Close button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-10 group"
          >
            <svg className="w-4 h-4 text-neutral-500 group-hover:text-neutral-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative p-6 pt-8">
            {/* App Icon */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-2xl shadow-xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  {/* Polaroid icon */}
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="8" y="6" width="28" height="32" rx="3" fill="white"/>
                    <rect x="11" y="9" width="22" height="18" rx="2" fill="url(#installGrad)"/>
                    <circle cx="28" cy="14" r="3" fill="#FDBA74"/>
                    <path d="M11 22L17 16L21 20L25 16L33 24V27H11V22Z" fill="#E2E8F0"/>
                    <defs>
                      <linearGradient id="installGrad" x1="11" y1="9" x2="33" y2="27" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FCD34D"/>
                        <stop offset="1" stopColor="#F97316"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Get RetroClick App
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Install for instant access, faster loading, and offline editing
              </p>
            </div>

            {showIOSPrompt ? (
              // iOS Instructions
              <div className="space-y-4">
                <div className="bg-neutral-50/80 backdrop-blur rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">Tap Share button</p>
                      <p className="text-xs text-neutral-400">In Safari toolbar</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-800">Add to Home Screen</p>
                      <p className="text-xs text-neutral-400">Scroll down in share menu</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm rounded-2xl transition-all hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98]"
                >
                  Got it!
                </button>
              </div>
            ) : (
              // Android/Chrome Install
              <div className="space-y-3">
                {/* Features */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Free</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>No signup</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>2MB</span>
                  </div>
                </div>

                <button
                  onClick={handleInstall}
                  className="w-full py-3.5 bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white font-semibold text-sm rounded-2xl transition-all hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 text-neutral-400 hover:text-neutral-600 font-medium text-sm transition-colors"
                >
                  Maybe later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
