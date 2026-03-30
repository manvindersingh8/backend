import connectDB from "./src/database/db.js";

import app from "./app.js";

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server connected to port ${port}`);
    });
  })
  .catch((error) => {
    console.log(`Server connection failed , ${error}`);
  });
