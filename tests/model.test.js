const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../model.js");

test("every baseline is normalized", () => {
  for (const baseline of Object.values(model.BASELINES)) {
    const total = Object.values(baseline.guilds).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 1e-10);
  }
});

test("an empty scenario preserves its starting state", () => {
  const result = model.simulate({}, "typical", 28);
  assert.equal(result.trajectory[28].capacity, result.baseline.capacity);
  for (const key of Object.keys(model.GUILDS)) {
    assert.ok(Math.abs(result.trajectory[28].guilds[key] - result.baseline.guilds[key]) < 1e-10);
  }
});

test("guild shares stay finite, positive and normalized", () => {
  const selection = Object.fromEntries(model.FOODS.map(food => [food.id, 21]));
  const result = model.simulate(selection, "lowFiber", 28);
  for (const point of result.trajectory) {
    const values = Object.values(point.guilds);
    assert.ok(values.every(value => Number.isFinite(value) && value > 0));
    assert.ok(Math.abs(values.reduce((a, b) => a + b, 0) - 1) < 1e-10);
  }
});

test("prebiotic-rich pattern raises bifidobacteria and butyrate guilds", () => {
  const result = model.simulate({ lentils: 7, beans: 7, "onion-garlic": 7, artichoke: 5 }, "typical", 28);
  const start = result.trajectory[0].guilds;
  const end = result.trajectory[28].guilds;
  assert.ok(end.bifido > start.bifido);
  assert.ok(end.butyrate > start.butyrate);
});

test("animal-protein and saturated-fat pressure raises corresponding guilds", () => {
  const result = model.simulate({ "red-meat": 14, "processed-meat": 7, cheese: 7 }, "typical", 28);
  const start = result.trajectory[0].guilds;
  const end = result.trajectory[28].guilds;
  assert.ok(end.proteolytic > start.proteolytic);
  assert.ok(end.bile > start.bile);
});

test("more weekly servings saturate rather than scale linearly", () => {
  const low = model.simulate({ "onion-garlic": 7 }, "typical", 28).trajectory[28].guilds.bifido;
  const medium = model.simulate({ "onion-garlic": 14 }, "typical", 28).trajectory[28].guilds.bifido;
  const high = model.simulate({ "onion-garlic": 21 }, "typical", 28).trajectory[28].guilds.bifido;
  assert.ok(medium - low > high - medium);
});

test("dominant pathways reflect the selected substrate", () => {
  const rs = model.aggregateDiet({ "cooled-potato": 7 });
  const fermented = model.aggregateDiet({ kefir: 7, kimchi: 7 });
  assert.equal(model.dominantPathway(rs).key, "resistant");
  assert.equal(model.dominantPathway(fermented).key, "fermented");
});
