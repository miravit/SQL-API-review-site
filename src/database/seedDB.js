const bcrypt = require("bcrypt");
const { sequelize } = require("./config");

const { account_types } = require("../data/account_types");
const { workshops } = require("../data/workshops");
const { cities } = require("../data/cities");
const { reviews } = require("../data/reviews");
const { users } = require("../data/users");

const workshopDb = async () => {
  try {
    await sequelize.query(`DROP TABLE IF EXISTS review;`);
    await sequelize.query(`DROP TABLE IF EXISTS workshop;`);
    await sequelize.query(`DROP TABLE IF EXISTS city;`);
    await sequelize.query(`DROP TABLE IF EXISTS user;`);
    await sequelize.query(`DROP TABLE IF EXISTS account_type;`);

    // Create city table
    await sequelize.query(`
     CREATE TABLE IF NOT EXISTS city (
       city_id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL
     );`);

    // Create account_type table
    await sequelize.query(`
     CREATE TABLE IF NOT EXISTS account_type (
       account_id INTEGER PRIMARY KEY AUTOINCREMENT,
       role TEXT NOT NULL
     );`);

    // Create users table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      fk_account_id INTEGER NOT NULL DEFAULT 3 CHECK(fk_account_id IN (1, 2, 3)),
      FOREIGN KEY(fk_account_id) REFERENCES account_type(account_id)
    );
    `);

    // Create workshop table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS workshop (
      workshop_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT NOT NULL,
      telephone TEXT NOT NULL,
      opening_hours TEXT NOT NULL,
      fk_city_id INTEGER NOT NULL,
      fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(fk_city_id) REFERENCES city(city_id),
      FOREIGN KEY(fk_user_id) REFERENCES user(user_id)
      );
      `);

    // Create reviews table
    await sequelize.query(`
    CREATE TABLE IF NOT EXISTS review (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      rating INTEGER NOT NULL,
      fk_workshop_id INTEGER NOT NULL,
      fk_user_id INTEGER NOT NULL,
      FOREIGN KEY(fk_workshop_id) REFERENCES workshop(workshop_id),
      FOREIGN KEY(fk_user_id) REFERENCES user(user_id)
      );
      `);

    let cityInsertQuery = "INSERT INTO city (name) VALUES ";

    let cityInsertQueryVariables = [];

    cities.forEach((city, index, array) => {
      let string = "(";
      for (let i = 1; i < 2; i++) {
        string += `$${cityInsertQueryVariables.length + i}`;
        if (i < 1) string += ",";
      }
      cityInsertQuery += string + ")";
      if (index < array.length - 1) cityInsertQuery += ",";

      const variables = [city.name];
      cityInsertQueryVariables = [...cityInsertQueryVariables, ...variables];
    });
    cityInsertQuery += ";";
    await sequelize.query(cityInsertQuery, {
      bind: cityInsertQueryVariables,
    });

    let account_typeInsertQuery = "INSERT INTO account_type (role) VALUES ";

    let account_typeInsertQueryVariables = [];

    account_types.forEach((account, index, array) => {
      let string = "(";
      for (let i = 1; i < 2; i++) {
        string += `$${account_typeInsertQueryVariables.length + i}`;
        if (i < 1) string += ",";
      }
      account_typeInsertQuery += string + ")";
      if (index < array.length - 1) account_typeInsertQuery += ",";

      const variables = [account.role];
      account_typeInsertQueryVariables = [
        ...account_typeInsertQueryVariables,
        ...variables,
      ];
    });
    account_typeInsertQuery += ";";
    await sequelize.query(account_typeInsertQuery, {
      bind: account_typeInsertQueryVariables,
    });

    // Hash the 4 user passwords
    const hashPw = async (password) => {
      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(password, salt);
      return hashedpassword;
    };

    let HashedPwOne = await hashPw(users[0].password);
    let HashedPwTwo = await hashPw(users[1].password);
    let HashedPwThree = await hashPw(users[2].password);
    let HashedPwFour = await hashPw(users[3].password);

    await sequelize.query(
      "INSERT INTO user (name, email, username, password, fk_account_id) VALUES ($name, $email, $username, $password, $fk_account_id)",
      {
        bind: {
          name: users[0].name,
          email: users[0].email,
          username: users[0].username,
          password: HashedPwOne,
          fk_account_id: users[0].fk_account_id,
        },
      }
    );

    await sequelize.query(
      "INSERT INTO user (name, email, username, password, fk_account_id) VALUES ($name, $email, $username, $password, $fk_account_id)",
      {
        bind: {
          name: users[1].name,
          email: users[1].email,
          username: users[1].username,
          password: HashedPwTwo,
          fk_account_id: users[1].fk_account_id,
        },
      }
    );

    await sequelize.query(
      "INSERT INTO user (name, email, username, password, fk_account_id) VALUES ($name, $email, $username, $password, $fk_account_id)",
      {
        bind: {
          name: users[2].name,
          email: users[2].email,
          username: users[2].username,
          password: HashedPwThree,
          fk_account_id: users[2].fk_account_id,
        },
      }
    );

    await sequelize.query(
      "INSERT INTO user (name, email, username, password, fk_account_id) VALUES ($name, $email, $username, $password, $fk_account_id)",
      {
        bind: {
          name: users[3].name,
          email: users[3].email,
          username: users[3].username,
          password: HashedPwFour,
          fk_account_id: users[3].fk_account_id,
        },
      }
    );
    //-------

    let workshopInsertQuery =
      "INSERT INTO workshop (name, description, address, telephone, opening_hours, fk_city_id, fk_user_id) VALUES ";

    let workshopInsertQueryVariables = [];

    workshops.forEach((workshop, index, array) => {
      const variables = [
        workshop.name,
        workshop.description,
        workshop.address,
        workshop.telephone,
        workshop.opening_hours,
        workshop.fk_city_id,
        workshop.fk_user_id,
      ];
      let string = "(";

      for (let i = 1; i < variables.length + 1; i++) {
        string += `$${workshopInsertQueryVariables.length + i}`;
        if (i < variables.length) string += ",";
      }
      workshopInsertQuery += string + ")";
      if (index < array.length - 1) workshopInsertQuery += ",";

      workshopInsertQueryVariables = [
        ...workshopInsertQueryVariables,
        ...variables,
      ];
    });
    workshopInsertQuery += ";";
    await sequelize.query(workshopInsertQuery, {
      bind: workshopInsertQueryVariables,
    });

    let reviewInsertQuery =
      "INSERT INTO review (content, rating, fk_workshop_id, fk_user_id) VALUES ";

    let reviewInsertQueryVariables = [];

    reviews.forEach((review, index, array) => {
      let string = "(";
      for (let i = 1; i < 5; i++) {
        string += `$${reviewInsertQueryVariables.length + i}`;
        if (i < 4) string += ",";
      }
      reviewInsertQuery += string + `)`;
      if (index < array.length - 1) reviewInsertQuery += ",";

      const variables = [
        review.content,
        review.rating,
        review.fk_workshop_id,
        review.fk_user_id,
      ];

      reviewInsertQueryVariables = [
        ...reviewInsertQueryVariables,
        ...variables,
      ];
    });
    reviewInsertQuery += `;`;
    await sequelize.query(reviewInsertQuery, {
      bind: reviewInsertQueryVariables,
    });

    console.log("Database successfully populated with data...");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
};

workshopDb();
