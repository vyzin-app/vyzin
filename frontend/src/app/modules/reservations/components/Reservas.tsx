import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  UserPlus,
  Link2,
  X,
  UserX,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'
import { getUserPermissions } from '@/app/utils/permissions'
import { display } from '@/app/utils/displayLabels'
import {
  useCondoData,
  Visitor,
  Reservation,
} from '@/app/contexts/CondoDataContext'
import { reservationRepository } from '@/app/data/reservationRepository'
import { visitorRepository } from '@/app/data/visitorRepository'
import { AvailableSlot } from '@/app/domain/reservation'
import { ReservationSpace } from '@/app/domain/reservationSpace'
import { todayISO } from '@/app/utils/dates'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Reservation['status'],
  { label: string; className: string }
> = {
  confirmed: {
    label: 'Confirmado',
    className: 'bg-success/10 text-success border-success/20',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateBR(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

// ─── Add-Visitor Dialog ───────────────────────────────────────────────────────

interface AddVisitorDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  reservation: Reservation
}

function AddVisitorDialog({
  open,
  onClose,
  onSuccess,
  reservation,
}: AddVisitorDialogProps) {
  const { addVisitor, linkVisitorToReservation } = useCondoData()
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [search, setSearch] = useState('')
  const [available, setAvailable] = useState<Visitor[]>([])
  const [loadingVisitors, setLoadingVisitors] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    purpose: '',
    notes: '',
  })

  useEffect(() => {
    if (!open) {
      setTab('existing')
      setSearch('')
      setLinkError(null)
      setNewForm({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        purpose: '',
        notes: '',
      })
    }
  }, [open])

  useEffect(() => {
    if (!open || tab !== 'existing') {
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoadingVisitors(true)
      try {
        const results = await visitorRepository.list({
          search: search || undefined,
        })
        if (!cancelled) {
          setAvailable(
            results.filter(
              (visitor) =>
                !(reservation.linkedVisitorIds ?? []).includes(visitor.id),
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setLoadingVisitors(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, tab, search, reservation.linkedVisitorIds])

  async function handleSelectExisting(visitorId: string) {
    setLinking(true)
    setLinkError(null)
    try {
      await linkVisitorToReservation(visitorId, reservation.id, reservation)
      onSuccess?.()
      onClose()
    } catch (err) {
      setLinkError(
        err instanceof Error
          ? err.message
          : 'Nao foi possivel vincular o visitante.',
      )
    } finally {
      setLinking(false)
    }
  }

  async function handleRegisterNew() {
    if (!newForm.name || !newForm.cpf) return
    setLinking(true)
    setLinkError(null)
    try {
      const id = await addVisitor({
        name: newForm.name,
        cpf: newForm.cpf,
        phone: newForm.phone,
        email: newForm.email,
        purpose: newForm.purpose || display.reservation.guestPurpose,
        date: reservation.date,
        time: reservation.startTime || '00:00',
        notes: newForm.notes,
        visitType: 'reservation',
        status: 'authorized',
        authorizedBy: '',
      })
      await linkVisitorToReservation(id, reservation.id, reservation)
      onSuccess?.()
      onClose()
    } catch (err) {
      setLinkError(
        err instanceof Error
          ? err.message
          : 'Nao foi possivel cadastrar e vincular o visitante.',
      )
    } finally {
      setLinking(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            {display.reservation.addVisitor}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {reservation.space} — {formatDateBR(reservation.date)}
          </p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="existing">Visitante Existente</TabsTrigger>
            <TabsTrigger value="new">Cadastrar Novo</TabsTrigger>
          </TabsList>

          {/* ── Select existing ── */}
          <TabsContent value="existing" className="space-y-3 mt-4">
            {linkError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {linkError}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingVisitors ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Buscando visitantes...
              </div>
            ) : available.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {search
                  ? 'Nenhum visitante encontrado para essa busca.'
                  : 'Todos os visitantes cadastrados já estão vinculados.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {available.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={linking}
                    onClick={() => void handleSelectExisting(v.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.cpf}</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Register new ── */}
          <TabsContent value="new" className="space-y-4 mt-4">
            {linkError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {linkError}
              </div>
            )}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
              {display.reservation.guestRegisteredAs}
              automaticamente.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm({ ...newForm, name: e.target.value })
                  }
                  placeholder="Nome do visitante"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={newForm.cpf}
                  onChange={(e) =>
                    setNewForm({ ...newForm, cpf: formatCPF(e.target.value) })
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={newForm.phone}
                  onChange={(e) =>
                    setNewForm({
                      ...newForm,
                      phone: formatPhone(e.target.value),
                    })
                  }
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={newForm.email}
                  onChange={(e) =>
                    setNewForm({ ...newForm, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Observações</Label>
                <Input
                  value={newForm.notes}
                  onChange={(e) =>
                    setNewForm({ ...newForm, notes: e.target.value })
                  }
                  placeholder="Informações adicionais (opcional)"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => void handleRegisterNew()}
                className="bg-primary hover:bg-primary/90"
                disabled={!newForm.name || !newForm.cpf || linking}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar e Vincular
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>

        {tab === 'existing' && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Time-Block Picker ────────────────────────────────────────────────────────

interface TimeBlockPickerProps {
  space: string
  date: string
  selectedStart: string
  selectedEnd: string
  editingId?: string
  onSelect: (start: string, end: string) => void
  onClearSelection?: () => void
}

function TimeBlockPicker({
  space,
  date,
  selectedStart,
  selectedEnd,
  editingId,
  onSelect,
  onClearSelection,
}: TimeBlockPickerProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!space || !date) {
      setSlots([])
      setError(null)
      return
    }

    let cancelled = false

    async function loadSlots() {
      setLoading(true)
      setError(null)
      try {
        const schedule = await reservationRepository.getAvailableSlots(
          space,
          date,
          editingId,
        )
        if (cancelled) return

        // When the chosen date is today, also block time slots that already
        // started — the backend rejects them, so reflect that in the UI.
        const now = new Date()
        const today = todayISO()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const adjusted =
          date === today
            ? schedule.map((slot) => ({
                ...slot,
                available:
                  slot.available &&
                  Number(slot.startTime.slice(0, 2)) * 60 +
                    Number(slot.startTime.slice(3, 5)) >
                    nowMinutes,
              }))
            : schedule
        setSlots(adjusted)

        const selectionStillValid = adjusted.some(
          (slot) =>
            slot.available &&
            slot.startTime === selectedStart &&
            slot.endTime === selectedEnd,
        )
        if (selectedStart && selectedEnd && !selectionStillValid) {
          onClearSelection?.()
        }
      } catch (err) {
        if (cancelled) return
        setSlots([])
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os horários.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSlots()

    return () => {
      cancelled = true
    }
  }, [space, date, editingId, selectedStart, selectedEnd, onClearSelection])

  if (!space || !date) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/40 rounded-lg">
        Selecione um espaço e uma data para ver os horários disponíveis.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/40 rounded-lg">
        Carregando horários disponíveis...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/40 rounded-lg">
        Nenhum horário configurado para este espaço.
      </div>
    )
  }

  const availableCount = slots.filter((slot) => slot.available).length

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {display.reservation.slotsAvailableCount(availableCount, slots.length)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected =
            slot.available &&
            slot.startTime === selectedStart &&
            slot.endTime === selectedEnd

          return (
            <button
              key={slot.label}
              type="button"
              disabled={!slot.available}
              title={
                slot.available
                  ? undefined
                  : display.reservation.slotAlreadyReserved
              }
              onClick={() => {
                if (slot.available) {
                  onSelect(slot.startTime, slot.endTime)
                }
              }}
              className={
                !slot.available
                  ? 'relative px-3 py-2.5 rounded-lg border-2 text-sm font-medium text-center border-border bg-muted/60 text-muted-foreground cursor-not-allowed opacity-70'
                  : isSelected
                    ? 'relative px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-center border-primary bg-primary text-white shadow-md scale-[1.02]'
                    : 'relative px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-center border-[#10B981]/40 bg-[#10B981]/5 text-[#10B981] hover:bg-[#10B981]/15 hover:border-[#10B981] cursor-pointer'
              }
            >
              <span>{slot.label}</span>
              {!slot.available && (
                <span className="block text-[10px] font-normal mt-0.5 leading-tight">
                  {display.reservation.slotAlreadyReserved}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Reservation Card ─────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
  onVisitorsChanged?: () => void
}

function ReservationCard({
  reservation: r,
  canEdit,
  onEdit,
  onDelete,
  onCancel,
  onVisitorsChanged,
}: ReservationCardProps) {
  const { getLinkedVisitors, unlinkVisitorFromReservation } = useCondoData()
  const [visitorsExpanded, setVisitorsExpanded] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const linkedVisitors = getLinkedVisitors(r.id)
  const sc = STATUS_CONFIG[r.status]
  const isCancelled = r.status === 'cancelled'

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-lg transition-shadow ${isCancelled ? 'opacity-60' : ''}`}
      >
        {/* Top section */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg">{r.space}</h3>
                  <Badge className={sc.className}>{sc.label}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                    {formatDateBR(r.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    {r.startTime} – {r.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    {linkedVisitors.length}{' '}
                    {linkedVisitors.length === 1 ? 'convidado' : 'convidados'}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Solicitante:</span>{' '}
                  {r.createdByDisplay ??
                    r.createdByName ??
                    r.createdByEmail ??
                    '—'}
                </div>
                {r.notes && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Obs:</span> {r.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {canEdit && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={isCancelled}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {r.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 hover:bg-orange-50"
                    onClick={onCancel}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Linked Visitors section ── */}
        <div className="border-t border-border">
          <button
            className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-secondary/50 transition-colors"
            onClick={() => setVisitorsExpanded((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>Visitantes Vinculados</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 h-5 px-2">
                {linkedVisitors.length}
              </Badge>
            </div>
            {visitorsExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {visitorsExpanded && (
            <div className="px-6 pb-4 space-y-3">
              {/* Summary strip */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Visitantes',
                    value: linkedVisitors.length,
                    color: 'text-primary bg-primary/5 border-primary/20',
                  },
                  {
                    label: 'Espaço',
                    value: r.space.split(' ')[0],
                    color: 'text-foreground bg-secondary/50 border-border',
                  },
                  {
                    label: 'Data',
                    value: formatDateBR(r.date),
                    color: 'text-foreground bg-secondary/50 border-border',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-2.5 text-center ${item.color}`}
                  >
                    <p className="font-semibold text-sm">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Visitor list */}
              {linkedVisitors.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <UserX className="w-4 h-4" />
                  <span>{display.reservation.noLinkedVisitors}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedVisitors.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 px-3 py-2.5 bg-secondary/40 rounded-lg group"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.cpf}</p>
                      </div>
                      {!isCancelled && canEdit && (
                        <button
                          onClick={() =>
                            void unlinkVisitorFromReservation(v.id, r.id, r).then(
                              () => onVisitorsChanged?.(),
                            )
                          }
                          title="Remover vínculo"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50 hover:text-red-600 text-muted-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cancelled notice */}
              {isCancelled ? (
                <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/40 rounded-lg">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {display.reservation.cancelledNotice}
                  </span>
                </div>
              ) : (
                !isCancelled && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Visitante
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </Card>

      <AddVisitorDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={onVisitorsChanged}
        reservation={r}
      />
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ReservationForm = {
  space: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

const EMPTY_FORM: ReservationForm = {
  space: '',
  date: '',
  startTime: '',
  endTime: '',
  notes: '',
}

export function Reservations({
  openNewModal,
  onCloseNewModal,
}: {
  openNewModal?: boolean
  onCloseNewModal?: () => void
}) {
  const { user, functions } = useAuth()
  const permissions = user ? getUserPermissions(functions) : null
  const isAdmin = user?.role === 'admin'
  const isResident = user?.role === 'resident'
  const isDoorman = user?.role === 'doorman'

  const {
    addReservation,
    updateReservation,
    deleteReservation,
  } = useCondoData()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'confirmed' | 'cancelled'
  >('all')
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
  })
  const [isLocalFormDialogOpen, setIsLocalFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [spaces, setSpaces] = useState<ReservationSpace[]>([])

  const blockHoursBySpace = useMemo(
    () =>
      Object.fromEntries(spaces.map((space) => [space.name, space.blockHours])),
    [spaces],
  )

  const clearTimeSelection = useCallback(() => {
    setForm((current) => ({ ...current, startTime: '', endTime: '' }))
  }, [])

  const isFormDialogOpen = openNewModal || isLocalFormDialogOpen

  const setIsFormDialogOpen = (open: boolean) => {
    if (!open && onCloseNewModal) {
      onCloseNewModal()
    }
    setIsLocalFormDialogOpen(open)
  }

  const listFilter = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      status:
        statusFilter === 'all'
          ? undefined
          : (statusFilter as Reservation['status']),
    }),
    [searchQuery, statusFilter],
  )

  const loadReservations = useCallback(async () => {
    setListLoading(true)
    try {
      const data = await reservationRepository.list(listFilter)
      setReservations(data)
    } finally {
      setListLoading(false)
    }
  }, [listFilter])

  const loadStats = useCallback(async () => {
    const search = searchQuery.trim() || undefined
    const [all, confirmed, cancelled] = await Promise.all([
      reservationRepository.list({ search }),
      reservationRepository.list({ search, status: 'confirmed' }),
      reservationRepository.list({ search, status: 'cancelled' }),
    ])
    setStats({
      total: all.length,
      confirmed: confirmed.length,
      cancelled: cancelled.length,
    })
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadReservations()
      void loadStats()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadReservations, loadStats])

  useEffect(() => {
    void reservationRepository.listSpaces().then(setSpaces)
  }, [])

  const refreshList = useCallback(async () => {
    await Promise.all([loadReservations(), loadStats()])
  }, [loadReservations, loadStats])

  // Helper to check if a reservation belongs to the current user
  function isUserReservation(r: Reservation) {
    if (!user) return false
    return r.createdBy === user.id
  }

  function canEditReservation(r: Reservation) {
    if (!permissions?.canManageReservations) return false
    if (isAdmin) return true
    if (isResident) return isUserReservation(r)
    return false
  }

  function handleCreate() {
    setEditingReservation(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setIsFormDialogOpen(true)
  }

  function handleEdit(r: Reservation) {
    setEditingReservation(r)
    setForm({
      space: r.space,
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      notes: r.notes,
    })
    setFormError(null)
    setIsFormDialogOpen(true)
  }

  // When space changes, clear the selected slot
  function handleSpaceChange(space: string) {
    setForm((f) => ({ ...f, space, startTime: '', endTime: '' }))
  }

  // When date changes, clear the selected slot
  function handleDateChange(date: string) {
    setForm((f) => ({ ...f, date, startTime: '', endTime: '' }))
  }

  async function handleSave() {
    setFormError(null)
    try {
      if (editingReservation) {
        await updateReservation(editingReservation.id, { ...form })
      } else {
        await addReservation({
          ...form,
          status: 'confirmed',
          createdBy: user?.id ?? '',
          linkedVisitorIds: [],
        })
      }
      setIsFormDialogOpen(false)
      await refreshList()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Erro ao salvar reserva.',
      )
    }
  }

  function handleCancel(id: string) {
    updateReservation(id, { status: 'cancelled' }).then(() => refreshList())
  }

  function confirmDelete() {
    if (deletingId) {
      deleteReservation(deletingId).then(() => refreshList())
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const isFormValid = form.space && form.date && form.startTime && form.endTime

  const statsCards = [
    {
      label: isResident ? display.reservation.myMany : 'Total',
      value: stats.total,
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Confirmadas',
      value: stats.confirmed,
      iconBg: 'bg-[#10B981]',
    },
    {
      label: 'Canceladas',
      value: stats.cancelled,
      iconBg: 'bg-red-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="w-7 h-7 text-primary" />
              {display.reservation.many}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isResident
                ? display.reservation.manageOwn
                : display.reservation.manageAll}
            </p>
          </div>
          {(isAdmin || isResident) && (
            <Button
              onClick={handleCreate}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {display.reservation.new}
            </Button>
          )}
        </div>

        {/* Stats — standardized to match main Dashboard pattern */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsCards.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                </div>
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                isResident
                  ? 'Buscar por espaço...'
                  : 'Buscar por espaço ou solicitante...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reservation cards */}
        <div className="space-y-4">
          {listLoading && (
            <Card className="p-12 text-center text-muted-foreground">
              Carregando reservas...
            </Card>
          )}
          {!listLoading && reservations.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              {display.reservation.noneFound}
            </Card>
          )}
          {!listLoading &&
            reservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                canEdit={canEditReservation(r)}
                onEdit={() => handleEdit(r)}
                onDelete={() => {
                  setDeletingId(r.id)
                  setIsDeleteDialogOpen(true)
                }}
                onCancel={() => handleCancel(r.id)}
                onVisitorsChanged={() => void refreshList()}
              />
            ))}
        </div>

        {/* Reservation Rules */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">{display.reservation.rules}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {[
              'Horário de funcionamento: 08:00 às 22:00',
              'Quadra Esportiva e Área da Piscina: blocos de 1 hora',
              'Salão de Festas e Churrasqueiras: blocos de 5 horas',
              display.reservation.ruleAdvance48h,
              'Cancelamentos devem ser feitos com 24h de antecedência',
              display.reservation.ruleUnlinkOnCancel,
            ].map((rule, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Create / Edit form dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReservation
                  ? display.reservation.edit
                  : display.reservation.new}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Space selector */}
              <div className="space-y-2">
                <Label>Espaço *</Label>
                <Select value={form.space} onValueChange={handleSpaceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    {spaces.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name} (blocos de {s.blockHours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date picker */}
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  min={todayISO()}
                  value={form.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              {/* Time-block picker */}
              <div className="space-y-2">
                <Label>Horário *</Label>
                {form.space && (
                  <p className="text-xs text-muted-foreground">
                    Blocos de {blockHoursBySpace[form.space] ?? 1}h — clique em um
                    horário disponível
                  </p>
                )}
                <TimeBlockPicker
                  space={form.space}
                  date={form.date}
                  selectedStart={form.startTime}
                  selectedEnd={form.endTime}
                  editingId={editingReservation?.id}
                  onSelect={(start, end) =>
                    setForm((f) => ({ ...f, startTime: start, endTime: end }))
                  }
                  onClearSelection={clearTimeSelection}
                />
                {form.startTime && form.endTime && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Selecionado:{' '}
                      <strong>
                        {form.startTime} – {form.endTime}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Informações adicionais (opcional)"
                />
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2 text-sm text-primary">
                <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {display.reservation.linkedCountHint}
                </span>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {formError}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsFormDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
                disabled={!isFormValid}
              >
                {editingReservation
                  ? 'Salvar Alterações'
                  : display.reservation.create}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                {display.reservation.deleteConfirm}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
