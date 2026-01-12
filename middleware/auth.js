const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Please login');
  }

  const authToken = req.headers.authorization.split(' ')[1];

  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send('Invalid auth token');
    }
    req.user = decoded;
    next();
  });
};

module.exports = { authenticate };
