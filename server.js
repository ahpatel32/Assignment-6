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


    // First GET /students or GET /students?course=value Route to get all students or students by course
    app.get("/students", (req, res) => {
        const { course } = req.query;
        // If course parameter exists, call getStudentsByCourse(course)
        if (course) {
        collegeData.getStudentsByCourse(parseInt(course))
            .then(students => {
                //if no records print No students found for this course
                if (students.length === 0) {
                    res.status(404).json({ message: "No students found for this course" });
                //return the students by courses
                } else {
                    res.json(students);
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching students by course:", err);
                res.status(500).json({ message: "Failed to retrieve students by course" });
            });
        } else {
        // Otherwise, call getAllStudents() to get all students
        collegeData.getAllStudents()
            .then(students => {
                //if no records print No students found
                if (students.length === 0) {
                    res.status(404).json({ message: "No students found" });
                //return all the students
                } else {
                    res.json(students);
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching all students:", err);
                res.status(500).json({ message: "Failed to retrieve all students" });
            });
        }
    });

    // Second GET /tas route to get all TAs
    app.get("/tas", (req, res) => {
        // call getTAs() to get all students with Students.TAs property as True.
        collegeData.getTAs()
            .then(tas => {
                //if no record printing No TAs found
                if (tas.length === 0) {
                    res.status(404).json({ message: "No TAs found" });
                //return the TAs 
                } else {
                    res.json(tas);
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching all TAs:", err);
                res.status(500).json({ message: "Failed to retrieve all TAs" });
            });
        });
    
    // Third GET /courses route to get all the courses
    app.get("/courses", (req, res) => {
        // call getCourses() to get all Courses.
        collegeData.getCourses()
            .then(courses => {
                //if no record printing No Courses found
                if (courses.length === 0) {
                    res.status(404).json({ message: "No Courses found" });
                //return the courses 
                } else {
                    res.json(courses);
                }
            })
            //if we encounter any error in .then() block, it will be catch by the below code.
            .catch(err => {
                console.error("Error fetching all Courses:", err);
                res.status(500).json({ message: "Failed to retrieve all Courses" });
            });
        });
    
    // Fourth GET /Student/Num route to get the data of a single student by studentNum
    app.get("/student/:num", (req, res) => {
        const studentNum = parseInt(req.params.num); // Convert params.num to integer
        console.log("Searching for student with studentNum:", studentNum);
        
        // call getStudentByNum() to get student details by number.
        collegeData.getStudentByNum(studentNum)
            .then(student => {
                // Return the student object
                res.json(student);
            })
            .catch(err => {
                // Handle the case where student is not found
                console.error("Error fetching student:", err);
                res.status(404).json({ message: "Student not found" });
            });
    });

    //Static route to public folder - used to use the custom css files.
    app.use(express.static(path.join(__dirname, "public")))


    // Middleware to parse URL-encoded data - used to add students.
    app.use(express.urlencoded({ extended: true }));

    // Route to serve HTML pages
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, '/views/home.html'));
    });

    app.get("/about", (req, res) => {
        res.sendFile(path.join(__dirname, '/views/about.html'));
    });

    app.get("/htmlDemo", (req, res) => {
        res.sendFile(path.join(__dirname, '/views/htmldemo.html'));
    });

    // Route to add the student.
    app.get("/students/add", (req, res) => {
        res.sendFile(path.join(__dirname, '/views/addStudents.html'))
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