
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeDetails, badgeIcons, badgeColors, BadgeIconName, BadgeColorName } from '@/lib/badgeOptions';
import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';

interface CustomBadgeProps {
  details: BadgeDetails | null | undefined;
  size?: 'sm' | 'default';
  className?: string;
}

const CustomBadge: React.FC<CustomBadgeProps> = ({
  details,
  size = 'default',
  className
}) => {
  if (!details || !details.text) {
    return null;
  }

  const {
    text,
    color,
    icon
  } = details;

  const IconComponent = badgeIcons[icon as BadgeIconName] || XCircle;
  const colorClasses = badgeColors[color as BadgeColorName] || badgeColors.secondary;

  const sizeClasses = {
    default: 'px-2.5 py-1 text-sm gap-2',
    sm: 'px-2 py-0.5 text-xs gap-1'
  };

  const iconSizeClasses = {
    default: 'h-4 w-4',
    sm: 'h-3 w-3'
  };

  return (
    <Badge className={cn('flex items-center w-fit transition-colors bg-mart-primary/20 border-transparent', colorClasses, sizeClasses[size], className)}>
      <IconComponent className={iconSizeClasses[size]} />
      <span className="font-bold my-0 mt-1">{text.toUpperCase()}</span>
    </Badge>
  );
};

export default CustomBadge;
