const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const Account = require('../models/Account.js')

const LoginController = async (req, res) => {
    const { phone, password } = req.body
    try {
        const acc = await Account.findOne({ phone })
        if (!acc) {
            return res.status(400).json({ message: 'User not found!' })
        }
        bcrypt.compare(password, acc.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Server error' })
            if (!isMatch) return res.status(400).json({ message: 'Password is incorrect' })

            const payload = {
                _id: acc._id,
                phone: acc.phone,
                role: acc.role,
                name:acc.name
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET
                // (err, token) => {
                // if (err) {
                //     console.error('Token generation failed:', err);
                //     return res.status(500).json({ message: 'Token generation failed' })
                // }


                // }
            )
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 4 * 60 * 60 * 1000
            })
            res.json({ user: acc })

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' })
    }


}
const loginWithGg = async (req, res) => {
  const {  displayName, email } = req.body;

  try {
    if ( !email) {
      return res.status(400).json({ message: "Missing uid or email" });
    }

    // kiểm tra user đã tồn tại chưa (ưu tiên tìm qua email)
    let user = await Account.findOne({ mail: email });

    // Nếu chưa có thì tạo mới
    if (!user) {
      user = await Account.create({
        name: displayName || "No Name",
        mail: email,
        phone: null,
        password: null,  // vì tài khoản GG không dùng password local
        role: "user",
       
      });
    }

    // Tạo payload để generate JWT
    const payload = {
      _id: user._id,
      phone: user.phone,
      role: user.role,
      name: user.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    // Lưu token vào cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 4 * 60 * 60 * 1000 // 4 giờ
    });

    return res.status(200).json({ user });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { LoginController,loginWithGg }