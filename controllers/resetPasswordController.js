const asyncHandler = require("express-async-handler");
const { User } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

exports.sendRestEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: "No user found with this email" });
    return;
  }

  const secret = process.env.JWT_SECRET + user.password;

  const payload = { email: user.email, id: user.id };

  const token = jwt.sign(payload, secret, { expiresIn: "15m" });

  const BaseURL = process.env.BASE_URL;

  const link = `${BaseURL}/api/resetpassword/${user.id}/${token}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Reset Password Link",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; width:"100%">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #555;">Hello,</p>
          <p style="color: #555;">We received a request to reset your password. Click the button below to reset it:</p>
          <p style="color: #555;"><strong>Note:</strong>The link is valid only for 15 minutes.</p>
          <a style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; transition: background-color 0.3s ease;" href=${link}>Reset Password</a>
          <p style="color: #555;">If you didn't request a password reset, you can ignore this email.</p>
          <p style="color: #555;">Thank you!</p>
        </div>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Reset password link sent to the email address" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.send("Invalid user");
  }

  const secret = process.env.JWT_SECRET + user.password;

  try {
    const payload = jwt.verify(token, secret);
    res.render("forgot-password", {
      email: payload.email,
      id: id,
      token: token,
      status: "not verified",
    });
  } catch (error) {
    res.send("This Link has expired. Please request for a new one");
  }
});

exports.submitNewPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User does not exist" });
  }
  const secret = process.env.JWT_SECRET + oldUser.password;

  try {
    const payload = jwt.verify(token, secret);
    const encryptPassword = await bcrypt.hash(password, 10);

    await User.updateOne({ _id: id }, { $set: { password: encryptPassword } });

    res.render("confirmation");
  } catch (error) {
    res.json({ status: "Something went wrong." });
  }
});
