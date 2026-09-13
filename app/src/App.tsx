import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/RequireAuth'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Movimientos } from './pages/Movimientos'
import { Presupuestos } from './pages/Presupuestos'
import { Saldos } from './pages/Saldos'
import { Reportes } from './pages/Reportes'
import { Ajustes } from './pages/Ajustes'
import { Categorias } from './pages/Categorias'
import { PagosFijos } from './pages/PagosFijos'
import { MetaMatrimonio } from './pages/MetaMatrimonio'
import { PorConfirmar } from './pages/PorConfirmar'
import { ConectarCorreo } from './pages/ConectarCorreo'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/presupuestos" element={<Presupuestos />} />
        <Route path="/saldos" element={<Saldos />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/pagos-fijos" element={<PagosFijos />} />
        <Route path="/por-confirmar" element={<PorConfirmar />} />
        <Route path="/metas/matrimonio" element={<MetaMatrimonio />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/ajustes/categorias" element={<Categorias />} />
        <Route path="/ajustes/correo" element={<ConectarCorreo />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
