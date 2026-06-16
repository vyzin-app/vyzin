import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Reservations } from '@/app/modules/reservations/components/Reservas'

export default function ReservationsPage() {
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
    <Reservations
      openNewModal={openNewModal}
      onCloseNewModal={() => setOpenNewModal(false)}
    />
  )
}
