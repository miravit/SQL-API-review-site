const { ValidationError } = require("../utils/errors")

exports.errorMiddleware = (error, req, res, next) => {
	let customError = {
		details: error.details,
		statusCode: error.statusCode || 500,
		message: error.message || "Something went wrong try again later",
	}

	if (process.env.NODE_ENV === 'development') {
		console.error(error)

		customError.message = error.message || "Something went wrong try again later"
		customError.error = error
	}

	if (error instanceof ValidationError) customError.validatonErrors = error.validationErrors

    if (error.name === "CastError") {
		customError.message = `No item found with id : ${error.value}`
		customError.statusCode = 404
	}

	return res.status(customError.statusCode).json(customError)
}