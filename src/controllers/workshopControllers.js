const { userRoles } = require("../constants/users");
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../utils/errors");
const { sequelize } = require("../database/config");
const { QueryTypes } = require("sequelize");
const { selectProps } = require("../utils/helpers");

// GET - /api/v1/workshops
exports.getAllWorkshops = async (req, res) => {
  const city = req.query.city;
  const limit = req.query?.limit || 10;
  const offset = req.query?.offset || 0;

  if (!city) {
    const workshops = await sequelize.query(
      `SELECT w.name, w.description, w.address, c.name AS city, w.telephone, w.opening_hours
    FROM workshop w
    LEFT JOIN city c ON c.city_id = w.fk_city_id
    ORDER BY w.name ASC LIMIT $limit OFFSET $offset`,

      {
        bind: { limit: limit, offset: offset },
        type: QueryTypes.SELECT,
      }
    );

    if (!workshops) throw new NotFoundError("Cannot find any workshops");

    return res.json(workshops);
  }

  const workshops = await sequelize.query(
    `SELECT w.name, w.description, w.address, c.name AS city, w.telephone, w.opening_hours
  FROM workshop w
  LEFT JOIN city c ON c.city_id = w.fk_city_id
  WHERE c.name  = $city
  ORDER BY w.name ASC LIMIT $limit OFFSET $offset`,

    {
      bind: { city: city, limit: limit, offset: offset },
      type: QueryTypes.SELECT,
    }
  );

  if (!workshops) throw new NotFoundError("Cannot find any workshops");

  return res.json(workshops);
};

// GET - /api/v1/workshops/:workshopId
exports.getWorkshopById = async (req, res) => {
  const workshopId = req.params.workshopId;

  const workshops = await sequelize.query(
    `SELECT w.name AS workshop, c.name AS city, r.content AS review, r.rating, u.username 
    FROM workshop w
    LEFT JOIN review r
    ON r.fk_workshop_id = w.workshop_id
    LEFT JOIN user u 
    ON u.user_id = r.fk_user_id 
    LEFT JOIN city c 
    ON c.city_id = w.fk_city_id 
    WHERE w.workshop_id = $workshopId;`,

    {
      bind: { workshopId: workshopId },
      type: QueryTypes.SELECT,
    }
  );
  console.log(workshops);

  if (!workshops) throw new NotFoundError("That workshop does not exist.");

  const workshopReviews = workshops.map(
    selectProps("review", "rating", "username")
  );

  const workshopName = workshops[1].workshop;

  const response = {
    workshop: workshopName,
    reviews: workshopReviews,
  };

  return res.json(response);
};

// POST - /api/v1/workshops
exports.createNewWorkshop = async (req, res) => {
  const { name, description, address, telephone, opening_hours, cityId } =
    req.body;
  const userId = req.user.userId;

  if (
    !name ||
    !description ||
    !address ||
    !telephone ||
    !opening_hours ||
    !cityId
  ) {
    throw new BadRequestError("You must fill in all fields.");
  }

  const [newWorkshopId] = await sequelize.query(
    `
      INSERT INTO workshop (name, description, address, telephone, opening_hours, fk_city_id, fk_user_id)
      VALUES ($name, $description, $address, $telephone, $opening_hours, $cityId, $userId);
    `,
    {
      bind: {
        name: name,
        description: description,
        address: address,
        telephone: telephone,
        opening_hours: opening_hours,
        cityId: cityId,
        userId: userId,
      },
      type: QueryTypes.INSERT,
    }
  );
  return res
    .setHeader(
      "Location",
      `${req.protocol}://${req.headers.host}/api/v1/workshops/${newWorkshopId}`
    )
    .sendStatus(201);
};

// PUT - /api/v1/workshops/:workshopId
exports.updateWorkshopById = async (req, res) => {
  const { name, description, address, telephone, opening_hours, fk_city_id } =
    req.body;
  const userId = req.user.userId;
  const workshopId = req.params.workshopId;

  if (
    !name ||
    !description ||
    !address ||
    !telephone ||
    !opening_hours ||
    !fk_city_id
  ) {
    throw new BadRequestError("You must enter values in all fields.");
  }

  const [workshop] = await sequelize.query(
    `
  SELECT * FROM workshop
  WHERE workshop_id = $workshopId  
  `,
    {
      bind: { workshopId: workshopId },
      type: QueryTypes.SELECT,
    }
  );

  if (!workshop) throw new NotFoundError("This workshop does not exist.");

  if (userId !== workshop.fk_user_id && req.user.role !== userRoles.ADMIN) {
    throw new UnauthorizedError(
      "You do not have permission to update this workshop."
    );
  }

  await sequelize.query(
    `UPDATE workshop
    SET name = $name, description  = $description, address = $address, telephone = $telephone, opening_hours = $opening_hours, fk_city_id = $fk_city_id
    WHERE workshop_id  = $workshopId;`,
    {
      bind: {
        name: name,
        description: description,
        address: address,
        telephone: telephone,
        opening_hours: opening_hours,
        fk_city_id: fk_city_id,
        workshopId: workshopId,
      },
      type: QueryTypes.UPDATE,
    }
  );
  return res.status(201).json({
    message: "The workshop has been updated",
  });
};

// DELETE - /api/v1/workshops/:workshopId
exports.deleteWorkshopById = async (req, res) => {
  const workshopId = req.params.workshopId;

  const userId = req.user.userId;

  const [workshopCreatedByUser] = await sequelize.query(
    `SELECT w.fk_user_id 
  FROM workshop w
  WHERE w.workshop_id = $workshopId;`,
    {
      bind: { workshopId: workshopId },
      type: QueryTypes.SELECT,
    }
  );

  const workshopCreatedByUserId = workshopCreatedByUser.fk_user_id;

  if (userId !== workshopCreatedByUserId && req.user.role !== userRoles.ADMIN) {
    throw new UnauthorizedError(
      "You do not have permission to delete this workshop."
    );
  }

  if (!workshopCreatedByUser) {
    throw new NotFoundError(
      "We could not find the workshop you are looking for."
    );
  }

  await sequelize.query(
    `DELETE
    FROM review
    WHERE fk_workshop_id  = $workshopId;`,
    {
      bind: { workshopId: workshopId },
      type: QueryTypes.SELECT,
    }
  );

  await sequelize.query(
    `DELETE
FROM workshop
WHERE workshop_id  = $workshopId;`,
    {
      bind: { workshopId: workshopId },
      type: QueryTypes.SELECT,
    }
  );

  return res.sendStatus(204);
};
