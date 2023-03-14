const { UnauthenticatedError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const { userRoles } = require("../constants/users");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, username, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);
  const fk_account_id = 2;

  await sequelize.query(
    "INSERT INTO user (name, email, username, password, fk_account_id) VALUES ($name, $email, $username, $password, $fk_account_id)",
    {
      bind: {
        name: name,
        email: email,
        username: username,
        password: hashedpassword,
        fk_account_id: fk_account_id,
      },
      type: QueryTypes.INSERT,
    }
  );

  return res.status(201).json({
    message: "Registration succeeded. Please log in.",
  });
};

exports.login = async (req, res) => {
  const { email, password: canditatePassword } = req.body;

  const [user, metadata] = await sequelize.query(
    "SELECT * FROM user WHERE email = $email LIMIT 1;",
    {
      bind: { email },
      type: QueryTypes.SELECT,
    }
  );

  if (!user) throw new UnauthenticatedError("Invalid Credentials");

  const isPasswordCorrect = await bcrypt.compare(
    canditatePassword,
    user.password
  );
  if (!isPasswordCorrect) throw new UnauthenticatedError("Invalid Credentials");

  const jwtPayload = {
    userId: user.user_id,
    email: user.email,
    role:
      user.fk_account_id === 1
        ? userRoles.ADMIN
        : user.fk_account_id === 2
        ? userRoles.USER
        : "Unknown role",
  };

  const jwtToken = jwt.sign(jwtPayload, "" + process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.json({ token: jwtToken, user: jwtPayload });
};
