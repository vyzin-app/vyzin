import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Calendar,
  MessageSquare,
  Users,
  Bell,
  Plus,
  Clock,
  CheckCircle,
  UserCog,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/contexts/AuthContext'
import { paths } from '@/app/router/paths'
import { getUserPermissions } from '@/app/utils/permissions'
import { display } from '@/app/utils/displayLabels'

export function VyzinDashboard() {
  const navigate = useNavigate()
  const { user, functions } = useAuth()
  const permissions = user ? getUserPermissions(functions) : null

  const openNewReservation = () => {
    navigate(paths.reservations, { state: { openNewModal: true } })
  }

  const openNewVisitor = () => {
    navigate(paths.visitantes, { state: { openNewModal: true } })
  }
  const upcomingReservations = [
    {
      id: 1,
      space: 'Salão de Festas',
      date: '15 Abr 2026',
      time: '19:00 - 23:00',
      status: 'confirmed',
    },
    {
      id: 2,
      space: 'Churrasqueira 2',
      date: '18 Abr 2026',
      time: '12:00 - 18:00',
      status: 'confirmed',
    },
    {
      id: 3,
      space: 'Quadra Esportiva',
      date: '20 Abr 2026',
      time: '15:00 - 17:00',
      status: 'confirmed',
    },
  ]

  const recentAnnouncements = [
    {
      id: 1,
      title: 'Manutenção do Elevador',
      excerpt:
        'Manutenção preventiva do elevador social será realizada na próxima semana...',
      author: 'Síndico',
      date: 'Hoje, 09:30',
      category: 'Manutenção',
    },
    {
      id: 2,
      title: 'Assembleia Geral',
      excerpt:
        'Convocação para assembleia geral ordinária no dia 25/04 às 19h...',
      author: 'Administração',
      date: 'Ontem, 14:15',
      category: 'Assembleias',
    },
    {
      id: 3,
      title: 'Pintura das Áreas Comuns',
      excerpt: 'Iniciamos a pintura da área da piscina e salão de festas...',
      author: 'Síndico',
      date: '08 Abr, 16:20',
      category: 'Obras',
    },
  ]

  const notifications = [
    {
      id: 1,
      message: 'Boleto do condomínio disponível para pagamento',
      time: '2h atrás',
      type: 'payment',
      unread: true,
    },
    {
      id: 2,
      message: 'Nova mensagem no grupo de moradores',
      time: '5h atrás',
      type: 'message',
      unread: true,
    },
    {
      id: 3,
      message: display.reservation.confirmedMessage,
      time: '1 dia atrás',
      type: 'success',
      unread: false,
    },
  ]

  const getQuickStats = () => {
    const baseStats = [
      {
        label: 'Avisos Não Lidos',
        value: '2',
        icon: MessageSquare,
        color: 'bg-orange-500',
        show: true,
      },
      {
        label:
          user?.role === 'admin'
            ? display.reservation.totalMany
            : display.reservation.myMany,
        value: user?.role === 'admin' ? '12' : '3',
        icon: Calendar,
        color: 'bg-blue-500',
        show: permissions?.canAccessReservations,
      },
      {
        label: 'Visitantes Hoje',
        value: '5',
        icon: Users,
        color: 'bg-[#10B981]',
        show: permissions?.canAccessVisitors,
      },
    ]

    if (user?.role === 'admin') {
      baseStats.push({
        label: 'Total de Usuários',
        value: '24',
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
        <Card className="p-8 border-l-4 border-l-primary shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Avisos Recentes</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
            >
              Ver todos
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-5 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/30 text-primary"
                  >
                    {announcement.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {announcement.date}
                  </span>
                </div>
                <h4 className="font-semibold mb-3 text-base group-hover:text-primary transition-colors">
                  {announcement.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {announcement.excerpt}
                </p>
                <p className="text-xs text-muted-foreground">
                  Por {announcement.author}
                </p>
              </div>
            ))}
          </div>
        </Card>

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
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Reservations */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{display.reservation.myMany}</h3>
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </div>
            <div className="space-y-3">
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
                          {reservation.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {reservation.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      reservation.status === 'confirmed'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    }
                  >
                    {reservation.status === 'confirmed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmado
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </>
                    )}
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
              {user?.role === 'admin' && (
                <>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">
                      Novo morador cadastrado
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      5h atrás
                    </p>
                  </div>
                </>
              )}
              {user?.role === 'doorman' && (
                <>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium">
                      Visitante aguardando autorização
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      30 min atrás
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">
                      Entrega realizada - Apto 201
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1h atrás
                    </p>
                  </div>
                </>
              )}
              {user?.role === 'resident' && (
                <>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium">
                      Boleto do condomínio disponível
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2h atrás
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium">
                      {display.reservation.confirmedMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 dia atrás
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
