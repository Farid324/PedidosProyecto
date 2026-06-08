// src/pages/employee/Pedidos/PedidosPage.jsx
import { useState, useEffect, useMemo } from 'react'
import useAuthStore from '../../../store/authStore'
import menuService from '../../../services/menuService'
import pedidoService from '../../../services/pedidoService'
import configuracionService from '../../../services/configuracionService'

import TableSelector from '../../../components/pedidos/TableSelector'
import MenuSection from '../../../components/pedidos/MenuSection'
import OrderSummary from '../../../components/pedidos/OrderSummary'
import RegistrarModal from '../../../components/pedidos/RegistrarModal'
import CuentaModal from '../../../components/pedidos/CuentaModal'
import CuentaConfirmModal from '../../../components/pedidos/CuentaConfirmModal'
import FinalizarModal from '../../../components/pedidos/FinalizarModal'

function PedidosPage() {
  const { role } = useAuthStore()
  
  // Estado de datos
  const [selectedMesa, setSelectedMesa] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [carrito, setCarrito] = useState({})

  // Estado del pedido
  const [clienteInfo, setClienteInfo] = useState({ razonSocial: '', nit: '' })
  const [tipoPedido, setTipoPedido] = useState('mesa')
  const [observaciones, setObservaciones] = useState('')

  // Estado de mesas y pedido activo
  const [mesasOcupadas, setMesasOcupadas] = useState([])
  const [pedidoActivo, setPedidoActivo] = useState(null)
  const [pagoQR, setPagoQR] = useState(false)
  const [qrImage, setQrImage] = useState(null)
  const [validationError, setValidationError] = useState(false)

  // Modales
  const [registrarModalOpen, setRegistrarModalOpen] = useState(false)
  const [cuentaModalOpen, setCuentaModalOpen] = useState(false)
  const [cuentaConfirmModalOpen, setCuentaConfirmModalOpen] = useState(false)
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Carga inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          menuService.getCategorias(),
          menuService.getProductos()
        ])
        
        const catsData = Array.isArray(catsRes) ? catsRes : (catsRes.data || [])
        setCategorias(catsData)
        if (catsData.length > 0) setSelectedCategoria(catsData[0].id)

        const prodsData = Array.isArray(prodsRes) ? prodsRes : (prodsRes.data || [])
        setProductos(prodsData)
      } catch (error) {
        console.error("Error al cargar datos", error)
      }
    }
    fetchData()
    fetchMesasOcupadas()
    fetchQR()
  }, [])

  const fetchMesasOcupadas = async () => {
    try {
      const res = await pedidoService.getMesasOcupadas()
      setMesasOcupadas(res.data || [])
    } catch (error) {
      console.error("Error cargando mesas ocupadas:", error)
    }
  }

  const fetchQR = async () => {
    try {
      const res = await configuracionService.getQR()
      if (res.data && res.data.valor) {
        setQrImage(res.data.valor)
      }
    } catch (error) {
      console.error("Error cargando QR:", error)
    }
  }

  // Al seleccionar mesa → cargar pedido activo si existe
  const handleSelectMesa = async (mesaId) => {
    setSelectedMesa(mesaId)
    setValidationError(false)
    setPagoQR(false)
    
    try {
      const res = await pedidoService.getPedidoByMesa(mesaId)
      if (res.data) {
        // Mesa ocupada, cargar datos del pedido
        setPedidoActivo(res.data)
        setClienteInfo({
          razonSocial: res.data.razon_social || '',
          nit: res.data.nit || ''
        })
        setTipoPedido(res.data.tipo_pedido || 'mesa')
        setObservaciones(res.data.observaciones || '')
        setPagoQR(res.data.pago_qr || false)

        // Cargar items al carrito
        const nuevoCarrito = {}
        if (res.data.DetallePedidos) {
          res.data.DetallePedidos.forEach(detalle => {
            if (detalle.Producto) {
              nuevoCarrito[detalle.producto_id] = {
                id: detalle.producto_id,
                nombre: detalle.Producto.nombre,
                precio: Number(detalle.precio_unitario),
                cantidad: detalle.cantidad
              }
            }
          })
        }
        setCarrito(nuevoCarrito)
      } else {
        // Mesa libre
        setPedidoActivo(null)
        setClienteInfo({ razonSocial: '', nit: '' })
        setTipoPedido('mesa')
        setObservaciones('')
        setCarrito({})
      }
    } catch (error) {
      console.error("Error cargando pedido de mesa:", error)
      setPedidoActivo(null)
      setCarrito({})
    }
  }

  // Funciones de carrito
  const handleProductClick = (producto) => {
    setCarrito(prev => {
      if (prev[producto.id]) return prev
      return { ...prev, [producto.id]: { ...producto, cantidad: 1 } }
    })
  }

  const updateCantidad = (e, productoId, delta) => {
    e?.stopPropagation()
    setCarrito(prev => {
      const item = prev[productoId]
      if (!item) return prev
      const newCantidad = item.cantidad + delta
      if (newCantidad <= 0) {
        const { [productoId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productoId]: { ...item, cantidad: newCantidad } }
    })
  }

  const removeItem = (e, productoId) => {
    e?.stopPropagation()
    setCarrito(prev => {
      const { [productoId]: _, ...rest } = prev
      return rest
    })
  }

  const totalPedido = useMemo(() => {
    return Object.values(carrito).reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0)
  }, [carrito])

  // === BOTONES ===

  // REGISTRAR
  const handleRegistrar = () => {
    if (!clienteInfo.razonSocial.trim()) {
      setValidationError(true)
      return
    }
    setValidationError(false)
    if (Object.keys(carrito).length === 0) {
      alert('Agrega al menos un platillo a la orden')
      return
    }
    if (!selectedMesa) {
      alert('Selecciona una mesa primero')
      return
    }
    setRegistrarModalOpen(true)
  }

  const handleConfirmRegistrar = async () => {
    try {
      const items = Object.values(carrito).map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
      }))

      if (pedidoActivo) {
        // Actualizar pedido existente
        await pedidoService.updatePedidoItems(pedidoActivo.id, {
          items,
          observaciones,
          razon_social: clienteInfo.razonSocial,
          nit: clienteInfo.nit,
          tipo_pedido: tipoPedido,
        })
      } else {
        // Crear nuevo pedido
        await pedidoService.createPedido({
          mesa: selectedMesa,
          items,
          observaciones,
          razon_social: clienteInfo.razonSocial,
          nit: clienteInfo.nit,
          tipo_pedido: tipoPedido,
        })
      }

      setRegistrarModalOpen(false)
      await fetchMesasOcupadas()
      // Recargar pedido activo
      await handleSelectMesa(selectedMesa)
      alert(pedidoActivo ? '✅ Pedido actualizado' : '✅ Pedido registrado. Mesa ocupada.')
    } catch (error) {
      console.error("Error registrando pedido:", error)
      alert(error?.response?.data?.error || 'Error al registrar el pedido')
    }
  }

  // FINALIZAR
  const handleFinalizar = () => {
    if (!pedidoActivo) {
      alert('No hay un pedido activo para finalizar')
      return
    }
    setFinalizarModalOpen(true)
  }

  const handleConfirmFinalizar = async () => {
    setFinalizarModalOpen(false)
    try {
      const metodo = pagoQR ? 'QR' : 'EFECTIVO'
      await pedidoService.finalizarPedido(pedidoActivo.id, metodo)
      
      // Limpiar todo
      setPedidoActivo(null)
      setCarrito({})
      setClienteInfo({ razonSocial: '', nit: '' })
      setObservaciones('')
      setPagoQR(false)
      setSelectedMesa(null)
      await fetchMesasOcupadas()
      
      // Mostrar toast
      setToastMessage('Pedido finalizado. Mesa liberada')
      setTimeout(() => setToastMessage(''), 4000)
    } catch (error) {
      console.error("Error finalizando pedido:", error)
      alert('Error al finalizar el pedido')
    }
  }

  // COMANDA (impresión para cocina)
  const handleComanda = () => {
    if (Object.keys(carrito).length === 0) {
      alert('No hay platillos en la orden para generar comanda')
      return
    }

    const items = Object.values(carrito)
    const printWindow = window.open('', '_blank', 'width=350,height=600')
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda - Atavismo</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 15px; width: 300px; color: #000; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .title { font-size: 22px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .info { font-size: 16px; margin-bottom: 15px; }
          .divider { border-top: 2px dashed #000; margin: 10px 0; }
          .item-row { font-size: 16px; margin-bottom: 8px; font-weight: bold; display: flex; }
          .qty { width: 35px; }
          .desc { flex: 1; }
          .obs { font-size: 14px; margin-top: 15px; border: 1px solid #000; padding: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="text-center title">COMANDA DE COCINA</div>
        <div class="info">
          <div><strong>MESA:</strong> ${selectedMesa || '--'}</div>
          <div><strong>FECHA:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="divider"></div>
        <div>
    `;
    
    items.forEach(item => {
      html += `<div class="item-row"><div class="qty">${item.cantidad} x</div><div class="desc">${item.nombre}</div></div>`;
    });

    html += `</div>`;
    
    if (observaciones) {
      html += `<div class="divider"></div><div class="obs"><strong>OBS:</strong><br/>${observaciones}</div>`;
    }
    
    html += `
        <div class="divider"></div>
        <div class="text-center" style="font-size: 12px; margin-top: 10px;">Atavismo Catering</div>
        <script>
          window.onload = function() { 
            setTimeout(function() { window.print(); window.close(); }, 200);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html)
    printWindow.document.close()
  }

  // CUENTA (toggle QR)
  const handleCuenta = () => {
    if (pagoQR) {
      // Ya está activado, preguntar si desactiva
      setCuentaConfirmModalOpen(true)
    } else {
      // Mostrar modal de QR
      setCuentaModalOpen(true)
    }
  }

  const handleConfirmCuenta = async () => {
    setPagoQR(true)
    setCuentaModalOpen(false)

    // Actualizar en backend si hay pedido activo
    if (pedidoActivo) {
      try {
        await pedidoService.updatePedido(pedidoActivo.id, { pago_qr: true, metodo_pago: 'QR' })
      } catch (error) {
        console.error("Error actualizando pago QR:", error)
      }
    }
  }

  const handleCuentaConfirmSi = async () => {
    setPagoQR(false)
    setCuentaConfirmModalOpen(false)

    if (pedidoActivo) {
      try {
        await pedidoService.updatePedido(pedidoActivo.id, { pago_qr: false, metodo_pago: 'EFECTIVO' })
      } catch (error) {
        console.error("Error actualizando pago:", error)
      }
    }
  }

  const handleCuentaConfirmNo = () => {
    setCuentaConfirmModalOpen(false)
  }

  // IMPRIMIR (recibo para cliente)
  const handleImprimir = () => {
    if (Object.keys(carrito).length === 0) {
      alert('No hay platillos en la orden para imprimir')
      return
    }

    const items = Object.values(carrito)
    const metodo = pagoQR ? 'QR' : 'EFECTIVO'
    
    const printWindow = window.open('', '_blank', 'width=350,height=600')
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura - Atavismo</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 15px; width: 300px; color: #000; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .header { margin-bottom: 15px; }
          .brand { font-size: 26px; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-bottom: 2px;}
          .sub-brand { font-size: 13px; margin-bottom: 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; letter-spacing: 1px;}
          .info-block { font-size: 13px; margin-bottom: 15px; line-height: 1.4; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .item-row { display: flex; font-size: 13px; margin-bottom: 5px; }
          .item-qty { width: 30px; }
          .item-name { flex: 1; padding-right: 5px; }
          .item-price { width: 65px; text-align: right; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 10px; }
          .footer { text-align: center; font-size: 12px; margin-top: 20px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="text-center header">
          <div class="brand">ATAVISMO</div>
          <div class="sub-brand">CATERING & EVENTOS</div>
          <div style="font-size: 15px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">TICKET DE VENTA</div>
        </div>
        
        <div class="info-block">
          <div><strong>Fecha:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div><strong>Mesa:</strong> ${selectedMesa || '--'}</div>
          <div><strong>Cliente:</strong> ${clienteInfo.razonSocial || 'S/N'}</div>
          ${clienteInfo.nit ? `<div><strong>NIT/CI:</strong> ${clienteInfo.nit}</div>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div style="font-weight: bold; display: flex; font-size: 13px; margin-bottom: 5px;">
          <div class="item-qty">CANT</div>
          <div class="item-name">DESCRIPCIÓN</div>
          <div class="item-price">IMPORTE</div>
        </div>
        
        <div class="divider"></div>
    `;

    items.forEach(item => {
      const subtotal = (item.cantidad * Number(item.precio)).toFixed(2)
      html += `
        <div class="item-row">
          <div class="item-qty">${item.cantidad}</div>
          <div class="item-name">${item.nombre}</div>
          <div class="item-price">${subtotal}</div>
        </div>
      `;
    })
    
    html += `
        <div class="divider"></div>
        <div class="total-row">
          <span>TOTAL Bs.</span>
          <span>${totalPedido.toFixed(2)}</span>
        </div>
        <div style="font-size: 13px; margin-top: 10px;">
          <strong>Método de pago:</strong> ${metodo}
        </div>
        <div class="divider"></div>
        <div class="footer">
          <div style="font-weight: bold;">¡Gracias por su preferencia!</div>
          <div>Revise su pedido antes de retirarse.</div>
        </div>
        <script>
          window.onload = function() { 
            setTimeout(function() { window.print(); window.close(); }, 200);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 overflow-hidden p-1"> 
      
      {/* Encabezado */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Pedidos</h1>
          <p className="text-[var(--gris-primario)] mt-1">Gestión de pedidos del restaurant</p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className='flex flex-col lg:flex-row gap-4 flex-1 min-h-0'>
        
        {/* Columna Izquierda: Mesas y Menú */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 min-h-0">
          <TableSelector 
            selectedMesa={selectedMesa} 
            onSelectMesa={handleSelectMesa}
            mesasOcupadas={mesasOcupadas}
          />
          
          <MenuSection 
            categorias={categorias}
            productos={productos}
            carrito={carrito}
            onProductClick={handleProductClick}
            onUpdateQuantity={updateCantidad}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategoria={selectedCategoria}
            setSelectedCategoria={setSelectedCategoria}
          />
        </div>

        {/* Derecha: Orden Actual */}
        <OrderSummary 
          selectedMesa={selectedMesa}
          carrito={carrito}
          clienteInfo={clienteInfo}
          setClienteInfo={(info) => { setClienteInfo(info); setValidationError(false) }}
          tipoPedido={tipoPedido}
          setTipoPedido={setTipoPedido}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          totalPedido={totalPedido}
          onUpdateQuantity={updateCantidad}
          onRemoveItem={removeItem}
          onRegistrar={handleRegistrar}
          onFinalizar={handleFinalizar}
          onComanda={handleComanda}
          onCuenta={handleCuenta}
          onImprimir={handleImprimir}
          pagoQR={pagoQR}
          pedidoActivo={pedidoActivo}
          validationError={validationError}
        />
      </div>

      {/* Modales */}
      <RegistrarModal
        isOpen={registrarModalOpen}
        onClose={() => setRegistrarModalOpen(false)}
        onConfirm={handleConfirmRegistrar}
        carrito={carrito}
        totalPedido={totalPedido}
        pedidoExistente={!!pedidoActivo}
      />

      <CuentaModal
        isOpen={cuentaModalOpen}
        onClose={() => setCuentaModalOpen(false)}
        onConfirm={handleConfirmCuenta}
        totalPedido={totalPedido}
        qrImage={qrImage}
      />

      <CuentaConfirmModal
        isOpen={cuentaConfirmModalOpen}
        onClose={() => setCuentaConfirmModalOpen(false)}
        onConfirmSi={handleCuentaConfirmSi}
        onConfirmNo={handleCuentaConfirmNo}
      />

      <FinalizarModal
        isOpen={finalizarModalOpen}
        onClose={() => setFinalizarModalOpen(false)}
        onConfirm={handleConfirmFinalizar}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[120] animate-fade-in-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}

export default PedidosPage