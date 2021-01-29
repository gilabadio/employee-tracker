const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');


const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'employee_db'
});

function mainMenu() {
  inquirer.prompt({
    type: 'list',
    message: 'What would you like to do?',
    name: 'action',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      'Update an Employee Role',
      'Exit Program'
    ]
  })
    .then(({ action }) => {
      switch (action) {
        case 'View All Departments':
          viewDepartments();
          break;
        case 'View All Roles':
          viewRoles();
          break;
        case 'View All Employees':
          viewEmployees();
          break;
        case 'Add a Department':
          addDepartment();
          break;
        case 'Add a Role':
          addRole();
          break;
        case 'Add an Employee':
          addEmployee();
          break;
        case 'Update an Employee Role':
          updateEmployeeRole();
          break;
        case 'Exit Program':
          connection.close();
          break;
      }
    });
}

function viewDepartments() {
  connection.promise().query(`SELECT * FROM department`)
    .then(([departments]) => {
      console.table(departments);
      mainMenu();
    });
}

function viewRoles() {
  const sql = `
SELECT role.id, title, name AS department, salary
FROM role
LEFT JOIN department ON department_id = department.id`;
  connection.promise().query(sql)
    .then(([roles]) => {
      console.table(roles);
      mainMenu();
    });
}

function viewEmployees() {
  const sql = `
SELECT e.id, e.first_name, e.last_name, title,
  department.name AS department, salary,
  CONCAT(m.first_name, " ", m.last_name) AS manager
FROM employee AS e
LEFT JOIN role ON e.role_id = role.id
LEFT JOIN department ON department_id = department.id
LEFT JOIN employee AS m ON e.manager_id = m.id`;

  connection.promise().query(sql)
    .then(([employees]) => {
      console.log('\n');
      console.table(employees);
      console.log('\n');
      mainMenu();
    });
}

function addDepartment() {
  inquirer.prompt({
    type: 'input',
    message: 'Enter the name of the new department:',
    name: 'departmentName'
  })
    .then(({ departmentName }) => {
      const sql = `INSERT INTO department SET ?`;
      return connection.promise().query(sql, { name: departmentName });
    })
    .then(({ results }) => {
      console.log('Department added');
      mainMenu();
    });
}

async function addRole() {
  
  const [departments] = await connection.promise().query(`SELECT id AS value, name FROM department`);
  inquirer.prompt([
    {
      type: 'input',
      message: 'Enter the title of the new role:',
      name: 'title'
    },
    {
      type: 'input',
      message: 'Enter the salary of the new role:',
      name: 'salary'
    },
    {
      type: 'list',
      message: 'Select the department the role belongs to:',
      name: 'department_id',
      choices: departments
    }
  ])
    .then(({ title, salary, department_id }) => {
      const sql = `INSERT INTO role SET ?`;
      const params = { title, salary, department_id };
      connection.promise().query(sql, params)
        .then(({ results }) => {
          console.log('Role added');
          mainMenu();
        });
    });
}

// add employee
async function addEmployee() {
  
  const [roles] = await connection.promise().query(`SELECT id AS value, title AS name FROM role`);
  const employeeSql = `SELECT id AS value, CONCAT(first_name, " ", last_name) AS name from employee`;
  const [employees] = await connection.promise().query(employeeSql);

  employees.unshift({ value: null, name: 'None' });

  inquirer.prompt([
    {
      type: 'input',
      message: 'What is the employee\'s first name?',
      name: 'first_name'
    },
    {
      type: 'input',
      message: 'What is the employee\'s last name?',
      name: 'last_name'
    },
    {
      type: 'list',
      message: 'What is the employee\'s role?',
      name: 'role_id',
      choices: roles
    },
    {
      type: 'list',
      message: 'Which employee do you want to set as manager for the selected employee?',
      name: 'manager_id',
      choices: employees
    }
  ])
    .then(answers => {
      const sql = `INSERT INTO employee SET ?`;
      return connection.promise().query(sql, answers);
    })
    .then(({ results }) => {
      console.log('Employee added');
      mainMenu();
    });
}

async function updateEmployeeRole() {
  
  const employeeSql = `SELECT id AS value, CONCAT(first_name, " ", last_name) AS name from employee`;
  const [employees] = await connection.promise().query(employeeSql);
  const [roles] = await connection.promise().query(`SELECT id AS value, title AS name FROM role`);

  inquirer.prompt([
    {
      type: 'list',
      message: 'Which employee\'s role do you want to update?',
      name: 'id',
      choices: employees
    },
    {
      type: 'list',
      message: 'What is the employee\'s new role?',
      name: 'role_id',
      choices: roles
    }
  ])
    .then(({ id, role_id }) => {
      const sql = `UPDATE employee SET ? WHERE ?`;
      return connection.promise().query(sql, [{ role_id }, { id }]);
    })
    .then(({ results }) => {
      console.log('Employee\'s role has been updated');
      mainMenu();
    });
}

mainMenu();