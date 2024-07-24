    class Data
    {   //defining the constructor which will take value from students and courses 
        constructor(students, courses){
            this.students = students;
            this.courses = courses;
        }
    }

    var dataCollection = null;
    const fs = require('fs');
    const path = require('path');

    function initialize() {
        return new Promise((resolve, reject) => {
            //defining a constant variable with the datafolder path values.
            const datafolderpath = 'D:/BTT - 2024/Sem 2/WEB700/Assignment-4';

            //reading the courses.json file
            fs.readFile(path.join(datafolderpath, 'data', 'courses.json'), 'utf8', (err, courseData) => {
                if (err) {
                    //returning the reject message if we are not able to read the data from courses.json
                    return reject("unable to read courses.json");
                }
                let courses;
                courses = JSON.parse(courseData);

            //reading the students.json file
            fs.readFile(path.join(datafolderpath, 'data', 'students.json'), 'utf8', (err, studentData) => {
                if (err) {
                    //returning the reject message if we are not able to read the data from students.json
                    return reject("Unable to read students.json");
                }
                let students;
                students = JSON.parse(studentData);
            
            //using datacollection variable to call class Data
            dataCollection = new Data(students, courses);
            resolve();
                });
            });
        });
    }

    //function to get all data related to students
    function getAllStudents() {
        return new Promise((resolve, reject) => {
            //adding condition to check if the length > 0 then return data using resolve method of promise
            if (dataCollection && dataCollection.students.length > 0) {
                resolve(dataCollection.students);
            //returning "no results returned" using the reject method of promise function
            } else {
                reject("no results returned");
            }
        });
    }

    function getTAs() {
        return new Promise((resolve, reject) => {
            //declaring variable TAs and storing the Students whose TA property is true in this variable.
            const TAs = dataCollection.students.filter(student => student.TA === true);
            //condition to check if the TAs have any data and return data using the resolve method.
            if (TAs.length > 0) {
                resolve(TAs);
            //printing "no results returned" message using the reject method of promise function.
            } else {
                reject("no results returned");
            }
        });
    }

    function getCourses() {
        return new Promise((resolve, reject) => {
            //adding condition to check if the length > 0 then return data using resolve method of promise
            if (dataCollection && dataCollection.courses.length > 0) {
                resolve(dataCollection.courses);
            //returning "no results returned" using the reject method of promise function
            } else {
                reject("no results returned");
            }
        });
    }

    function getStudentsByCourse(course) {
        return new Promise((resolve, reject) => {
            //declaring variable filteredStudents_courses and storing the Students whose course property matches with the course.
            const filteredStudents_courses = dataCollection.students.filter(student => student.course === course);
            //condition to check if the filteredStudents_courses have any data and return data using the resolve method.
            if (filteredStudents_courses.length > 0) {
                    resolve(filteredStudents_courses);
                //printing "no results returned" message using the reject method of promise function.
                } else {
                    reject("No results returned");
                } 
        });
    }


    function getStudentByNum(num) {
        return new Promise((resolve, reject) => {
            // Check if dataCollection or dataCollection.students is not initialized
            if (!dataCollection || !dataCollection.students) {
                reject("Data not initialized");
                return;
            }

            // Find the student by studentNum
            const student = dataCollection.students.find(student => student.studentNum === num);

            // Check if student is found
            if (student) {
                resolve(student); // Resolve with the student object
            } else {
                reject("Student not found"); // Reject if student is not found
            }
        });
    }

    function addStudent(studentData) {
        return new Promise((resolve, reject) => {
            //condition to update the TA field in the student.json file.
            if (studentData.TA === undefined)
            {
                studentData.TA = false;
            }
            else
            {
                studentData.TA = true;
            }
            //Incrementing the studentNum and assigning the value to the StudentNUm
            studentData.studentNum = dataCollection.students.length + 1;
            //pushing the whole record to our file
            dataCollection.students.push(studentData);
            resolve();

        })
    }

    /*
    // Function to test getStudentByNum
    function testGetStudentByNum(num) {
        getStudentByNum(num)
            .then(student => {
                console.log("Student found:", student);
            })
            .catch(err => {
                console.log("Error:", err);
            });
    }

    // Example usage to test fetching student number 5
    testGetStudentByNum(5);
    //mentioning this so that we can export the functions from this file.
    */

    module.exports = { initialize, getAllStudents, getTAs, getCourses, getStudentsByCourse, getStudentByNum, addStudent};
