const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

exports.generateDynamicQR = async (sessionId) => {
  const payload = {
    sessionId,
    nonce: Math.random().toString(36).substring(2, 15) // Nonce for replay protection
  };
  
  // Token expires slowly (2 minutes) to account for manual entering and slow GPS lock delays
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2m' });
  
  try {
    // Generate the QR Code as a base64 string
    const qrDataUrl = await QRCode.toDataURL(token, {
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return { token, qrDataUrl };
  } catch (err) {
    console.error("QR Generation Error:", err);
    return null;
  }
};
