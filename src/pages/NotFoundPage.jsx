// src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

function NotFoundPage() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-full mb-6">
          <AlertCircle size={64} className="text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-blue-100 mb-8">Página no encontrada</p>
        <button 
          onClick={() => navigate('/login')}
          className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100 flex items-center gap-2 mx-auto"
        >
          <Home size={20} />
          Volver al Inicio
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage