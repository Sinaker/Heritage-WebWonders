const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_KEY,
  },
});

exports.getHome = (req, res, next) => {
  const login = req.query.login || false;
  const email = req.query.mailSent || false;
  const notAuth = req.query.notAuth || false;
  res.render("heropage", {
    pageTitle: "Darshan",
    normal: false,
    dark: false,
    login: login,
    email: email,
    notAuth: notAuth,
  });
};

exports.sendSub = async (req, res, next) => {
  try {
    const email = req.body.email;
    const p = path.join(
      __dirname,
      "..",
      "views",
      "templates",
      "subscription.html"
    );
    const htmlContent = await fs.readFile(p, "utf8"); // Ensure the file is read as a UTF-8 string

    const mailOptions = {
      from: `"Darshan Newsletter" <${process.env.SENDER}>`,
      to: email,
      subject: "Thank you for Subscribing",
      html: htmlContent, // Use the read file content as the email body
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error:", err);
      } else {
        console.log("Subscription Sent:", info.response);
      }
    });

    res.redirect("/?mailSent=true");
  } catch (error) {
    console.error("Failed to send subscription email:", error);
    res.redirect("/?mailSent=false");
  }
};

exports.getAbout = (req, res, next) => {
  res.render("about", {
    pageTitle: "About Us",
    normal: false,
    dark: true,
  });
};

exports.getContribute = (req, res, next) => {
  res.render("contribute", {
    pageTitle: "About Us",
    normal: false,
    dark: true,
  });
};
