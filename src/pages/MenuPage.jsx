// src/pages/MenuPage.jsx
import { ChefHat, Plus, Edit } from 'lucide-react'

function MenuPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Menú</h1>
          <p className="text-gray-600 mt-1">Administra los productos y precios del restaurant</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-2">Bebidas</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-500">productos activos</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-2">Platos Principales</h3>
          <p className="text-3xl font-bold text-green-600">35</p>
          <p className="text-sm text-gray-500">productos activos</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-2">Postres</h3>
          <p className="text-3xl font-bold text-purple-600">12</p>
          <p className="text-sm text-gray-500">productos activos</p>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ChefHat size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Editor de menú en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuPage