const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


const runScript = (db, script) => {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getAllFromEmployee = (db) => {
  const sql = `SELECT * FROM Employee;`
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const removeNonEducatedEmployeesInNashvilleOrDenver = (employees) => {
  let cleanedEmployees = [];
  let employeeInNashOrDen
  employees.forEach((employee) => {
    employeeInNashOrDen = employee.LOCATION == 'Denver' || employee.LOCATION == 'Nashville'
    if(employee.EDUCATION || (!employee.EDUCATION && !employeeInNashOrDen)) {
      cleanedEmployees.push(employee)
    }
  })

  return cleanedEmployees;
}

const sortById = (a, b) => {
  if(a.ID > b.ID) {
    return 1;
  } else if (a.ID < b.ID) {
    return -1;
  } else {
    return 0;
  }
}

describe('the SQL in the `exercise.sql` file', () => {
  let db;
  let scriptPath;
  let cleanup1;
  let cleanup2;
  let cleanup3;
  let initialEmployees;

  beforeAll( async () => {
    const dbPath = path.resolve(__dirname, '..', 'lesson31.db');
    db = new sqlite3.Database(dbPath);

    scriptPath = path.resolve(__dirname, '..', 'exercise.sql');
    cleanup1 = path.resolve(__dirname, './cleanup1.sql');
    cleanup2 = path.resolve(__dirname, './cleanup2.sql');
    cleanup3 = path.resolve(__dirname, './cleanup3.sql');
    await runScript(db, cleanup1);
    await runScript(db, cleanup2);
    await runScript(db, cleanup3);
    initialEmployees = await getAllFromEmployee(db);
  });

  afterAll( async () => {
    await runScript(db, cleanup1);
    await runScript(db, cleanup2);
    await runScript(db, cleanup3);
    db.close()
  });

  it('should delete all rows where employees have no education and live in nashville or denver', async () => {
      await runScript(db, scriptPath);
      const results = await getAllFromEmployee(db);
      const expected = removeNonEducatedEmployeesInNashvilleOrDenver(initialEmployees);

      expect(expected.sort(sortById)).toEqual(results.sort(sortById));
  });
});
