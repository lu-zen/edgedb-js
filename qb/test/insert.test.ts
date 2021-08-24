import {edgedb} from "@generated/imports";
import {Villain} from "@generated/modules/default";
import {InsertShape} from "@syntax/insert";
import {UpdateShape} from "@syntax/update";
import {createPool} from "edgedb";
import {typeutil} from "reflection";

import e from "../generated/example";
import {setupTests, teardownTests, TestData} from "./setupTeardown";

let pool: edgedb.Pool;
let data: TestData;

beforeAll(async () => {
  pool = await createPool();
  data = await setupTests();
});

afterAll(async () => {
  await teardownTests();
  await pool.close();
});

test("insert shape check", async () => {
  type insertVillainShape = InsertShape<typeof Villain>;
  const c1: insertVillainShape = {name: e.str("adf")};
});

test("basic insert", async () => {
  const q1 = e.insert(e.Hero, {
    name: e.str("Black Widow"),
    secret_identity: e.str("Natasha Romanoff"),
  });

  const r1 = await pool.queryOne(q1.toEdgeQL());

  pool.execute(`DELETE Hero FILTER .name = 'Black Widow';`);
  return;
});

test("nested insert", async () => {
  const q1 = e.insert(e.Villain, {
    name: e.str("Loki"),
    nemesis: e.insert(e.Hero, {
      name: e.str("Thor"),
      secret_identity: e.str("Thor"),
    }),
  });

  const q2 = e.select(q1, {
    name: true,
    nemesis: {name: true},
  });

  const result = await pool.queryOne(q2.toEdgeQL());

  // cleanup
  await pool.execute(`delete Villain filter .name = '${result.name}';`);
  await pool.execute(`delete Hero filter .name = '${result.nemesis.name}';`);
  return;
});

test("insert type enforcement", async () => {
  e.insert(e.Villain, {
    // @ts-expect-error card mismatch
    nemesis: e.select(e.Hero),
  });

  // @ts-expect-error missing required field
  e.insert(e.Villain, {});
  return;
});