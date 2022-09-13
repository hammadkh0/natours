class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    /* (1A)
      used to FILTER out the functionaliites from request and only keep the db fields in the
      request. Maybe this is not required in the current node/express versions OR it could be done by MONGOOSE.
      */
    const queryObj = { ...this.queryString }; // shallow copy of req.query
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    /* ==> (1B)
      Advanced filtering:
      {difficulty: 'easy', duration:{$gte:5}} -> in MongoDB
      {difficulty: 'easy', duration:{gte:5}} -> in our query bcoz we passed duration[gte]=5
      gt,gte,lt,lte
      {difficulty: 'easy', duration:{$gte:5}} -> after the 3 lines of code below 
    */
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    /* 
      We are not using AWAIT here so this will not find the result of the query and the documents.
      But will rather return the mongoose query object on which we can use functions and properties.
    */

    return this;
    // returning the class object through this so we can call the class methods from the same objects again thorugh chaining and without creating new objects.
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // by default sorting by newset items first
    }

    return this;
  }

  limitFields() {
    /* (3) FIELD LIMITING */
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // not select the __v field
    }

    return this;
  }

  paginate() {
    /* (4) PAGINATION */
    if (this.queryString.page) {
      const page = +this.queryString.page || 1;
      const limit = +this.queryString.limit || 3;
      const skipDocuments = (page - 1) * limit;

      // skip the number of documents before the requested page and limit the results.
      this.query = this.query.skip(skipDocuments).limit(limit);

      // if (req.query.page) {
      //   const numTours = await Tour.countDocuments();
      //   if (skipDocuments > numTours) throw new Error('This page does not exist!');
      // }
    }
    return this;
  }
}

module.exports = APIFeatures;
