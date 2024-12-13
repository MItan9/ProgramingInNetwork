
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'mihailova99999@gmail.com', 
        pass: 'defk kxyw jpbt cyme' 
    }
});

const mailOptions = {
    from: 'mihailova99999@gmail.com', 
    to: 'tatiana.mihailova@isa.utm.md', 
    subject: 'Sending Email using Node.js', 
    text: 'Im shocked!' 
};

transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log('Error:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});
