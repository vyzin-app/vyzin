import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Visitantes } from '@/app/modules/visitantes/components/Visitantes'

export default function VisitantesPage() {
  const location = useLocation()
  const [openNewModal, setOpenNewModal] = useState(false)

  useEffect(() => {
    const state = location.state as { openNewModal?: boolean } | null
    if (state?.openNewModal) {
      setOpenNewModal(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  return (
    <Visitantes
      openNewModal={openNewModal}
      onCloseNewModal={() => setOpenNewModal(false)}
    />
  )
}
