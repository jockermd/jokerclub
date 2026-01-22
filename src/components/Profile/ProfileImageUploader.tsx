
import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileImageUploaderProps {
  coverPreview: string | null;
  avatarPreview: string | null;
  onCoverClick: () => void;
  onAvatarClick: () => void;
  fullName?: string | null;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  coverPreview,
  avatarPreview,
  onCoverClick,
  onAvatarClick,
  fullName,
}) => {
  return (
    <div className="space-y-2">
      <div 
        className="h-36 bg-mart-secondary/50 relative group cursor-pointer"
        onClick={onCoverClick}
      >
        {coverPreview && <img src={coverPreview} alt="Prévia da capa" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-8 h-8" />
        </div>
      </div>
      <div className="relative h-12">
        <div 
          className="absolute -bottom-12 left-4 w-24 h-24 rounded-full bg-mart-secondary group cursor-pointer border-4 border-mart-dark"
          onClick={onAvatarClick}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Prévia do avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold">{fullName?.charAt(0)}</div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
