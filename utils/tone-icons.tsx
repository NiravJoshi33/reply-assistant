import {
  ThumbsUp,
  Scale,
  Laugh,
  CircleHelp,
  Briefcase,
  Flame,
  MessageSquare,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  'thumbs-up': ThumbsUp,
  scale: Scale,
  laugh: Laugh,
  'circle-help': CircleHelp,
  briefcase: Briefcase,
  flame: Flame,
  'message-square': MessageSquare,
};

export function ToneIcon({
  name,
  size = 16,
}: {
  name?: string;
  size?: number;
}) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return <span>{name}</span>;
  return <Icon size={size} />;
}

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
