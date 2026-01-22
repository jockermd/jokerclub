import { Crown, Star, Shield, Flame, Gem, Heart, Trophy, Zap, Rocket, Award, Diamond, Sparkles, Target, Briefcase, Coffee, Music, Camera, Gamepad, Lightbulb, Settings, Users, Calendar, Clock, Map, type LucideIcon } from 'lucide-react';

export const badgeIcons: Record<string, LucideIcon> = {
  Star: Star,
  Crown: Crown,
  Shield: Shield,
  Trophy: Trophy,
  Flame: Flame,
  Gem: Gem,
  Heart: Heart,
  Zap: Zap,
  Rocket: Rocket,
  Award: Award,
  Diamond: Diamond,
  Sparkles: Sparkles,
  Target: Target,
  Briefcase: Briefcase,
  Coffee: Coffee,
  Music: Music,
  Camera: Camera,
  Gamepad: Gamepad,
  Lightbulb: Lightbulb,
  Settings: Settings,
  Users: Users,
  Calendar: Calendar,
  Clock: Clock,
  Map: Map,
};

export const badgeColors: Record<string, string> = {
  secondary: 'text-zinc-400',
  primary: 'text-mart-primary',
  accent: 'text-mart-accent font-bold',
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-400',
  purple: 'text-purple-500',
  white: 'text-white',
  orange: 'text-orange-500',
  pink: 'text-pink-500',
  cyan: 'text-cyan-500',
  lime: 'text-lime-500',
  indigo: 'text-indigo-500',
  teal: 'text-teal-500',
  rose: 'text-rose-500',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
  slate: 'text-slate-600',
  gray: 'text-gray-700',
};

export const badgeColorPickerColors: Record<string, string> = {
  secondary: 'bg-zinc-400',
  primary: 'bg-mart-primary',
  accent: 'bg-mart-accent',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-500',
  white: 'bg-white',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  lime: 'bg-lime-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-600',
  gray: 'bg-gray-700',
};

export type BadgeIconName = keyof typeof badgeIcons;
export type BadgeColorName = keyof typeof badgeColors;

export interface BadgeDetails {
  text: string;
  color: BadgeColorName;
  icon: BadgeIconName;
}
