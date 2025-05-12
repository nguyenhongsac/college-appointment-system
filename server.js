const app = require("./src/app");

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("App is listening on port " + listener.address().port)
});