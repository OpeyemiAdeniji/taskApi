const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	// copy request query
	const reqQuery = { ...req.query };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];  // remove before getting to the DB.

	// loop over removeFields and delete them from request query
	removeFields.forEach((p) => delete reqQuery[p]);

	// create query string
	let queryStr = JSON.stringify(reqQuery); // json.stringify takes params inside an aarray and turn it to a string

	// create operators
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// find resource
	query = model.find(JSON.parse(queryStr)); // json.parse turns a string to either an object or an array 

	// select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' '); // .split always return an array while .join will return it to a string
		query = query.select(fields);     // this function is used to select some specific fields from the DB
	}

	// sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.select(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	// pagination
	const page = parseInt(req.query.page, 10) || 1;  // parseInt turns anything to number
	const limit = parseInt(req.query.limit, 10) || 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//populate
	if (populate) {
		query = query.populate(populate);
	}

	// execute query
	const results = await query;

	// Pagination result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.advancedResults = {
		error: false,
		errors: [],
		count: results.length,
		message: 'Successfull',
		pagination: pagination,
		data: results,
		status: 200
	};

	next();
};

module.exports = advancedResults;
