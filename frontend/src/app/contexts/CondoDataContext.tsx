import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import {
  reservationRepository,
  ReservationInput,
} from '../data/reservationRepository'
import { visitorRepository, VisitorInput } from '../data/visitorRepository'
import { Reservation, ReservationStatus } from '../domain/reservation'
import { Visitor, VisitType, VisitorStatus } from '../domain/visitor'
import {
  findLinkedVisitors,
  findReservationForVisitor,
} from '../services/condo/condoQueries'

// Re-exported so existing screens can keep importing these types from here.
export type { Visitor, VisitType, VisitorStatus, Reservation, ReservationStatus }

interface CondoDataContextType {
  visitors: Visitor[]
  reservations: Reservation[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>

  // Visitor operations
  addVisitor: (visitor: Omit<Visitor, 'id'>) => Promise<string>
  updateVisitor: (id: string, patch: Partial<Visitor>) => Promise<void>
  deleteVisitor: (id: string) => Promise<void>

  // Reservation operations
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<string>
  updateReservation: (id: string, patch: Partial<Reservation>) => Promise<void>
  deleteReservation: (id: string) => Promise<void>

  // Linking helpers (a reservation owns the linkedVisitorIds list)
  linkVisitorToReservation: (
    visitorId: string,
    reservationId: string,
    reservationSnapshot?: Reservation,
  ) => Promise<void>
  unlinkVisitorFromReservation: (
    visitorId: string,
    reservationId: string,
    reservationSnapshot?: Reservation,
  ) => Promise<void>
  getLinkedVisitors: (reservationId: string) => Visitor[]
  getReservationForVisitor: (visitorId: string) => Reservation | undefined
}

const CondoDataContext = createContext<CondoDataContextType | undefined>(
  undefined,
)

const VISITOR_CORE_KEYS: (keyof Visitor)[] = [
  'name',
  'cpf',
  'phone',
  'email',
  'purpose',
  'date',
  'time',
  'notes',
  'visitType',
]

function toVisitorInput(visitor: Visitor): VisitorInput {
  return {
    name: visitor.name,
    cpf: visitor.cpf,
    phone: visitor.phone,
    email: visitor.email,
    purpose: visitor.purpose,
    date: visitor.date,
    time: visitor.time,
    notes: visitor.notes,
    visitType: visitor.visitType,
    status: visitor.status,
    exitTime: visitor.exitTime,
  }
}

function toReservationInput(reservation: Reservation): ReservationInput {
  return {
    space: reservation.space,
    date: reservation.date,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    notes: reservation.notes,
    status: reservation.status,
    linkedVisitorIds: reservation.linkedVisitorIds ?? [],
  }
}

export function CondoDataProvider({ children }: { children: ReactNode }) {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshVisitors = useCallback(async () => {
    setVisitors(await visitorRepository.list())
  }, [])

  const refreshReservations = useCallback(async () => {
    setReservations(await reservationRepository.list())
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [fetchedVisitors, fetchedReservations] = await Promise.all([
        visitorRepository.list(),
        reservationRepository.list(),
      ])
      setVisitors(fetchedVisitors)
      setReservations(fetchedReservations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value: CondoDataContextType = {
    visitors,
    reservations,
    loading,
    error,
    refresh,

    addVisitor: async (visitor) => {
      const {
        authorizedBy: _authorizedBy,
        createdBy: _createdBy,
        createdByName: _createdByName,
        createdByDisplay: _createdByDisplay,
        authorizedByName: _authorizedByName,
        authorizedByDisplay: _authorizedByDisplay,
        ...rest
      } = visitor
      const id = await visitorRepository.create(rest)
      await refreshVisitors()
      return id
    },

    updateVisitor: async (id, patch) => {
      let existing = visitors.find((visitor) => visitor.id === id)
      if (!existing) {
        existing = await visitorRepository.get(id)
      }
      const touchesCore = VISITOR_CORE_KEYS.some((key) => key in patch)
      if (!touchesCore && patch.status) {
        await visitorRepository.updateStatus(
          id,
          patch.status,
          patch.exitTime ?? existing.exitTime,
        )
      } else {
        await visitorRepository.update(id, toVisitorInput({ ...existing, ...patch }))
      }
      await refreshVisitors()
    },

    deleteVisitor: async (id) => {
      await visitorRepository.remove(id)
      const linked = reservations.filter((reservation) =>
        reservation.linkedVisitorIds.includes(id),
      )
      await Promise.all(
        linked.map((reservation) =>
          reservationRepository.unlinkVisitor(reservation.id, id),
        ),
      )
      await refresh()
    },

    addReservation: async (reservation) => {
      const id = await reservationRepository.create(
        toReservationInput(reservation as Reservation),
      )
      await refreshReservations()
      return id
    },

    updateReservation: async (id, patch) => {
      let existing = reservations.find((reservation) => reservation.id === id)
      if (!existing) {
        existing = await reservationRepository.get(id)
      }
      await reservationRepository.update(
        id,
        toReservationInput({ ...existing, ...patch }),
      )
      await refreshReservations()
    },

    deleteReservation: async (id) => {
      await reservationRepository.remove(id)
      await refreshReservations()
    },

    linkVisitorToReservation: async (
      visitorId,
      reservationId,
      _reservationSnapshot,
    ) => {
      await reservationRepository.linkVisitor(reservationId, visitorId)
      await refresh()
    },

    unlinkVisitorFromReservation: async (
      visitorId,
      reservationId,
      _reservationSnapshot,
    ) => {
      await reservationRepository.unlinkVisitor(reservationId, visitorId)
      await refresh()
    },

    getLinkedVisitors: (reservationId) =>
      findLinkedVisitors(reservations, visitors, reservationId),

    getReservationForVisitor: (visitorId) =>
      findReservationForVisitor(reservations, visitorId),
  }

  return (
    <CondoDataContext.Provider value={value}>
      {children}
    </CondoDataContext.Provider>
  )
}

export function useCondoData() {
  const context = useContext(CondoDataContext)
  if (!context) {
    throw new Error('useCondoData must be used within a CondoDataProvider')
  }
  return context
}
