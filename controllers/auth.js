const mysql = require("mysql");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const { error } = require("console");
const { ifError } = require("assert");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'usuario',
    password: 'usuario',
    database: 'db_conn'
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`email:${email} password:${password}`)
        if (!email || !password) {
            return res.json({
                status:"error",
                error: "Please Provide an email and password"
            });
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            console.log(results);
            if (err) {
                throw err;
            }
            if (!results || results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
                return res.json({
                    status:"error",
                    error: "Email or password incorrect"
                });
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, "process.env.JWT_SECRET", {
                    expiresIn: "90d"
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + 90 * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                //res.redirect('/app');
                return res.json({
                    status:"success",
                    success: "User has been logged in"
                });
                //res.status(200).redirect("/");
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.register = (req, res) => {
    console.log(req.body);
    console.log("0");
    const { username, email, password, passwordConfirm } = req.body;
    db.query('SELECT email from users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.json({
                    status:"error",
                    error: "this email is already in use"
                });
                
            } else if (password != passwordConfirm) {
                return res.json({
                    status:"error",
                    error: "Password don't match"
                });
            }
        }
        console.log("0");
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', { name: username, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.json({
                    status:"success",
                    success: "User registered"
                })
            }
        })
    })
    //res.send("Form submitted");
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            console.log("cookie is set");
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                "process.env.JWT_SECRET"
            );
            console.log(decoded);

            // 2. Check if the user still exist
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results) => {
                console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
            fetch('http://localhost:8080/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.user)
            })
            .then(response => {
                if (response.ok) {
                    console.log('Data sent successfully');
                } else {
                    console.error('Failed to send data');
                    console.log(response);
                }
            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}
exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}