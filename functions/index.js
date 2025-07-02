// functions/index.js - Versión completa con todas las funciones
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { defineString } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

initializeApp();

const gmailEmail = defineString('GMAIL_EMAIL');
const gmailPassword = defineString('GMAIL_PASSWORD');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail.value(),
    pass: gmailPassword.value()
  }
});

// Función principal: Verificar fechas límite de objetivos
exports.dailyCheck = onSchedule('0 9 * * *', async (event) => { // Todos los días a las 9:00 AM UTC
  console.log('Ejecutando verificación automática diaria...');
  
  const db = getFirestore();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  try {
    const [objectivesSnapshot, usersSnapshot] = await Promise.all([
      db.collection('objectives').get(),
      db.collection('users').get()
    ]);
    
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data().email;
    });
    
    let emailsSent = 0;
    let results = [];
    
    for (const doc of objectivesSnapshot.docs) {
      const obj = doc.data();
      const userEmail = usersMap[obj.uid];
      
      if (!obj.deadline || !userEmail) continue;
      
      let progress = 0;
      if (obj.milestones && obj.milestones.length > 0) {
        const completed = obj.milestones.filter(m => m.completed).length;
        progress = (completed / obj.milestones.length) * 100;
      }
      
      if (progress >= 100) continue;
      
      const deadline = new Date(obj.deadline.toDate());
      deadline.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      let emailType = null;
      
      if (daysLeft === 0) {
        await sendNotificationEmail(userEmail, 'urgente', obj, progress, daysLeft);
        emailType = 'urgente - vence HOY';
        emailsSent++;
      } else if (daysLeft === 1) {
        await sendNotificationEmail(userEmail, 'mañana', obj, progress, daysLeft);
        emailType = 'mañana - vence en 1 día';
        emailsSent++;
      } else if (daysLeft === 3) {
        await sendNotificationEmail(userEmail, 'recordatorio', obj, progress, daysLeft);
        emailType = 'recordatorio - quedan 3 días';
        emailsSent++;
      } else if (daysLeft < 0) {
        const daysSinceOverdue = Math.abs(daysLeft);
        if (daysSinceOverdue % 7 === 0) {
          await sendNotificationEmail(userEmail, 'vencido', obj, progress, daysLeft);
          emailType = `vencido - hace ${daysSinceOverdue} días`;
          emailsSent++;
        }
      }
      
      results.push({
        objetivo: obj.text,
        usuario: userEmail,
        daysLeft: daysLeft,
        progress: Math.round(progress),
        emailSent: emailType
      });
    }
    
    console.log(`✅ Verificación completada. Emails enviados: ${emailsSent}`);
    return {
      success: true,
      emailsSent: emailsSent,
      objetivosRevisados: results.length,
      detalles: results,
      timestamp: new Date().toISOString(),
      trigger: 'automatic'
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
});

