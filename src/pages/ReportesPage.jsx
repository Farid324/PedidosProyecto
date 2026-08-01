// src/pages/ReportesPage.jsx
import { TrendingUp, Calendar, Download } from 'lucide-react'
import useAuthStore from '../store/authStore'

function ReportesPage() {
  const { role, user } = useAuthStore()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {role === 'cajero' ? 'Mi Reporte' : 'Reportes'}
          </h1>
          <p className="text-gray-600 mt-1">
            {role === 'cajero' 
              ? `Reporte de ${user?.name} - Turno actual`
              : 'Reportes y análisis del restaurant'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar size={20} />
            Seleccionar Fecha
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Download size={20} />
            Exportar
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sistema de reportes en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportesPage