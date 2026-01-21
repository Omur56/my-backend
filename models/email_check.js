const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,

  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: String,
});
