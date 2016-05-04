// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing    : true */
// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
"use strict";

var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var port = 3000;
var dbUrl = "mongodb://localhost/test";

mongoose.connect(dbUrl);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

var blogSchema = mongoose.Schema({
    "post": String,
    "user": String,
    "date": String,
    "hearts": Number
});

var userSchema = mongoose.Schema({
    "name": String,
    "password": String,
    "likes": {
        type: [ObjectId]
    }
});

var textSchema = mongoose.Schema({
    "content": String,
    "done": Boolean
});

var Text = mongoose.model("text", textSchema);
var Blog = mongoose.model("blog", blogSchema);
var Users = mongoose.model("users", userSchema);


app.get("/showPosts", function(req, res) {
    Blog.find({}, function(err, rep) {
        if (err !== null) {
            // return from the function
            return;
        } else {
            res.send(rep);
        }

    });
});

app.post("/register", function(req, res) {
    Users.count({
        name: req.body.newUsernm
    }, function(err, result) {
        if (err) {
            res.send(err);
        } else {
            if (result === 0) {
                var newUser = new Users({
                    "name": req.body.newUsernm,
                    "password": req.body.newPassword,
                    "likes": []
                });
                newUser.save(function(err) {
                    if (err !== null) {
                        // object was not saved!
                        res.send({
                            "error": err
                        });
                    } else {
                        Users.find({}, function(err, rep) {
                            if (err !== null) {
                                // return from the function
                                return;
                            } else {
                                res.send({
                                    "success": true
                                });
                            }

                        });
                    }

                });
            } else {
                res.send({
                    "success": false
                });
            }

        }
    });

});
app.post("/login", function(req, res) {
    Users.find({
        "name": req.body.uname,
        "password": req.body.pwrd
    }, function(err, rep) {
        if (err !== null) {
            // return from the function
            return;
        } else {
            res.send(rep);
        }
    });
});

app.post("/updateStar", function(req, res) {

    Users.update({
            "name": req.body.user
        }, {
            $addToSet: {
                "likes": (req.body.id)
            }
        },
        function(err, rep) {
            if (err !== null) {
                // return from the function
                return;
            } else {
                if (rep.nModified === 0) {
                    Blog.update({
                        _id: req.body.id
                    }, {
                        $inc: {
                            hearts: -1
                        }
                    }, function(err, data) {});

                    Users.update({
                            "name": req.body.user
                        }, {
                            $pull: {
                                "likes": (req.body.id)
                            }
                        },
                        function(err, rep) {
                            if (err !== null) {
                                return;
                            } else {
                                //do nothing
                            }

                        });
                    res.send({
                        "success": false
                    });
                } else {
                    Blog.update({
                        _id: req.body.id
                    }, {
                        $inc: {
                            hearts: 1
                        }
                    }, function(err, data) {
                        res.send({
                            "success": true
                        });
                    });

                }

            }
        });

});
app.post("/addPost", function(req, res) {
    var b1 = new Blog({
        "post": req.body.post,
        "user": req.body.user,
        "date": req.body.date,
        "hearts": 0
    });
    b1.save(function(err) {
        if (err !== null) {
            // object was not saved!
            res.send({
                "error": err
            });
        } else {
            Blog.find({}, function(err, rep) {
                if (err !== null) {
                    // return from the function
                    return;
                } else {
                    res.send(rep);
                }

            });
        }

    });
});
app.post("/todo/add", function(req, res) {
    var l1 = new Text({
        "content": req.body.content,
        "done": false
    });
    l1.save(function(err) {
        if (err !== null) {
            // object was not saved!
            res.send({
                "error": err
            });
        } else {
            Text.find({}, function(err, rep) {
                if (err !== null) {
                    // return from the function
                    return;
                } else {
                    res.send(rep);
                }

            });
        }

    });
});
app.delete("/todo/del", function(req, res) {
    Text.remove({
        "done": true
    }, function(err, rep) {
        if (err !== null) {
            return;
        } else {
            Text.find({}, function(err, rep) {
                if (err !== null) {
                    // return from the function
                    return;
                } else {
                    res.send(rep);
                }

            });
        }
    });
});
app.post("/todo/check/:id", function(req, res) {
    Text.findOne({
        "_id": req.params.id
    }, "done", function(err, temp) {
        if (err !== null) {

            return;
        } else {
            Text.update({
                    "_id": temp._id
                }, {
                    $set: {
                        "done": !temp.done
                    }
                },
                function(err, doc) {
                    if (err !== null) {
                        return;
                    } else {
                        //show all entries
                        Text.find({}, function(err, rep) {
                            if (err !== null) {
                                // return from the function
                                return;
                            } else {
                                res.send(rep);
                            }

                        });
                    }
                });
        }
    });

});
app.get("/todo/get", function(req, res) {
    Text.find({}, function(err, rep) {
        if (err !== null) {
            // return from the function
            return;
        } else {
            res.send(rep);
        }

    });
});
app.listen(port);
console.log("Server is running on port 3000...");