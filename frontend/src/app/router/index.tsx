import { Navigate, Route, Routes } from 'react-router-dom'
import { RootLayout } from '@/app/layouts/RootLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { SegurancaLayout } from '@/app/layouts/SegurancaLayout'
import { RequirePermission } from '@/app/router/RequirePermission'
import { paths } from '@/app/router/paths'
import LoginPage from '@/app/pages/login/page'
import DashboardPage from '@/app/pages/dashboard/page'
import ReservationsPage from '@/app/pages/reservations/page'
import MuralPage from '@/app/pages/mural/page'
import VisitantesPage from '@/app/pages/visitantes/page'
import InformacoesPage from '@/app/pages/informacoes/page'
import SegurancaUsuariosPage from '@/app/pages/seguranca/usuarios/page'
import SegurancaPerfisPage from '@/app/pages/seguranca/perfis/page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path={paths.login} element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={paths.dashboard} replace />} />
          <Route
            path={paths.dashboard}
            element={
              <RequirePermission permission="canAccessDashboard">
                <DashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path={paths.reservations}
            element={
              <RequirePermission permission="canAccessReservations">
                <ReservationsPage />
              </RequirePermission>
            }
          />
          <Route
            path={paths.mural}
            element={
              <RequirePermission permission="canAccessNoticeBoard">
                <MuralPage />
              </RequirePermission>
            }
          />
          <Route
            path={paths.visitantes}
            element={
              <RequirePermission permission="canAccessVisitors">
                <VisitantesPage />
              </RequirePermission>
            }
          />
          <Route
            path={paths.informacoes}
            element={
              <RequirePermission permission="canAccessInformation">
                <InformacoesPage />
              </RequirePermission>
            }
          />

          <Route path={paths.seguranca.root} element={<SegurancaLayout />}>
            <Route
              path="usuarios"
              element={
                <RequirePermission permission="canManageUsers">
                  <SegurancaUsuariosPage />
                </RequirePermission>
              }
            />
            <Route
              path="perfis"
              element={
                <RequirePermission permission="canAccessProfiles">
                  <SegurancaPerfisPage />
                </RequirePermission>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={paths.dashboard} replace />} />
      </Route>
    </Routes>
  )
}
