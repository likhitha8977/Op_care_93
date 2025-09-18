exports.getNotifications = async (req, res, next) => {
  // For demo, return static notifications
  res.json([
    { message: 'Your appointment is confirmed.' },
    { message: 'New hospital added in your city.' }
  ]);
};
