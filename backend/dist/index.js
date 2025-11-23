"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const port = Number(env_1.env.PORT) || 4000;
app_1.app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
