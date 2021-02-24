'use strict';

class RouteUtil {
    constructor() {}

    sendOk(res,model,next){
        res.status(200).send({response: model, status: "ok"});
        if (next) next();
    }

    sendError(res,err,message,next) {
        console.error(err);
        res.status(500).send({response: err, status: "error", message: message});
        if (next) next();
    }

    sendBadRequest(res,message,next) {
        let mess = "Bad request.";
        if (message) mess = message;
        res.status(400).send({response: {}, status: "ok", message: mess});
        if (next) next();
    }

}


module.exports = RouteUtil;