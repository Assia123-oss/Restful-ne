require('dotenv').config({path:'../../.env'});
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NODEMAILER_EMAIL:', process.env.NODEMAILER_EMAIL);
console.log('NODEMAILER_PASS:', process.env.NODEMAILER_PASS);