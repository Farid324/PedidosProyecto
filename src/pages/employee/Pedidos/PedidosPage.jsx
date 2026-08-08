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
import TarjetaModal from '../../../components/pedidos/TarjetaModal'
import TarjetaConfirmModal from '../../../components/pedidos/TarjetaConfirmModal'
import FinalizarModal from '../../../components/pedidos/FinalizarModal'
import FinalizarTodasModal from '../../../components/pedidos/FinalizarTodasModal'

function PedidosPage() {
  const { role, turno } = useAuthStore()
  
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
  const [pagoTarjeta, setPagoTarjeta] = useState(false)
  const [qrImage, setQrImage] = useState(null)
  // Modales
  const [registrarModalOpen, setRegistrarModalOpen] = useState(false)
  const [cuentaModalOpen, setCuentaModalOpen] = useState(false)
  const [cuentaConfirmModalOpen, setCuentaConfirmModalOpen] = useState(false)
  const [tarjetaModalOpen, setTarjetaModalOpen] = useState(false)
  const [tarjetaConfirmModalOpen, setTarjetaConfirmModalOpen] = useState(false)
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false)
  const [finalizarTodasModalOpen, setFinalizarTodasModalOpen] = useState(false)
  const [isFinalizandoTodas, setIsFinalizandoTodas] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

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

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 4000)
  }

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
        setPagoTarjeta(res.data.pago_tarjeta || false)

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
        setPagoTarjeta(false)
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
    if (!selectedMesa) {
      showToast('Selecciona una mesa primero', 'error')
      return
    }
    if (Object.keys(carrito).length === 0) {
      showToast('Agrega al menos un platillo a la orden', 'error')
      return
    }
    setRegistrarModalOpen(true)
  }

  const handleConfirmRegistrar = async () => {
    try {
      const items = Object.values(carrito).map(item => ({
        producto_id: item.id,
        kind: 'comida',
        cantidad: item.cantidad,
      }))

      const finalRazonSocial = clienteInfo.razonSocial.trim() || 'Sin nombre';
      const finalNit = clienteInfo.nit.trim() || '00000';

      if (pedidoActivo) {
        // Actualizar pedido existente
        await pedidoService.updatePedidoItems(pedidoActivo.id, {
          items,
          observaciones,
          razon_social: finalRazonSocial,
          nit: finalNit,
          tipo_pedido: tipoPedido,
        })
      } else {
        // Crear nuevo pedido
        await pedidoService.createPedido({
          mesa: selectedMesa,
          items,
          observaciones,
          razon_social: finalRazonSocial,
          nit: finalNit,
          tipo_pedido: tipoPedido,
        })
      }

      setRegistrarModalOpen(false)
      await fetchMesasOcupadas()
      // Recargar pedido activo
      await handleSelectMesa(selectedMesa)
      showToast(pedidoActivo ? 'Pedido actualizado correctamente' : 'Pedido registrado. Mesa ocupada.', 'success')
    } catch (error) {
      console.error("Error registrando pedido:", error)
      showToast(error?.response?.data?.error || 'Error al registrar el pedido', 'error')
    }
  }

  // FINALIZAR
  const handleFinalizar = () => {
    if (!pedidoActivo) {
      showToast('No hay un pedido activo para finalizar', 'error')
      return
    }
    setFinalizarModalOpen(true)
  }

  const handleConfirmFinalizar = async () => {
    setFinalizarModalOpen(false)
    try {
      const metodo = pagoTarjeta ? 'TARJETA' : (pagoQR ? 'QR' : 'EFECTIVO')
      await pedidoService.finalizarPedido(pedidoActivo.id, metodo)

      // Limpiar todo
      setPedidoActivo(null)
      setCarrito({})
      setClienteInfo({ razonSocial: '', nit: '' })
      setObservaciones('')
      setPagoQR(false)
      setPagoTarjeta(false)
      setSelectedMesa(null)
      await fetchMesasOcupadas()

      // Mostrar toast
      showToast('Pedido finalizado. Mesa liberada', 'success')
    } catch (error) {
      console.error("Error finalizando pedido:", error)
      showToast('Error al finalizar el pedido', 'error')
    }
  }

  const handleConfirmFinalizarTodas = async () => {
    setIsFinalizandoTodas(true)
    try {
      const res = await pedidoService.getPedidos({ estado: 'pendiente' })
      const pedidosPendientes = res.data || []
      
      for (const pedido of pedidosPendientes) {
        await pedidoService.finalizarPedido(pedido.id, pedido.pago_tarjeta ? 'TARJETA' : (pedido.pago_qr ? 'QR' : 'EFECTIVO'))
      }

      setPedidoActivo(null)
      setCarrito({})
      setClienteInfo({ razonSocial: '', nit: '' })
      setObservaciones('')
      setPagoQR(false)
      setPagoTarjeta(false)
      setSelectedMesa(null)
      await fetchMesasOcupadas()
      
      setFinalizarTodasModalOpen(false)
      showToast('Todas las mesas fueron finalizadas', 'success')
    } catch (error) {
      console.error("Error finalizando todas las mesas:", error)
      showToast('Error al finalizar algunas mesas', 'error')
    } finally {
      setIsFinalizandoTodas(false)
    }
  }

  // COMANDA (impresión para cocina)
  const handleComanda = () => {
    if (Object.keys(carrito).length === 0) {
      showToast('No hay platillos en la orden para generar comanda', 'error')
      return
    }

    const items = Object.values(carrito)
    const width = Math.floor(window.screen.width / 2);
    const height = Math.floor(window.screen.height / 2);
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`)
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda - Casa valluna</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 10px; width: 280px; color: #000; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .info { font-size: 12px; margin-bottom: 10px; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .item-row { font-size: 12px; margin-bottom: 5px; font-weight: bold; display: flex; }
          .qty { width: 35px; }
          .desc { flex: 1; }
          .obs { font-size: 11px; margin-top: 10px; border: 1px solid #000; padding: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="text-center title">COMANDA DE COCINA</div>
        <div class="info">
          <div><strong>PEDIDO NRO:</strong> ${pedidoActivo ? (pedidoActivo.numero_diario || pedidoActivo.id) : '--'}</div>
          <div><strong>TIPO:</strong> ${tipoPedido === 'llevar' ? 'PARA LLEVAR' : 'PARA INTERNO'}</div>
          <div><strong>TURNO:</strong> ${turno === 'AM' ? 'MAÑANA' : 'TARDE'}</div>
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
    
    const finalObservaciones = observaciones ? observaciones.trim() : 'Sin descripcion';
    html += `<div class="divider"></div><div class="obs"><strong>OBS:</strong><br/>${finalObservaciones}</div>`;
    
    html += `
        <div class="divider"></div>
        <div class="text-center" style="font-size: 10px; margin-top: 5px;">Casa valluna</div>
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
    setPagoTarjeta(false) // Desactivar tarjeta si se activa QR
    setCuentaModalOpen(false)

    // Actualizar en backend si hay pedido activo
    if (pedidoActivo) {
      try {
        await pedidoService.updatePedido(pedidoActivo.id, { pago_qr: true, pago_tarjeta: false, metodo_pago: 'QR' })
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

  // TARJETA (toggle pago con tarjeta)
  const handleTarjeta = () => {
    if (pagoTarjeta) {
      // Ya está activado, preguntar si desactiva
      setTarjetaConfirmModalOpen(true)
    } else {
      // Mostrar modal de tarjeta
      setTarjetaModalOpen(true)
    }
  }

  const handleConfirmTarjeta = async () => {
    setPagoTarjeta(true)
    setPagoQR(false) // Desactivar QR si se activa tarjeta
    setTarjetaModalOpen(false)

    // Actualizar en backend si hay pedido activo
    if (pedidoActivo) {
      try {
        await pedidoService.updatePedido(pedidoActivo.id, { pago_tarjeta: true, pago_qr: false, metodo_pago: 'TARJETA' })
      } catch (error) {
        console.error("Error actualizando pago tarjeta:", error)
      }
    }
  }

  const handleTarjetaConfirmSi = async () => {
    setPagoTarjeta(false)
    setTarjetaConfirmModalOpen(false)

    if (pedidoActivo) {
      try {
        await pedidoService.updatePedido(pedidoActivo.id, { pago_tarjeta: false, metodo_pago: 'EFECTIVO' })
      } catch (error) {
        console.error("Error actualizando pago:", error)
      }
    }
  }

  const handleTarjetaConfirmNo = () => {
    setTarjetaConfirmModalOpen(false)
  }

  // IMPRIMIR (recibo para cliente)
  const handleImprimir = () => {
    if (Object.keys(carrito).length === 0) {
      showToast('No hay platillos en la orden para imprimir', 'error')
      return
    }

    const items = Object.values(carrito)
    const metodo = pagoTarjeta ? 'TARJETA' : (pagoQR ? 'QR' : 'EFECTIVO')
    
    const width = Math.floor(window.screen.width / 2);
    const height = Math.floor(window.screen.height / 2);
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`)
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura - Casa valluna</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 10px; width: 280px; color: #000; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .header { margin-bottom: 10px; }
          .brand { font-size: 20px; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-bottom: 2px;}
          .sub-brand { font-size: 11px; margin-bottom: 5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; letter-spacing: 1px;}
          .info-block { font-size: 11px; margin-bottom: 10px; line-height: 1.3; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .item-row { display: flex; font-size: 11px; margin-bottom: 3px; }
          .item-qty { width: 25px; }
          .item-name { flex: 1; padding-right: 5px; }
          .item-price { width: 55px; text-align: right; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 5px; }
          .footer { text-align: center; font-size: 10px; margin-top: 10px; line-height: 1.3; }
        </style>
      </head>
      <body>
        <div class="text-center header">
          <div class="brand">CASA VALLUNA</div>
          <div style="font-size: 12px; font-weight: bold; border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px;">TICKET DE VENTA</div>
        </div>
        
        <div class="info-block">
          <div><strong>Pedido Nro:</strong> ${pedidoActivo ? (pedidoActivo.numero_diario || pedidoActivo.id) : '--'}</div>
          <div><strong>Tipo:</strong> ${tipoPedido === 'llevar' ? 'Para llevar' : 'Para interno'}</div>
          <div><strong>Fecha:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div><strong>Mesa:</strong> ${selectedMesa || '--'}</div>
          <div><strong>Cliente:</strong> ${clienteInfo.razonSocial || 'Sin nombre'}</div>
          <div><strong>NIT/CI:</strong> ${clienteInfo.nit || '00000'}</div>
          <div><strong>Obs:</strong> ${observaciones ? observaciones.trim() : 'Sin descripcion'}</div>
        </div>
        
        <div class="divider"></div>
        
        <div style="font-weight: bold; display: flex; font-size: 11px; margin-bottom: 5px;">
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
        <div style="font-size: 11px; margin-top: 10px;">
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
        {mesasOcupadas.length > 0 && (
          <button
            onClick={() => setFinalizarTodasModalOpen(true)}
            className="px-4 py-2 bg-[var(--guindo-primario)] text-white text-sm font-bold rounded-lg hover:bg-red-800 transition-colors shadow-sm"
          >
            Finalizar Todas las Mesas
          </button>
        )}
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
          setClienteInfo={(info) => { setClienteInfo(info) }}
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
          onTarjeta={handleTarjeta}
          pagoQR={pagoQR}
          pagoTarjeta={pagoTarjeta}
          pedidoActivo={pedidoActivo}
          validationError={false}
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

      <TarjetaModal
        isOpen={tarjetaModalOpen}
        onClose={() => setTarjetaModalOpen(false)}
        onConfirm={handleConfirmTarjeta}
        totalPedido={totalPedido}
      />

      <TarjetaConfirmModal
        isOpen={tarjetaConfirmModalOpen}
        onClose={() => setTarjetaConfirmModalOpen(false)}
        onConfirmSi={handleTarjetaConfirmSi}
        onConfirmNo={handleTarjetaConfirmNo}
      />

      <FinalizarModal
        isOpen={finalizarModalOpen}
        onClose={() => setFinalizarModalOpen(false)}
        onConfirm={handleConfirmFinalizar}
      />

      <FinalizarTodasModal
        isOpen={finalizarTodasModalOpen}
        onClose={() => setFinalizarTodasModalOpen(false)}
        onConfirm={handleConfirmFinalizarTodas}
        isFinalizando={isFinalizandoTodas}
      />

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-[9999] animate-bounce">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 backdrop-blur-md text-white font-semibold ${toast.type === 'success' ? 'bg-green-600/95' : 'bg-red-600/95'
            }`}>
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PedidosPage