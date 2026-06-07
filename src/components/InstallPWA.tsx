import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadSimple } from "@phosphor-icons/react"

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const installedHandler = () => setInstalled(true)

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installedHandler)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setInstalled(true)
      setDeferredPrompt(null)
    }
  }

  if (installed || !deferredPrompt) return null

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      className="gap-2 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <DownloadSimple className="h-4 w-4" />
      Instalar app
    </Button>
  )
}
