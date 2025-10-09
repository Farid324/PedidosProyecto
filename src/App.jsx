import { ShoppingCart, Printer, Users, TrendingUp } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🍽️ Restaurant POS
          </h1>
          <p className="text-blue-100 text-lg">
            Sistema de Pedidos y Facturación
          </p>
        </div>

        {/* Cards de prueba */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="text-blue-600" size={32} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pedidos Hoy</p>
                <p className="text-2xl font-bold text-gray-800">45</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Printer className="text-green-600" size={32} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Comandas</p>
                <p className="text-2xl font-bold text-gray-800">23</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={32} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Clientes</p>
                <p className="text-2xl font-bold text-gray-800">120</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-xl transition">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="text-yellow-600" size={32} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Ventas</p>
                <p className="text-2xl font-bold text-gray-800">Bs 2,450</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de prueba */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ✅ Sistema Funcionando
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">Nuevo Pedido</button>
              <button className="btn btn-secondary">Facturación</button>
              <button className="btn btn-success">Reportes</button>
              <button className="btn btn-danger">Cerrar Turno</button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                ✓ Tailwind CSS configurado
              </p>
              <p className="text-green-700 text-sm mt-1">
                ✓ Lucide Icons funcionando
              </p>
              <p className="text-green-700 text-sm">
                ✓ React + Vite listo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App