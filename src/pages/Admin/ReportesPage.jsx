import { useEffect, useMemo, useState } from 'react'
import { Calendar, Download, Printer } from 'lucide-react'
import useAuthStore from '../../store/authStore'

// —— helpers ——
const bs = (n) => `Bs ${Number(n || 0).toFixed(2)}`
const iso = (d) => new Date(d).toISOString().slice(0, 10)
const today = new Date()
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Simulador de datos para las fechas seleccionadas
function generarDatosSimulados(desde, hasta) {
  const start = new Date(desde)
  const end = new Date(hasta)
  if (isNaN(start) || isNaN(end) || start > end) return { facturas: [], pedidosSinFactura: [] }

  const dias = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1)
  const metodos = ['EFECTIVO', 'QR']

  const facturas = []
  let correlativo = 1000
  for (let i = 0; i < dias; i++) {
    const dia = new Date(start)
    dia.setDate(start.getDate() + i)

    // 3 a 8 facturas por día
    const porDia = Math.floor(Math.random() * 6) + 3
    for (let j = 0; j < porDia; j++) {
      const total = Number((Math.random() * 150 + 20).toFixed(2))
      const clienteNum = Math.floor(Math.random() * 9000) + 1000
      const docNum = Math.floor(Math.random() * 900000) + 100000
      facturas.push({
        numero_factura: `FAC-${correlativo++}`,
        fecha_emision: new Date(dia.getTime() + j * 3600000).toISOString(),
        codigo_control: Math.random().toString(36).slice(2, 8).toUpperCase(),
        razon_social: `Cliente ${clienteNum}`,
        codigo_cliente: `CLI-${clienteNum}`,
        numero_documento: `${docNum}`,
        complemento: '',
        monto_total: total,
        metodo_pago: metodos[Math.floor(Math.random() * metodos.length)],
        moneda: 'BOB',
        detalle_extra: '—'
      })
    }
  }

  // Pedidos sin factura (0–25% del total de facturas)
  const sinFacturaCant = Math.floor(facturas.length * Math.random() * 0.25)
  const pedidosSinFactura = Array.from({ length: sinFacturaCant }, (_, i) => ({
    id: i + 1,
    fecha: new Date(start.getTime() + i * 7200000).toISOString(),
    total: Number((Math.random() * 120 + 10).toFixed(2))
  }))

  return { facturas, pedidosSinFactura }
}

