import { createPool } from "mysql2/promise";

const config: any = {
  host: Bun.env.MYSQL_HOST,
  user: Bun.env.MYSQL_USER,
  password: Bun.env.MYSQL_PASSWORD,
  port: Bun.env.MYSQL_PORT,
  database: Bun.env.MYSQL_DATABASE,
  connectionLimit: 10,
};

function connect() {
  return createPool(config);
}

export { connect };
