
const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        status: 500,
        message: "error has occured",
        error: err.message,
    })
}

export default errorHandling;


// const {constants} = require("../../constants")

// const errorHandler = (err, req, res, next) => {
//     const statusCode = res.statusCode ? res.statusCode : 500;
//     switch (statusCode) {

//         case constants.VALIDATION_ERR:
//             res.json({ title: "Validation Failed", message: err.message, stackTrace: err.stack });
//             break;

//         case constants.NOT_FOUND:
//             res.json({ title: "Not Found", message: err.message, stackTrace: err.stack });
//             break;

//         case constants.FORBIDDEN:
//             res.json({ title: "Forbidden", message: err.message, stackTrace: err.stack });
//             break;

//         case constants.UNAUTHORIZED:
//             res.json({ title: "Unauthorized", message: err.message, stackTrace: err.stack });
//             break;
        
//         case constants.SERVER_ERR:
//             res.json({ title: "Server Error", message: err.message, stackTrace: err.stack });
//             break;

//         default:
//             console.log("No error. All good!");
//             break;
//     }


// }

// module.exports = errorHandler;

