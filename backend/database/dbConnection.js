import mongoose from "mongoose";

export const dbConnection = () => {
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

};
