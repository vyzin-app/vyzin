import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import {
  Calendar,
  MessageSquare,
  Users,
  Plus,
  Clock,
  CheckCircle,
  UserCog,
  Info,
  Pin,
  AlertCircle,
  ThumbsUp,
  MessageCircle,
  BarChart3,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/contexts/AuthContext'
import { announcementRepository } from '@/app/data/announcementRepository'
import { reservationRepository } from '@/app/data/reservationRepository'
import { userRepository } from '@/app/data/userRepository'
import { visitorRepository } from '@/app/data/visitorRepository'
import {
  Announcement,
  AnnouncementCategory,
} from '@/app/domain/announcement'
import { Reservation } from '@/app/domain/reservation'
import { paths } from '@/app/router/paths'
import { formatDateBR, todayISO } from '@/app/utils/dates'
import { getUserPermissions } from '@/app/utils/permissions'
import { display } from '@/app/utils/displayLabels'

const categoryLabels: Record<AnnouncementCategory, string> = {
  general: 'Avisos Gerais',
  event: 'Eventos',
  maintenance: 'Manutenção',
  important: 'Importante',
}

function formatAnnouncementDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VyzinDashboard() {
  const navigate = useNavigate()
  const { user, functions } = useAuth()
  const permissions = user ? getUserPermissions(functions) : null

  const [recentAnnouncements, setRecentAnnouncements] = useState<
    Announcement[]
  >([])
  const [upcomingReservations, setUpcomingReservations] = useState<
    Reservation[]
  >([])
  const [dashboardStats, setDashboardStats] = useState({
    reservations: 0,
    visitorsToday: 0,
    importantAnnouncements: 0,
    users: 0,
    waitingVisitors: 0,
  })
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)
  const [announcementDetailOpen, setAnnouncementDetailOpen] = useState(false)

  const loadRecentAnnouncements = useCallback(async () => {
    if (!permissions?.canAccessNoticeBoard) {
      setRecentAnnouncements([])
      return
    }

    const data = await announcementRepository.list()
    const sorted = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    setRecentAnnouncements(sorted.slice(0, 3))
  }, [permissions?.canAccessNoticeBoard])

  useEffect(() => {
    void loadRecentAnnouncements()
  }, [loadRecentAnnouncements])

  const loadDashboardData = useCallback(async () => {
    const today = todayISO()
    const tasks: Promise<void>[] = []

    if (permissions?.canAccessReservations) {
      tasks.push(
        reservationRepository.list({ status: 'confirmed' }).then((items) => {
          const upcoming = items
            .filter((item) => item.date >= today)
            .sort((a, b) =>
              `${a.date}${a.startTime}`.localeCompare(
                `${b.date}${b.startTime}`,
              ),
            )
          setUpcomingReservations(upcoming.slice(0, 3))
          setDashboardStats((prev) => ({
            ...prev,
            reservations: items.length,
          }))
        }),
      )
    } else {
      setUpcomingReservations([])
    }

    if (permissions?.canAccessVisitors) {
      tasks.push(
        Promise.all([
          visitorRepository.list({ date: today }),
          visitorRepository.list({ date: today, status: 'waiting' }),
        ]).then(([todayVisitors, waiting]) => {
          setDashboardStats((prev) => ({
            ...prev,
            visitorsToday: todayVisitors.length,
            waitingVisitors: waiting.length,
          }))
        }),
      )
    }

    if (permissions?.canAccessNoticeBoard) {
      tasks.push(
        announcementRepository.list({ isImportant: true }).then((items) => {
          setDashboardStats((prev) => ({
            ...prev,
            importantAnnouncements: items.length,
          }))
        }),
      )
    }

    if (permissions?.canManageUsers && user?.role === 'admin') {
      tasks.push(
        userRepository.list().then((items) => {
          setDashboardStats((prev) => ({ ...prev, users: items.length }))
        }),
      )
    }

    await Promise.all(tasks)
  }, [permissions, user?.role])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  const openAnnouncementDetail = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setAnnouncementDetailOpen(true)
  }

  const openNewReservation = () => {
    navigate(paths.reservations, { state: { openNewModal: true } })
  }

  const openNewVisitor = () => {
    navigate(paths.visitantes, { state: { openNewModal: true } })
  }
  const getQuickStats = () => {
    const baseStats = [
      {
        label: 'Avisos Importantes',
        value: String(dashboardStats.importantAnnouncements),
        icon: MessageSquare,
        color: 'bg-orange-500',
        show: permissions?.canAccessNoticeBoard,
      },
      {
        label:
          user?.role === 'admin'
            ? display.reservation.totalMany
            : display.reservation.myMany,
        value: String(dashboardStats.reservations),
        icon: Calendar,
        color: 'bg-blue-500',
        show: permissions?.canAccessReservations,
      },
      {
        label: 'Visitantes Hoje',
        value: String(dashboardStats.visitorsToday),
        icon: Users,
        color: 'bg-[#10B981]',
        show: permissions?.canAccessVisitors,
      },
    ]

    if (user?.role === 'admin') {
      baseStats.push({
        label: 'Total de Usuários',
        value: String(dashboardStats.users),
        icon: UserCog,
        color: 'bg-purple-500',
        show: permissions?.canManageUsers,
      })
    }

    return baseStats.filter((stat) => stat.show)
  }

  const quickStats = getQuickStats()

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Olá, {user?.name.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.role === 'admin'
                  ? 'Painel de administração - Gestão completa do condomínio'
                  : user?.role === 'doorman'
                    ? 'Painel de portaria - Controle de acesso e visitantes'
                    : 'Bem-vindo ao Vyzin - Sua gestão condominial inteligente'}
              </p>
            </div>
            {user?.apartment && (
              <div className="flex items-center gap-2">
                <Badge className="bg-success/10 text-success border-success/20 px-3 py-1.5">
                  <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
                  Apto {user.apartment} - Bloco {user.block}
                </Badge>
              </div>
            )}
            {user?.role === 'admin' && (
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 px-3 py-1.5">
                Administrador
              </Badge>
            )}
            {user?.role === 'doorman' && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1.5">
                Porteiro
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.label}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-semibold mt-1">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Recent Announcements */}
        {permissions?.canAccessNoticeBoard && (
          <Card className="p-8 border-l-4 border-l-primary shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Avisos Recentes</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => navigate(paths.mural)}
              >
                Ver todos
              </Button>
            </div>
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum aviso publicado ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openAnnouncementDetail(announcement)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openAnnouncementDetail(announcement)
                      }
                    }}
                    className="p-5 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs border-primary/30 text-primary"
                      >
                        {categoryLabels[announcement.category]}
                      </Badge>
                      {announcement.isPinned && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          <Pin className="w-3 h-3 mr-1" />
                          Fixado
                        </Badge>
                      )}
                      {announcement.isImportant && (
                        <Badge className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Importante
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatAnnouncementDate(announcement.date)}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-3 text-base group-hover:text-primary transition-colors">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por{' '}
                      {announcement.authorDisplay ??
                        announcement.authorName ??
                        announcement.author}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <Dialog
          open={announcementDetailOpen}
          onOpenChange={setAnnouncementDetailOpen}
        >
          <DialogContent className="max-w-2xl">
            {selectedAnnouncement && (
              <>
                <DialogHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {categoryLabels[selectedAnnouncement.category]}
                    </Badge>
                    {selectedAnnouncement.isPinned && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Pin className="w-3 h-3 mr-1" />
                        Fixado
                      </Badge>
                    )}
                    {selectedAnnouncement.isImportant && (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Importante
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-xl leading-snug">
                    {selectedAnnouncement.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground pt-1">
                    Por{' '}
                    {selectedAnnouncement.authorDisplay ??
                      selectedAnnouncement.authorName ??
                      selectedAnnouncement.author}{' '}
                    • {formatAnnouncementDate(selectedAnnouncement.date)}
                  </p>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <span className="inline-flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" />
                      {selectedAnnouncement.likes}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      {selectedAnnouncement.comments}
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAnnouncementDetailOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button onClick={() => navigate(paths.mural)}>
                    Ver no mural
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {permissions?.canAccessReservations &&
              user?.role !== 'doorman' && (
                <Button
                  className="bg-primary hover:bg-primary/90 h-auto py-4"
                  onClick={openNewReservation}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Reserva
                </Button>
              )}
            {permissions?.canAccessReservations &&
              user?.role === 'doorman' && (
                <Button
                  variant="outline"
                  className="h-auto py-4"
                  onClick={() => navigate(paths.reservations)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Ver Reservas
                </Button>
              )}
            {permissions?.canAccessVisitors && (
              <Button
                variant="outline"
                className="h-auto py-4"
                onClick={openNewVisitor}
              >
                <Users className="w-5 h-5 mr-2" />
                Registrar Visitante
              </Button>
            )}
            {permissions?.canAccessNoticeBoard && (
              <Button
                variant="outline"
                className="h-auto py-4"
                onClick={() => navigate(paths.mural)}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Ver Avisos
              </Button>
            )}
            {permissions?.canAccessInformation && (
              <Button
                variant="outline"
                className="h-auto py-4"
                onClick={() => navigate(paths.informacoes)}
              >
                <Info className="w-5 h-5 mr-2" />
                Informações
              </Button>
            )}
            {permissions?.canManageUsers && user?.role === 'admin' && (
              <Button
                variant="outline"
                className="h-auto py-4"
                onClick={() => navigate(paths.seguranca.usuarios)}
              >
                <UserCog className="w-5 h-5 mr-2" />
                Gerenciar Usuários
              </Button>
            )}
            {permissions?.canAccessReports && (
              <Button
                variant="outline"
                className="h-auto py-4 border-primary/30 hover:border-primary hover:bg-primary/5"
                onClick={() => navigate(paths.relatorio)}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Relatório Operacional
              </Button>
            )}
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Reservations */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{display.reservation.myMany}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(paths.reservations)}
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingReservations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma reserva confirmada nos próximos dias.
                </p>
              )}
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{reservation.space}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDateBR(reservation.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {reservation.startTime} – {reservation.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmado
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resumo de Atividades</h3>
            </div>
            <div className="space-y-3">
              {permissions?.canAccessVisitors &&
                dashboardStats.waitingVisitors > 0 && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium">
                      {dashboardStats.waitingVisitors} visitante(s) aguardando
                      autorização
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Hoje</p>
                  </div>
                )}
              {permissions?.canAccessNoticeBoard &&
                dashboardStats.importantAnnouncements > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">
                      {dashboardStats.importantAnnouncements} aviso(s)
                      importante(s) no mural
                    </p>
                  </div>
                )}
              {permissions?.canAccessReservations &&
                upcomingReservations.length > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">
                      Próxima reserva: {upcomingReservations[0].space}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateBR(upcomingReservations[0].date)} •{' '}
                      {upcomingReservations[0].startTime}
                    </p>
                  </div>
                )}
              {(permissions?.canAccessVisitors ||
                permissions?.canAccessNoticeBoard ||
                permissions?.canAccessReservations) &&
                dashboardStats.waitingVisitors === 0 &&
                dashboardStats.importantAnnouncements === 0 &&
                upcomingReservations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade pendente para hoje.
                  </p>
                )}
              {!permissions?.canAccessVisitors &&
                !permissions?.canAccessNoticeBoard &&
                !permissions?.canAccessReservations && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade recente disponível.
                  </p>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
