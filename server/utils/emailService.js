const nodemailer = require('nodemailer');
const path = require('path');

// Configuración del transporter
// En producción, reemplaza con variables de entorno o credenciales reales
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarCorreoBienvenida = async (email, nombre, carnet) => {
  // Si no hay credenciales configuradas, skip silenciosamente
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Envío de correo omitido: EMAIL_USER / EMAIL_PASS no configurados en .env');
    return false;
  }
  
  try {
    // Ruta a la imagen del logo en el frontend
    const logoPath = path.join(__dirname, '../../src/assets/images/LogoAtavismoLetra.png');

    const mailOptions = {
      from: `"Atavismo Catering" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bienvenido a Atavismo Catering - Credenciales de Acceso',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Encabezado con color Guindo -->
          <div style="background-color: #7a1523; padding: 40px 20px; text-align: center; border-bottom: 3px solid #5a0f19;">
            <img src="cid:logoatavismo" alt="Atavismo Catering" style="max-width: 280px; display: block; margin: 0 auto;" />
          </div>
          
          <!-- Cuerpo del correo -->
          <div style="padding: 40px 35px;">
            <h2 style="color: #222222; font-size: 26px; margin-top: 0; margin-bottom: 20px; text-align: center; font-weight: bold;">¡Bienvenido al equipo, ${nombre}!</h2>
            
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
              El Administrador de <strong>Atavismo Catering</strong> ha creado tu cuenta oficial en el sistema de pedidos. A continuación, encontrarás tus credenciales de acceso:
            </p>
            
            <!-- Caja de Credenciales -->
            <div style="background-color: #faf5f6; border-left: 5px solid #7a1523; padding: 25px; border-radius: 0 8px 8px 0; margin-bottom: 35px;">
              <p style="margin: 0 0 12px 0; color: #333333; font-size: 16px;">
                <span style="color: #7a1523; font-weight: bold; display: inline-block; width: 140px;">Usuario o Correo:</span> 
                <strong style="color: #111111;">${email}</strong> <span style="color: #888888; font-size: 14px;">(o ${nombre})</span>
              </p>
              <p style="margin: 0; color: #333333; font-size: 16px;">
                <span style="color: #7a1523; font-weight: bold; display: inline-block; width: 140px;">Contraseña:</span> 
                <strong style="color: #111111; letter-spacing: 1px;">${carnet}</strong>
              </p>
            </div>
            
            <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 0; text-align: center; background-color: #fcfcfc; padding: 15px; border-radius: 8px; border: 1px dashed #dddddd;">
              <em><strong style="color: #555555;">Nota importante:</strong> Por tu seguridad, te recomendamos no compartir estas credenciales. Tu contraseña inicial ha sido configurada como tu número de Carnet de Identidad.</em>
            </p>
          </div>
          
          <!-- Pie de página -->
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 13px; margin: 0;">
              © ${new Date().getFullYear()} Atavismo Catering. Todos los derechos reservados.
            </p>
            <p style="color: #aaaaaa; font-size: 12px; margin: 8px 0 0 0;">
              Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'LogoAtavismoLetra.png',
          path: logoPath,
          cid: 'logoatavismo', // Mismo cid referenciado en el HTML
          contentDisposition: 'inline'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando correo de bienvenida:', error);
    // No lanzamos error para que no bloquee la creación del usuario si falla el email
    return false;
  }
};

module.exports = {
  enviarCorreoBienvenida
};
