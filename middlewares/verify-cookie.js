const verifyCookie = async (req, res, next) => {
  const { cookies } = req;

  if ("sessionID" in cookies) {
    return next();
  }

  res.redirect("/sign-in");
};

module.exports = verifyCookie;
