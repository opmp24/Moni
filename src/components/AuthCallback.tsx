import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
    </div>
  )
}
