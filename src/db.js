import {createPool} from 'mysql2/promise';

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "degea200",
  port: 3306,
  database: "diagramas"
});

export default pool;