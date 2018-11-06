// // Transpile all code following this line with babel and use 'env' (aka ES6) preset.
// require('babel-register')({
//     presets: ["@babel/preset-es2016"]
// })

// // Import the rest of our application.
// module.exports = require('./index.js')

require = require("esm")(module)
module.exports = require("./index.js");