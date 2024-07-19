exports.getHome = (req, res, next) => {
  const login = req.query.login || false;
  const email = req.query.mailSent || false;
  res.render("heropage", {
    pageTitle: "Darshan",
    normal: false,
    dark: false,
    login: login,
    email: email,
  });
};
