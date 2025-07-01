// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar región específica
const regionalFunctions = functions.region('us-central1');

// Configurar Gmail
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Función HTTP para verificar fechas límite
exports.checkDeadlines = regionalFunctions.https.onRequest(async (req, res) => {
  console.log('Iniciando verificación de fechas límite...');
  
  const db = admin.firestore();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  try {
    const objectivesSnapshot = await db.collection('objectives').get();
    const usersSnapshot = await db.collection('users').get();
    const usersMap = {};
    usersSnapshot.forEach(doc => {
      usersMap[doc.id] = doc.data().email;
    });
    
    let emailsSent = 0;
    let results = [];
    
    for (const doc of objectivesSnapshot.docs) {
      const obj = { id: doc.id, ...doc.data() };
      const userEmail = usersMap[obj.uid];
      
      if (!obj.deadline || !userEmail) continue;
      
      const progress = obj.milestones && obj.milestones.length > 0 ? 
        (obj.milestones.filter(m => m.completed).length / obj.milestones.length) * 100 : 0;
      
      if (progress >= 100) continue;
      
      const deadline = new Date(obj.deadline.toDate());
      deadline.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      console.log(`Objetivo: ${obj.text}, Días restantes: ${daysLeft}, Usuario: ${userEmail}`);
      
      let emailType = null;
      
      if (daysLeft === 0) {
        await sendEmail(userEmail, 'urgente', obj, daysLeft, progress);
        emailType = 'urgente';
        emailsSent++;
      } else if (daysLeft === 1) {
        await sendEmail(userEmail, 'mañana', obj, daysLeft, progress);
        emailType = 'mañana';
        emailsSent++;
      } else if (daysLeft === 3) {
        await sendEmail(userEmail, 'recordatorio', obj, daysLeft, progress);
        emailType = 'recordatorio';
        emailsSent++;
      } else if (daysLeft < 0) {
        const daysSinceOverdue = Math.abs(daysLeft);
        if (daysSinceOverdue % 7 === 0) {
          await sendEmail(userEmail, 'vencido', obj, daysLeft, progress);
          emailType = 'vencido';
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
    
    console.log(`Verificación completada. Emails enviados: ${emailsSent}`);
    res.json({ 
      success: true, 
      emailsSent, 
      totalObjectives: results.length,
      results: results,
      message: `Verificación completada. Emails enviados: ${emailsSent}` 
    });
    
  } catch (error) {
    console.error('Error en verificación de fechas límite:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función HTTP para simular completar objetivo (para testing)
exports.simulateComplete = regionalFunctions.https.onRequest(async (req, res) => {
  try {
    const { email, objectiveName } = req.query;
    
    if (!email || !objectiveName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan parámetros: ?email=tu@email.com&objectiveName=NombreObjetivo' 
      });
    }
    
    const testObjective = {
      text: objectiveName,
      milestones: [
        { title: "Hito 1", completed: true },
        { title: "Hito 2", completed: true }
      ]
    };
    
    await sendEmail(email, 'completado', testObjective, 0, 100);
    res.json({ success: true, message: `Email de felicitación enviado a ${email}` });
    
  } catch (error) {
    console.error('Error enviando email de completado:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función auxiliar para enviar emails
async function sendEmail(email, tipo, objetivo, daysLeft, progress) {
  let subject, html;
  
  const progressText = `${Math.round(progress)}%`;
  
  switch (tipo) {
    case 'urgente':
      subject = '🚨 ¡Tu objetivo vence HOY!';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #e53935; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🚨 ¡URGENTE!</h1>
            <h2 style="margin: 10px 0 0 0;">Tu objetivo vence HOY</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin-top: 0;">📋 ${objetivo.text}</h3>
            <p style="font-size: 16px; color: #666;">
              <strong>Progreso actual:</strong> ${progressText} completado
            </p>
            <p style="color: #e53935; font-weight: bold; font-size: 18px;">
              ⏰ ¡Es tu última oportunidad para terminarlo!
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p style="color: #1976d2; font-weight: bold; margin: 0;">
                🎯 Revisa tu objetivo en la aplicación Imparable
              </p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'mañana':
      subject = '⚡ Tu objetivo vence MAÑANA';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff9800; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">⚡ ¡Atención!</h1>
            <h2 style="margin: 10px 0 0 0;">Tu objetivo vence MAÑANA</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin-top: 0;">📋 ${objetivo.text}</h3>
            <p style="font-size: 16px; color: #666;">
              <strong>Progreso actual:</strong> ${progressText} completado
            </p>
            <p style="color: #ff9800; font-weight: bold; font-size: 16px;">
              📅 Te queda 1 día para completarlo
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p style="color: #1976d2; font-weight: bold; margin: 0;">
                🎯 Revisa tu objetivo en la aplicación Imparable
              </p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'recordatorio':
      subject = '📍 Recordatorio: Te quedan 3 días';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">📍 Recordatorio</h1>
            <h2 style="margin: 10px 0 0 0;">Te quedan 3 días</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin-top: 0;">📋 ${objetivo.text}</h3>
            <p style="font-size: 16px; color: #666;">
              <strong>Progreso actual:</strong> ${progressText} completado
            </p>
            <p style="color: #1976d2; font-weight: bold; font-size: 16px;">
              ⏳ Todavía tienes tiempo, ¡sigue así!
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p style="color: #1976d2; font-weight: bold; margin: 0;">
                🎯 Revisa tu objetivo en la aplicación Imparable
              </p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'vencido':
      subject = '⏰ Objetivo vencido - ¿Necesitas ayuda?';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">⏰ Objetivo Vencido</h1>
            <h2 style="margin: 10px 0 0 0;">Hace ${Math.abs(daysLeft)} días</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin-top: 0;">📋 ${objetivo.text}</h3>
            <p style="font-size: 16px; color: #666;">
              <strong>Progreso actual:</strong> ${progressText} completado
            </p>
            <p style="color: #d32f2f; font-weight: bold; font-size: 16px;">
              ¿Necesitas extender la fecha límite o ajustar el objetivo?
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
              <p style="color: #1976d2; font-weight: bold; margin: 0;">
                🎯 Revisa tu objetivo en la aplicación Imparable
              </p>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'completado':
      subject = '🎉 ¡Felicidades! Objetivo completado';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #43a047; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">🎉 ¡FELICIDADES!</h1>
            <h2 style="margin: 10px 0 0 0;">¡Has completado tu objetivo!</h2>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; margin-top: 0;">✅ ${objetivo.text}</h3>
            <p style="font-size: 18px; color: #43a047; font-weight: bold; text-align: center;">
              🏆 ¡100% COMPLETADO! 🏆
            </p>
            <p style="font-size: 16px; color: #666; text-align: center;">
              ¡Excelente trabajo! Has demostrado dedicación y perseverancia. 💪
            </p>
            <div style="text-align: center; margin: 30px 0; padding: 15px; background: #e8f5e8; border-radius: 5px;">
              <p style="color: #43a047; font-weight: bold; margin: 0;">
                🚀 Sigue así con tus próximos objetivos
              </p>
            </div>
          </div>
        </div>
      `;
      break;
      
    default:
      return;
  }
  
  const mailOptions = {
    from: `"Imparable App" <${gmailEmail}>`,
    to: email,
    subject: subject,
    html: html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email}: ${tipo} - ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error enviando email a ${email}:`, error);
    throw error;
  }
}

// Función de test simple
exports.testEmail = regionalFunctions.https.onRequest(async (req, res) => {
  try {
    const testObjective = {
      text: "Completar mi TFG",
      milestones: [
        { title: "Investigación", completed: true },
        { title: "Desarrollo", completed: false }
      ]
    };
    
    await sendEmail('conquistalogros@gmail.com', 'recordatorio', testObjective, 3, 50);
    res.json({ success: true, message: 'Email de prueba enviado a conquistalogros@gmail.com' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});