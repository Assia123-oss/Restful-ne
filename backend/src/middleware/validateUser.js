const validator = require('validator');

const validateUser = (req, res, next) => {
  let { name, email, password } = req.body;

  name = name ? name.trim() : '';
  email = email ? email.trim() : '';
  password = password ? password.trim() : '';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
    return res.status(400).json({ message: 'Name must be 2-50 characters long and contain only letters and spaces' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    });
  }

  req.body = { name, email, password };
  next();
};

module.exports = validateUser;