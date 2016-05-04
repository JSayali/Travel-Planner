// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing    : true */
// Server-side code
/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
/*globals angular*/
"use strict";

var myApp = angular.module("myGradProject", ["ngStorage"]);
var likes;

//Directive to check whether password and confirm password match
var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};

myApp.directive("compareTo", compareTo);

myApp.controller("blog", function($scope, $http, $localStorage) {

    //Initialize default values of $localStorage
    $scope.$storage = $localStorage.$default({
        user: "",
        like: []
    });

    $scope.loginSuccess = false;
    $scope.loginFailed = false;
    $scope.registerSuccess = false;
    $scope.duplicateUser = false;

    //Check if the user is logged-in on page load
    angular.element(document).ready(function() {
        //User is not logged-in, display login page
        if (($localStorage.user) === "") {
            $scope.loginSuccess = false;
            $scope.loginFailed = false;
            $scope.registerSuccess = false;
            $scope.duplicateUser = false;
        } else {
            //User is logged-in, display application div
            $scope.loginSuccess = true;
            $scope.user = $localStorage.user;

            $http.get("/showPosts")
                .success(function(data) {
                    data.forEach(function(d) {

                        var likes = $localStorage.like;

                        if (likes.indexOf(d._id) !== -1) {
                            d.star = true;
                        } else {
                            d.star = false;
                        }
                    });
                    $scope.disp = data;
                });
        }
    });

    //Hide application div and reset $localStorage data on logout
    $scope.logout = function() {
        $scope.loginSuccess = false;
        $localStorage.$reset({
            name: "",
            like: []
        });
        window.location.reload();
    };

    //Handle login request
    $scope.login = function() {

        var auth = {
            "uname": $scope.formData.username,
            "pwrd": $scope.formData.password
        };

        $http.post("/login", auth)
            .success(function(data) {

                if (data.length !== 0) {
                    $scope.signInForm.$setPristine();
                    $scope.loginSuccess = true;

                    $scope.user = $scope.formData.username;
                    $localStorage.user = $scope.formData.username;
                    likes = data[0].likes;

                    $localStorage.like = likes;

                    $http.get("/showPosts")
                        .success(function(data) {
                            data.forEach(function(d) {
                                if (likes.indexOf(d._id) !== -1) {
                                    d.star = true;
                                } else {
                                    d.star = false;
                                }
                            });
                            $scope.disp = data;
                        });
                } else {
                    $scope.loginFailed = true;
                }
            });
    };

    //Get month name from month number
    function GetMonthName(monthNumber) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[monthNumber - 1];
    }

    //Get today's date
    function getDate() {
        var d = new Date();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var output = GetMonthName(month) + " " + day + ", " + d.getFullYear();
        return output;
    }

    //Add user-post
    $scope.add = function() {

        $scope.blog.user = $localStorage.user;
        $scope.blog.date = getDate();

        $http.post("/addPost", $scope.blog)
            .success(function(data) {
                $scope.blog.post = "";
                //Display all posts
                data.forEach(function(d) {
                    var like = $localStorage.like;
                    //Check if the post is liked by the uuser
                    if (like.indexOf(d._id) !== -1) {
                        //post is liked
                        d.star = true;
                    } else {
                        d.star = false;
                    }
                });
                $scope.disp = data;

            });
    };

    //Handle sign-up request
    $scope.signUp = function() {
        var register = {
            "newUsernm": $scope.formData.newUsername,
            "newPassword": $scope.formData.newPassword
        };
        $http.post("/register", register)
            .success(function(data) {
                //Username is avaliable, user created
                if (data.success) {
                    $scope.registerSuccess = data.success;
                    $scope.formData.newUsername = "";
                    $scope.formData.newPassword = "";
                    $scope.formData.password_c = "";
                } else {

                    //Username is taken, display error message
                    $scope.duplicateUser = true;
                }

            });
    };

    //Update likes for the post
    $scope.update = function(id) {
        var data = {
            id: id,
            user: $localStorage.user
        };
        $http.post("/updateStar", data)
            .success(function(data) {
                //Once database is updated, update client side likes array
                if (data.success === false) {
                    //Remove id from the likes array since the post was already liked
                    $localStorage.like = jQuery.grep($localStorage.like, function(value) {
                        return value !== id;
                    });
                } else {
                    //Add id to the like array
                    $localStorage.like.push(id);
                }

            });
    };
});

myApp.controller("todo", function($scope, $http) {
    //Show all todo items at page load
    angular.element(document).ready(function() {
        $http.get("/todo/get")
            .success(function(data) {
                $scope.disp = data;
            });
    });

    //Add new todo item
    $scope.addTodo = function() {
        $http.post("/todo/add", $scope.text)
            .success(function(data) {
                $scope.text = {};
                $scope.disp = data;
            });
    };

    //Delete all todo items marked as done
    $scope.rem = function() {
        $http.delete("/todo/del")
            .success(function(data) {
                $scope.disp = data;
            });
    };

    //Check the todo item as done
    $scope.done = function(id) {
        $http.post("/todo/check/" + id)
            .success(function(data) {
                $scope.disp = data;
            });
    };
});