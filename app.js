(function () {
  "use strict";

  const { FOODS, GUILDS, SPECIES, simulateExposure, speciesBaseline, dominantPathway } = window.MicrobiomeModel;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const EVIDENCE = [
    { year: 2021, type: "intervention", authors: "Wastyk et al. · Cell", title: "Gut-microbiota-targeted diets modulate human immune status", finding: "A 17-week randomized study found distinct, person-variable responses to fermented-food and high-fibre diets.", url: "https://doi.org/10.1016/j.cell.2021.06.019" },
    { year: 2019, type: "longitudinal", authors: "Johnson et al. · Cell Host & Microbe", title: "Daily sampling reveals personalized diet–microbiome associations", finding: "Dense food and stool sampling showed reproducible but highly individualized food–microbe relationships.", url: "https://doi.org/10.1016/j.chom.2019.05.005" },
    { year: 2021, type: "cohort", authors: "Asnicar et al. · Nature Medicine · ZOE PREDICT 1", title: "Microbiome connections with host metabolism and habitual diet", finding: "Shotgun metagenomics in 1,098 people linked microbial species with foods, dietary patterns and metabolic markers.", url: "https://doi.org/10.1038/s41591-020-01183-8" },
    { year: 2019, type: "intervention", authors: "Baxter et al. · mBio", title: "Microbiota and SCFA dynamics after three fermentable fibres", finding: "Responses to resistant starch and inulin-type fibre were substrate-specific and baseline-dependent.", url: "https://doi.org/10.1128/mBio.02566-18" },
    { year: 2014, type: "intervention", authors: "David et al. · Nature", title: "Diet rapidly and reproducibly alters the human gut microbiome", finding: "Short plant- and animal-based diets altered community structure and microbial gene expression within days.", url: "https://doi.org/10.1038/nature12820" },
    { year: 2015, type: "personalized", authors: "Zeevi et al. · Cell", title: "Personalized nutrition by prediction of glycemic responses", finding: "Post-meal responses varied substantially between people; microbiome features contributed to prediction.", url: "https://doi.org/10.1016/j.cell.2015.11.001" },
    { year: 2025, type: "cohort", authors: "Fackelmann et al. · Nature Microbiology", title: "Gut microbiome signatures of vegan, vegetarian and omnivore diets", finding: "Multi-cohort metagenomics linked dietary patterns and food quality to species-level signatures.", url: "https://doi.org/10.1038/s41564-024-01870-z" },
    { year: 2024, type: "cohort", authors: "Manghi et al. · Nature Microbiology", title: "Coffee consumption and Lawsonibacter asaccharolyticus", finding: "A large multi-cohort analysis found a replicated coffee association supported by culture experiments.", url: "https://doi.org/10.1038/s41564-024-01858-9" }
  ];

  const CATEGORY_LABELS = { all: "All", grains: "Grains", legumes: "Legumes", fruit: "Fruit", plants: "Plants", fermented: "Fermented", polyphenols: "Polyphenols", animal: "Animal", other: "Other" };
  const state = { selection: {}, baseline: "typical", mode: "meal", repeats: 5, exposure: 5, customDistribution: null, foodFilter: "all", evidenceFilter: "all", query: "", result: null };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("microbiome-exposure-v2"));
      if (!saved) return;
      state.selection = Object.fromEntries(Object.entries(saved.selection || {}).map(([key, value]) => [key, Math.min(6, Number(value) || 0)]).filter(([, value]) => value > 0));
      if (["typical", "plant", "lowFiber"].includes(saved.baseline)) state.baseline = saved.baseline;
      if (["meal", "day"].includes(saved.mode)) state.mode = saved.mode;
      state.repeats = Math.max(1, Math.min(10, Number(saved.repeats) || 5));
      state.exposure = state.repeats;
      if (saved.customDistribution) state.customDistribution = saved.customDistribution;
    } catch (_) { /* Local persistence is optional. */ }
  }

  function saveState() {
    try {
      localStorage.setItem("microbiome-exposure-v2", JSON.stringify({ selection: state.selection, baseline: state.baseline, mode: state.mode, repeats: state.repeats, customDistribution: state.customDistribution }));
    } catch (_) { /* The model still works without browser storage. */ }
  }

  function renderFilters() {
    const categories = ["all", "grains", "legumes", "fruit", "plants", "fermented", "polyphenols", "animal", "other"];
    $("#food-filters").innerHTML = categories.map(category => `<button type="button" class="filter-button ${state.foodFilter === category ? "active" : ""}" data-food-filter="${category}">${CATEGORY_LABELS[category] || "Plants"}</button>`).join("");
    $("#evidence-filters").innerHTML = ["all", "intervention", "longitudinal", "cohort", "personalized"].map(type => `<button type="button" class="filter-button ${state.evidenceFilter === type ? "active" : ""}" data-evidence-filter="${type}">${type}</button>`).join("");
  }

  function renderFoodLibrary() {
    const query = state.query.trim().toLowerCase();
    const matches = FOODS.filter(food => {
      const categoryMatch = state.foodFilter === "all" || food.group === state.foodFilter || (state.foodFilter === "plants" && ["vegetables", "starches", "nuts", "fats"].includes(food.group));
      return categoryMatch && (!query || `${food.name} ${food.tags}`.toLowerCase().includes(query));
    });
    $("#food-library").innerHTML = matches.length ? matches.map(food => {
      const selected = state.selection[food.id] > 0;
      return `<button type="button" class="food-card ${selected ? "selected" : ""}" data-food="${food.id}" aria-label="Add one portion of ${food.name}">
        <span class="food-add">${selected ? `${state.selection[food.id]}×` : "+"}</span><span class="food-icon" aria-hidden="true">${food.icon}</span><strong>${food.name}</strong><small>${food.tags}</small>
      </button>`;
    }).join("") : `<div class="empty-diet">No food matches. Try fibre, fermented or polyphenols.</div>`;
  }

  function renderSelectedDiet() {
    const foods = state.result.diet.foods;
    const unit = state.mode === "meal" ? "meal" : "day";
    $("#plant-count").textContent = state.result.diet.plantCount;
    $("#diet-summary").textContent = foods.length ? `${foods.length} foods · ${state.result.diet.totalPortions} portions in one ${unit} · repeated ${state.repeats}×` : `No foods added to this ${unit}`;
    $("#selected-list").innerHTML = foods.length ? foods.map(food => `<div class="selected-chip">
      <span>${food.icon} ${food.name}</span><button type="button" data-decrease="${food.id}" aria-label="Remove one portion of ${food.name}">−</button><strong>${food.portions}×</strong><button type="button" data-increase="${food.id}" aria-label="Add one portion of ${food.name}">+</button>
    </div>`).join("") : `<div class="empty-diet">Select foods above to compose one ${unit}.</div>`;
  }

  function renderDistributionEditor() {
    const distribution = state.customDistribution || speciesBaseline(state.baseline);
    $("#distribution-editor").innerHTML = Object.entries(SPECIES).map(([key, species]) => `<label class="species-input">
      <span><i style="background:${species.color}"></i><em>${species.short}</em></span>
      <span><input type="number" min="0" max="100" step="0.1" value="${(100 * distribution[key]).toFixed(1)}" data-species-input="${key}" aria-label="Starting relative parts for ${species.name}"><small>%</small></span>
    </label>`).join("");
  }

  function renderEvidence() {
    const papers = EVIDENCE.filter(paper => state.evidenceFilter === "all" || paper.type === state.evidenceFilter);
    $("#evidence-list").innerHTML = papers.map(paper => `<a class="paper-row" href="${paper.url}" target="_blank" rel="noreferrer">
      <span class="paper-year">${paper.year}</span><span class="paper-title"><strong>${paper.title}</strong><small>${paper.authors}</small></span><span class="paper-finding">${paper.finding}</span><span class="paper-kind">${paper.type}</span><span class="paper-link">↗</span>
    </a>`).join("");
  }

  function topResponders() {
    const start = state.result.trajectory[0].species;
    const end = state.result.trajectory[state.result.repeats].species;
    return Object.keys(SPECIES).sort((a, b) => Math.abs(end[b] - start[b]) - Math.abs(end[a] - start[a]));
  }

  function linePath(points, key, maxY, width, height, pad) {
    return points.map((point, index) => {
      const x = pad.l + (point.exposure / state.result.repeats) * (width - pad.l - pad.r);
      const y = pad.t + (1 - point.species[key] / maxY) * (height - pad.t - pad.b);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }

  function renderTrajectoryChart() {
    const svg = $("#trajectory-chart");
    const width = 720, height = 280, pad = { l: 42, r: 14, t: 18, b: 28 };
    const keys = topResponders().slice(0, 5);
    const maxY = Math.max(.05, Math.ceil(Math.max(...state.result.trajectory.flatMap(point => keys.map(key => point.species[key]))) * 20) / 20);
    const yTicks = [0, maxY / 2, maxY];
    const xTicks = [...Array(state.result.repeats + 1).keys()];
    const markerX = pad.l + (state.exposure / state.result.repeats) * (width - pad.l - pad.r);
    const grid = yTicks.map(tick => {
      const y = pad.t + (1 - tick / maxY) * (height - pad.t - pad.b);
      return `<line x1="${pad.l}" y1="${y}" x2="${width - pad.r}" y2="${y}" stroke="rgba(244,239,229,.10)"/><text x="2" y="${y + 3}">${(tick * 100).toFixed(tick ? 1 : 0)}%</text>`;
    }).join("") + xTicks.map(tick => {
      const x = pad.l + (tick / state.result.repeats) * (width - pad.l - pad.r);
      return `<text x="${x}" y="${height - 5}" text-anchor="middle">${tick}</text>`;
    }).join("");
    const paths = keys.map(key => `<path d="${linePath(state.result.trajectory, key, maxY, width, height, pad)}" fill="none" stroke="${SPECIES[key].color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><title>${SPECIES[key].name}</title></path>`).join("");
    svg.innerHTML = `<title>Top five modelled species trajectories across repeated exposures</title>${grid}<line x1="${markerX}" y1="${pad.t}" x2="${markerX}" y2="${height - pad.b}" stroke="rgba(244,239,229,.5)" stroke-dasharray="3 5"/>${paths}`;
    $("#chart-legend").innerHTML = keys.map(key => `<span><i style="background:${SPECIES[key].color}"></i><em>${SPECIES[key].short}</em></span>`).join("");
  }

  function renderSpeciesChart(point) {
    const svg = $("#species-chart");
    const start = state.result.trajectory[0].species;
    const order = Object.keys(SPECIES).sort((a, b) => start[b] - start[a]);
    const width = 720, height = 620, pad = { l: 178, r: 74, t: 25, b: 34 };
    const maxValue = Math.max(.05, Math.ceil(Math.max(...Object.values(start), ...Object.values(point.species)) * 20) / 20);
    const plotWidth = width - pad.l - pad.r;
    const rowHeight = (height - pad.t - pad.b) / order.length;
    const x = value => pad.l + (value / maxValue) * plotWidth;
    const ticks = [0, maxValue / 2, maxValue];
    const grid = ticks.map(tick => `<line x1="${x(tick)}" y1="${pad.t - 8}" x2="${x(tick)}" y2="${height - pad.b}" stroke="rgba(244,239,229,.09)"/><text x="${x(tick)}" y="${height - 8}" text-anchor="middle">${(tick * 100).toFixed(tick ? 1 : 0)}%</text>`).join("");
    const rows = order.map((key, index) => {
      const y = pad.t + rowHeight * (index + .5);
      const before = start[key], after = point.species[key], delta = 100 * (after - before);
      const deltaText = Math.abs(delta) < .005 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} pp`;
      return `<g><title>${SPECIES[key].name}: ${(100 * before).toFixed(2)}% to ${(100 * after).toFixed(2)}%, ${deltaText}</title>
        <text class="species-label" x="${pad.l - 10}" y="${y + 3}" text-anchor="end">${SPECIES[key].short}</text>
        <line x1="${x(before)}" y1="${y}" x2="${x(after)}" y2="${y}" stroke="${SPECIES[key].color}" stroke-width="2"/>
        <circle cx="${x(before)}" cy="${y}" r="4" fill="var(--deep)" stroke="rgba(244,239,229,.72)" stroke-width="1.5"/>
        <circle cx="${x(after)}" cy="${y}" r="5" fill="${SPECIES[key].color}"/>
        <text class="species-delta ${delta > .005 ? "up" : delta < -.005 ? "down" : ""}" x="${width - 4}" y="${y + 3}" text-anchor="end">${deltaText}</text>
      </g>`;
    }).join("");
    svg.innerHTML = `<title>Starting and modelled relative abundance for 20 species</title>${grid}${rows}`;
  }

  function renderInsights(point) {
    const start = state.result.trajectory[0].species;
    const changes = Object.keys(SPECIES).map(key => ({ key, delta: 100 * (point.species[key] - start[key]), pressure: state.result.pressure[key] })).sort((a, b) => b.delta - a.delta);
    const gain = changes[0], loss = changes[changes.length - 1];
    const pressure = [...changes].sort((a, b) => Math.abs(b.pressure) - Math.abs(a.pressure))[0];
    const card = (label, item, value, note) => `<article><small>${label}</small><strong><em>${SPECIES[item.key].short}</em></strong><span>${value}</span><p>${note}</p></article>`;
    if (!state.result.diet.totalPortions || state.exposure === 0) {
      $("#species-insights").innerHTML = `<article class="insight-empty"><small>Insight layer</small><strong>Add foods or move beyond exposure 0</strong><p>The strongest modeled responders and their direction will appear here.</p></article>`;
      return;
    }
    $("#species-insights").innerHTML = [
      card("Largest relative-share gain", gain, `${gain.delta >= 0 ? "+" : ""}${gain.delta.toFixed(2)} pp`, SPECIES[gain.key].note),
      card("Largest relative-share loss", loss, `${loss.delta >= 0 ? "+" : ""}${loss.delta.toFixed(2)} pp`, "A relative decline can also reflect other species expanding."),
      card("Strongest direct food pressure", pressure, `${pressure.pressure >= 0 ? "+" : ""}${pressure.pressure.toFixed(2)} log-pressure`, "Before competition and normalization across the community.")
    ].join("");
  }

  function capacityCopy(delta) {
    if (delta > 4) return "This exposure mix widens carbohydrate-fermenting capacity in the scenario.";
    if (delta < -4) return "Protein, bile or low-fermentable-substrate pressure narrows the modeled capacity.";
    return "A small modeled nudge; repeated exposure and starting ecology shape the direction.";
  }

  function renderPathway() {
    const pathway = dominantPathway(state.result.diet);
    $("#pathway-title").textContent = pathway.title;
    $("#pathway-copy").textContent = pathway.copy;
    $("#confidence-label").textContent = ["Very low", "Low", "Moderate", "High", "High"][pathway.confidence];
    $$("#confidence-dots i").forEach((dot, index) => dot.classList.toggle("filled", index < pathway.confidence));
    $("#pathway-visual").innerHTML = pathway.nodes.map(([title, subtitle]) => `<div class="path-node"><span>${title}<small>${subtitle}</small></span></div>`).join("");
  }

  function renderSimulation() {
    state.result = simulateExposure(state.selection, state.baseline, state.mode, state.repeats, state.customDistribution);
    state.exposure = Math.max(0, Math.min(state.repeats, state.exposure));
    const point = state.result.trajectory[state.exposure];
    const baselinePoint = state.result.trajectory[0];
    const delta = point.capacity - baselinePoint.capacity;
    $("#exposure-label").textContent = state.exposure;
    $("#exposure-total").textContent = state.repeats;
    $("#repeat-count").textContent = state.repeats;
    $("#repeat-slider").value = state.repeats;
    $("#exposure-slider").max = state.repeats;
    $("#exposure-slider").value = state.exposure;
    $("#capacity-score").textContent = point.capacity;
    $("#hero-diversity").textContent = point.capacity;
    $("#capacity-ring").style.setProperty("--score", point.capacity);
    $("#capacity-copy").textContent = capacityCopy(delta);
    const deltaElement = $("#capacity-delta");
    deltaElement.textContent = delta === 0 ? "baseline" : `${delta > 0 ? "+" : ""}${delta} vs start`;
    deltaElement.className = `delta-pill ${delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral"}`;
    $("#butyrate-potential").textContent = point.metabolites.butyratePotential;
    $("#butyrate-meter").style.width = `${point.metabolites.butyratePotential}%`;
    $("#acetate-share").textContent = `${point.metabolites.acetateShare}%`;
    $("#propionate-share").textContent = `${point.metabolites.propionateShare}%`;
    $("#proteolytic-pressure").textContent = point.metabolites.proteolyticPressure;
    renderTrajectoryChart();
    renderSpeciesChart(point);
    renderInsights(point);
    renderSelectedDiet();
    renderPathway();
    updateParticleTargets(point.guilds);
    saveState();
  }

  function addFood(id, amount = 1) {
    state.selection[id] = Math.max(0, Math.min(6, (state.selection[id] || 0) + amount));
    if (!state.selection[id]) delete state.selection[id];
    renderFoodLibrary();
    renderSimulation();
  }

  const particles = [];
  let animationFrame;

  function initCanvas() {
    const canvas = $("#ecosystem-canvas");
    for (let index = 0; index < 82; index += 1) {
      const angle = index * 2.39996;
      particles.push({ angle, radius: 70 + (index % 23) * 8.5, speed: .00008 + (index % 7) * .000012, size: 3.5 + (index % 5) * 2.2, phase: index * .83, guild: "generalists" });
    }
    function draw(time) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
      if (canvas.width !== targetWidth) { canvas.width = targetWidth; canvas.height = Math.floor(rect.height * dpr); }
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = canvas.width / 680, center = canvas.width / 2;
      const gradient = ctx.createRadialGradient(center, center, 15 * scale, center, center, 285 * scale);
      gradient.addColorStop(0, "rgba(131,213,192,.18)"); gradient.addColorStop(.55, "rgba(157,147,232,.06)"); gradient.addColorStop(1, "rgba(244,239,229,0)");
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(center, center, 290 * scale, 0, Math.PI * 2); ctx.fill();
      particles.forEach((particle, index) => {
        const wobble = Math.sin(time * .00035 + particle.phase) * 12;
        const angle = particle.angle + time * particle.speed * (index % 2 ? 1 : -1);
        const radius = (particle.radius + wobble) * scale;
        const x = center + Math.cos(angle) * radius * 1.07, y = center + Math.sin(angle) * radius * .92;
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle + time * .00008); ctx.globalAlpha = .55 + .3 * Math.sin(time * .0007 + particle.phase); ctx.fillStyle = GUILDS[particle.guild].color;
        if (index % 4 === 0) { ctx.beginPath(); ctx.roundRect(-particle.size * scale, -particle.size * .38 * scale, particle.size * 2 * scale, particle.size * .76 * scale, 8 * scale); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(0, 0, particle.size * .55 * scale, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      animationFrame = requestAnimationFrame(draw);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) draw(0); else animationFrame = requestAnimationFrame(draw);
  }

  function updateParticleTargets(guilds) {
    const cumulative = [];
    let total = 0;
    Object.keys(GUILDS).forEach(key => { total += guilds[key]; cumulative.push([key, total]); });
    particles.forEach((particle, index) => { particle.guild = (cumulative.find(([, threshold]) => (index + .5) / particles.length <= threshold) || ["generalists"])[0]; });
  }

  function syncChoiceButtons() {
    $$("[data-baseline]").forEach(item => { const active = item.dataset.baseline === state.baseline; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); });
    $$("[data-mode]").forEach(item => { const active = item.dataset.mode === state.mode; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); });
  }

  function bindEvents() {
    $("#food-filters").addEventListener("click", event => { const button = event.target.closest("[data-food-filter]"); if (!button) return; state.foodFilter = button.dataset.foodFilter; renderFilters(); renderFoodLibrary(); });
    $("#food-library").addEventListener("click", event => { const card = event.target.closest("[data-food]"); if (card) addFood(card.dataset.food, 1); });
    $("#selected-list").addEventListener("click", event => { const increase = event.target.closest("[data-increase]"), decrease = event.target.closest("[data-decrease]"); if (increase) addFood(increase.dataset.increase, 1); if (decrease) addFood(decrease.dataset.decrease, -1); });
    $("#food-search").addEventListener("input", event => { state.query = event.target.value; renderFoodLibrary(); });
    $("#baseline-options").addEventListener("click", event => { const button = event.target.closest("[data-baseline]"); if (!button) return; state.baseline = button.dataset.baseline; state.customDistribution = null; renderDistributionEditor(); syncChoiceButtons(); renderSimulation(); });
    $("#mode-options").addEventListener("click", event => { const button = event.target.closest("[data-mode]"); if (!button) return; state.mode = button.dataset.mode; syncChoiceButtons(); renderSimulation(); });
    $("#repeat-slider").addEventListener("input", event => { state.repeats = Number(event.target.value); state.exposure = state.repeats; renderSimulation(); });
    $("#exposure-slider").addEventListener("input", event => { state.exposure = Number(event.target.value); renderSimulation(); });
    $("#distribution-editor").addEventListener("input", () => { state.customDistribution = Object.fromEntries($$("[data-species-input]").map(input => [input.dataset.speciesInput, Math.max(0, Number(input.value) || 0)])); renderSimulation(); });
    $("#distribution-reset").addEventListener("click", () => { state.customDistribution = null; renderDistributionEditor(); renderSimulation(); });
    $("#clear-foods").addEventListener("click", () => { state.selection = {}; renderFoodLibrary(); renderSimulation(); });
    $("#reset-button").addEventListener("click", () => { Object.assign(state, { selection: {}, baseline: "typical", mode: "meal", repeats: 5, exposure: 5, customDistribution: null }); renderDistributionEditor(); syncChoiceButtons(); renderFoodLibrary(); renderSimulation(); });
    $("#load-demo").addEventListener("click", () => { Object.assign(state, { selection: { oats: 1, lentils: 1, berries: 1, "onion-garlic": 1 }, baseline: "typical", mode: "meal", repeats: 5, exposure: 5, customDistribution: null }); renderDistributionEditor(); syncChoiceButtons(); renderFoodLibrary(); renderSimulation(); $("#model").scrollIntoView({ behavior: "smooth" }); });
    $("#evidence-filters").addEventListener("click", event => { const button = event.target.closest("[data-evidence-filter]"); if (!button) return; state.evidenceFilter = button.dataset.evidenceFilter; renderFilters(); renderEvidence(); });
    const dialog = $("#about-dialog");
    $("#about-button").addEventListener("click", () => dialog.showModal()); $("#dialog-close").addEventListener("click", () => dialog.close()); dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    window.addEventListener("beforeunload", () => { if (animationFrame) cancelAnimationFrame(animationFrame); });
  }

  loadState();
  renderFilters(); renderFoodLibrary(); renderEvidence(); renderDistributionEditor(); syncChoiceButtons(); initCanvas(); renderSimulation(); bindEvents();
})();
