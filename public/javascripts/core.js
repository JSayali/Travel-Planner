var myApp = angular.module("myGradProject", ["ngStorage"]);
var user;
var likes;

var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};

myApp.directive("compareTo", compareTo);

myApp.controller("blog",function($scope, $http, $localStorage){
    $scope.$storage = $localStorage.$default({
        user: ""
        ,like: []
    });
    $scope.loginSuccess = false;
    $scope.loginFailed = false;
    $scope.registerSuccess = false;
    $scope.duplicateUser = false;
    angular.element(document).ready(function () {

        if(($localStorage.user) === ""){
            $scope.loginSuccess = false;
            $scope.loginFailed = false;
            $scope.registerSuccess = false;
            $scope.duplicateUser = false;
        }
        else {
            $scope.loginSuccess = true;
            $scope.user = $localStorage.user;

            $http.get("/showPosts")
                .success(function(data){
                    data.forEach(function(d){

                        var likes = $localStorage.like;

                        if(likes.indexOf(d._id)!==-1){
                            d.star = true;
                        }
                        else
                            d.star = false;
                    });
                    $scope.disp = data;
                });
        }
    });
    $scope.logout = function () {
        $scope.loginSuccess = false;
        $localStorage.$reset({
            name: ""
            ,like: []
        });
        window.location.reload();
    };
    $scope.login = function(){

        var auth = {
            "uname": $scope.formData.username,
            "pwrd": $scope.formData.password
        };

        $http.post("/login", auth)
            .success(function(data){

                if(data.length!=0){
                    $scope.signInForm.$setPristine();
                    $scope.loginSuccess = true;

                    $scope.user = $scope.formData.username;
                    user = $scope.formData.username;
                    likes = data[0].likes;

                    $localStorage.user = user;
                    $localStorage.like = likes;

                    $http.get("/showPosts")
                        .success(function(data){
                            data.forEach(function(d){
                                if(likes.indexOf(d._id)!==-1){
                                    d.star = true;
                                }
                                else
                                    d.star = false;
                            });
                            $scope.disp = data;
                        });
                }
                else {
                    $scope.loginFailed = true;
                }
            });
    };

    /*Get month name from month number*/
    function GetMonthName(monthNumber) {
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months[monthNumber - 1];
    }

    /*Get today's date*/
    function getDate() {
        var d = new Date();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var output = GetMonthName(month) + " " + day + ", " + d.getFullYear();
        return output;
    }

    $scope.add = function(){

        $scope.blog.user = $localStorage.user;
        $scope.blog.date = getDate();

        $http.post("/addPost", $scope.blog)
            .success(function(data){
                $scope.blog.post = "";
                data.forEach(function(d){
                    var likes = $localStorage.like;
                    if(likes.indexOf(d._id)!==-1){
                        d.star = true;
                    }
                    else
                        d.star = false;
                });
                $scope.disp = data;

            });
    };

    $scope.signUp = function () {
        var register = {
            "newUsernm" : $scope.formData.newUsername,
            "newPassword" : $scope.formData.newPassword
        };
        $http.post("/register", register)
            .success(function(data){
                if(data.success){
                    $scope.registerSuccess = data.success;
                    $scope.formData.newUsername="";
                    $scope.formData.newPassword="";
                    $scope.formData.password_c="";
                }
                else {
                    $scope.duplicateUser = true;
                }

            });
    };

    $scope.update = function(id){
        var data ={
            id: id,
            user: $localStorage.user
        };
        $http.post("/updateStar", data)
            .success(function (data) {
                if(data.success==false){
                    $localStorage.like = jQuery.grep($localStorage.like, function(value) {
                        return value != id;
                    });
                }
                else{
                    $localStorage.like.push(id);
                }

            });
    }
});

myApp.controller("todo",function($scope, $http){
    angular.element(document).ready(function () {
        $http.get("/todo/get")
            .success(function(data){
                $scope.disp = data;
            });
    });

    $scope.addTodo = function(){
        $http.post("/todo/add", $scope.text)
            .success(function(data){
                $scope.text = {};
                $scope.disp = data;
            });
    };
    $scope.rem = function(id){
        $http.delete("/todo/del")
            .success(function(data){
                $scope.disp = data;
            });
    }
    $scope.done = function(id){
        $http.post("/todo/check/"+id)
            .success(function(data){
                $scope.disp = data;
            });
    }
});

