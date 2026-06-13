import { useState } from 'react'
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SPACES = [
  { id: 'salao', name: 'Salão de Festas', capacity: 80 },
  { id: 'churrasqueira1', name: 'Churrasqueira 1', capacity: 20 },
  { id: 'churrasqueira2', name: 'Churrasqueira 2', capacity: 20 },
  { id: 'quadra', name: 'Quadra Esportiva', capacity: 30 },
  { id: 'piscina', name: 'Área da Piscina', capacity: 40 },
]

// Block duration in hours per space name
const BLOCK_CONFIG: Record<string, number> = {
  'Salão de Festas': 5,
  'Churrasqueira 1': 5,
  'Churrasqueira 2': 5,
  'Quadra Esportiva': 1,
  'Área da Piscina': 1,
}

const OPEN_HOUR = 8 // 08:00
const CLOSE_HOUR = 22 // 22:00

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

// ─── Time-block helpers ───────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface TimeSlot {
  startTime: string
  endTime: string
  label: string
}

function getTimeSlots(spaceName: string): TimeSlot[] {
  const duration = BLOCK_CONFIG[spaceName] ?? 1
  const slots: TimeSlot[] = []
  for (let h = OPEN_HOUR; h + duration <= CLOSE_HOUR; h++) {
    const start = `${pad(h)}:00`
    const end = `${pad(h + duration)}:00`
    slots.push({ startTime: start, endTime: end, label: `${start} – ${end}` })
  }
  return slots
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

function slotsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const aS = timeToMinutes(aStart)
  const aE = timeToMinutes(aEnd)
  const bS = timeToMinutes(bStart)
  const bE = timeToMinutes(bEnd)
  return aS < bE && aE > bS
}

type SlotStatus = 'available' | 'reserved'

function getSlotStatus(
  slot: TimeSlot,
  space: string,
  date: string,
  reservations: Reservation[],
  editingId?: string,
): SlotStatus {
  const conflicts = reservations.filter(
    (r) =>
      r.space === space &&
      r.date === date &&
      r.status !== 'cancelled' &&
      r.id !== editingId &&
      slotsOverlap(slot.startTime, slot.endTime, r.startTime, r.endTime),
  )
  return conflicts.length > 0 ? 'reserved' : 'available'
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
  reservation: Reservation
}

