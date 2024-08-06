exports.isLoggedIn = (req, res, next) => {
  if (
    !req.session ||
    !req.session.isLoggedIn ||
    (req.session.user && req.session.user.isAdmin)
  )
    return res.status(401).redirect("/?notAuth=true");

  next();
};
exports.isAdmin = (req, res, next) => {
  // Check if user is authenticated and if the user is an admin
  if (!req.session || !req.session.user || !req.session.user.isAdmin)
    return res.status(403).redirect("/?notAuth=true");

  next();
};
