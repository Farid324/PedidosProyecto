export const printShiftReceipt = (data) => {
  const width = Math.floor(window.screen.width / 2);
  const height = Math.floor(window.screen.height / 2);
  const left = (window.screen.width / 2) - (width / 2);
  const top = (window.screen.height / 2) - (height / 2);
  const printWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);
  
  if (!printWindow) return;

  const {
    cajero,
    fecha,
    turno,
    resumen: {
      total = 0,
      total_qr = 0,
      total_efectivo = 0,
      total_tarjeta = 0
    } = {}
  } = data;

  const dateObj = new Date(fecha + 'T12:00:00'); // Safe parsing to avoid timezone shift
  const formattedDate = dateObj.toLocaleDateString('es-BO');
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cierre de Turno</title>
      <style>
        @page { margin: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 10px; width: 280px; color: #000; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 5px; }
        .info { font-size: 12px; margin-bottom: 10px; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
        .row-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 10px; border-top: 2px solid #000; padding-top: 5px; }
      </style>
    </head>
    <body>
      <div class="text-center title">REPORTE DE TURNO</div>
      
      <div class="info">
        <div><strong>FECHA:</strong> ${formattedDate}</div>
        <div><strong>HORA IMPRESIÓN:</strong> ${formattedTime}</div>
        <div><strong>TURNO:</strong> ${turno === 'TODOS' ? 'AMBOS (AM y PM)' : turno}</div>
        <div><strong>CAJERO:</strong> ${cajero || 'Todos'}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="text-center" style="font-weight: bold; margin-bottom: 5px;">RESUMEN DE VENTAS</div>
      
      <div class="row">
        <span>EFECTIVO:</span>
        <span>Bs ${Number(total_efectivo).toFixed(2)}</span>
      </div>
      <div class="row">
        <span>QR:</span>
        <span>Bs ${Number(total_qr).toFixed(2)}</span>
      </div>
      <div class="row">
        <span>TARJETA:</span>
        <span>Bs ${Number(total_tarjeta).toFixed(2)}</span>
      </div>
      
      <div class="row-total">
        <span>TOTAL GENERAL:</span>
        <span>Bs ${Number(total).toFixed(2)}</span>
      </div>
      
      <div class="divider" style="margin-top: 15px;"></div>
      <div class="text-center" style="font-size: 10px; margin-top: 5px;">Cierre Generado por Sistema</div>
      
      <script>
        window.onload = function() { 
          setTimeout(function() { window.print(); window.close(); }, 300);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
