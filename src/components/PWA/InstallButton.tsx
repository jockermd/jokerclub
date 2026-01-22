
import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useBoolean } from '@/hooks/useBoolean';

const InstallButton = () => {
  const { canInstall, triggerInstall, isIOS } = usePWA();
  const [isIOSInfoOpen, { setTrue: openIOSInfo, setFalse: closeIOSInfo }] = useBoolean(false);

  const handleInstallClick = () => {
    if (isIOS) {
      openIOSInfo();
    } else if (canInstall) {
      triggerInstall();
    }
  };

  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className="fixed bottom-20 right-4 mars-button z-50 flex items-center gap-2"
        aria-label="Instalar Aplicativo"
      >
        <ArrowDownToLine className="h-5 w-5" />
        <span className="hidden sm:inline">Instalar App</span>
      </Button>

      <Dialog open={isIOSInfoOpen} onOpenChange={closeIOSInfo}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-white">Instalar Joker Club no seu iOS</DialogTitle>
            <DialogDescription className="text-white/80">
              Para instalar o aplicativo no seu iPhone ou iPad, siga estes passos:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4 text-sm text-white">
            <p>1. Toque no ícone de <strong>Compartilhar</strong> <Share className="inline-block h-4 w-4" /> na barra de menu do Safari.</p>
            <p>2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</p>
            <p>3. Toque em <strong>"Adicionar"</strong> no canto superior direito.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallButton;
