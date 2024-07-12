exports.getHome = (req, res, next) => {
  res
    .status(200)
    .render("heropage", { pageTitle: "Darshan", normal: false, dark: false });
};