function AddVisitorDialog({
  open,
  onClose,
  reservation,
}: AddVisitorDialogProps) {
  const { visitors, addVisitor, linkVisitorToReservation } = useCondoData()
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [search, setSearch] = useState('')
  const [newForm, setNewForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    purpose: '',
    notes: '',
  })

  const available = visitors.filter(
    (v) =>
      !reservation.linkedVisitorIds.includes(v.id) &&
      (v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.cpf.includes(search)),
  )

  async function handleSelectExisting(visitorId: string) {
    await linkVisitorToReservation(visitorId, reservation.id)
    onClose()
  }

  async function handleRegisterNew() {
    if (!newForm.name || !newForm.cpf) return
    const id = await addVisitor({
      name: newForm.name,
      cpf: newForm.cpf,
      phone: newForm.phone,
      email: newForm.email,
      purpose: newForm.purpose || display.reservation.guestPurpose,
      date: reservation.date,
      time: reservation.startTime,
      notes: newForm.notes,
      visitType: 'reservation',
      status: 'authorized',
      authorizedBy: display.reservation.linkedVia,
    })
    await linkVisitorToReservation(id, reservation.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {available.length === 0 ? (
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
                    onClick={() => handleSelectExisting(v.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
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
                onClick={handleRegisterNew}
                className="bg-primary hover:bg-primary/90"
                disabled={!newForm.name || !newForm.cpf}
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
  reservations: Reservation[]
  editingId?: string
  onSelect: (start: string, end: string) => void
}

function TimeBlockPicker({
  space,
  date,
  selectedStart,
  selectedEnd,
  reservations,
  editingId,
  onSelect,
}: TimeBlockPickerProps) {
  if (!space || !date) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/40 rounded-lg">
        Selecione um espaço e uma data para ver os horários disponíveis.
      </div>
    )
  }

  const slots = getTimeSlots(space)

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#10B981] inline-block" />
          Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />
          {display.reservation.reserved}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const status = getSlotStatus(
            slot,
            space,
            date,
            reservations,
            editingId,
          )
          const isSelected =
            slot.startTime === selectedStart && slot.endTime === selectedEnd
          const isReserved = status === 'reserved'

          let cls =
            'relative px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-center '
          if (isSelected) {
            cls += 'border-primary bg-primary text-white shadow-md scale-[1.02]'
          } else if (isReserved) {
            cls +=
              'border-orange-300 bg-orange-50 text-orange-600 cursor-not-allowed opacity-75'
          } else {
            cls +=
              'border-[#10B981]/40 bg-[#10B981]/5 text-[#10B981] hover:bg-[#10B981]/15 hover:border-[#10B981] cursor-pointer'
          }

          return (
            <button
              key={slot.label}
              type="button"
              disabled={isReserved}
              onClick={() =>
                !isReserved && onSelect(slot.startTime, slot.endTime)
              }
              className={cls}
            >
              {slot.label}
              {isReserved && (
                <span className="block text-xs font-normal text-orange-500 mt-0.5">
                  {display.reservation.reserved}
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
}

function ReservationCard({
  reservation: r,
  canEdit,
  onEdit,
  onDelete,
  onCancel,
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
                  {r.createdBy}
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
                            unlinkVisitorFromReservation(v.id, r.id)
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
    reservations,
    addReservation,
    updateReservation,
    deleteReservation,
  } = useCondoData()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'confirmed' | 'cancelled'
  >('all')
  const [isLocalFormDialogOpen, setIsLocalFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM)

  const isFormDialogOpen = openNewModal || isLocalFormDialogOpen

  const setIsFormDialogOpen = (open: boolean) => {
    if (!open && onCloseNewModal) {
      onCloseNewModal()
    }
    setIsLocalFormDialogOpen(open)
  }

  // Helper to check if a reservation belongs to the current user
  function isUserReservation(r: Reservation) {
    if (!user) return false
    return r.createdBy === user.id
  }

  // First filter by role (residents see only their own)
  const roleFiltered = reservations.filter((r) => {
    if (isResident) return isUserReservation(r)
    return true
  })

  // Then filter by status
  const statusFiltered = roleFiltered.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  })

  // Then filter by search query
  const filtered = statusFiltered.filter((r) => {
    const query = searchQuery.toLowerCase()
    if (isResident) {
      // Residents search within their own reservations
      return (
        r.space.toLowerCase().includes(query) ||
        r.createdBy.toLowerCase().includes(query)
      )
    }
    // Admin/doorman search by resident name, apartment, space
    return (
      r.space.toLowerCase().includes(query) ||
      r.createdBy.toLowerCase().includes(query)
    )
  })

  function canEditReservation(r: Reservation) {
    if (!permissions?.canManageReservations) return false
    if (isAdmin) return true
    if (isResident) return isUserReservation(r)
    return false
  }

  function handleCreate() {
    setEditingReservation(null)
    setForm(EMPTY_FORM)
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

  function handleSave() {
    if (editingReservation) {
      updateReservation(editingReservation.id, { ...form })
    } else {
      addReservation({
        ...form,
        status: 'confirmed',
        createdBy: user?.id ?? '',
        linkedVisitorIds: [],
      })
    }
    setIsFormDialogOpen(false)
  }

  function handleCancel(id: string) {
    updateReservation(id, { status: 'cancelled', linkedVisitorIds: [] })
  }

  function confirmDelete() {
    if (deletingId) {
      deleteReservation(deletingId)
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const isFormValid = form.space && form.date && form.startTime && form.endTime

  // Stats
  const stats = [
    {
      label: isResident ? display.reservation.myMany : 'Total',
      value: roleFiltered.length,
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Confirmadas',
      value: roleFiltered.filter((r) => r.status === 'confirmed').length,
      iconBg: 'bg-[#10B981]',
    },
    {
      label: 'Canceladas',
      value: roleFiltered.filter((r) => r.status === 'cancelled').length,
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
          {stats.map((stat) => (
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
          {filtered.length === 0 && (
            <Card className="p-12 text-center text-muted-foreground">
              {display.reservation.noneFound}
            </Card>
          )}
          {filtered.map((r) => (
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
                    {SPACES.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name} (até {s.capacity} pessoas)
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
                  value={form.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              {/* Time-block picker */}
              <div className="space-y-2">
                <Label>Horário *</Label>
                {form.space && (
                  <p className="text-xs text-muted-foreground">
                    Blocos de {BLOCK_CONFIG[form.space] ?? 1}h — clique em um
                    horário disponível
                  </p>
                )}
                <TimeBlockPicker
                  space={form.space}
                  date={form.date}
                  selectedStart={form.startTime}
                  selectedEnd={form.endTime}
                  reservations={reservations}
                  editingId={editingReservation?.id}
                  onSelect={(start, end) =>
                    setForm((f) => ({ ...f, startTime: start, endTime: end }))
                  }
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
