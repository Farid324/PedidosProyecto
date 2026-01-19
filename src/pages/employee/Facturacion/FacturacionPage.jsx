// src/pages/employee/Facturacion/FacturacionPage.jsx
import { FileText, Download } from 'lucide-react'

function FacturacionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Facturación</h1>
          <p className="text-gray-600 mt-1">Gestión de facturas y comprobantes</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <FileText size={20} />
          Nueva Factura
        </button>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sistema de facturación en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacturacionPage