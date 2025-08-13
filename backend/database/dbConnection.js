import mongoose from "mongoose";

export const dbConnection = () => {
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

};
