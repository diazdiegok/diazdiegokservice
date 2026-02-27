import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter
// In production, you would use real SMTP settings from .env
// For now, we'll use a test account or a placeholder
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOrderConfirmation(order, items) {
    if (!order.shipping_email) return;

    const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

    const mailOptions = {
        from: '"DiazDiegokService" <noreply@diazdiegokservice.com>',
        to: order.shipping_email,
        subject: `Confirmación de pedido #${order.id} - DiazDiegokService`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #4CAF50;">¡Gracias por tu compra!</h2>
        <p>Hola <strong>${order.shipping_name}</strong>,</p>
        <p>Hemos recibido tu pedido correctamente. Aquí tenés los detalles:</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Resumen del pedido #${order.id}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 10px; font-weight: bold;">Total</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #4CAF50;">$${order.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <h3>Datos de envío:</h3>
        <p>
          ${order.shipping_address}<br>
          ${order.shipping_city}<br>
          Tel: ${order.shipping_phone}
        </p>
        
        <p style="margin-top: 30px;">Si tenés alguna duda, podés contactarnos por WhatsApp al 3435508586.</p>
        <p>Saludos,<br>El equipo de DiazDiegokService</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        // Preview URL for Ethereal
        if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
