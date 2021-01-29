USE employee_db;

INSERT INTO department (name)
VALUES ('Journalist'), ('Historian'), ('Probation'), ('Engineering');

INSERT INTO role (title, salary, department_id)
VALUES
  ('Lead Journalist', 10000, 1),
  ('Journalist', 40000, 1),
  ('Head Art historian', 1110000, 2),
  ('Art historian', 3000, 2),
  ('Probation officer Manager', 25020, 3),
  ('Probation officer', 12523, 3),
  ('Aircraft engineer Lead', 7000, 4),
  ('Aircraft engineer', 300001, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
  ('Eadmund ', 'Camel', 1, 3),
  ('Gertrudis', 'Iudas', 2, 1),
  ('Maja', 'Krishna', 3, null),
  ('Henrikas', 'Theotleip', 4, 3),
  ('Mia', 'Banne', 6, null),
  ('Asha', 'Zowie', 7, null),
  ('Bob', 'Normal', 8, 6),
  ('Three', 'Gnomes', 3, 2);