// Exportar CSV (Excel abre .csv sin problema). Si deseas .xlsx, luego integramos SheetJS.
function exportarCSV(nombre, filas) {
  const encabezados = [
    'Numero factura','Fecha Emisión','Codigo Control','Razon Social','Codigo Cliente',
    'Numero Documento','Complemento','Monto Total','Metodo de Pago','Moneda','Detalle Extra'
  ]
  const esc = (v) => (v?.toString().includes(',') || v?.toString().includes('"')) ? `"${String(v).replace(/"/g,'""')}"` : v
  const cuerpo = filas.map(f => [
    f.numero_factura,
    new Date(f.fecha_emision).toLocaleString('es-BO'),
    f.codigo_control,
    f.razon_social,
    f.codigo_cliente,
    f.numero_documento,
    f.complemento,
    Number(f.monto_total).toFixed(2),
    f.metodo_pago,
    f.moneda,
    f.detalle_extra
  ].map(esc).join(','))
  const contenido = [encabezados.join(','), ...cuerpo].join('\n')
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nombre}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ReportesPage() {
  const { role, user } = useAuthStore()

  // Guard: solo admin ve el mensual
  if (role && role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Acceso restringido</h1>
        <p className="text-gray-600">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  const [fechaInicio, setFechaInicio] = useState(iso(startOfMonth))
  const [fechaFin, setFechaFin] = useState(iso(endOfMonth))
  const [facturas, setFacturas] = useState([])
  const [pedidosSinFactura, setPedidosSinFactura] = useState([])
  const [loading, setLoading] = useState(false)

  // Filtros de la tabla
  const [filtroNumero, setFiltroNumero] = useState('')
  const [filtroRazon, setFiltroRazon] = useState('')
  const [filtroDocumento, setFiltroDocumento] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')

  const fechasValidas = useMemo(() => new Date(fechaInicio) <= new Date(fechaFin), [fechaInicio, fechaFin])

  // cargar datos simulados cuando cambian las fechas
  useEffect(() => {
    if (!fechasValidas) return
    setLoading(true)
    const { facturas, pedidosSinFactura } = generarDatosSimulados(fechaInicio, fechaFin)
    setFacturas(facturas)
    setPedidosSinFactura(pedidosSinFactura)
    setLoading(false)
  }, [fechaInicio, fechaFin])

  const conFactura = useMemo(() => facturas.reduce((s, f) => s + Number(f.monto_total || 0), 0), [facturas])
  const sinFactura = useMemo(() => pedidosSinFactura.reduce((s, p) => s + Number(p.total || 0), 0), [pedidosSinFactura])
  const totalMensual = conFactura + sinFactura
  const totalPedidos = facturas.length + pedidosSinFactura.length

  const hasData = totalPedidos > 0

  const facturasFiltradas = useMemo(() => {
    return facturas.filter(f => {
      const okNumero = !filtroNumero || f.numero_factura.toLowerCase().includes(filtroNumero.toLowerCase())
      const okRazon = !filtroRazon || f.razon_social.toLowerCase().includes(filtroRazon.toLowerCase())
      const okDoc = !filtroDocumento || String(f.numero_documento).toLowerCase().includes(filtroDocumento.toLowerCase())
      const okMetodo = !filtroMetodo || f.metodo_pago === filtroMetodo
      return okNumero && okRazon && okDoc && okMetodo
    })
  }, [facturas, filtroNumero, filtroRazon, filtroDocumento, filtroMetodo])

  const onImprimir = () => window.print()
  const onExportar = () => exportarCSV(`reporte_mensual_${fechaInicio}_a_${fechaFin}`, facturasFiltradas)

  return (
    <div className="space-y-6">
      {/* Encabezado de la página (heredado por AdminLayout, aquí solo el título de la vista) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
          <p className="text-gray-600 mt-1">Reportes y análisis del restaurant</p>
        </div>
        <div className="flex gap-3 print:hidden">
          
        </div>
      </div>

      {/* —— Filtros superiores (como en tu mockup) —— */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-gray-800">Reportes del Sistema</p>
            <p className="text-sm text-gray-500">Tipo de reporte:</p>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold bg-[var(--guindo-primario)] text-[var(--blanco-primario)]">Reporte Mensual</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha inicio:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[var(--guindo-primario)]"><Calendar size={18} /></span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border rounded-lg py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-[var(--guindo-primario)] border-[var(--guindo-primario)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fecha fin:</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[var(--guindo-primario)]"><Calendar size={18} /></span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border rounded-lg py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-[var(--guindo-primario)] border-[var(--guindo-primario)]"
                />
              </div>
              {!fechasValidas && (
                <p className="text-xs text-red-600 mt-1">La fecha fin debe ser mayor o igual a la fecha inicio.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <button
              className="btn btn-secondary flex items-center gap-2"
              onClick={onImprimir}
              disabled={!hasData}
            >
              <Printer size={20} />
              Imprimir
            </button>
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={onExportar}
              disabled={!hasData}
            >
              <Download size={20} />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* —— KPIs —— */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-600">Total Mensual</p>
          <p className="text-2xl font-bold text-[var(--guindo-primario)]">{bs(totalMensual)}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-600">Con Factura</p>
          <p className="text-2xl font-bold text-[var(--guindo-primario)]">{bs(conFactura)}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-600">Sin Factura</p>
          <p className="text-2xl font-bold text-[var(--guindo-primario)]">{bs(sinFactura)}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-sm text-gray-600">Total Pedidos</p>
          <p className="text-2xl font-bold text-[var(--guindo-primario)]">{totalPedidos}</p>
        </div>
      </div>

      {/* —— Tabla con filtros —— */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-3 text-[var(--guindo-primario)]">Resumen de ventas</h3>

        {/* Filtros de la tabla */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 print:hidden">
          <input
            placeholder="Número factura"
            value={filtroNumero}
            onChange={(e) => setFiltroNumero(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--guindo-primario)]"
          />
          <input
            placeholder="Razón social"
            value={filtroRazon}
            onChange={(e) => setFiltroRazon(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--guindo-primario)]"
          />
          <input
            placeholder="Número documento"
            value={filtroDocumento}
            onChange={(e) => setFiltroDocumento(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--guindo-primario)]"
          />
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--guindo-primario)]"
          >
            <option value="">Método de pago (todos)</option>
            <option value="EFECTIVO">EFECTIVO</option>
            <option value="QR">QR</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3">Numero factura</th>
                <th className="text-left py-2 px-3">Fecha Emisión</th>
                <th className="text-left py-2 px-3">Codigo Control</th>
                <th className="text-left py-2 px-3">Razon Social</th>
                <th className="text-left py-2 px-3">Codigo Cliente</th>
                <th className="text-left py-2 px-3">Numero Documento</th>
                <th className="text-left py-2 px-3">Complemento</th>
                <th className="text-left py-2 px-3">Monto Total</th>
                <th className="text-left py-2 px-3">Metodo de Pago</th>
                <th className="text-left py-2 px-3">Moneda</th>
                <th className="text-left py-2 px-3">Detalle Extra</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={11} className="py-6 text-center text-gray-500">Cargando…</td></tr>
              )}
              {!loading && facturasFiltradas.length === 0 && (
                <tr><td colSpan={11} className="py-6 text-center text-gray-500">No hay registros en el rango seleccionado</td></tr>
              )}
              {!loading && facturasFiltradas.map((f) => (
                <tr key={f.numero_factura} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{f.numero_factura}</td>
                  <td className="py-2 px-3">{new Date(f.fecha_emision).toLocaleString('es-BO')}</td>
                  <td className="py-2 px-3">{f.codigo_control}</td>
                  <td className="py-2 px-3">{f.razon_social}</td>
                  <td className="py-2 px-3">{f.codigo_cliente}</td>
                  <td className="py-2 px-3">{f.numero_documento}</td>
                  <td className="py-2 px-3">{f.complemento || '—'}</td>
                  <td className="py-2 px-3 font-semibold">{bs(f.monto_total)}</td>
                  <td className="py-2 px-3">{f.metodo_pago}</td>
                  <td className="py-2 px-3">{f.moneda}</td>
                  <td className="py-2 px-3">{f.detalle_extra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* estilos de impresión mínimos */}
      <style>{`
        @media print {
          header, .print\\:hidden, .btn { display: none !important; }
          table { font-size: 12px; }
          th, td { padding: 6px; }
          .card { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}
