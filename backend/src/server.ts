import app from "./app";
import { validateStartupEnv } from "./config/env.js";

validateStartupEnv();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
