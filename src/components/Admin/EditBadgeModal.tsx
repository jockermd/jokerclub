
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/api/profiles';
import { Tables } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { badgeIcons, badgeColors, badgeColorPickerColors, BadgeDetails, BadgeIconName, BadgeColorName } from '@/lib/badgeOptions';
import CustomBadge from '@/components/common/CustomBadge';

interface EditBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Tables<'profiles'>;
  onSave: () => void;
}

const EditBadgeModal = ({ isOpen, onClose, profile, onSave }: EditBadgeModalProps) => {
  const [badgeText, setBadgeText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<BadgeIconName>('Star');
  const [selectedColor, setSelectedColor] = useState<BadgeColorName>('primary');
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile?.badge_details) {
      const details = profile.badge_details as unknown as BadgeDetails;
      setBadgeText(details.text || '');
      setSelectedIcon(details.icon || 'Star');
      setSelectedColor(details.color || 'primary');
    } else {
      setBadgeText('');
      setSelectedIcon('Star');
      setSelectedColor('primary');
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: ({ userId, badgeDetails }: { userId: string; badgeDetails: BadgeDetails }) =>
      updateProfile(userId, { badge_details: badgeDetails as unknown as any }),
    onSuccess: () => {
      toast.success('Badge atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      onSave();
      onClose();
    },
    onError: () => {
      toast.error('Erro ao atualizar badge.');
    },
  });

  const handleSave = () => {
    if (!badgeText.trim()) {
      toast.error('Por favor, insira um texto para a badge.');
      return;
    }

    const badgeDetails: BadgeDetails = {
      text: badgeText,
      icon: selectedIcon,
      color: selectedColor,
    };

    mutation.mutate({ userId: profile.id, badgeDetails });
  };

  const previewBadge: BadgeDetails = {
    text: badgeText || 'Preview',
    icon: selectedIcon,
    color: selectedColor,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-mart-dark-1 border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Badge - {profile.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-white">Preview da Badge</Label>
            <div className="flex justify-center p-3 bg-mart-dark-2 rounded-lg border border-white/10">
              <CustomBadge details={previewBadge} />
            </div>
          </div>

          {/* Texto da Badge */}
          <div className="space-y-2">
            <Label htmlFor="badgeText" className="text-white">Texto da Badge</Label>
            <Input
              id="badgeText"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Digite o texto da badge"
              className="bg-mart-dark-2 border-white/10 text-white"
            />
          </div>

          {/* Seletor de Ícone */}
          <div className="space-y-2">
            <Label className="text-white">Ícone</Label>
            <div className="grid grid-cols-6 gap-1.5 max-h-32 overflow-y-auto border border-white/10 rounded p-2 bg-mart-dark-2">
              {Object.entries(badgeIcons).map(([iconName, IconComponent]) => (
                <button
                  key={iconName}
                  onClick={() => setSelectedIcon(iconName as BadgeIconName)}
                  className={`p-2 rounded border transition-colors ${
                    selectedIcon === iconName
                      ? 'border-mart-primary bg-mart-primary/20'
                      : 'border-white/10 bg-mart-dark-1 hover:bg-mart-dark-1/80'
                  }`}
                  title={iconName}
                >
                  <IconComponent className="h-3 w-3 text-white mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Cor */}
          <div className="space-y-2">
            <Label className="text-white">Cor</Label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(badgeColorPickerColors).map(([colorName, colorClass]) => (
                <button
                  key={colorName}
                  onClick={() => setSelectedColor(colorName as BadgeColorName)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${colorClass} ${
                    selectedColor === colorName
                      ? 'border-white scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                  title={colorName}
                />
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="bg-mart-primary hover:bg-mart-primary/80"
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar Badge'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBadgeModal;
