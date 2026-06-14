import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Link2,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react'
import { reportRepository } from '@/app/data/reportRepository'
import {
  OperationalReport,
  OperationalReportFilter,
} from '@/app/domain/report'
import { useAuth } from '@/app/contexts/AuthContext'

const RESERVATION_SPACES = [
  'Salão de Festas',
  'Churrasqueira 1',
  'Churrasqueira 2',
  'Quadra Esportiva',
  'Área da Piscina',
  'Sala de Reuniões',
]

function formatDateBR(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function defaultDateRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

function reservationStatusLabel(status: string) {
  return status === 'confirmed' ? 'Confirmada' : 'Cancelada'
}

function visitorStatusLabel(status: string) {
  const labels: Record<string, string> = {
    authorized: 'Autorizado',
    waiting: 'Aguardando',
    exited: 'Saiu',
    denied: 'Negado',
  }
  return labels[status] ?? status
}

function visitTypeLabel(type: string) {
  return type === 'reservation' ? 'Convidado de reserva' : 'Visita ao apartamento'
}

function unitLabel(apartment?: string, block?: string) {
  if (apartment && block) return `Apto ${apartment} — Bloco ${block}`
  if (apartment) return `Apto ${apartment}`
  return '—'
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    )
    .join('\n')

  const blob = new Blob([`\uFEFF${content}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function RelatorioOperacional() {
  const { user } = useAuth()
  const initialRange = useMemo(() => defaultDateRange(), [])
  const [filters, setFilters] = useState<OperationalReportFilter>(initialRange)
  const [searchInput, setSearchInput] = useState('')
  const [report, setReport] = useState<OperationalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reportRepository.getOperationalReport({
        ...filters,
        search: searchInput.trim() || undefined,
      })
      setReport(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar o relatorio.',
      )
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [filters, searchInput])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadReport()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadReport])

  function exportReservationsCsv() {
    if (!report) return
    downloadCsv('relatorio-reservas.csv', [
      [
        'Espaco',
        'Data',
        'Horario',
        'Status',
        'Solicitante',
        'Email',
        'Unidade',
        'Perfil',
        'Convidados',
        'Nomes dos convidados',
        'Observacoes',
      ],
      ...report.reservations.map((row) => [
        row.space,
        formatDateBR(row.date),
        `${row.startTime} - ${row.endTime}`,
        reservationStatusLabel(row.status),
        row.createdByName,
        row.createdByEmail,
        unitLabel(row.createdByApartment, row.createdByBlock),
        row.createdByProfileName,
        String(row.linkedVisitorCount),
        row.linkedVisitors.map((v) => v.name).join(', '),
        row.notes,
      ]),
    ])
  }

  function exportVisitorsCsv() {
    if (!report) return
    downloadCsv('relatorio-visitantes.csv', [
      [
        'Nome',
        'CPF',
        'Data',
        'Horario',
        'Status',
        'Tipo',
        'Finalidade',
        'Autorizado por',
        'Perfil autorizador',
        'Unidade autorizador',
        'Reserva vinculada',
        'Espaco reserva',
        'Data reserva',
        'Solicitante reserva',
      ],
      ...report.visitors.map((row) => [
        row.name,
        row.cpf,
        formatDateBR(row.date),
        row.time,
        visitorStatusLabel(row.status),
        visitTypeLabel(row.visitType),
        row.purpose,
        row.authorizedByName,
        row.authorizedByProfileName,
        unitLabel(row.authorizedByApartment, row.authorizedByBlock),
        row.reservationId ?? '—',
        row.reservationSpace ?? '—',
        row.reservationDate ? formatDateBR(row.reservationDate) : '—',
        row.reservationOwnerName ?? '—',
      ]),
    ])
  }

  const summary = report?.summary

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" />
              Relatório Operacional
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Consolidação com joins entre reservas, visitantes, moradores e
              perfis. Respeita as permissões do seu perfil (
              {user?.role === 'admin'
                ? 'visão completa'
                : user?.role === 'doorman'
                  ? 'visão da portaria'
                  : 'apenas seus registros'}
              ).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadReport()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={exportReservationsCsv}
              disabled={!report?.reservations.length}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV Reservas
            </Button>
            <Button
              variant="outline"
              onClick={exportVisitorsCsv}
              disabled={!report?.visitors.length}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV Visitantes
            </Button>
          </div>
        </div>

        <Card className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período — de</Label>
              <Input
                type="date"
                value={filters.from ?? ''}
                onChange={(e) =>
                  setFilters((current) => ({ ...current, from: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Período — até</Label>
              <Input
                type="date"
                value={filters.to ?? ''}
                onChange={(e) =>
                  setFilters((current) => ({ ...current, to: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status da reserva</Label>
              <Select
                value={filters.reservationStatus ?? 'all'}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    reservationStatus:
                      value === 'all'
                        ? undefined
                        : (value as OperationalReportFilter['reservationStatus']),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Espaço</Label>
              <Select
                value={filters.space ?? 'all'}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    space: value === 'all' ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {RESERVATION_SPACES.map((space) => (
                    <SelectItem key={space} value={space}>
                      {space}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status do visitante</Label>
              <Select
                value={filters.visitorStatus ?? 'all'}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    visitorStatus:
                      value === 'all'
                        ? undefined
                        : (value as OperationalReportFilter['visitorStatus']),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="authorized">Autorizado</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="exited">Saiu</SelectItem>
                  <SelectItem value="denied">Negado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de visita</Label>
              <Select
                value={filters.visitType ?? 'all'}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    visitType:
                      value === 'all'
                        ? undefined
                        : (value as OperationalReportFilter['visitType']),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="reservation">Convidado de reserva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Busca textual</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Nome, CPF, espaço, finalidade..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </Card>
        )}

        {loading ? (
          <Card className="p-10 text-center text-muted-foreground">
            Gerando relatório com joins...
          </Card>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: 'Reservas no período',
                  value: summary.totalReservations,
                  sub: `${summary.confirmedReservations} confirmadas · ${summary.cancelledReservations} canceladas`,
                  icon: Calendar,
                  color: 'bg-blue-500',
                },
                {
                  label: 'Visitantes no período',
                  value: summary.totalVisitors,
                  sub: `${summary.authorizedVisitors} autorizados · ${summary.waitingVisitors} aguardando`,
                  icon: Users,
                  color: 'bg-[#10B981]',
                },
                {
                  label: 'Convidados vinculados',
                  value: summary.reservationGuests,
                  sub: 'Visitantes ligados a reservas',
                  icon: Link2,
                  color: 'bg-primary',
                },
                {
                  label: 'Espaço mais reservado',
                  value: summary.topSpaces[0]?.space ?? '—',
                  sub: summary.topSpaces[0]
                    ? `${summary.topSpaces[0].count} reserva(s)`
                    : 'Sem dados no filtro',
                  icon: BarChart3,
                  color: 'bg-purple-500',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.label} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-2xl font-semibold mt-1 truncate">
                          {item.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {item.sub}
                        </p>
                      </div>
                      <div
                        className={`w-11 h-11 ${item.color} rounded-lg flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card className="p-5 bg-secondary/20">
              <h3 className="font-medium mb-2">Joins aplicados neste relatório</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Reserva → Morador:</strong>{' '}
                  `createdBy` → usuário (nome, e-mail, apto, bloco) + perfil RBAC
                </p>
                <p>
                  <strong className="text-foreground">Reserva → Visitantes:</strong>{' '}
                  `linkedVisitorIds[]` → cadastro de visitantes vinculados
                </p>
                <p>
                  <strong className="text-foreground">Visitante → Autorizador:</strong>{' '}
                  `authorizedBy` → usuário + perfil de quem autorizou
                </p>
                <p>
                  <strong className="text-foreground">Visitante → Reserva:</strong>{' '}
                  lookup reverso em `linkedVisitorIds` + solicitante da reserva
                </p>
              </div>
              {report?.generatedAt && (
                <p className="text-xs text-muted-foreground mt-3">
                  Gerado em{' '}
                  {new Date(report.generatedAt).toLocaleString('pt-BR')}
                </p>
              )}
            </Card>

            <Tabs defaultValue="reservations">
              <TabsList>
                <TabsTrigger value="reservations">
                  Reservas ({report?.reservations.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="visitors">
                  Visitantes ({report?.visitors.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reservations" className="mt-4">
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-secondary/40 text-left">
                          <th className="p-3 font-medium">Espaço / Data</th>
                          <th className="p-3 font-medium">Solicitante (join user)</th>
                          <th className="p-3 font-medium">Convidados (join visitors)</th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report?.reservations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center text-muted-foreground py-8"
                            >
                              Nenhuma reserva encontrada para os filtros.
                            </td>
                          </tr>
                        ) : (
                          report?.reservations.map((row) => (
                            <tr
                              key={row.reservationId}
                              className="border-b last:border-0 hover:bg-secondary/20"
                            >
                              <td className="p-3 align-top">
                                <p className="font-medium">{row.space}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateBR(row.date)} · {row.startTime}–
                                  {row.endTime}
                                </p>
                              </td>
                              <td className="p-3 align-top">
                                <p className="font-medium">{row.createdByName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {row.createdByProfileName} ·{' '}
                                  {unitLabel(
                                    row.createdByApartment,
                                    row.createdByBlock,
                                  )}
                                </p>
                              </td>
                              <td className="p-3 align-top">
                                {row.linkedVisitors.length === 0 ? (
                                  <span className="text-muted-foreground text-sm">
                                    Nenhum
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {row.linkedVisitors.map((visitor) => (
                                      <Badge
                                        key={visitor.visitorId}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {visitor.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <Badge
                                  className={
                                    row.status === 'confirmed'
                                      ? 'bg-success/10 text-success border-success/20'
                                      : 'bg-muted text-muted-foreground'
                                  }
                                >
                                  {reservationStatusLabel(row.status)}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="visitors" className="mt-4">
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-secondary/40 text-left">
                          <th className="p-3 font-medium">Visitante</th>
                          <th className="p-3 font-medium">Autorizador (join user)</th>
                          <th className="p-3 font-medium">
                            Reserva vinculada (join reservation)
                          </th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report?.visitors.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center text-muted-foreground py-8"
                            >
                              Nenhum visitante encontrado para os filtros.
                            </td>
                          </tr>
                        ) : (
                          report?.visitors.map((row) => (
                            <tr
                              key={row.visitorId}
                              className="border-b last:border-0 hover:bg-secondary/20"
                            >
                              <td className="p-3 align-top">
                                <p className="font-medium">{row.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {row.cpf} · {formatDateBR(row.date)} {row.time}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {visitTypeLabel(row.visitType)}
                                </p>
                              </td>
                              <td className="p-3 align-top">
                                <p className="font-medium">
                                  {row.authorizedByName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {row.authorizedByProfileName} ·{' '}
                                  {unitLabel(
                                    row.authorizedByApartment,
                                    row.authorizedByBlock,
                                  )}
                                </p>
                              </td>
                              <td className="p-3 align-top">
                                {row.reservationId ? (
                                  <>
                                    <p className="font-medium">
                                      {row.reservationSpace}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {row.reservationDate
                                        ? formatDateBR(row.reservationDate)
                                        : '—'}{' '}
                                      · {row.reservationOwnerName}
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Sem vínculo
                                  </span>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                <Badge variant="outline">
                                  {visitorStatusLabel(row.status)}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  )
}
