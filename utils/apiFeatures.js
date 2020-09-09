class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // req.query returns an object with the querystrings.
        // In JS setting an object to a variable will only reference the ORIGINAL object and not any updates we make to it. Here we use destructuring to take all the fields out of the object and create a new one with all the key: value pairs from the req.query object.
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        // Find ALL instances of gt, lt, gte, lte with '$' in front of the matched element so it can be read by Mongoose.
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );
        this.query = this.query.find(JSON.parse(queryStr));

        // 'this' returns entire object so we can chain the methods when we execute the query.
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            // This takes the url string e.g. '...?sort=-price,ratingsAverage' and converts it to a format readable by Mongoose e.g. sort('price ratingsAverage').
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        // Selecting only certain field names to return is called 'projecting'.
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Use '-' to remove fields from returned data.
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        // page=2&limit=10: 1-10 page 1, 11-20 page 2, 21-30 page etc.
        // '||' defines a default value in the below
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
