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

  const workerRef = useRef<Worker | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const notificationPermission = useRef<NotificationPermission>('default')

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermission.current = permission
        })
      }
    }

    // Create audio element for sound notification
    if (playSound) {
      audioRef.current = new Audio()
      // Create a simple beep sound using Web Audio API
      createBeepSound().then(audioUrl => {
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.preload = 'auto'
        }
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [playSound])

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    // Trigger haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }

    // Play sound notification
    if (playSound && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    // Show browser notification
    if ('Notification' in window && notificationPermission.current === 'granted') {
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        // icon: '/icon-192x192.png', // Will be added when app icons are created
        // badge: '/icon-192x192.png',
        tag: 'workout-timer',
        requireInteraction: true,
        silent: !playSound
      })

      // Auto-close notification after 10 seconds
      setTimeout(() => notification.close(), 10000)

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    // Call custom completion handler
    onComplete?.()
  }, [notificationTitle, notificationBody, playSound, onComplete])

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

      if (type === 'tick') {
        setState(prev => ({ ...prev, seconds }))
      } else if (type === 'complete') {
        setState(prev => ({ ...prev, isRunning: false, isCompleted: true, seconds: 0 }))
        handleTimerComplete()
      }
    }

    // Initialize worker with initial seconds
    workerRef.current.postMessage({ action: 'set', seconds: initialSeconds })

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [initialSeconds, handleTimerComplete])

  // Timer controls
  const start = useCallback(() => {
    if (state.seconds > 0) {
      setState(prev => ({ ...prev, isRunning: true, isCompleted: false }))
      workerRef.current?.postMessage({ action: 'start' })
    }
  }, [state.seconds])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }))
    workerRef.current?.postMessage({ action: 'pause' })
  }, [])

  const reset = useCallback(() => {
    setState({
      seconds: initialSeconds,
      isRunning: false,
      isCompleted: false
    })
    workerRef.current?.postMessage({ action: 'reset', seconds: initialSeconds })
  }, [initialSeconds])

  const setSeconds = useCallback((newSeconds: number) => {
    setState(prev => ({
      ...prev,
      seconds: newSeconds,
      isCompleted: false
    }))
    workerRef.current?.postMessage({ action: 'set', seconds: newSeconds })
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
    hasNotificationPermission: notificationPermission.current === 'granted'
  }
}

// Helper function to create a beep sound using Web Audio API
async function createBeepSound(): Promise<string> {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
    
    // Create a MediaRecorder to capture the audio as a blob
    const stream = audioContext.destination.stream
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        resolve(URL.createObjectURL(blob))
      }
      
      mediaRecorder.start()
      setTimeout(() => mediaRecorder.stop(), 600)
    })
  } catch (error) {
    console.warn('Could not create beep sound:', error)
    // Fallback: return empty data URL for silent audio
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+GmqlcBCIK/6bF//+8'
  }
}