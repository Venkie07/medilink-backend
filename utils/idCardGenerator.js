const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const supabase = require('../config/db');

const idCardGenerator = {
  // Generate QR code data URL
  async generateQRCode(data) {
    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(data));
      return qrDataUrl;
    } catch (error) {
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  },

  // Fetch patient photo from URL
  async fetchPatientPhoto(photoUrl) {
    if (!photoUrl) return null;
    
    try {
      // Extract file path from Supabase URL
      const urlParts = photoUrl.split('/storage/v1/object/public/');
      if (urlParts.length < 2) return null;

      const pathParts = urlParts[1].split('/');
      const bucket = pathParts[0];
      const filePath = pathParts.slice(1).join('/');

      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error || !data) return null;

      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error fetching photo:', error);
      return null;
    }
  },

  // Generate ID card PDF
  async generateIdCardPDF(patient) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [400, 250], // ID card size
          margins: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Background rectangle
        doc.rect(0, 0, 400, 250)
          .fillColor('#f0f0f0')
          .fill();

        // Fetch patient photo
        let photoBuffer = null;
        if (patient.photoUrl) {
          photoBuffer = await this.fetchPatientPhoto(patient.photoUrl);
        }

        // Draw photo or placeholder
        if (photoBuffer) {
          doc.image(photoBuffer, 30, 40, {
            width: 80,
            height: 100,
            fit: [80, 100]
          });
        } else {
          // Draw placeholder rectangle
          doc.rect(30, 40, 80, 100)
            .fillColor('#cccccc')
            .fill()
            .fillColor('#666666')
            .fontSize(12)
            .text('No Photo', 40, 85, { align: 'center' });
        }

        // Patient information
        doc.fillColor('#000000')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(patient.name, 130, 50);

        doc.fontSize(12)
          .font('Helvetica')
          .text(`Patient ID: ${patient.patientId}`, 130, 80)
          .text(`Age: ${patient.age} years`, 130, 100)
          .text(`Gender: ${patient.gender}`, 130, 120);

        // Generate and add QR code
        const qrData = {
          patientId: patient.patientId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender
        };

        const qrCodeDataUrl = await this.generateQRCode(qrData);
        if (qrCodeDataUrl) {
          // Convert data URL to buffer
          const base64Data = qrCodeDataUrl.split(',')[1];
          const qrBuffer = Buffer.from(base64Data, 'base64');
          
          doc.image(qrBuffer, 280, 50, {
            width: 80,
            height: 80
          });
        }

        // Footer
        doc.fontSize(10)
          .fillColor('#666666')
          .text('MediLink Healthcare System', 130, 200);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = idCardGenerator;

