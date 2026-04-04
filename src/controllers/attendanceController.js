const jwt = require('jsonwebtoken');
const { Attendance, Session, Log } = require('../models');
const { Op } = require('sequelize');

exports.markAttendance = async (req, res) => {
  try {
    const { qrToken, deviceTicket, deviceFingerprint } = req.body;

    if (!qrToken) {
      return res.status(400).json({ error: 'QR Token is required' });
    }

    // 1. Validate the JWT token from QR
    let decodedQr;
    try {
      decodedQr = jwt.verify(qrToken, process.env.JWT_SECRET);
    } catch (err) {
      // Token is expired (older than 10-15s) or tampered
      return res.status(400).json({ error: 'QR Code is invalid or expired. Please scan the latest one.' });
    }

    const { sessionId, nonce } = decodedQr;

    // 2. Validate Session
    const session = await Session.findByPk(sessionId);
    if (!session || !session.isActive) {
      return res.status(400).json({ error: 'This class session is no longer active.' });
    }

    // 4. IP Validation
    let studentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (studentIp === '::1' || studentIp === '::ffff:127.0.0.1') studentIp = '127.0.0.1';

    // Anti-proxy logic: compare with gateway IP
    if (session.validGatewayIp && session.validGatewayIp !== '127.0.0.1' && studentIp !== session.validGatewayIp) {
        await Log.create({
            action: 'PROXY_ATTEMPT_BLOCKED',
            details: `IP Mismatch. Expected: ${session.validGatewayIp}, Got: ${studentIp}`,
            userId: req.user.id,
            ipAddress: studentIp
        });
        
        // Uncomment below line to actively block in production
        // return res.status(403).json({ error: `Proxy attendance blocked! Must connect to class WiFi.` });
    }

    // 5. Ensure student hasn't already marked attendance
    const existingAttendance = await Attendance.findOne({
      where: { sessionId, studentId: req.user.id }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Your attendance is already marked for this session.' });
    }

    // 5b. The Ultimate Hardware Proxy Lock! 
    // Ensure no overlapping physical devices try to scan twice.
    if (deviceTicket || (deviceFingerprint && deviceFingerprint !== 'unknown_fp')) {
        const overlappingDevice = await Attendance.findOne({
            where: {
                sessionId,
                [Op.or]: [
                    deviceTicket ? { deviceTicket } : null,
                    (deviceFingerprint && deviceFingerprint !== 'unknown_fp') ? { deviceFingerprint } : null
                ].filter(Boolean) // Remove nulls from Op.or
            }
        });

        if (overlappingDevice) {
            await Log.create({
                action: 'DEVICE_SHARE_BLOCKED',
                details: `Physical Device lock hit. Someone else checked in on this phone!`,
                userId: req.user.id,
                ipAddress: studentIp
            });
            return res.status(403).json({ error: 'This physical device (phone/laptop) has already recorded an attendance today! You cannot share devices.' });
        }
    }

    // 6. Mark Attendance
    const attendance = await Attendance.create({
      sessionId,
      studentId: req.user.id,
      ipAddress: studentIp,
      deviceInfo: req.headers['user-agent'],
      deviceTicket: deviceTicket || null,
      deviceFingerprint: deviceFingerprint !== 'unknown_fp' ? deviceFingerprint : null
    });

    // Extract app IO securely to emit event to admin
    const io = req.app.get('io');
    if (io) {
      io.to(`session_${sessionId}`).emit('attendance-marked', {
        studentId: req.user.studentId,
        name: req.user.name,
        email: req.user.email,
        timestamp: attendance.timestamp
      });
    }

    res.status(200).json({ status: 'success', message: 'Attendance marked successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
