#!/usr/bin/env node
/*
Simple DB connection tester. Run from project root:

Examples:
  node scripts/test-db.js --type mysql --host localhost --port 3306 --user root --password "" --database ai_inventory
  node scripts/test-db.js --type postgresql --host localhost --port 5432 --user postgres --password "" --database ai_inventory
  node scripts/test-db.js --type mongodb --host localhost --port 27017 --database ai_inventory
  node scripts/test-db.js --type mongodb --atlas --user <DB_USERNAME> --password <DB_PASSWORD> --host <cluster0.xxxxx.mongodb.net> --database ai_inventory
*/

/* eslint-disable no-console */

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.replace(/^--/, '');
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function testMySQL({ host, port, user, password, database }) {
  const initialPool = mysql.createPool({
    host,
    port: Number(port) || 3306,
    user,
    password,
    waitForConnections: true,
    connectionLimit: 5,
  });
  try {
    const conn = await initialPool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    conn.release();
    await initialPool.end();

    const pool = mysql.createPool({
      host,
      port: Number(port) || 3306,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
    });
    const c = await pool.getConnection();
    const [rows] = await c.query('SELECT 1 AS ok');
    c.release();
    await pool.end();
    return { ok: true, info: rows };
  } catch (err) {
    try { await initialPool.end(); } catch (_) {}
    return { ok: false, error: err };
  }
}

async function testPostgres({ host, port, user, password, database }) {
  const initial = new Pool({
    host,
    port: Number(port) || 5432,
    user,
    password,
    database: 'postgres',
    max: 2,
  });
  try {
    await initial.query('SELECT 1');
    try { await initial.query(`CREATE DATABASE "${database}"`); } catch (_) {}
    await initial.end();

    const pool = new Pool({
      host,
      port: Number(port) || 5432,
      user,
      password,
      database,
      max: 2,
    });
    const res = await pool.query('SELECT 1 as ok');
    await pool.end();
    return { ok: true, info: res.rows };
  } catch (err) {
    try { await initial.end(); } catch (_) {}
    return { ok: false, error: err };
  }
}

async function testMongo({ host, port, user, password, database, atlas }) {
  let uri;
  if (atlas || (host && String(host).includes('mongodb.net'))) {
    const cleanHost = String(host || '').replace(/^mongodb\+srv:\/\//, '').replace(/^mongodb:\/\//, '');
    if (!user || !password || !cleanHost) {
      return { ok: false, error: new Error('MongoDB Atlas requires --user, --password, and --host') };
    }
    uri = `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${cleanHost}/${database}?retryWrites=true&w=majority`;
  } else if (user && password) {
    uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host || 'localhost'}:${Number(port) || 27017}/${database}`;
  } else {
    uri = `mongodb://${host || 'localhost'}:${Number(port) || 27017}/${database}`;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000, directConnection: !atlas });
  try {
    await client.connect();
    const db = client.db(database);
    const names = await db.listCollections().toArray();
    await client.close();
    return { ok: true, info: names.map(c => c.name) };
  } catch (err) {
    try { await client.close(); } catch (_) {}
    return { ok: false, error: err };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const type = String(args.type || '').toLowerCase();
  if (!type || !['mysql', 'postgresql', 'mongodb'].includes(type)) {
    console.error('Usage: --type <mysql|postgresql|mongodb> --host <host> --port <port> --user <user> --password <pwd> --database <db> [--atlas]');
    process.exit(2);
  }

  const common = {
    host: args.host || 'localhost',
    port: args.port,
    user: args.user,
    password: args.password,
    database: args.database || 'ai_inventory',
    atlas: Boolean(args.atlas),
  };

  let result;
  if (type === 'mysql') {
    result = await testMySQL(common);
  } else if (type === 'postgresql') {
    result = await testPostgres(common);
  } else if (type === 'mongodb') {
    result = await testMongo(common);
  }

  if (result.ok) {
    console.log('SUCCESS:', { type, host: common.host, port: common.port || '(default)', database: common.database });
    if (result.info) console.log('INFO:', result.info);
    process.exit(0);
  } else {
    const err = result.error || new Error('Unknown error');
    console.error('FAILED:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();


