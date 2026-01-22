
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star } from 'lucide-react';
import { getConsultingCardSettings } from '@/api/consulting';

const Consulting = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['consultingCardSettings'],
    queryFn: getConsultingCardSettings,
  });

  const handleScheduleCall = () => {
    const buttonLink = settings?.button_link || 'https://wa.me/message/ZFVHTFMDYHBQJ1';
    window.open(buttonLink, '_blank');
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-mart-dark-1 hover:border-mart-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
            <div className="h-10 bg-white/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const consultantName = settings?.consultant_name || 'Joker Specialist';
  const consultantTitle = settings?.consultant_title || 'Especialista Senior';
  const consultantAvatar = settings?.consultant_avatar_url;
  const rating = settings?.rating || 5.0;
  const customBadgeText = settings?.custom_badge_text || 'Disponível';
  const skills = settings?.skills || ['React', 'Node.js', 'DevOps'];
  const availabilityText = settings?.availability_text;
  const buttonText = settings?.button_text || 'Agende uma chamada';

  return (
    <Card className="glass-card border-mart-dark-1 hover:border-mart-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-orbitron text-lg">Consultoria Especializada</CardTitle>
          <Badge variant="secondary" className="bg-mart-primary/20 text-mart-primary border-mart-primary/30">
            {customBadgeText}
          </Badge>
        </div>
        <CardDescription className="text-white/70">
          {availabilityText || 'Obtenha orientação personalizada com nossos especialistas'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mart-primary to-mart-secondary flex items-center justify-center overflow-hidden">
            {consultantAvatar ? (
              <img 
                src={consultantAvatar} 
                alt={consultantName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {consultantName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-medium">{consultantName}</p>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-white/70 text-xs">{rating} • {consultantTitle}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs border-mart-primary/30 text-mart-primary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleScheduleCall}
          className="mars-button w-full"
          size="sm"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Consulting;