// Enviar email al completar objetivo
exports.completationEmail = onRequest(async (req, res) => {
  const email = req.query.email || gmailEmail.value();
  const objetivo = req.query.objetivo || 'Completar mi TFG';
  
  try {
    await sendNotificationEmail(email, 'completado', { text: objetivo }, 100, 0);
    res.json({ 
      success: true, 
      message: `🎉 Email de felicitación enviado a ${email}`,
      objetivo: objetivo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función auxiliar para enviar emails con diseños bonitos
async function sendNotificationEmail(email, tipo, objetivo, progress, daysLeft) {
  let subject, html;
  
  switch (tipo) {
    case 'urgente':
      subject = '🚨 ¡Tu objetivo vence HOY!';
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #e53935, #d32f2f); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🚨 ¡URGENTE!</h1>
            <h2 style="margin: 15px 0 0 0; font-weight: 300; font-size: 18px;">Tu objetivo vence HOY</h2>
          </div>
          <div style="background: white; padding: 30px;">
            <h3 style="color: #333; margin-top: 0; font-size: 20px;">📋 ${objetivo.text}</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #666;">
                <strong>Progreso actual:</strong> ${Math.round(progress)}% completado
              </p>
            </div>
            <p style="color: #e53935; font-weight: bold; font-size: 18px; text-align: center; margin: 25px 0;">
              ⏰ ¡Es tu última oportunidad para terminarlo!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
                <p style="color: #1976d2; font-weight: bold; margin: 0; font-size: 16px;">
                  🎯 Abre la aplicación ConquistaLogros y termina tu objetivo
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'mañana':
      subject = '⚡ Tu objetivo vence MAÑANA';
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #ff9800, #f57c00); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">⚡ ¡Atención!</h1>
            <h2 style="margin: 15px 0 0 0; font-weight: 300; font-size: 18px;">Tu objetivo vence MAÑANA</h2>
          </div>
          <div style="background: white; padding: 30px;">
            <h3 style="color: #333; margin-top: 0; font-size: 20px;">📋 ${objetivo.text}</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #666;">
                <strong>Progreso actual:</strong> ${Math.round(progress)}% completado
              </p>
            </div>
            <p style="color: #ff9800; font-weight: bold; font-size: 18px; text-align: center; margin: 25px 0;">
              📅 ¡Solo te queda 1 día para completarlo!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px;">
                <p style="color: #f57c00; font-weight: bold; margin: 0; font-size: 16px;">
                  🏃‍♂️ ¡Es momento de acelerar el paso!
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'recordatorio':
      subject = '📍 Recordatorio: Te quedan 3 días';
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1976d2, #1565c0); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📍 Recordatorio</h1>
            <h2 style="margin: 15px 0 0 0; font-weight: 300; font-size: 18px;">Te quedan 3 días</h2>
          </div>
          <div style="background: white; padding: 30px;">
            <h3 style="color: #333; margin-top: 0; font-size: 20px;">📋 ${objetivo.text}</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #666;">
                <strong>Progreso actual:</strong> ${Math.round(progress)}% completado
              </p>
            </div>
            <p style="color: #1976d2; font-weight: bold; font-size: 18px; text-align: center; margin: 25px 0;">
              ⏳ Todavía tienes tiempo, ¡sigue así!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
                <p style="color: #1976d2; font-weight: bold; margin: 0; font-size: 16px;">
                  💪 ¡Vas por buen camino!
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'vencido':
      const daysSinceOverdue = Math.abs(daysLeft);
      subject = '⏰ Objetivo vencido - ¿Necesitas ayuda?';
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #d32f2f, #b71c1c); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">⏰ Objetivo Vencido</h1>
            <h2 style="margin: 15px 0 0 0; font-weight: 300; font-size: 18px;">Hace ${daysSinceOverdue} días</h2>
          </div>
          <div style="background: white; padding: 30px;">
            <h3 style="color: #333; margin-top: 0; font-size: 20px;">📋 ${objetivo.text}</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; color: #666;">
                <strong>Progreso actual:</strong> ${Math.round(progress)}% completado
              </p>
            </div>
            <p style="color: #d32f2f; font-weight: bold; font-size: 16px; text-align: center; margin: 25px 0;">
              ¿Necesitas extender la fecha límite o ajustar el objetivo?
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #ffebee; padding: 20px; border-radius: 8px;">
                <p style="color: #d32f2f; font-weight: bold; margin: 0; font-size: 16px;">
                  🔄 No te rindas, ajusta tu plan y sigue adelante
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'completado':
      subject = '🎉 ¡Felicidades! Objetivo completado';
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #43a047, #388e3c); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🎉 ¡FELICIDADES!</h1>
            <h2 style="margin: 15px 0 0 0; font-weight: 300; font-size: 18px;">¡Has completado tu objetivo!</h2>
          </div>
          <div style="background: white; padding: 30px; text-align: center;">
            <h3 style="color: #333; margin-top: 0; font-size: 24px;">✅ ${objetivo.text}</h3>
            <div style="margin: 30px 0;">
              <p style="font-size: 24px; color: #43a047; font-weight: bold; margin: 0;">
                🏆 ¡100% COMPLETADO! 🏆
              </p>
            </div>
            <p style="font-size: 18px; color: #666; margin: 25px 0;">
              ¡Excelente trabajo! Has demostrado dedicación y perseverancia. 💪
            </p>
            <div style="background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #43a047; font-weight: bold; margin: 0; font-size: 18px;">
                🚀 Eres imparable, sigue así con tus próximos objetivos
              </p>
            </div>
          </div>
        </div>
      `;
      break;
  }
  
  const mailOptions = {
    from: `"ConquistaLogros" <${gmailEmail.value()}>`,
    to: email,
    subject: subject,
    html: html
  };
  
  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email enviado a ${email}: ${tipo} - ${info.messageId}`);
}

// Funciones de testing
exports.helloWorld = onRequest(async (req, res) => {
  res.json({ 
    message: '🚀 ConquistaLogros funcionando perfectamente',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

exports.testBasic = onRequest(async (req, res) => {
  try {
    await sendNotificationEmail(gmailEmail.value(), 'completado', 
      { text: 'Realizar TFG' }, 100, -7);
    res.json({ 
      success: true, 
      message: 'Email de prueba enviado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

exports.checkBasic = onRequest(async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('objectives').get();
    
    res.json({ 
      success: true, 
      totalObjectives: snapshot.size,
      message: `📊 Se encontraron ${snapshot.size} objetivos en la base de datos`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});