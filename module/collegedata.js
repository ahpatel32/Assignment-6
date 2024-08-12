const {Sequelize, Model, DataTypes } = require('sequelize'); 
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'gc2mHoG0Uvaf', 
    {   host: 'ep-super-band-a5g1lq82.us-east-2.aws.neon.tech',     
        dialect: 'postgres',     
        port: 5432,     
        dialectOptions: { 
        ssl: { rejectUnauthorized: false } 
    }, 
    query:{ raw: true } 
}); 

// Creating the Student model
const Student = sequelize.define('Student', {
    studentNum: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressStreet: {
      type: DataTypes.STRING
    },
    addressCity: {
      type: DataTypes.STRING
    },
    addressProvince: {
      type: DataTypes.STRING
    },
    TA: {
      type: DataTypes.BOOLEAN
    },
    status: {
      type: DataTypes.STRING
    }
  });
  
  // Creating the Course model
  const Course = sequelize.define('Course', {
    courseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseDescription: {
      type: DataTypes.STRING
    }
  });
  
  // Set up the relationship
  Course.hasMany(Student, {foreignKey: 'courseId'});

function initialize() {
        
        return new Promise((resolve, reject) => {
            sequelize.sync()
            .then(() => {
                    resolve('Database synced successfully.');
                })
                .catch((error) => {
                    console.error('Unable to sync the database:', error); // Log the full error
                    reject('Unable to sync the database.')
                })
        });
    }

    //function to get all data related to students
    function getAllStudents() {
        return new Promise((resolve, reject) => {
            //using Student.findALL() function to check for records in database
            Student.findAll().then(data => {
                if (data.length > 0) {
                    resolve(data);
                }
                //printing message if no student data found.
                else {
                    reject("no student data found.")
                }
            }).catch(() => {
                reject("error reading students table.")
            });
        });
    }

    function getCourses() {
        return new Promise((resolve, reject) => {
            //using Course.findALL() function to check for records in database
            Course.findAll().then(data => {
                if (data.length > 0) {
                    resolve(data);
                }
                //Print message if no data found
                else {
                    reject("no course data found.")
                }
            }).catch(() => {
                reject("error reading courses table.")
            });
        });
    }

    function getStudentsByCourse(courseId) {
        return new Promise((resolve, reject) => {
            Student.findAll({
                where: { courseId: courseId}
            }).then(data => {
                if (data.length > 0) {
                    resolve(data);
                }
                else{
                    reject("no student found in the course.")
                }
            }).catch(() => {
                reject("error running getStudentsByCourse function.")
            });
        });
    }


    function getStudentByNum(num) {
        return new Promise((resolve, reject) => {
            Student.findAll({
                where: { studentNum: num}
            }).then(data => {
                if(data.length > 0) {
                    resolve(data[0]);
                } 
                else {
                    reject("no record found for the studentnum.")
                }
            }).catch(() => {
                reject("error running getStudentByNum function.")
            });
        });
    }

    function addStudent(studentData) {
        return new Promise((resolve, reject) => {
            //Checking and updating value of studentData.TA
            studentData.TA = (studentData.TA) ? true : false;
            
            studentData.courseId = studentData.course;
            delete studentData.course; // Remove the original course field

            // Update the empty strings with value null
            for (let a in studentData){
                if (studentData[a] === ""){
                    studentData[a] = null;
                }
            }
            console.log(studentData);

            Student.create(studentData).then(() => {
                resolve();
            }).catch(() => {
                reject("unable to add new student record.")
            });
        });
    }

    function getCourseById(id) {
        const courseId = parseInt(id, 10);
        console.log(`Fetching course with ID: ${courseId}`);  // Log the courseId
        return new Promise((resolve, reject) => {
            Course.findAll({
                where: { courseId: courseId}
            }).then(data =>{
                if(data.length > 0){
                    resolve(data[0]);
                }
                else{
                    reject("no course found for the courseid.")
                }
            }).catch(() => {
                reject("error running getCourseByID function.")
            });
        });
    }

    // Define the updateStudent method
    function updateStudent(studentData) {
        return new Promise((resolve, reject) => {
           //Checking and updating value of studentData.TA
            studentData.TA = (studentData.TA) ? true : false;

            // Update the empty strings with value null
            for (let a in studentData) {
                if (studentData[a] === "") {
                    studentData[a] = null;
                }
            }

            Student.update(studentData, {
                where: { studentNum: studentData.studentNum }
            }).then(() => {
                resolve();
            }).catch(() => {
                reject("error running updateStudent function.");
            });
        });
    }

    // New function to add courses in the database
    function addCourse(courseData) {
        return new Promise((resolve, reject) => {
            // Set empty values to null values.
            for (let n in courseData) {
                if (courseData[n] === "") {
                    courseData[n] = null;
                }
            }
    
            Course.create(courseData)
                .then(() => resolve("Course added successfully"))
                .catch(() => reject("unable to create course"));
        });
    }

    //New function to update the course data.
    function updateCourse(courseData) {
        return new Promise((resolve, reject) => {
            // Set empty values to null values.
            for (let n in courseData) {
                if (courseData[n] === "") {
                    courseData[n] = null;
                }
            }
    
            Course.update(courseData, {
                where: {
                    courseId: courseData.courseId
                }
            })
            .then(([rowsUpdated]) => {
                if (rowsUpdated > 0) {
                    resolve("Course updated successfully");
                } else {
                    reject("Course not found");
                }
            })
            .catch(() => reject("unable to update course"));
        });
    }

    // New Function to delete the course by courseId
    function deleteCourseById(id) {
        return new Promise((resolve, reject) => {
            Course.destroy({
                where: {
                    courseId: id
                }
            })
            .then(deletedRows => {
                if (deletedRows > 0) {
                    resolve("Course deleted successfully");
                } else {
                    reject("Course not found");
                }
            })
            .catch(() => reject("unable to delete course"));
        });
    }
    
    // Function to delete a student by their number
    function deleteStudentByNum(studentNum) {
        return Student.destroy({
            where: {
                studentNum: studentNum
            }
        }).then(deletedRows => {
            if (deletedRows > 0) {
                return Promise.resolve("Student deleted successfully");
            } else {
                return Promise.reject("Student not found");
            }
        }).catch(() => {
            return Promise.reject("Unable to delete student");
        });
    }

    module.exports = { initialize, getAllStudents, getCourses, getStudentsByCourse, getStudentByNum, addStudent, getCourseById, updateStudent, addCourse, updateCourse, deleteCourseById, deleteStudentByNum};
