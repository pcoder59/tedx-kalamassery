var db = require('../config/mongoconnect');
var md5 = require('blueimp-md5');
const { response } = require('express');

module.exports = {
    addUser:(user, callback) => {
        user.password = md5(user.password);
        user.paid = false;
        user.ticketType = "General";
        db.get().collection('users').insertOne(user).then(async (data) => {
            if(user.code) {
                var codeUser;
                codeUser = await db.get().collection("users").findOne({"code": user.code});
                if(codeUser) {
                    db.get().collection('users').updateOne({"email": user.email}, {$set: {paid: true}});
                }
            }
            callback(data)
        });
    },
    loginUser: (userData, callback) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection('users').findOne({"email": userData.email});
            if(user) {
                if(md5(userData.password) == user.password) {
                    if(user.email == "event.tedkochi@gmail.com") {
                        callback(true, true, true);
                    }else if(user.paid == false) {
                        response.user = user;
                        response.status = true;
                        callback(true, false, false);
                    } else {
                        callback(true, true, false);
                    }
                } else {
                        callback(false, false, false);
                }
            } else {
                callback(false, false, false);
            }
        });
    },
    checkPaid: (paidData, callback) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection('users').findOne({"email": paidData});
            if(user.paid == true) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    setPaid: (payData, user, callback) => {
        return new Promise((resolve, reject) => {
            db.get().collection('users').updateOne({"email": user}, {$set: {paid: true}});
            callback(true);
        });
    }
}
