
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from '@/components/ui/sonner'
import { useEffect } from 'react'

function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (offlineReady) {
      toast.success('O app está pronto para ser usado offline.')
      setOfflineReady(false)
    }
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (needRefresh) {
      const toastId = toast.info('Uma nova atualização está disponível.', {
        action: {
          label: 'Atualizar',
          onClick: () => {
            updateServiceWorker(true)
          },
        },
        cancel: {
            label: 'Agora não',
            onClick: () => {
                setNeedRefresh(false);
            }
        },
        duration: Infinity,
        onDismiss: () => {
          setNeedRefresh(false)
        },
        onAutoClose: () => {
          setNeedRefresh(false)
        }
      });

      return () => {
        toast.dismiss(toastId);
      }
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker])

  return null
}

export default UpdatePrompt
