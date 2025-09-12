import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Animation utilities for world-class interactions
export const animations = {
  // Entrance animations
  fadeInUp: "animate-in fade-in-0 slide-in-from-bottom-4 duration-300",
  fadeInDown: "animate-in fade-in-0 slide-in-from-top-4 duration-300",
  fadeInLeft: "animate-in fade-in-0 slide-in-from-left-4 duration-300",
  fadeInRight: "animate-in fade-in-0 slide-in-from-right-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  
  // Exit animations
  fadeOut: "animate-out fade-out-0 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
  
  // Bounce and spring effects
  bounceIn: "animate-bounce",
  pulse: "animate-pulse",
  
  // Smooth transitions
  smooth: "transition-all duration-200 ease-out",
  smoothSlow: "transition-all duration-300 ease-out",
}

// Touch feedback utilities
export const touchFeedback = {
  button: "active:scale-95 transition-transform duration-100",
  card: "active:scale-[0.98] transition-transform duration-100",
  subtle: "active:scale-[0.99] transition-transform duration-75",
}

// Mobile-first responsive breakpoints
export const breakpoints = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
}

// Color palette inspired by modern design systems
export const colors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe", 
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
  },
  warning: {
    50: "#fffbeb", 
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
  },
  danger: {
    50: "#fef2f2",
    100: "#fee2e2", 
    500: "#ef4444",
    600: "#dc2626",
  }
}

// Format helpers for better UX
export function formatWeight(weight: number | null | undefined): string {
  if (!weight) return "Bodyweight"
  return weight % 1 === 0 ? `${weight} lbs` : `${weight.toFixed(1)} lbs`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// Haptic feedback simulation for web
export function vibrateDevice(pattern: number | number[] = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}