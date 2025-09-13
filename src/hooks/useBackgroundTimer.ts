"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface BackgroundTimerState {
  seconds: number
  isRunning: boolean
  isCompleted: boolean
}

interface UseBackgroundTimerOptions {
  initialSeconds: number
  autoStart?: boolean
  onComplete?: () => void
  notificationTitle?: string
  notificationBody?: string
  playSound?: boolean
}

export function useBackgroundTimer({
  initialSeconds,
  autoStart = false,
  onComplete,
  notificationTitle = "Timer Complete",
  notificationBody = "Your workout timer has finished!",
  playSound = true
}: UseBackgroundTimerOptions) {
  const [state, setState] = useState<BackgroundTimerState>({
    seconds: initialSeconds,
    isRunning: autoStart,
    isCompleted: false
  })

  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const workerRef = useRef<Worker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const notificationPermission = useRef<NotificationPermission>('default')
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const wakeLockRef = useRef<any>(null)
  const isWorkerActive = useRef<boolean>(false)
  
  // Function to update permission state
  const updatePermissionState = useCallback(() => {
    if ('Notification' in window) {
      const newPermission = Notification.permission
      notificationPermission.current = newPermission
      setPermissionState(newPermission)
    }
  }, [])

  // Request wake lock to keep screen active
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
        console.log('Wake lock acquired')
      }
    } catch (error) {
      console.warn('Wake lock failed:', error)
    }
  }, [])

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
      console.log('Wake lock released')
    }
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    updatePermissionState()
    // Don't auto-request permission, let user click the bell icon

    // Create audio element for sound notification
    if (playSound) {
      // Use a data URL for a simple beep that works on iPhone
      const beepData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+G'
      audioRef.current = new Audio(beepData)
      audioRef.current.preload = 'auto'
      audioRef.current.volume = 0.8
      
      // Prepare audio for iPhone (requires user interaction first)
      audioRef.current.load()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current)
      }
      releaseWakeLock()
    }
  }, [playSound, releaseWakeLock])

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }

    // Play sound notification
    if (playSound && audioRef.current) {
      // Create multiple beeps for better notification
      const playBeeps = async () => {
        try {
          for (let i = 0; i < 3; i++) {
            await audioRef.current?.play()
            await new Promise(resolve => setTimeout(resolve, 200))
            audioRef.current?.pause()
            audioRef.current!.currentTime = 0
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error) {
          console.warn('Audio play failed:', error)
        }
      }
      playBeeps()
    }

    // Show browser notification
    if ('Notification' in window && notificationPermission.current === 'granted') {
      try {
        const notification = new Notification(notificationTitle, {
          body: notificationBody,
          // icon: '/icon-192x192.png', // Will be added when app icons are created
          // badge: '/icon-192x192.png',
          tag: 'workout-timer',
          requireInteraction: true,
          silent: false, // Always use sound for iPhone
          vibrate: [200, 100, 200, 100, 200] // Vibration pattern for mobile
        })

        // Auto-close notification after 15 seconds (longer for mobile)
        setTimeout(() => {
          try {
            notification.close()
          } catch (e) {
            // Ignore close errors
          }
        }, 15000)

        notification.onclick = () => {
          try {
            window.focus()
            notification.close()
          } catch (e) {
            // Ignore errors
          }
        }

        notification.onerror = (error) => {
          console.warn('Notification error:', error)
        }
      } catch (error) {
        console.warn('Failed to show notification:', error)
      }
    }

    // Release wake lock when timer completes
    releaseWakeLock()

    // Call custom completion handler
    onComplete?.()
  }, [notificationTitle, notificationBody, playSound, onComplete, releaseWakeLock])

  // Create Web Worker for background timing
  useEffect(() => {
    const workerCode = `
      let timerId = null;
      let remainingTime = 0;
      let isActive = false;

      self.onmessage = function(e) {
        const { action, seconds } = e.data;

        switch (action) {
          case 'start':
            if (!isActive && remainingTime > 0) {
              isActive = true;
              timerId = setInterval(() => {
                remainingTime--;
                self.postMessage({ type: 'tick', seconds: remainingTime });
                
                if (remainingTime <= 0) {
                  isActive = false;
                  clearInterval(timerId);
                  self.postMessage({ type: 'complete' });
                }
              }, 1000);
            }
            break;

          case 'pause':
            isActive = false;
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            break;

          case 'reset':
            isActive = false;
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            remainingTime = seconds;
            self.postMessage({ type: 'tick', seconds: remainingTime });
            break;

          case 'set':
            remainingTime = seconds;
            self.postMessage({ type: 'tick', seconds: remainingTime });
            break;
        }
      };
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    workerRef.current = new Worker(URL.createObjectURL(blob))

    workerRef.current.onmessage = (e) => {
      const { type, seconds } = e.data
      isWorkerActive.current = true

      if (type === 'tick') {
        setState(prev => ({ ...prev, seconds }))
        // Stop fallback timer if worker is working
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }
      } else if (type === 'complete') {
        setState(prev => ({ ...prev, isRunning: false, isCompleted: true, seconds: 0 }))
        handleTimerComplete()
      }
    }

    workerRef.current.onerror = () => {
      console.warn('Web Worker failed, falling back to setInterval')
      isWorkerActive.current = false
    }

    // Initialize worker with initial seconds
    workerRef.current.postMessage({ action: 'set', seconds: initialSeconds })
    
    // Auto-start if requested
    if (autoStart) {
      workerRef.current.postMessage({ action: 'start' })
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [initialSeconds, handleTimerComplete])

  // Fallback timer system for when Web Worker fails
  const startFallbackTimer = useCallback(() => {
    // Wait 3 seconds to see if Web Worker is working before starting fallback
    setTimeout(() => {
      if (isWorkerActive.current || fallbackTimerRef.current) {
        return // Worker is active or fallback already running
      }

      console.log('Starting fallback timer')
      startTimeRef.current = Date.now()
      lastUpdateRef.current = state.seconds

      fallbackTimerRef.current = setInterval(() => {
        // Don't run if worker became active
        if (isWorkerActive.current) {
          clearInterval(fallbackTimerRef.current!)
          fallbackTimerRef.current = null
          return
        }

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const newSeconds = Math.max(lastUpdateRef.current - elapsed, 0)
        
        setState(prev => {
          if (prev.seconds !== newSeconds) {
            if (newSeconds <= 0 && prev.seconds > 0) {
              handleTimerComplete()
              return { ...prev, seconds: 0, isRunning: false, isCompleted: true }
            }
            return { ...prev, seconds: newSeconds }
          }
          return prev
        })

        if (newSeconds <= 0) {
          clearInterval(fallbackTimerRef.current!)
          fallbackTimerRef.current = null
        }
      }, 1000)
    }, 3000) // 3 second delay
  }, [state.seconds, handleTimerComplete])

  // Page Visibility API to handle tab switching and mobile background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (tab switched or mobile locked)
        console.log('Page hidden - starting fallback timer')
        if (state.isRunning) {
          startTimeRef.current = Date.now()
          lastUpdateRef.current = state.seconds
        }
      } else {
        // Page is visible again
        console.log('Page visible - syncing timer')
        if (state.isRunning && startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const newSeconds = Math.max(lastUpdateRef.current - elapsed, 0)
          
          setState(prev => ({ ...prev, seconds: newSeconds }))
          
          if (newSeconds <= 0) {
            handleTimerComplete()
            setState(prev => ({ ...prev, isRunning: false, isCompleted: true, seconds: 0 }))
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state.isRunning, state.seconds, handleTimerComplete])

  // Timer controls
  const start = useCallback(() => {
    if (state.seconds > 0) {
      setState(prev => ({ ...prev, isRunning: true, isCompleted: false }))
      isWorkerActive.current = false // Reset worker status
      workerRef.current?.postMessage({ action: 'start' })
      startFallbackTimer()
      requestWakeLock() // Request wake lock when starting timer
    }
  }, [state.seconds, startFallbackTimer, requestWakeLock])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }))
    isWorkerActive.current = false
    workerRef.current?.postMessage({ action: 'pause' })
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    releaseWakeLock() // Release wake lock when pausing
  }, [releaseWakeLock])

  const reset = useCallback(() => {
    setState({
      seconds: initialSeconds,
      isRunning: false,
      isCompleted: false
    })
    isWorkerActive.current = false
    workerRef.current?.postMessage({ action: 'reset', seconds: initialSeconds })
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    releaseWakeLock() // Release wake lock when resetting
  }, [initialSeconds, releaseWakeLock])

  const setSeconds = useCallback((newSeconds: number) => {
    setState(prev => ({
      ...prev,
      seconds: newSeconds,
      isCompleted: false
    }))
    workerRef.current?.postMessage({ action: 'set', seconds: newSeconds })
    lastUpdateRef.current = newSeconds
  }, [])

  const toggle = useCallback(() => {
    if (state.isRunning) {
      pause()
    } else {
      start()
    }
  }, [state.isRunning, start, pause])

  return {
    ...state,
    start,
    pause,
    reset,
    toggle,
    setSeconds,
    hasNotificationPermission: permissionState === 'granted',
    updatePermissionState
  }
}

