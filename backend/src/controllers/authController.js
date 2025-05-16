const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { sendOtpEmail } = require('../utils/email');



const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const adminCount = await prisma.users.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      console.log('Admin already exists, only user role allowed');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    try {
      await sendOtpEmail(email, otpCode);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        is_verified: false,
      },
    });

    await prisma.otp.create({
      data: {
        userId: newUser.id,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    res.status(201).json({ message: 'User registered, OTP sent to email', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { userId, otpCode } = req.body;

  if (!userId || !otpCode) {
    return res.status(400).json({ error: 'User ID and OTP code are required' });
  }

  try {
    const otp = await prisma.otp.findFirst({
      where: {
        userId: parseInt(userId),
        otp_code: otpCode,
        expires_at: { gt: new Date() },
        is_verified: false,
      },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.otp.updateMany({
      where: {
        userId: parseInt(userId),
        otp_code: otpCode,
      },
      data: {
        is_verified: true,
      },
    });

    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: { is_verified: true },
    });

    await prisma.logs.create({
      data: {
        userId: parseInt(userId),
        action: 'User verified OTP',
      },
    });

    res.json({ message: 'OTP verified, user registration completed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const resendOtp = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await prisma.users.findFirst({
      where: {
        id: parseInt(userId),
        is_verified: false,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not found or already verified' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.deleteMany({ where: { userId: user.id } });

    await prisma.otp.create({
      data: {
        userId: user.id,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    try {
      await sendOtpEmail(user.email, otpCode);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to resend OTP email' });
    }

    await prisma.logs.create({
      data: {
        userId: user.id,
        action: 'OTP resent',
      },
    });

    res.json({ message: 'OTP resent to email' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

console.log('Entered password:', password);
console.log('Stored hash:', user.password);
console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await prisma.logs.create({
      data: {
        userId: user.id,
        action: 'User logged in',
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
};
