import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const maxConnectionQuery = await database.query("SHOW max_connections;");
  const maxConnection = maxConnectionQuery.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const openedConnectionQuery = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;", // Corrigido
    values: [databaseName],
  });
  const openedConnection = openedConnectionQuery.rows[0].count;

  const postgresQuery = await database.query("SHOW server_version;");
  const postgresVersion = postgresQuery.rows[0].server_version;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: postgresVersion,
        max_connections: parseInt(maxConnection),
        opened_connections: openedConnection,
      },
    },
  });
}

export default status;
