/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aakash Harendrakumar Patel Student ID: 147805238 Date: 07/07/2024
*
********************************************************************************/

var express = require("express");
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;
var app = express();
var collegeData = require(path.join(__dirname, 'module', 'collegedata'));
const exphbs = require('express-handlebars');


    // Configure express-handlebars
    app.engine('.hbs', exphbs.engine({
        extname: '.hbs',
        defaultLayout: 'main',        
        helpers: {
            navLink: function (url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
            },
            equal: function (lvalue, rvalue, options) {
                console.log('Helper "equal" called with:', lvalue, rvalue);
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }    
        }
    }));
    app.set("views", path.join(__dirname + "views"));
    app.set('view engine', '.hbs');

    //Static route to public folder - used to use the custom css files.
    app.use(express.static(path.join(__dirname, "public")))


    // Middleware to parse URL-encoded data - used to add students.
    app.use(express.urlencoded({ extended: true }));

    // First GET /students or GET /students?course=value Route to get all students or students by course
    app.get("/students", (req, res) => {
        const { course } = req.query;
        // If course parameter exists, call getStudentsByCourse(course)
        if (course) {
        collegeData.getStudentsByCourse(parseInt(course))
            .then(students => {
                //if no records print No students found for this course
                if (students.length === 0) {
                    //res.status(404).json({ message: "No students found for this course" });
                    res.render('students', { students: [], message: "No students found for this course" });
                //return the students by courses
                } else {
                    res.render('students', { students: students});
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching students by course:", err);
                res.render('students', { students: [], message: "Failed to retrieve students by course" });
            });
        } else {
        // Otherwise, call getAllStudents() to get all students
        collegeData.getAllStudents()
            .then(students => {
                //if no records print No students found
                if (students.length === 0) {
                    res.render('students', { students: [], message: "No students found" });
                //return all the students
                } else {
                    res.render('students', { students: students });
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching all students:", err);
                res.render('students', { students: [], message: "Failed to retrieve all students" });
            });
        }
    });


    // Third GET /courses route to get all the courses
    app.get("/courses", (req, res) => {
        // call getCourses() to get all Courses.
        collegeData.getCourses()
            .then(courses => {
                //if no record printing No Courses found
                if (courses.length === 0) {
                    res.render('courses', { message: "no course found" });
                //return the courses 
                } else {
                    res.render('courses', { courses: courses });
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching all Courses:", err);
                res.render('courses', { message: "Failed to retrieve all Courses" });
            });
        });
    
    // Fourth GET /Student/Num route to get the data of a single student by studentNum
    app.get("/student/:num", (req, res) => {
        const studentNum = parseInt(req.params.num); // Convert params.num to integer
        console.log("Searching for student with studentNum:", studentNum);
        let studentData = null;
        // call getStudentByNum() to get student details by number.
        collegeData.getStudentByNum(studentNum)
            .then(student => {
                studentData = student;
                return  collegeData.getCourses();
                //res.render("student", { student: student });
            })
            .then(courses => {
                res.render("student", { student: studentData, courses: courses })
            })
            .catch(err => {
                // Handle the case where student is not found
                console.error("Error fetching student:", err);
                res.render("student", { message: "Student not found" });
            });
    });

    // Route to get a specific course by ID
    app.get("/course/:num", (req, res) => {
        const courseId = parseInt(req.params.num, 10); // Convert params.num to integer
        
        collegeData.getCourseById(courseId)
            .then(course => {
                res.render('course', { course: course });
            })
            .catch(err => {
                console.error("Error fetching course:", err);
                res.status(404).render('course', { message: "Course not found" });
            });
    });

    app.post('/student/update', (req, res) => {
        collegeData.updateStudent(req.body)
            .then(() => {
                res.redirect('/students'); // Redirect to the students page after updating the student
            })
            .catch((err) => {
                console.error("Error updating student:", err);
                res.status(500).send('Unable to update student');
            });
    });

    app.use(function(req,res,next){
        let route = req.path.substring(1);
        app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
        next();
    });
    
    // Route to serve HTML pages
    app.get("/", (req, res) => {
        res.render('home');
    });

    app.get("/about", (req, res) => {
        res.render('about');
    });

    app.get("/htmlDemo", (req, res) => {
        res.render('htmlDemo');
    });

    // Route to add the student.
    app.get("/students/add", (req, res) => {
        res.render('addStudents');
    })

    app.post('/students/add', (req, res) => {
        collegeData.addStudent(req.body)
            .then(() => {
                res.redirect('/students'); // Redirect to the students page after adding the student
            })
            .catch((err) => {
                res.status(500).send('Unable to add student');
            });
    });      

    // Route for handling 404 errors
    app.use((req, res) => {
        res.status(404).json({ message: "Page Not Found" })});
    
    //creating the initialize method to initiate the server only if we are able to access the collegedata.js
    collegeData.initialize()
        .then(() => {
    // Start the server only if data initialization is successful
        app.listen(HTTP_PORT, () => {
        //printing message that server is online on port 8080 now.
            console.log("Server is listening on port: " + HTTP_PORT);
        });
        })
    //using catch method to catch a error if initialization fails.
        .catch((err) => {
            console.error("Initialization failed:", err);
        });
    
    module.exports = app;