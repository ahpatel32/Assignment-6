/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aakash Harendrakumar Patel Student ID: 147805238 Date: 07/25/2024
*
********************************************************************************/

var express = require("express");
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;
var app = express();
var collegeData = require(path.join(__dirname, 'module', 'collegedata'));
//adding the variable for express-handlebars 
const exphbs = require('express-handlebars');


    // Configuring express-handlebars
    app.engine('.hbs', exphbs.engine({
        extname: '.hbs',
        defaultLayout: 'main',        
        helpers: {
            //custom helper 1
            navLink: function (url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
            },
            //custom helper 2
            equal: function (lvalue, rvalue, options) {
                console.log('Helper "equal" called with:', lvalue, rvalue);
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                console.log('Returning options.inverse');
                return options.inverse(this);
            } else {
                console.log('Returning options.fn');
                return options.fn(this);
            }
        }    
        }
    }));
    //setting path for views directory
    app.set("views", path.join(__dirname + "/views"));
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
                // If course parameter exists, call getStudentsByCourse(course)
                collegeData.getStudentsByCourse(parseInt(course))
                    .then(students => {
                        // Render the "students" view only if there are students
                        if (students.length > 0) {
                            res.render('students', { students: students });
                        } else {
                            res.render('students', { message: "No students found for this course" });
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching students by course:", err);
                        res.render('students', { message: "Failed to retrieve students by course" });
                    });
            } else {
                // Otherwise, call getAllStudents() to get all students
                collegeData.getAllStudents()
                    .then(students => {
                        // Render the "students" view only if there are students
                        if (students.length > 0) {
                            console.log(students); // Log the students data here
                            res.render('students', { students: students });
                        } else {
                            res.render('students', { message: "No results" });
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching all students:", err);
                        res.render('students', { message: "Failed to retrieve all students" });
                    });
            }
        });
        

    // Third GET /courses route to get all the courses
    app.get("/courses", (req, res) => {
        // call getCourses() to get all Courses.
        collegeData.getCourses()
            .then(courses => {
                if (courses.length > 0) {
                    res.render('courses', { courses: courses });
                //return the courses 
                } else {
                    res.render('courses', { message: "no course found" });
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
    
        let viewData = {};
    
        // Call getStudentByNum() to get student details by number.
        collegeData.getStudentByNum(studentNum)
            .then(student => {
                if (student) {
                    viewData.student = student; // Store student data in viewData object
                } else {
                    viewData.student = null; // Set student to null if none were returned
                }
                return collegeData.getCourses(); // Fetch the list of courses
            })
            .then(courses => {
                viewData.courses = courses; // Store course data in viewData object
    
                // Loop through viewData.courses and mark the selected course
                if (viewData.student) {
                    for (let i = 0; i < viewData.courses.length; i++) {
                        if (viewData.courses[i].courseId == viewData.student.course) {
                            viewData.courses[i].selected = true; // Mark the course as selected
                        }
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                viewData.courses = []; // Set courses to empty if there was an error
            })
            .then(() => {
                if (viewData.student == null) {
                    // If no student, return an error
                    res.status(404).send("Student Not Found");
                } else {
                    // Render the student view with viewData
                    res.render("student", { viewData: viewData });
                }
            });
    });
    

    // Route to get a specific course by ID
    app.get("/course/:num", (req, res) => {
        const courseId = parseInt(req.params.num, 10); // Convert params.num to integer
        console.log(`Course ID from params: ${req.params.num}`);
        //call getCourseByID() to get the course details by courseid
        collegeData.getCourseById(courseId)
            .then(course => {
                if (course) {
                res.render('course', { course: course });    
                }else{
                    res.status(400).send("Course Not Found");
                }
            })
            .catch(err => {
                //Handling the case where course data is not found
                console.error("Error fetching course:", err);
                res.status(500).send("Unable to retrieve course");
             });
    });

    //new path to delete the course by id
    app.get('/course/delete/:id', (req, res) => {
        const courseId = parseInt(req.params.id);
    
        collegeData.deleteCourseById(courseId)
            .then(() => {
                res.redirect('/courses');
            })
            .catch(err => {
                console.error("Error deleting course:", err);
                res.status(500).send("Unable to Remove Course / Course not found");
            });
    });
    
    //New path for updating the students data.
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

    //New path for updating the courses data.
    app.post('/course/update', (req, res) => {
        collegeData.updateCourse(req.body)
            .then(() => {
                res.redirect('/courses'); // Redirect to the students page after updating the student
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
    app.get('/students/add', (req, res) => {
        collegeData.getCourses()
            .then(courses => {
                console.log(courses);
                res.render('addStudents', { courses: courses });
            })
            .catch(err => {
                console.error('Error fetching courses:', err);
                res.render('addStudents', { courses: [] });
            });
    });

    app.post('/students/add', (req, res) => {
        collegeData.addStudent(req.body)
            .then(() => {
                res.redirect('/students'); // Redirect to the students page after adding the student
            })
            .catch((err) => {
                res.status(500).send('Unable to add student');
            });
    });      

    // Route to delete a student
    app.get('/student/delete/:studentNum', (req, res) => {
        const studentNum = parseInt(req.params.studentNum); // Convert params.studentNum to integer

        collegeData.deleteStudentByNum(studentNum)
            .then(() => {
                res.redirect('/students'); // Redirect to the students list after deletion
            })
            .catch(err => {
                console.error("Error deleting student:", err);
                res.status(500).send("Unable to Remove Student / Student not found");
            });
    });

    // Route to add the course.
    app.get("/courses/add", (req, res) => {
        res.render('addCourse');
    })
    
    app.post('/courses/add', (req, res) => {
        collegeData.addCourse(req.body)
            .then(() => {
                res.redirect('/courses'); // Redirect to the students page after adding the student
            })
            .catch((err) => {
                res.status(500).send('Unable to add course');
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
