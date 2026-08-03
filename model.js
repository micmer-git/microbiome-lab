(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MicrobiomeModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GUILDS = {
    butyrate: { name: "Butyrate producers", note: "Faecalibacterium, Roseburia-like", color: "#dfff73" },
    bifido: { name: "Bifidobacteria", note: "Primary prebiotic responders", color: "#83d5c0" },
    saccharolytic: { name: "Complex-carb degraders", note: "Bacteroides / Prevotella-like", color: "#9d93e8" },
    mucin: { name: "Mucin specialists", note: "Akkermansia-like", color: "#ff8c72" },
    lactate: { name: "Lactate producers", note: "Food-associated + resident LAB", color: "#e6ba5f" },
    proteolytic: { name: "Proteolytic guild", note: "Amino-acid fermenters", color: "#ef9ba7" },
    bile: { name: "Bile-tolerant guild", note: "Fat-associated pressure", color: "#76a4a0" },
    generalists: { name: "Ecological generalists", note: "Flexible substrate use", color: "#d5c9b5" }
  };

  const BASELINES = {
    typical: {
      label: "Mixed diet",
      capacity: 62,
      uncertainty: 6.5,
      guilds: { butyrate: .175, bifido: .095, saccharolytic: .235, mucin: .065, lactate: .075, proteolytic: .115, bile: .095, generalists: .145 }
    },
    plant: {
      label: "Plant-diverse",
      capacity: 74,
      uncertainty: 5.5,
      guilds: { butyrate: .215, bifido: .115, saccharolytic: .25, mucin: .075, lactate: .065, proteolytic: .07, bile: .055, generalists: .155 }
    },
    lowFiber: {
      label: "Low-fibre",
      capacity: 46,
      uncertainty: 8.5,
      guilds: { butyrate: .115, bifido: .065, saccharolytic: .185, mucin: .055, lactate: .065, proteolytic: .165, bile: .16, generalists: .19 }
    }
  };

  const SPECIES = {
    faecalibacterium: { name: "Faecalibacterium prausnitzii", short: "F. prausnitzii", guild: "butyrate", note: "butyrate producer", color: "#dfff73", response: 1.00 },
    roseburia: { name: "Roseburia intestinalis", short: "R. intestinalis", guild: "butyrate", note: "fibre-linked butyrate producer", color: "#c9ef66", response: 1.08 },
    eubacterium: { name: "Eubacterium rectale", short: "E. rectale", guild: "butyrate", note: "starch and fibre fermenter", color: "#b6df5a", response: 1.03 },
    anaerobutyricum: { name: "Anaerobutyricum hallii", short: "A. hallii", guild: "butyrate", note: "lactate cross-feeder", color: "#a5cf52", response: .95 },
    bifidoAdolescentis: { name: "Bifidobacterium adolescentis", short: "B. adolescentis", guild: "bifido", note: "prebiotic responder", color: "#83d5c0", response: 1.16 },
    bifidoLongum: { name: "Bifidobacterium longum", short: "B. longum", guild: "bifido", note: "oligosaccharide user", color: "#6fc4b0", response: 1.06 },
    bacteroidesTheta: { name: "Bacteroides thetaiotaomicron", short: "B. thetaiotaomicron", guild: "saccharolytic", note: "polysaccharide generalist", color: "#9d93e8", response: .86 },
    bacteroidesVulgatus: { name: "Bacteroides vulgatus", short: "B. vulgatus", guild: "saccharolytic", note: "broad glycan user", color: "#8d82d7", response: .76 },
    prevotella: { name: "Prevotella copri", short: "P. copri", guild: "saccharolytic", note: "plant-carbohydrate associated", color: "#7e72c7", response: 1.12 },
    ruminococcus: { name: "Ruminococcus bromii", short: "R. bromii", guild: "saccharolytic", note: "resistant-starch degrader", color: "#6e63b6", response: 1.18 },
    akkermansia: { name: "Akkermansia muciniphila", short: "A. muciniphila", guild: "mucin", note: "mucin specialist", color: "#ff8c72", response: .80 },
    blautia: { name: "Blautia wexlerae", short: "B. wexlerae", guild: "generalists", note: "acetate-utilizing commensal", color: "#d5c9b5", response: .72 },
    coprococcus: { name: "Coprococcus comes", short: "C. comes", guild: "butyrate", note: "carbohydrate fermenter", color: "#91bd49", response: .88 },
    lawsonibacter: { name: "Lawsonibacter asaccharolyticus", short: "L. asaccharolyticus", guild: "generalists", note: "coffee-associated species", color: "#c4b7a1", response: 1.02 },
    alistipes: { name: "Alistipes putredinis", short: "A. putredinis", guild: "proteolytic", note: "protein-tolerant generalist", color: "#ef9ba7", response: .72 },
    parabacteroides: { name: "Parabacteroides distasonis", short: "P. distasonis", guild: "generalists", note: "flexible saccharolytic species", color: "#b3a68f", response: .74 },
    collinsella: { name: "Collinsella aerofaciens", short: "C. aerofaciens", guild: "lactate", note: "carbohydrate fermenter", color: "#e6ba5f", response: .82 },
    bilophila: { name: "Bilophila wadsworthia", short: "B. wadsworthia", guild: "bile", note: "bile-tolerant sulfite reducer", color: "#76a4a0", response: 1.18 },
    escherichia: { name: "Escherichia coli", short: "E. coli", guild: "proteolytic", note: "facultative generalist", color: "#de8996", response: .78 },
    enterococcus: { name: "Enterococcus faecalis", short: "E. faecalis", guild: "lactate", note: "facultative lactate producer", color: "#d5a64e", response: .76 }
  };

  const SPECIES_BASELINE_WEIGHTS = {
    typical: [11, 7, 8, 4, 5, 5, 10, 8, 4, 4, 4, 5, 4, 2, 4, 4, 3, 3, 3, 2],
    plant: [13, 9, 10, 5, 6, 6, 8, 5, 8, 7, 4, 5, 5, 3, 2, 3, 2, 1.5, 1.5, 1.5],
    lowFiber: [7, 4, 5, 3, 3, 3, 11, 10, 2, 2, 3, 6, 3, 1.5, 7, 6, 3, 7, 6, 4]
  };

  const SPECIES_MODIFIERS = {
    faecalibacterium: { fiber: .08, rs: .10 },
    roseburia: { fiber: .12, arabinoxylan: .16, betaGlucan: .10 },
    eubacterium: { rs: .20, fiber: .08 },
    anaerobutyricum: { fermented: .08, gos: .10, inulin: .10 },
    bifidoAdolescentis: { inulin: .28, gos: .28, betaGlucan: .08 },
    bifidoLongum: { inulin: .20, gos: .22, pectin: .06 },
    bacteroidesTheta: { pectin: .14, fiber: .06 },
    bacteroidesVulgatus: { animalProtein: .05, fiber: .03 },
    prevotella: { fiber: .17, plant: .08 },
    ruminococcus: { rs: .38, betaGlucan: .08 },
    akkermansia: { polyphenol: .20, unsatFat: .06 },
    blautia: { fiber: .07, plant: .05 },
    coprococcus: { fiber: .08, pectin: .08 },
    lawsonibacter: { coffee: .48, polyphenol: .08 },
    alistipes: { animalProtein: .12, fiber: -.05 },
    parabacteroides: { fiber: .06, plant: .03 },
    collinsella: { refined: .08, dairy: .05 },
    bilophila: { satFat: .34, animalProtein: .12, unsatFat: -.05 },
    escherichia: { processed: .10, refined: .08 },
    enterococcus: { fermented: .07, animalProtein: .06 }
  };

  const FOODS = [
    { id: "oats", name: "Oats", icon: "◌", group: "grains", plant: true, tags: "β-glucan · resistant starch", features: { fiber: .7, betaGlucan: 1, rs: .28, plant: .6 } },
    { id: "lentils", name: "Lentils", icon: "●", group: "legumes", plant: true, tags: "GOS · resistant starch", features: { fiber: 1, gos: .8, rs: .45, plant: 1 } },
    { id: "chickpeas", name: "Chickpeas", icon: "◉", group: "legumes", plant: true, tags: "GOS · arabinans", features: { fiber: .9, gos: .75, rs: .35, plant: 1 } },
    { id: "beans", name: "Beans", icon: "⬮", group: "legumes", plant: true, tags: "GOS · resistant starch", features: { fiber: 1, gos: .9, rs: .5, plant: 1 } },
    { id: "cooled-potato", name: "Cooled potato", icon: "⬡", group: "starches", plant: true, tags: "retrograded starch", features: { fiber: .22, rs: 1, plant: .35 } },
    { id: "green-banana", name: "Green banana", icon: "◒", group: "fruit", plant: true, tags: "resistant starch · pectin", features: { fiber: .45, rs: .8, pectin: .55, plant: .8 } },
    { id: "apple", name: "Apple", icon: "○", group: "fruit", plant: true, tags: "pectin · polyphenols", features: { fiber: .52, pectin: .85, polyphenol: .45, plant: .8 } },
    { id: "berries", name: "Berries", icon: "✣", group: "fruit", plant: true, tags: "anthocyanins · fibre", features: { fiber: .58, pectin: .38, polyphenol: 1, plant: 1 } },
    { id: "onion-garlic", name: "Onion + garlic", icon: "◎", group: "vegetables", plant: true, tags: "inulin · fructans", features: { fiber: .3, inulin: 1, plant: .9 } },
    { id: "artichoke", name: "Artichoke", icon: "✺", group: "vegetables", plant: true, tags: "inulin · polyphenols", features: { fiber: .85, inulin: .9, polyphenol: .45, plant: 1 } },
    { id: "broccoli", name: "Broccoli", icon: "♧", group: "vegetables", plant: true, tags: "cell walls · glucosinolates", features: { fiber: .62, sulfurPlant: .65, plant: 1 } },
    { id: "wholegrain", name: "Wholegrain bread", icon: "▱", group: "grains", plant: true, tags: "arabinoxylan · fibre", features: { fiber: .7, arabinoxylan: .85, plant: .7 } },
    { id: "almonds", name: "Almonds", icon: "◇", group: "nuts", plant: true, tags: "cell walls · polyphenols", features: { fiber: .6, polyphenol: .5, plant: .8, unsatFat: .5 } },
    { id: "cocoa", name: "Dark cocoa", icon: "◆", group: "polyphenols", plant: true, tags: "flavanols · fibre", features: { fiber: .45, polyphenol: 1, plant: .6 } },
    { id: "coffee", name: "Coffee", icon: "∿", group: "polyphenols", plant: true, tags: "chlorogenic acids", features: { polyphenol: .85, coffee: 1, plant: .35 } },
    { id: "olive-oil", name: "Extra virgin olive oil", icon: "◐", group: "fats", plant: true, tags: "phenolics · unsaturated fat", features: { polyphenol: .35, unsatFat: 1, plant: .25 } },
    { id: "kefir", name: "Kefir", icon: "◍", group: "fermented", plant: false, tags: "live cultures · fermentation", features: { fermented: 1, dairy: .55 } },
    { id: "yogurt", name: "Live yogurt", icon: "◓", group: "fermented", plant: false, tags: "live cultures", features: { fermented: .78, dairy: .65 } },
    { id: "kimchi", name: "Kimchi / kraut", icon: "≋", group: "fermented", plant: true, tags: "fermented plants", features: { fermented: 1, fiber: .35, plant: .8 } },
    { id: "red-meat", name: "Red meat", icon: "▰", group: "animal", plant: false, tags: "animal protein · saturated fat", features: { animalProtein: 1, satFat: .65, heme: .7 } },
    { id: "processed-meat", name: "Processed meat", icon: "▤", group: "animal", plant: false, tags: "protein · salt · processing", features: { animalProtein: 1, satFat: .85, processed: .7, heme: .65 } },
    { id: "cheese", name: "Aged cheese", icon: "△", group: "animal", plant: false, tags: "saturated fat · fermentation", features: { animalProtein: .6, satFat: 1, fermented: .22, dairy: .8 } },
    { id: "upf-snack", name: "Ultra-processed snack", icon: "▧", group: "other", plant: false, tags: "low fibre · food matrix lost", features: { satFat: .55, processed: 1, refined: 1 } }
  ];

  // Log-abundance pressure coefficients. These encode directional hypotheses, not clinical effect sizes.
  const EFFECTS = {
    fiber:       { butyrate: .23, bifido: .07, saccharolytic: .16, mucin: .03, proteolytic: -.11, bile: -.06 },
    betaGlucan:  { butyrate: .19, bifido: .06, saccharolytic: .10 },
    rs:          { butyrate: .34, bifido: .07, saccharolytic: .12, proteolytic: -.07 },
    gos:         { bifido: .31, butyrate: .10, lactate: .06 },
    inulin:      { bifido: .35, butyrate: .10, proteolytic: -.05 },
    pectin:      { butyrate: .15, saccharolytic: .15, bifido: .04 },
    arabinoxylan:{ butyrate: .18, bifido: .06, saccharolytic: .14 },
    polyphenol:  { mucin: .13, butyrate: .07, saccharolytic: .03, proteolytic: -.05 },
    coffee:      { generalists: .07, mucin: .04 },
    fermented:   { lactate: .30, bifido: .05, generalists: .06 },
    plant:       { butyrate: .035, saccharolytic: .04, generalists: .03, proteolytic: -.025 },
    unsatFat:    { mucin: .035, bile: -.025 },
    animalProtein:{ proteolytic: .28, bile: .08, butyrate: -.045 },
    satFat:      { bile: .27, proteolytic: .07, butyrate: -.055 },
    heme:        { proteolytic: .075 },
    processed:   { generalists: .04, butyrate: -.075, bifido: -.035 },
    refined:     { generalists: .06, butyrate: -.04 },
    dairy:       { lactate: .035 },
    sulfurPlant: { saccharolytic: .02 }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const sum = values => values.reduce((a, b) => a + b, 0);
  const round = (value, digits = 1) => Number(value.toFixed(digits));

  function normalizeGuilds(guilds) {
    const total = sum(Object.values(guilds));
    return Object.fromEntries(Object.entries(guilds).map(([key, value]) => [key, value / total]));
  }

  function speciesBaseline(id = "typical") {
    const weights = SPECIES_BASELINE_WEIGHTS[id] || SPECIES_BASELINE_WEIGHTS.typical;
    const total = sum(weights);
    return Object.fromEntries(Object.keys(SPECIES).map((key, index) => [key, weights[index] / total]));
  }

  function normalizeSpecies(distribution, fallback = speciesBaseline("typical")) {
    const safe = Object.fromEntries(Object.keys(SPECIES).map(key => [key, Math.max(0, Number(distribution && distribution[key]) || 0)]));
    const total = sum(Object.values(safe));
    if (total <= 0) return { ...fallback };
    return Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, value / total]));
  }

  function speciesToGuilds(distribution) {
    const guilds = Object.fromEntries(Object.keys(GUILDS).map(key => [key, 0]));
    for (const [key, value] of Object.entries(distribution)) guilds[SPECIES[key].guild] += value;
    return normalizeGuilds(guilds);
  }

  function aggregateDiet(selection) {
    const features = {};
    let plantCount = 0;
    let totalServings = 0;
    const foods = [];
    for (const [id, weeklyRaw] of Object.entries(selection || {})) {
      const weekly = clamp(Number(weeklyRaw) || 0, 0, 21);
      const food = FOODS.find(item => item.id === id);
      if (!food || weekly <= 0) continue;
      const daily = weekly / 7;
      totalServings += weekly;
      if (food.plant) plantCount += 1;
      foods.push({ ...food, weekly });
      for (const [feature, weight] of Object.entries(food.features)) {
        features[feature] = (features[feature] || 0) + weight * daily;
      }
    }
    return { features, plantCount, totalServings, foods };
  }

  function aggregateExposure(selection, mode = "meal") {
    const features = {};
    let plantCount = 0;
    let totalPortions = 0;
    const foods = [];
    for (const [id, portionsRaw] of Object.entries(selection || {})) {
      const portions = clamp(Number(portionsRaw) || 0, 0, 6);
      const food = FOODS.find(item => item.id === id);
      if (!food || portions <= 0) continue;
      totalPortions += portions;
      if (food.plant) plantCount += 1;
      foods.push({ ...food, portions });
      for (const [feature, weight] of Object.entries(food.features)) {
        features[feature] = (features[feature] || 0) + weight * portions;
      }
    }
    const scale = mode === "day" ? .72 : .46;
    for (const feature of Object.keys(features)) features[feature] *= scale;
    return { features, plantCount, totalPortions, totalServings: totalPortions, foods, mode };
  }

  function pressureFromDiet(diet) {
    const pressure = Object.fromEntries(Object.keys(GUILDS).map(key => [key, 0]));
    for (const [feature, amountRaw] of Object.entries(diet.features)) {
      const amount = 1.7 * Math.tanh(amountRaw / 1.7); // diminishing returns
      const coefficients = EFFECTS[feature] || {};
      for (const [guild, coefficient] of Object.entries(coefficients)) pressure[guild] += amount * coefficient;
    }
    // Unique plant sources add a small ecological breadth effect, without double-counting serving volume.
    const breadth = Math.tanh(diet.plantCount / 14);
    pressure.butyrate += breadth * .10;
    pressure.saccharolytic += breadth * .08;
    pressure.generalists += breadth * .06;
    pressure.proteolytic -= breadth * .04;
    return pressure;
  }

  function calculateMetabolites(guilds, diet) {
    const f = diet.features;
    const carbSubstrate = (f.fiber || 0) + .9 * (f.rs || 0) + .65 * (f.inulin || 0) + .55 * (f.gos || 0) + .45 * (f.pectin || 0) + .35 * (f.betaGlucan || 0);
    const substrateFactor = .58 + .42 * Math.tanh(carbSubstrate / 2.2);
    const butyratePotential = clamp(18 + 250 * guilds.butyrate * substrateFactor + diet.plantCount * .7, 10, 96);
    const propionateRaw = 18 + 62 * guilds.saccharolytic + 2.4 * (f.fiber || 0);
    const butyrateRaw = 13 + 78 * guilds.butyrate * substrateFactor;
    const acetateRaw = 46 + 64 * guilds.bifido + 35 * guilds.lactate;
    const scfaTotal = acetateRaw + propionateRaw + butyrateRaw;
    const proteinPressure = clamp(8 + 210 * guilds.proteolytic + 12 * (f.animalProtein || 0) - 5 * carbSubstrate, 4, 94);
    const gasPotential = clamp(16 + 12 * (f.inulin || 0) + 10 * (f.gos || 0) + 7 * (f.rs || 0) + 55 * guilds.lactate, 8, 96);
    return {
      butyratePotential: round(butyratePotential, 0),
      acetateShare: round(100 * acetateRaw / scfaTotal, 0),
      propionateShare: round(100 * propionateRaw / scfaTotal, 0),
      butyrateShare: round(100 * butyrateRaw / scfaTotal, 0),
      proteolyticPressure: round(proteinPressure, 0),
      gasPotential: round(gasPotential, 0)
    };
  }

  function calculateCapacity(guilds, diet, baselineCapacity) {
    const carbohydrateGuilds = guilds.butyrate + guilds.bifido + guilds.saccharolytic;
    const ecologicalBreadth = Math.tanh(diet.plantCount / 18);
    const negativePressure = guilds.proteolytic + guilds.bile;
    const target = 36 + 70 * carbohydrateGuilds + 15 * ecologicalBreadth - 28 * negativePressure;
    const anchor = .25 * baselineCapacity + .75 * target;
    return round(clamp(anchor, 22, 91), 0);
  }

  function simulate(selection = {}, baselineId = "typical", days = 28) {
    const baseline = BASELINES[baselineId] || BASELINES.typical;
    const diet = aggregateDiet(selection);
    const pressure = pressureFromDiet(diet);
    const start = { ...baseline.guilds };
    let current = { ...start };
    const trajectory = [{ day: 0, guilds: { ...start }, capacity: baseline.capacity, metabolites: calculateMetabolites(start, { features: {}, plantCount: 0 }) }];
    const adaptation = .14;

    for (let day = 1; day <= days; day += 1) {
      const ramp = 1 - Math.exp(-day / 3.2);
      const target = {};
      for (const guild of Object.keys(GUILDS)) {
        target[guild] = start[guild] * Math.exp((pressure[guild] || 0) * ramp);
      }
      const normalizedTarget = normalizeGuilds(target);
      for (const guild of Object.keys(GUILDS)) current[guild] += adaptation * (normalizedTarget[guild] - current[guild]);
      current = normalizeGuilds(current);
      trajectory.push({
        day,
        guilds: { ...current },
        capacity: diet.totalServings ? calculateCapacity(current, diet, baseline.capacity) : baseline.capacity,
        metabolites: calculateMetabolites(current, diet)
      });
    }

    return { baseline, diet, pressure, trajectory, uncertainty: baseline.uncertainty + (diet.totalServings ? 1.5 : 0) };
  }

  function pressureForSpecies(diet) {
    const guildPressure = pressureFromDiet(diet);
    const result = {};
    for (const [key, species] of Object.entries(SPECIES)) {
      let value = (guildPressure[species.guild] || 0) * species.response;
      for (const [feature, coefficient] of Object.entries(SPECIES_MODIFIERS[key] || {})) {
        const amount = 1.45 * Math.tanh((diet.features[feature] || 0) / 1.45);
        value += amount * coefficient;
      }
      result[key] = value;
    }
    return result;
  }

  function simulateExposure(selection = {}, baselineId = "typical", mode = "meal", repeats = 5, customDistribution = null) {
    const baseline = BASELINES[baselineId] || BASELINES.typical;
    const preset = speciesBaseline(baselineId);
    const start = customDistribution ? normalizeSpecies(customDistribution, preset) : preset;
    const diet = aggregateExposure(selection, mode);
    const pressure = pressureForSpecies(diet);
    const steps = clamp(Math.round(Number(repeats) || 1), 1, 10);
    const dose = mode === "day" ? .48 : .31;
    const adaptation = mode === "day" ? .46 : .38;
    let current = { ...start };
    const initialGuilds = speciesToGuilds(start);
    const trajectory = [{ exposure: 0, species: { ...start }, guilds: initialGuilds, capacity: baseline.capacity, metabolites: calculateMetabolites(initialGuilds, { features: {}, plantCount: 0 }) }];

    for (let exposure = 1; exposure <= steps; exposure += 1) {
      if (diet.totalPortions > 0) {
        const ramp = .72 + .28 * (1 - Math.exp(-exposure / 2.4));
        const target = {};
        for (const key of Object.keys(SPECIES)) target[key] = start[key] * Math.exp((pressure[key] || 0) * dose * ramp);
        const normalizedTarget = normalizeSpecies(target, start);
        for (const key of Object.keys(SPECIES)) current[key] += adaptation * (normalizedTarget[key] - current[key]);
        current = normalizeSpecies(current, start);
      }
      const guilds = speciesToGuilds(current);
      const carbohydrateShift = (guilds.butyrate + guilds.bifido + guilds.saccharolytic) - (initialGuilds.butyrate + initialGuilds.bifido + initialGuilds.saccharolytic);
      const negativeShift = (guilds.proteolytic + guilds.bile) - (initialGuilds.proteolytic + initialGuilds.bile);
      const substrate = (diet.features.fiber || 0) + .8 * (diet.features.rs || 0) + .55 * (diet.features.inulin || 0) + .5 * (diet.features.gos || 0);
      const exposureProgress = 1 - Math.exp(-exposure / 2.8);
      const capacityDelta = 85 * carbohydrateShift - 45 * negativeShift + exposureProgress * (2.8 * Math.tanh(substrate / 2.8) + 1.2 * Math.tanh(diet.plantCount / 4) - 2.2 * Math.tanh((diet.features.animalProtein || 0) / 1.8));
      trajectory.push({
        exposure,
        species: { ...current },
        guilds,
        capacity: diet.totalPortions ? round(clamp(baseline.capacity + capacityDelta, 22, 91), 0) : baseline.capacity,
        metabolites: calculateMetabolites(guilds, diet)
      });
    }

    return { baseline, baselineSpecies: start, diet, pressure, trajectory, repeats: steps, mode, uncertainty: baseline.uncertainty + 4.5 };
  }

  function dominantPathway(diet) {
    const f = diet.features;
    const candidates = [
      { key: "resistant", score: (f.rs || 0) + .45 * (f.fiber || 0), title: "Resistant-starch cross-feeding", copy: "Starch escaping small-intestinal digestion becomes a shared substrate. Primary degraders release intermediates that butyrate producers can consume.", confidence: 4, nodes: [["Resistant starch", "substrate"], ["Primary degraders", "hydrolysis"], ["Butyrate guild", "cross-feeding"], ["Butyrate", "metabolite"]] },
      { key: "prebiotic", score: (f.inulin || 0) + (f.gos || 0), title: "Prebiotic bifidogenic route", copy: "Inulin-type fructans and GOS selectively favour some primary fermenters. Acetate and lactate can then feed secondary butyrate producers.", confidence: 4, nodes: [["Inulin / GOS", "substrate"], ["Bifidobacteria", "primary use"], ["Cross-feeders", "secondary use"], ["Acetate + butyrate", "metabolites"]] },
      { key: "polyphenol", score: (f.polyphenol || 0) + .5 * (f.coffee || 0), title: "Polyphenol biotransformation", copy: "Most polyphenols are transformed extensively before or within the colon. Microbes and metabolites respond, but causality is compound- and person-specific.", confidence: 2, nodes: [["Polyphenols", "food matrix"], ["Biotransformers", "conversion"], ["Phenolic acids", "metabolites"], ["Community shift", "association"]] },
      { key: "fermented", score: (f.fermented || 0) * 1.1, title: "Fermented-food exposure", copy: "Food-associated microbes and fermentation products enter repeatedly. Persistence is usually limited, yet community diversity and immune markers may change.", confidence: 3, nodes: [["Fermented food", "exposure"], ["Transient microbes", "passage"], ["Resident network", "interaction"], ["Immune context", "host readout"]] },
      { key: "protein", score: (f.animalProtein || 0) + .7 * (f.satFat || 0), title: "Protein and bile-acid pressure", copy: "Protein reaching the colon supports amino-acid fermentation, while higher saturated-fat exposure can alter bile flow and favour bile-tolerant organisms.", confidence: 2, nodes: [["Protein + fat", "diet"], ["Bile / peptides", "substrates"], ["Tolerant guilds", "selection"], ["N/S products", "metabolites"]] }
    ];
    const best = candidates.sort((a, b) => b.score - a.score)[0];
    if (!best || best.score <= 0) return { key: "empty", title: "Complex carbohydrate cross-feeding", copy: "Add foods to reveal the strongest modelled route through the ecosystem.", confidence: 2, nodes: [["Food matrix", "input"], ["Substrates", "colon"], ["Microbial guilds", "ecology"], ["Metabolites", "output"]] };
    return best;
  }

  return { GUILDS, BASELINES, SPECIES, FOODS, EFFECTS, aggregateDiet, aggregateExposure, simulate, simulateExposure, dominantPathway, normalizeGuilds, normalizeSpecies, speciesBaseline, speciesToGuilds, calculateMetabolites };
});
