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
    const datafolderpath = path.join(__dirname, '../data');
    function initialize() {
        
        return new Promise((resolve, reject) => {
            //defining a constant variable with the datafolder path values.
            console.log('Reading courses.json from:', path.join(datafolderpath, 'courses.json'));
            //reading the courses.json file
            fs.readFile(path.join(datafolderpath, 'courses.json'),'utf8', (err, courseData) => {
                if (err) {
                    //returning the reject message if we are not able to read the data from courses.json
                    return reject("unable to read courses.json");
                }
                let courses;
                courses = JSON.parse(courseData);

            //reading the students.json file
            fs.readFile(path.join(datafolderpath, 'students.json'), 'utf8', (err, studentData) => {
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

    function getCourseById(id) {
        return new Promise((resolve, reject) => {
            const course = dataCollection.courses.find(c => c.courseId === id);
            console.log("Retrieved course:", course); // Debug log
            if (course) {
                resolve(course);
            } else {
                reject("query returned 0 results");
            }
        });
    }

    // Define the updateStudent method
    function updateStudent(studentData) {
        return new Promise((resolve, reject) => {
            // Log the incoming student data
            console.log("Updating student with data:", studentData);

            // Ensure studentNum is a number
            studentData.studentNum = parseInt(studentData.studentNum, 10);
            const studentIndex = dataCollection.students.findIndex(student => student.studentNum === studentData.studentNum);
            console.log(studentIndex)
            if (studentIndex === -1) {
                return reject("Student not found");
            }
    
            // Update the TA field based on whether the checkbox is checked or not
            studentData.TA = studentData.TA === "on";
    
            // Update the student data
            dataCollection.students[studentIndex] = studentData;
    
            // Write the updated students array back to the students.json file
            fs.writeFile(path.join(datafolderpath, 'data', 'students.json'), JSON.stringify(dataCollection.students, null, 2), 'utf8', (err) => {
                if (err) {
                    return reject("Unable to write to students.json");
                }
                resolve();
            });
        });
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

    module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent};
