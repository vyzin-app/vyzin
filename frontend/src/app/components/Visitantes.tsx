import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  UserPlus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Link2,
  Home,
  CalendarDays,
} from 'lucide-react'
import { useCondoData, Visitor, VisitType } from '../contexts/CondoDataContext'
import { useAuth } from '../contexts/AuthContext'
import { getUserPermissions } from '../utils/permissions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDateBR(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const statusConfig: Record<
  Visitor['status'],
  { label: string; className: string; Icon: typeof CheckCircle }
> = {
  authorized: {
    label: 'Autorizado',
    className: 'bg-success/10 text-success border-success/20',
    Icon: CheckCircle,
  },
  waiting: {
    label: 'Aguardando',
    className: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Icon: Clock,
  },
  exited: {
    label: 'Saiu',
    className: 'bg-muted text-muted-foreground border-border',
    Icon: XCircle,
  },
  denied: {
    label: 'Negado',
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
    Icon: XCircle,
  },
}

const visitTypeConfig: Record<
  VisitType,
  { label: string; Icon: typeof Home; className: string }
> = {
  apartment: {
    label: 'Visita ao Apartamento',
    Icon: Home,
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  reservation: {
    label: 'Convidado de Reservation',
    Icon: CalendarDays,
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
}

// ─── Blank form ───────────────────────────────────────────────────────────────

type VisitorForm = {
  name: string
  cpf: string
  phone: string
  email: string
  purpose: string
  date: string
  time: string
  notes: string
  visitType: VisitType
  linkedReservationId: string
}

const EMPTY_FORM: VisitorForm = {
  name: '',
  cpf: '',
  phone: '',
  email: '',
  purpose: '',
  date: '',
  time: '',
  notes: '',
  visitType: 'apartment',
  linkedReservationId: '',
}

// ─── Pre-authorised (local only – not part of shared context) ─────────────────

interface PreAuthorized {
  id: string
  name: string
  cpf: string
  schedule: string
  validUntil: string
  active: boolean
}

const SEED_PRE_AUTH: PreAuthorized[] = [
  {
    id: 'pa1',
    name: 'Diarista - Joana Souza',
    cpf: '123.987.456-78',
    schedule: 'Toda segunda-feira, 08:00',
    validUntil: '2026-06-30',
    active: true,
  },
  {
    id: 'pa2',
    name: 'Personal Trainer - Lucas Martins',
    cpf: '789.456.123-90',
    schedule: 'Terça e quinta, 18:00',
    validUntil: '2026-05-15',
    active: true,
  },
  {
    id: 'pa3',
    name: 'Avó - Dona Maria',
    cpf: '321.654.987-00',
    schedule: 'Livre acesso',
    validUntil: '2026-12-31',
    active: true,
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Visitantes({
  openNewModal,
  onCloseNewModal,
}: {
  openNewModal?: boolean
  onCloseNewModal?: () => void
}) {
  const {
    visitors,
    reservations,
    addVisitor,
    updateVisitor,
    deleteVisitor,
    linkVisitorToReservation,
    getReservationForVisitor,
  } = useCondoData()

  const { functions } = useAuth()
  const permissions = getUserPermissions(functions)
  const canManageVisitors = permissions.canManageVisitors
  const canVisitorWorkflow = permissions.canVisitorWorkflow

  const [activeTab, setActiveTab] = useState<'today' | 'preauthorized'>('today')
  const [searchQuery, setSearchQuery] = useState('')

  // Visitor dialog
  const [isLocalDialogOpen, setIsLocalDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<VisitorForm>(EMPTY_FORM)

  const isDialogOpen = openNewModal || isLocalDialogOpen

  const setIsDialogOpen = (open: boolean) => {
    if (!open && onCloseNewModal) {
      onCloseNewModal()
    }
    setIsLocalDialogOpen(open)
  }

  // Pre-authorised dialog
  const [preAuthorized, setPreAuthorized] =
    useState<PreAuthorized[]>(SEED_PRE_AUTH)
  const [isPreAuthOpen, setIsPreAuthOpen] = useState(false)
  const [isPreAuthDeleteOpen, setIsPreAuthDeleteOpen] = useState(false)
  const [editingPreAuth, setEditingPreAuth] = useState<PreAuthorized | null>(
    null,
  )
  const [deletingPreAuthId, setDeletingPreAuthId] = useState<string | null>(
    null,
  )
  const [preAuthForm, setPreAuthForm] = useState({
    name: '',
    cpf: '',
    schedule: '',
    validUntil: '',
  })

  // ── Filtered list ──
  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.cpf.includes(searchQuery) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // ── Visitor CRUD ──
  function openCreate() {
    setEditingVisitor(null)
    setForm(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  function openEdit(v: Visitor) {
    const linked = getReservationForVisitor(v.id)
    setEditingVisitor(v)
    setForm({
      name: v.name,
      cpf: v.cpf,
      phone: v.phone,
      email: v.email,
      purpose: v.purpose,
      date: v.date,
      time: v.time,
      notes: v.notes,
      visitType: v.visitType,
      linkedReservationId: linked?.id ?? '',
    })
    setIsDialogOpen(true)
  }

  async function saveVisitor() {
    const payload: Omit<Visitor, 'id'> = {
      name: form.name,
      cpf: form.cpf,
      phone: form.phone,
      email: form.email,
      purpose: form.purpose,
      date: form.date,
      time: form.time,
      notes: form.notes,
      visitType: form.visitType,
      status: editingVisitor?.status ?? 'waiting',
      authorizedBy: editingVisitor?.authorizedBy ?? 'Aguardando autorização',
      exitTime: editingVisitor?.exitTime,
    }

    if (editingVisitor) {
      await updateVisitor(editingVisitor.id, payload)
      if (form.visitType === 'reservation' && form.linkedReservationId) {
        await linkVisitorToReservation(
          editingVisitor.id,
          form.linkedReservationId,
        )
      }
    } else {
      const newId = await addVisitor(payload)
      if (form.visitType === 'reservation' && form.linkedReservationId) {
        await linkVisitorToReservation(newId, form.linkedReservationId)
      }
    }
    setIsDialogOpen(false)
  }

  function confirmDelete() {
    if (deletingId) {
      deleteVisitor(deletingId)
      setDeletingId(null)
      setIsDeleteOpen(false)
    }
  }

  function authorizeVisitor(id: string) {
    updateVisitor(id, { status: 'authorized', authorizedBy: 'Portaria' })
  }
  function denyVisitor(id: string) {
    updateVisitor(id, { status: 'denied' })
  }
  function registerExit(id: string) {
    const now = new Date()
    updateVisitor(id, {
      status: 'exited',
      exitTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    })
  }

  // ── Pre-auth CRUD ──
  function openCreatePreAuth() {
    setEditingPreAuth(null)
    setPreAuthForm({ name: '', cpf: '', schedule: '', validUntil: '' })
    setIsPreAuthOpen(true)
  }
  function openEditPreAuth(pa: PreAuthorized) {
    setEditingPreAuth(pa)
    setPreAuthForm({
      name: pa.name,
      cpf: pa.cpf,
      schedule: pa.schedule,
      validUntil: pa.validUntil,
    })
    setIsPreAuthOpen(true)
  }
  function savePreAuth() {
    if (editingPreAuth) {
      setPreAuthorized((prev) =>
        prev.map((pa) =>
          pa.id === editingPreAuth.id ? { ...pa, ...preAuthForm } : pa,
        ),
      )
    } else {
      setPreAuthorized((prev) => [
        ...prev,
        { id: `pa${Date.now()}`, ...preAuthForm, active: true },
      ])
    }
    setIsPreAuthOpen(false)
  }
  function confirmDeletePreAuth() {
    if (deletingPreAuthId) {
      setPreAuthorized((prev) =>
        prev.filter((pa) => pa.id !== deletingPreAuthId),
      )
      setDeletingPreAuthId(null)
      setIsPreAuthDeleteOpen(false)
    }
  }

  const isFormValid = form.name && form.cpf && form.purpose

  // ── Render ──
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Visitantes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie visitantes e controle de acesso
            </p>
          </div>
          {canManageVisitors && (
            <Button
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Visitante
            </Button>
          )}
        </div>

        {/* Stats — standardized to match main Dashboard pattern */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total hoje',
              value: visitors.length,
              iconBg: 'bg-blue-500',
            },
            {
              label: 'Autorizados',
              value: visitors.filter((v) => v.status === 'authorized').length,
              iconBg: 'bg-[#10B981]',
            },
            {
              label: 'Aguardando',
              value: visitors.filter((v) => v.status === 'waiting').length,
              iconBg: 'bg-orange-500',
            },
            {
              label: 'Pré-autorizados',
              value: preAuthorized.filter((v) => v.active).length,
              iconBg: 'bg-purple-500',
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-semibold mt-1">{s.value}</h3>
                </div>
                <div
                  className={`w-12 h-12 ${s.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(
            [
              ['today', `Visitantes (${visitors.length})`],
              ['preauthorized', `Pré-Autorizados (${preAuthorized.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Visitors tab ── */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar visitante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filtered.length === 0 && (
              <Card className="p-12 text-center text-muted-foreground">
                Nenhum visitante encontrado.
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((visitor) => {
                const sc = statusConfig[visitor.status]
                const tc = visitTypeConfig[visitor.visitType]
                const StatusIcon = sc.Icon
                const TypeIcon = tc.Icon
                const linkedRes = getReservationForVisitor(visitor.id)

                return (
                  <Card
                    key={visitor.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{visitor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {visitor.cpf}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={sc.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {sc.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${tc.className}`}
                        >
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {tc.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        {visitor.purpose}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {formatDateBR(visitor.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        Entrada: {visitor.time || '—'}
                        {visitor.exitTime && (
                          <span>• Saída: {visitor.exitTime}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        {visitor.authorizedBy}
                      </div>
                    </div>

                    {/* Reservation link badge */}
                    {linkedRes && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm text-purple-700">
                        <Link2 className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Vinculado a: <strong>{linkedRes.space}</strong> —{' '}
                          {formatDateBR(linkedRes.date)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
                      {canVisitorWorkflow && visitor.status === 'waiting' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 bg-success hover:bg-success/90 text-white"
                            onClick={() => authorizeVisitor(visitor.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Autorizar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:bg-red-50"
                            onClick={() => denyVisitor(visitor.id)}
                          >
                            Recusar
                          </Button>
                        </>
                      )}
                      {canVisitorWorkflow && visitor.status === 'authorized' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => registerExit(visitor.id)}
                        >
                          Registrar Saída
                        </Button>
                      )}
                      {canManageVisitors && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(visitor)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDeletingId(visitor.id)
                              setIsDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Pre-authorised tab ── */}
        {activeTab === 'preauthorized' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Visitantes com autorização permanente ou recorrente
              </p>
              <Button
                onClick={openCreatePreAuth}
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {preAuthorized.length === 0 && (
              <Card className="p-12 text-center text-muted-foreground">
                Nenhum pré-autorizado cadastrado.
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {preAuthorized.map((pa) => (
                <Card
                  key={pa.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{pa.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pa.cpf}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        pa.active
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {pa.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      {pa.schedule}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      Válido até: {formatDateBR(pa.validUntil)}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEditPreAuth(pa)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setDeletingPreAuthId(pa.id)
                        setIsPreAuthDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Visitor Create/Edit Dialog ── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisitor ? 'Editar Visitante' : 'Novo Visitante'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nome do visitante"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input
                    value={form.cpf}
                    onChange={(e) =>
                      setForm({ ...form, cpf: formatCPF(e.target.value) })
                    }
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: formatPhone(e.target.value) })
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Motivo da Visita *</Label>
                  <Input
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    placeholder="Ex: Visita familiar, entrega..."
                  />
                </div>

                {/* Visit Type */}
                <div className="space-y-2 col-span-2">
                  <Label>Tipo de Visita *</Label>
                  <Select
                    value={form.visitType}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        visitType: v as VisitType,
                        linkedReservationId: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Visita ao Apartamento
                        </div>
                      </SelectItem>
                      <SelectItem value="reservation">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          Convidado de Reservation
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reservation picker — only when visitType=reservation */}
                {form.visitType === 'reservation' && (
                  <div className="space-y-2 col-span-2">
                    <Label>Vincular à Reservation</Label>
                    {reservations.filter((r) => r.status !== 'cancelled')
                      .length === 0 ? (
                      <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-lg">
                        Nenhuma reservation ativa disponível.
                      </p>
                    ) : (
                      <Select
                        value={form.linkedReservationId}
                        onValueChange={(v) =>
                          setForm({ ...form, linkedReservationId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar reservation (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {reservations
                            .filter((r) => r.status !== 'cancelled')
                            .map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{r.space}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateBR(r.date)} • {r.startTime}–
                                    {r.endTime}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-muted-foreground">
                      O visitante será adicionado à lista de convidados da
                      reservation selecionada.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Observações</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Informações adicionais (opcional)"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={saveVisitor}
                className="bg-primary hover:bg-primary/90"
                disabled={!isFormValid}
              >
                {editingVisitor ? 'Salvar Alterações' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visitor Delete */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este visitante? O registro será
                removido, mas quaisquer vínculos com reservations também serão
                desfeitos.
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

        {/* Pre-auth Create/Edit */}
        <Dialog open={isPreAuthOpen} onOpenChange={setIsPreAuthOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPreAuth
                  ? 'Editar Pré-Autorizado'
                  : 'Novo Pré-Autorizado'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={preAuthForm.name}
                  onChange={(e) =>
                    setPreAuthForm({ ...preAuthForm, name: e.target.value })
                  }
                  placeholder="Ex: Diarista - Nome"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input
                  value={preAuthForm.cpf}
                  onChange={(e) =>
                    setPreAuthForm({
                      ...preAuthForm,
                      cpf: formatCPF(e.target.value),
                    })
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência / Horário *</Label>
                <Input
                  value={preAuthForm.schedule}
                  onChange={(e) =>
                    setPreAuthForm({ ...preAuthForm, schedule: e.target.value })
                  }
                  placeholder="Ex: Toda segunda-feira, 08:00"
                />
              </div>
              <div className="space-y-2">
                <Label>Válido até</Label>
                <Input
                  type="date"
                  value={preAuthForm.validUntil}
                  onChange={(e) =>
                    setPreAuthForm({
                      ...preAuthForm,
                      validUntil: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreAuthOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={savePreAuth}
                className="bg-primary hover:bg-primary/90"
                disabled={
                  !preAuthForm.name || !preAuthForm.cpf || !preAuthForm.schedule
                }
              >
                {editingPreAuth ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pre-auth Delete */}
        <AlertDialog
          open={isPreAuthDeleteOpen}
          onOpenChange={setIsPreAuthDeleteOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este pré-autorizado?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePreAuth}
                className="bg-red-600 hover:bg-red-700"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
