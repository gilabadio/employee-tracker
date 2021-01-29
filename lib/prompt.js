const inquirer = require("inquirer");
const cTable = require("console.table");
const connection = require("../db/database");

function viewDepartments() {
  connection
    .promise()
    .query(`SELECT * FROM department`)
    .then(([departments]) => {
      console.log(`
    =================
    Departments
    =================
    `);
      console.table(departments);
      promptMenu();
    });
}

function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "Enter the name of the new department:",
      name: "department_name",
    })
    .then(({ department_name }) => {
      return connection
        .promise()
        .query(`INSERT INTO department SET ?`, { name: department_name });
    })
    .then(({ departmentAdded }) => {
      console.log(`
        =================
        Department added
        =================
        `);
      promptMenu();
    });
}

function viewRoles() {
  connection
    .promise()
    .query(`SELECT * FROM role`)
    .then(([roles]) => {
      console.log(`
    =================
    Roles
    =================
    `);
      console.log("\n");
      console.table(roles);
      promptMenu();
    });
}

async function addRole() {
  const [departments] = await connection
    .promise()
    .query(`SELECT id AS value, name FROM department`);

  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter the title of the new role:",
        name: "role_title",
      },
      {
        type: "number",
        message: "Enter the salary of the new role:",
        name: "role_salary",
      },
      {
        type: "list",
        message: "Select the department this role belongs to:",
        name: "department",
        choices: departments,
      },
    ])
    .then((answers) => {
      return connection.promise().query(`INSERT INTO role SET ?`, {
        title: answers.role_title,
        salary: answers.role_salary,
        department_id: answers.department,
      });
    })
    .then((roleAdded) => {
      console.log(`
        =================
        Role added
        =================
        `);
      promptMenu();
    });
}
function viewEmployee() {
  connection
    .promise()
    .query(
      `SELECT employee.id, employee.first_name, employee.last_name, 
      department.name AS department, 
      role.title AS title, role.salary AS salary, 
      CONCAT(manager.first_name, " ", manager.last_name) AS manager
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON department_id = department.id
      LEFT JOIN employee AS manager ON employee.manager_id = manager.id`
    )
    .then(([employee]) => {
      console.log(`
    =================
    Employee
    =================
    `);
      console.log("\n");
      console.table(employee);
      promptMenu();
    });
}

async function addEmployee() {
  const [roles] = await connection
    .promise()
    .query(`SELECT id AS value, title AS name FROM role`);
  const [employee] = await connection
    .promise()
    .query(
      `SELECT id AS value, CONCAT(first_name, " ", last_name) AS name from employee`
    );

  employee.unshift({ value: null, name: "None" });

  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "first_name",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "last_name",
      },
      {
        type: "list",
        message: "What is the employee's role?",
        name: "role_id",
        choices: roles,
      },
      {
        type: "list",
        message:
          "Which employee do you want to set as manager for the selected employee?",
        name: "manager_id",
        choices: employee,
      },
    ])
    .then((answers) => {
      const sql = `INSERT INTO employee SET ?`;
      return connection.promise().query(sql, answers);
    })
    .then(({ results }) => {
      console.log("Employee added");
      promptMenu();
    });
}

async function updateEmployeeRole() {
  const [employee] = await connection
    .promise()
    .query(
      `SELECT id AS value, CONCAT(first_name, " ", last_name) AS name from employee`
    );
  const [roles] = await connection
    .promise()
    .query(`SELECT id AS value, title AS name FROM role`);

  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee's role do you want to update?",
        name: "id",
        choices: employee,
      },
      {
        type: "list",
        message: "What is the employee's new role?",
        name: "role_id",
        choices: roles,
      },
    ])
    .then(({ id, role_id }) => {
      return connection
        .promise()
        .query(`UPDATE employee SET ? WHERE ?`, [{ role_id }, { id }]);
    })
    .then(({ employeeUpdated }) => {
      console.log(`
          =================
          Employee Updated
          =================
          `);
      promptMenu();
    });
}


// main menua
const promptMenu = () => {
 
  return inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "Please select an option:",
        choices: [
          "View all departments",
          "View all roles",
          "View all employee",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update employee role",
          "Close program",
        ],
      },
    ])
    .then(({ menu }) => {
      switch (menu) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employee":
          viewEmployee();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update employee role":
          updateEmployeeRole();
          break;
        case "Close program":
          connection.end();
          break;
      }
    });
};

module.exports = { promptMenu };