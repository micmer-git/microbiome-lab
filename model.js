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

  return { GUILDS, BASELINES, FOODS, EFFECTS, aggregateDiet, simulate, dominantPathway, normalizeGuilds, calculateMetabolites };
});
