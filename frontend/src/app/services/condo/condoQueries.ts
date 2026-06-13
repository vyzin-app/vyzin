import { Visitor } from '../../domain/visitor'
import { Reservation } from '../../domain/reservation'

/**
 * Pure, side-effect-free helpers for the condo domain. Concentrating this logic
 * here keeps the React context thin and makes the rules independently testable
 * and reusable (Information Expert / High Cohesion).
 */

export function findLinkedVisitors(
  reservations: Reservation[],
  visitors: Visitor[],
  reservationId: string,
): Visitor[] {
  const reservation = reservations.find((item) => item.id === reservationId)
  if (!reservation) {
    return []
  }

  return reservation.linkedVisitorIds
    .map((id) => visitors.find((visitor) => visitor.id === id))
    .filter((visitor): visitor is Visitor => Boolean(visitor))
}

export function findReservationForVisitor(
  reservations: Reservation[],
  visitorId: string,
): Reservation | undefined {
  return reservations.find((reservation) =>
    reservation.linkedVisitorIds.includes(visitorId),
  )
}
