(function () {
  "use strict";

  const { FOODS, GUILDS, SPECIES, simulateExposure, dominantPathway, calculateMealScores } = window.MicrobiomeModel;
  const { MEALS, FREQUENCY_GROUPS, DEFAULT_FREQUENCIES, QUICK_STORIES, STORY_UI, SPECIES_INFO, SPECIES_BASES, UI, FOOD_IT } = window.MicrobiomeContent;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const EVIDENCE = [
    { year: 2021, type: "intervention", authors: "Wastyk et al. · Cell", title: "Gut-microbiota-targeted diets modulate human immune status", finding: "A 17-week randomized study found distinct, person-variable responses to fermented-food and high-fibre diets.", it: "Uno studio randomizzato di 17 settimane ha osservato risposte diverse e variabili tra persone alle diete con fermentati o molte fibre.", url: "https://doi.org/10.1016/j.cell.2021.06.019" },
    { year: 2019, type: "longitudinal", authors: "Johnson et al. · Cell Host & Microbe", title: "Daily sampling reveals personalized diet–microbiome associations", finding: "Dense food and stool sampling showed reproducible but highly individualized food–microbe relationships.", it: "Campionamenti frequenti di cibo e feci hanno mostrato relazioni cibo–microbi altamente individuali ma riproducibili.", url: "https://doi.org/10.1016/j.chom.2019.05.005" },
    { year: 2021, type: "cohort", authors: "Asnicar et al. · Nature Medicine · ZOE PREDICT 1", title: "Microbiome connections with host metabolism and habitual diet", finding: "Shotgun metagenomics in 1,098 people linked microbial species with foods, dietary patterns and metabolic markers.", it: "La metagenomica shotgun in 1.098 persone ha collegato specie microbiche, alimenti, pattern alimentari e marcatori metabolici.", url: "https://doi.org/10.1038/s41591-020-01183-8" },
    { year: 2019, type: "intervention", authors: "Baxter et al. · mBio", title: "Microbiota and SCFA dynamics after three fermentable fibres", finding: "Responses to resistant starch and inulin-type fibre were substrate-specific and baseline-dependent.", it: "Le risposte ad amido resistente e fibre tipo inulina dipendevano dal substrato e dal microbioma iniziale.", url: "https://doi.org/10.1128/mBio.02566-18" },
    { year: 2014, type: "intervention", authors: "David et al. · Nature", title: "Diet rapidly and reproducibly alters the human gut microbiome", finding: "Short plant- and animal-based diets altered community structure and microbial gene expression within days.", it: "Brevi diete vegetali o animali hanno modificato in pochi giorni struttura comunitaria ed espressione genica microbica.", url: "https://doi.org/10.1038/nature12820" },
    { year: 2015, type: "personalized", authors: "Zeevi et al. · Cell", title: "Personalized nutrition by prediction of glycemic responses", finding: "Post-meal responses varied substantially between people; microbiome features contributed to prediction.", it: "Le risposte post-prandiali variavano molto tra persone; caratteristiche del microbioma contribuivano alla previsione.", url: "https://doi.org/10.1016/j.cell.2015.11.001" },
    { year: 2025, type: "cohort", authors: "Fackelmann et al. · Nature Microbiology", title: "Gut microbiome signatures of vegan, vegetarian and omnivore diets", finding: "Multi-cohort metagenomics linked dietary patterns and food quality to species-level signatures.", it: "Una metagenomica multi-coorte ha collegato pattern e qualità alimentare a firme a livello di specie.", url: "https://doi.org/10.1038/s41564-024-01870-z" },
    { year: 2024, type: "cohort", authors: "Manghi et al. · Nature Microbiology", title: "Coffee consumption and Lawsonibacter asaccharolyticus", finding: "A large multi-cohort analysis found a replicated coffee association supported by culture experiments.", it: "Un'ampia analisi multi-coorte ha trovato un'associazione replicata con il caffè, supportata da esperimenti in coltura.", url: "https://doi.org/10.1038/s41564-024-01858-9" }
  ];

  const CATEGORY_LABELS = { all: "All", grains: "Grains", legumes: "Legumes", fruit: "Fruit", plants: "Plants", fermented: "Fermented", polyphenols: "Polyphenols", animal: "Animal", other: "Other" };
  const preferredLanguage = navigator.language && navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
  const state = { selection: {}, mode: "meal", repeats: 5, exposure: 5, foodFilter: "all", evidenceFilter: "all", mealFilter: "all", language: preferredLanguage, query: "", result: null, selectedSpecies: null, storyKind: "food", storyExposure: "coffee", frequencyPage: 0, foodFrequency: { ...DEFAULT_FREQUENCIES } };
  const t = key => UI[state.language][key] || UI.en[key] || key;
  const foodName = food => state.language === "it" ? (FOOD_IT[food.id] || food.name) : food.name;
  const FOOD_EMOJI = {
    oats: "🥣", lentils: "🫘", chickpeas: "🫘", beans: "🫘", "cooled-potato": "🥔", "green-banana": "🍌", apple: "🍎", berries: "🫐", "onion-garlic": "🧅", artichoke: "🌿", broccoli: "🥦", wholegrain: "🍞", almonds: "🥜", cocoa: "🍫", coffee: "☕", kombucha: "🫗", alcohol: "🍷", "olive-oil": "🫒", kefir: "🥛", yogurt: "🥣", kimchi: "🥬", "red-meat": "🥩", "processed-meat": "🥓", cheese: "🧀", "upf-snack": "🍪", eggs: "🥚", chicken: "🍗", salmon: "🐟", "white-bread": "🍞", pasta: "🍝", "brown-rice": "🍚", "white-rice": "🍚", "leafy-greens": "🥬", tomato: "🍅", avocado: "🥑", carrots: "🥕", peas: "🫛", pear: "🍐", "ripe-banana": "🍌", walnuts: "🥜", milk: "🥛", butter: "🧈", "sugary-drink": "🥤", fries: "🍟", pizza: "🍕", burger: "🍔", "sweet-cereal": "🥣", pancakes: "🥞"
  };
  const foodEmoji = food => FOOD_EMOJI[food && food.id] || "🍽";

  function modeledVariety(distribution, threshold = .02) {
    return Object.values(distribution).filter(value => value >= threshold).length;
  }

  function ecologyProfile(distribution) {
    const guilds = Object.fromEntries(Object.keys(GUILDS).map(key => [key, 0]));
    Object.entries(distribution).forEach(([key, value]) => { guilds[SPECIES[key].guild] += value; });
    if (guilds.bile + guilds.proteolytic >= .18) return state.language === "it"
      ? { label: "Profilo tollerante a bile e proteine", copy: "Una quota maggiore del modello occupa nicchie associate a bile e substrati proteici; non significa microbioma cattivo." }
      : { label: "Bile- and protein-tolerant profile", copy: "More of the model occupies bile- and protein-linked niches; this is not a bad-microbiome label." };
    if (guilds.butyrate + guilds.bifido >= .43) return state.language === "it"
      ? { label: "Profilo di cross-feeding fermentativo", copy: "Il modello è orientato a reti che condividono substrati e sostengono la produzione di SCFA." }
      : { label: "Fermentative cross-feeding profile", copy: "The model leans toward networks that share substrates and support SCFA production." };
    if (guilds.saccharolytic >= .27) return state.language === "it"
      ? { label: "Profilo degradatore di carboidrati complessi", copy: "Nel modello hanno più peso le specie che aprono amidi, pectine e altri glicani alla comunità." }
      : { label: "Complex-carbohydrate degrader profile", copy: "Species that open starches, pectins and other glycans to the community carry more weight in the model." };
    return state.language === "it"
      ? { label: "Profilo ecologico misto", copy: "Nessun gruppo funzionale domina nettamente questa distribuzione modellata." }
      : { label: "Mixed ecological profile", copy: "No functional guild clearly dominates this modeled distribution." };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("microbiome-exposure-v2"));
      if (!saved) return;
      state.selection = Object.fromEntries(Object.entries(saved.selection || {}).map(([key, value]) => [key, Math.min(6, Number(value) || 0)]).filter(([, value]) => value > 0));
      if (["meal", "day"].includes(saved.mode)) state.mode = saved.mode;
      if (["en", "it"].includes(saved.language)) state.language = saved.language;
      if (["food", "meal"].includes(saved.storyKind)) state.storyKind = saved.storyKind;
      if (QUICK_STORIES.some(story => story.id === saved.storyExposure)) state.storyExposure = saved.storyExposure;
      state.frequencyPage = Math.max(0, Math.min(FREQUENCY_GROUPS.length - 1, Number(saved.frequencyPage) || 0));
      if (saved.foodFrequency) state.foodFrequency = Object.fromEntries(Object.keys(DEFAULT_FREQUENCIES).map(id => [id, Math.max(0, Math.min(5, Number(saved.foodFrequency[id]) || 0))]));
      state.repeats = Math.max(1, Math.min(10, Number(saved.repeats) || 5));
      state.exposure = state.repeats;
    } catch (_) { /* Local persistence is optional. */ }
  }

  function saveState() {
    try {
      localStorage.setItem("microbiome-exposure-v2", JSON.stringify({ selection: state.selection, mode: state.mode, repeats: state.repeats, language: state.language, storyKind: state.storyKind, storyExposure: state.storyExposure, frequencyPage: state.frequencyPage, foodFrequency: state.foodFrequency }));
    } catch (_) { /* The model still works without browser storage. */ }
  }

  const STATIC_COPY = [
    ["#about-button", "What this is", "Cos'è"],
    [".site-header nav a:nth-child(1)", "Start", "Inizia"],
    [".site-header nav a:nth-child(2)", "Model", "Modello"],
    [".site-header nav a:nth-child(3)", "Biology", "Biologia"],
    [".site-header nav a:nth-child(4)", "Evidence", "Evidenze"],
    [".hero-copy .eyebrow", "A living systems experiment · v0.7", "Un esperimento sui sistemi viventi · v0.7"],
    [".hero-copy h1", "Your gut is an <em>ecosystem</em>, not a score.", "Il tuo intestino è un <em>ecosistema</em>, non un voto.", true],
    [".hero-lede", "Build one meal or one day. See the directional nudge across 20 gut species, then repeat the same exposure to explore how baseline-dependent ecological pressure may accumulate.", "Costruisci un pasto o una giornata. Osserva la spinta direzionale su 20 specie intestinali e ripeti l'esposizione per esplorare come la pressione ecologica dipenda dal punto di partenza."],
    [".hero-actions .primary-button", "Describe your usual week <span>↓</span>", "Descrivi la tua settimana abituale <span>↓</span>", true],
    ["#load-demo", "Load the fibre-rich meal", "Carica il pasto ricco di fibre"],
    [".trust-line span:nth-of-type(1)", "Human studies", "Studi sull'uomo"],
    [".trust-line span:nth-of-type(2)", "Mechanism-aware", "Attento ai meccanismi"],
    [".trust-line span:nth-of-type(3)", "Uncertainty shown", "Incertezza visibile"],
    [".vessel-core small", "ecosystem<br>capacity", "capacità<br>dell'ecosistema", true],
    [".orbit-note-a", "cross-feeding", "cross-feeding"],
    [".orbit-note-b", "substrates", "substrati"],
    [".orbit-note-c", "metabolites", "metaboliti"],
    [".model-section > .section-shell > .section-heading .eyebrow", "01 · Exposure → ecology", "01 · Esposizione → ecologia"],
    [".model-section > .section-shell > .section-heading h2", "Build once.<br>Repeat it.", "Componi una volta.<br>Ripeti.", true],
    [".model-section > .section-shell > .section-heading > p", "Start from your weekly-food baseline, add one meal or more foods, then repeat the exposure up to ten times. This models directional pressure—not measured abundance.", "Parti dalla baseline dei tuoi alimenti settimanali, aggiungi un pasto o altri cibi e ripeti l'esposizione fino a dieci volte. Il modello mostra una pressione direzionale, non un'abbondanza misurata."],
    ["#advanced-lab-summary-title", "Open advanced exploration", "Apri l'esplorazione avanzata"],
    ["#advanced-lab-summary-copy", "Build any meal, compare repeated exposure and inspect the evidence.", "Componi qualsiasi pasto, confronta le esposizioni ripetute e consulta le evidenze."],
    [".control-panel > .panel-heading:first-child small", "Starting ecology", "Ecologia iniziale"],
    [".control-panel > .panel-heading:first-child h3", "Your onboarding baseline", "La baseline del tuo onboarding"],
    ["#onboarding-baseline-title", "Loaded from your weekly foods", "Caricata dai tuoi alimenti settimanali"],
    ["#onboarding-baseline-copy", "The 35 frequencies condition the same 20-species starting ecology used above.", "Le 35 frequenze condizionano la stessa ecologia iniziale a 20 specie mostrata sopra."],
    ["#edit-onboarding-link", "Edit weekly foods ↑", "Modifica gli alimenti settimanali ↑"],
    [".exposure-controls .panel-heading small", "Exposure unit", "Unità di esposizione"],
    [".exposure-controls .panel-heading h3", "Meal or full day?", "Pasto o giornata intera?"],
    ["[data-mode='meal'] strong", "One meal", "Un pasto"],
    ["[data-mode='meal'] small", "A smaller ecological pulse", "Un impulso ecologico più piccolo"],
    ["[data-mode='day'] strong", "One day", "Una giornata"],
    ["[data-mode='day'] small", "A full-day substrate mix", "La miscela di substrati di un giorno"],
    [".repeat-control > span", "Repeat this exposure", "Ripeti questa esposizione"],
    [".food-heading small", "Food input", "Alimenti"],
    [".food-heading h3", "Add portions", "Aggiungi porzioni"],
    [".simulation-toolbar .eyebrow", "Modelled state", "Stato modellato"],
    ["#community-kicker", "Interactive ecosystem", "Ecosistema interattivo"],
    [".score-block > div:last-child small", "Functional capacity heuristic", "Euristica di capacità funzionale"],
    [".chart-wrap .chart-header small", "Repeated exposure trajectory", "Traiettoria dell'esposizione ripetuta"],
    ["#chart-title", "Largest species responders", "Specie con risposta maggiore"],
    ["#species-chart-kicker", "All 20 species", "Tutte le 20 specie"],
    ["#species-chart-title", "Before → after, with the strongest food driver", "Prima → dopo, con l'alimento che contribuisce di più"],
    ["#species-start-key", "start", "inizio"],
    ["#species-end-key", "modelled", "modellato"],
    ["#species-driver-key", "top driver", "driver principale"],
    [".uncertainty-note p", "<strong>Pressure, not a stool-test forecast.</strong> A meal may alter substrates and activity before relative abundance moves. The species shifts are normalized scenario estimates; person-specific variation can exceed the displayed effect.", "<strong>Pressione, non previsione di un test fecale.</strong> Un pasto può cambiare substrati e attività prima dell'abbondanza relativa. Le variazioni sono stime normalizzate di scenario; la variabilità personale può superare l'effetto mostrato.", true],
    [".selected-heading .eyebrow", "Your selected exposure", "La tua esposizione"],
    ["#clear-foods", "Clear all", "Svuota tutto"],
    [".biology-section .section-heading .eyebrow", "02 · Under the hood", "02 · Dentro il modello"],
    [".biology-section .section-heading h2", "Follow the carbon.", "Segui il carbonio."],
    [".biology-section .section-heading > p", "The model is a transparent causal sketch: food features become colonic substrates, guilds compete and cooperate, then metabolites emerge.", "Il modello è uno schema causale trasparente: le caratteristiche del cibo diventano substrati nel colon, le comunità competono e cooperano, poi emergono i metaboliti."],
    [".metabolite-card:nth-child(1) > small", "Modelled potential", "Potenziale modellato"],
    [".metabolite-card:nth-child(1) h3", "Butyrate", "Butirrato"],
    [".metabolite-card:nth-child(1) p", "Fuel for colonocytes; linked to epithelial and immune signalling. Production depends on both substrate and the microbes already present.", "Carburante per i colonociti, collegato ai segnali epiteliali e immunitari. La produzione dipende sia dal substrato sia dai microbi già presenti."],
    [".metabolite-card:nth-child(2) > small", "SCFA pool share", "Quota del pool di SCFA"],
    [".metabolite-card:nth-child(2) h3", "Acetate", "Acetato"],
    [".metabolite-card:nth-child(2) p", "A common fermentation product and cross-feeding currency used by other microbes.", "Un comune prodotto della fermentazione e una risorsa di cross-feeding usata da altri microbi."],
    [".metabolite-card:nth-child(3) > small", "SCFA pool share", "Quota del pool di SCFA"],
    [".metabolite-card:nth-child(3) h3", "Propionate", "Propionato"],
    [".metabolite-card:nth-child(3) p", "Often produced from complex carbohydrate fermentation through several pathways.", "Spesso prodotto dalla fermentazione dei carboidrati complessi attraverso diverse vie."],
    [".metabolite-card:nth-child(4) > small", "Relative pressure", "Pressione relativa"],
    [".metabolite-card:nth-child(4) h3", "Proteolytic products", "Prodotti proteolitici"],
    [".metabolite-card:nth-child(4) p", "Amino-acid fermentation can yield branched-chain fatty acids, ammonia, phenols and indoles—chemically diverse, not uniformly harmful.", "La fermentazione degli amminoacidi può produrre acidi grassi ramificati, ammoniaca, fenoli e indoli: sostanze diverse, non tutte uniformemente nocive."],
    [".mechanism-copy .eyebrow", "Dominant pathway", "Via dominante"],
    [".confidence-row > span", "Evidence confidence", "Solidità dell'evidenza"],
    [".evidence-section .section-heading .eyebrow", "03 · Evidence ledger", "03 · Registro delle evidenze"],
    [".evidence-section .section-heading h2", "What is known.<br>What is inferred.", "Ciò che sappiamo.<br>Ciò che inferiamo.", true],
    [".evidence-section .section-heading > p", "Associations are not interventions. Stool abundance is not necessarily activity. The ledger makes those distinctions explicit.", "Le associazioni non sono interventi. L'abbondanza fecale non equivale necessariamente all'attività. Il registro rende esplicite queste differenze."],
    [".sample-section .section-heading .eyebrow", "04 · Measure the real system", "04 · Misura il sistema reale"],
    [".sample-section .section-heading h2", "One stool sample is a frame.<br><em>Not the film.</em>", "Un campione fecale è un fotogramma.<br><em>Non il film.</em>", true],
    [".sample-section .section-heading > p", "Method determines meaning. Repeated samples plus time-aligned food records are far more informative for diet response than a single commercial “wellness” snapshot.", "Il metodo determina il significato. Campioni ripetuti e diari alimentari sincronizzati sono molto più informativi di una singola istantanea commerciale di “benessere”."],
    [".sample-flow article:nth-child(1) small", "Community screen", "Profilo della comunità"],
    [".sample-flow article:nth-child(1) p", "Relative bacterial marker-gene profile. Useful for broad community structure; limited species, strain and functional resolution.", "Profilo relativo di un gene marcatore batterico. Utile per la struttura generale; limitato per specie, ceppi e funzioni."],
    [".sample-flow article:nth-child(1) strong", "Who may be there", "Chi potrebbe esserci"],
    [".sample-flow article:nth-child(2) small", "Genomic potential", "Potenziale genomico"],
    [".sample-flow article:nth-child(2) p", "Species, strains and microbial genes with improved resolution. Measures encoded capacity—not which pathways are active now.", "Specie, ceppi e geni microbici con risoluzione migliore. Misura la capacità codificata, non quali vie siano attive ora."],
    [".sample-flow article:nth-child(2) strong", "What they could do", "Cosa potrebbero fare"],
    [".sample-flow article:nth-child(3) small", "Functional output", "Output funzionale"],
    [".sample-flow article:nth-child(3) h3", "Faecal metabolomics", "Metabolomica fecale"],
    [".sample-flow article:nth-child(3) p", "SCFAs, bile acids, indoles and many unknowns. Integrates diet, microbial and host chemistry after transit and absorption.", "SCFA, acidi biliari, indoli e molte incognite. Integra la chimica di dieta, microbi e ospite dopo transito e assorbimento."],
    [".sample-flow article:nth-child(3) strong", "What remains in stool", "Cosa resta nelle feci"],
    [".sample-flow article:nth-child(4) small", "Within-person inference", "Inferenza nella persona"],
    [".sample-flow article:nth-child(4) h3", "Repeated time series", "Serie temporali ripetute"],
    [".sample-flow article:nth-child(4) p", "Food timestamps, symptoms and multiple samples expose lag, baseline dependence and normal day-to-day variation.", "Orari dei pasti, sintomi e campioni multipli mostrano ritardi, dipendenza dal profilo iniziale e normale variabilità quotidiana."],
    [".sample-flow article:nth-child(4) strong", "How the system changes", "Come cambia il sistema"],
    [".boundary-card > .eyebrow", "Scientific boundary", "Limite scientifico"],
    [".boundary-card h2", "Useful counterfactual.<br>Not a diagnostic.", "Controfattuale utile.<br>Non diagnostico.", true],
    [".boundary-grid > div:nth-child(1) strong", "It can", "Può"],
    [".boundary-grid > div:nth-child(1) p", "Compare dietary scenarios, expose plausible mechanisms, show lag and uncertainty, and link every rule to evidence.", "Confrontare scenari alimentari, mostrare meccanismi plausibili, ritardi e incertezza, collegando ogni regola alle evidenze."],
    [".boundary-grid > div:nth-child(2) strong", "It cannot", "Non può"],
    [".boundary-grid > div:nth-child(2) p", "Identify your taxa, diagnose dysbiosis, predict disease, or replace stool metagenomics, metabolomics and clinical interpretation.", "Identificare i tuoi taxa, diagnosticare disbiosi, prevedere malattie o sostituire metagenomica, metabolomica e interpretazione clinica."],
    [".boundary-grid > div:nth-child(3) strong", "To personalize", "Per personalizzare"],
    [".boundary-grid > div:nth-child(3) p", "Future versions can ingest repeated stool samples, food logs and covariates while separating measured values from model estimates.", "Versioni future potranno usare campioni ripetuti, diari alimentari e covariate, distinguendo misure reali e stime del modello."],
    [".site-footer > p", "Built as an open, inspectable model. Biology first; certainty earned.", "Un modello aperto e ispezionabile. Prima la biologia; la certezza va meritata."],
    [".site-footer > a", "View source ↗", "Vedi il codice ↗"],
    ["#about-dialog .eyebrow", "About the experiment", "Informazioni sull'esperimento"],
    ["#about-dialog h2", "A map, not the territory.", "Una mappa, non il territorio."],
    ["#about-dialog p:nth-of-type(2)", "This interactive model translates dietary features into directional pressures on functional microbial guilds. It is designed for learning and hypothesis-building, with conservative claims and inspectable assumptions.", "Questo modello interattivo traduce le caratteristiche alimentari in pressioni direzionali su gruppi microbici funzionali. Serve per apprendere e formulare ipotesi, con affermazioni prudenti e assunzioni ispezionabili."],
    ["#about-dialog p:nth-of-type(3)", "Percentages are normalized model states—not predictions from a validated clinical algorithm. A person’s microbiome is also shaped by baseline ecology, medication, transit time, age, geography, illness and many unobserved variables.", "Le percentuali sono stati normalizzati del modello, non previsioni di un algoritmo clinico validato. Il microbioma dipende anche da ecologia iniziale, farmaci, transito, età, geografia, malattie e molte variabili non osservate."],
    ["#about-dialog .primary-button", "Read the model specification <span>↗</span>", "Leggi la specifica del modello <span>↗</span>", true]
  ];

  function applyStaticCopy() {
    document.documentElement.lang = state.language;
    for (const [selector, en, it, html] of STATIC_COPY) {
      const node = $(selector);
      if (!node) continue;
      if (html) node.innerHTML = state.language === "it" ? it : en;
      else node.textContent = state.language === "it" ? it : en;
    }
    $("#language-button").textContent = t("language");
    $("#meal-library-button").innerHTML = `${t("mealsButton")} <span>↗</span>`;
    $("#food-search").placeholder = state.language === "it" ? "Cerca avena, lenticchie, kefir…" : "Search oats, lentils, kefir…";
    $("#variety-score-label").textContent = t("variety");
    $("#support-score-label").textContent = t("support");
    $("#score-caution").textContent = t("scoreCaution");
    $("#community-title").textContent = t("communityTitle");
    $("#community-intro").textContent = t("communityIntro");
    $("#meal-dialog-title").textContent = t("mealsTitle");
    $("#meal-dialog-intro").textContent = t("mealsIntro");
    const plantCount = $("#plant-count").textContent;
    $(".plant-counter").innerHTML = `<strong id="plant-count">${plantCount}</strong> ${t("plantSources")}`;
    $$(".dialog-close").forEach(button => button.setAttribute("aria-label", t("close")));
  }

  function storyScenario() {
    const story = QUICK_STORIES.find(item => item.id === state.storyExposure) || QUICK_STORIES[0];
    const weeklySelection = Object.fromEntries(Object.entries(state.foodFrequency).filter(([, frequency]) => frequency > 0).map(([id, frequency]) => [id, frequency / 7]));
    const baselineRun = simulateExposure(weeklySelection, "typical", "day", 10);
    const customDistribution = baselineRun.trajectory[10].species;
    const exposureRun = simulateExposure(story.selection, "typical", "meal", 10, customDistribution);
    return { story, weeklySelection, customDistribution, exposureRun };
  }

  function renderStoryChart(exposureRun) {
    const start = exposureRun.trajectory[0].species;
    const once = exposureRun.trajectory[1].species;
    const ten = exposureRun.trajectory[10].species;
    const keys = Object.keys(SPECIES);
    const mobile = window.innerWidth <= 760;
    const width = mobile ? 420 : 720, columns = mobile ? 2 : 5, rows = mobile ? 10 : 4;
    const height = mobile ? 930 : 440, cellWidth = width / columns, cellHeight = (height - 20) / rows;
    const maxValue = Math.max(...keys.flatMap(key => [start[key], once[key], ten[key]]));
    const radius = value => 7 + 21 * Math.sqrt(value / maxValue);
    const nodes = keys.map((key, index) => {
      const column = index % columns, row = Math.floor(index / columns);
      const x = cellWidth * (column + .5), y = 42 + cellHeight * row;
      const delta = 100 * (ten[key] - start[key]);
      const driver = driverCopy(exposureRun, key, delta, true);
      const driverItem = speciesDriver(exposureRun, key, delta);
      const driverIcon = driverItem ? foodEmoji(driverItem.food) : "🍽";
      return `<g class="story-species-node" data-species-node="${key}" data-guild="${SPECIES[key].guild}" data-start="${start[key]}" data-end="${ten[key]}" data-driver-icon="${driverIcon}" role="button" tabindex="0" aria-label="${SPECIES[key].name}, ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} percentage points after ten exposures; ${driver}">
        <title>${SPECIES[key].name}: ${(100 * start[key]).toFixed(2)}% → ${(100 * once[key]).toFixed(2)}% → ${(100 * ten[key]).toFixed(2)}%. ${driver}</title>
        <circle class="ten-ring ${delta >= 0 ? "up" : "down"}" cx="${x}" cy="${y}" r="${radius(ten[key]).toFixed(1)}"/>
        <circle class="once-ring" cx="${x}" cy="${y}" r="${radius(once[key]).toFixed(1)}"/>
        <circle class="start-dot" cx="${x}" cy="${y}" r="${radius(start[key]).toFixed(1)}" fill="${SPECIES[key].color}"/>
        <text class="species-name" x="${x}" y="${y + 39}" text-anchor="middle">${SPECIES[key].short}</text>
        <text class="delta-label ${delta >= 0 ? "up" : "down"}" x="${x}" y="${y + 55}" text-anchor="middle">${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pp</text>
      </g>`;
    }).join("");
    $("#story-chart").setAttribute("viewBox", `0 0 ${width} ${height}`);
    $("#story-chart").innerHTML = `<title>${STORY_UI[state.language].compare}</title><desc>${STORY_UI[state.language].disclaimer}</desc>${nodes}`;
  }

  function renderStory() {
    const copy = STORY_UI[state.language];
    const { story, exposureRun } = storyScenario();
    const group = FREQUENCY_GROUPS[state.frequencyPage];
    const copyMap = { "story-kicker": copy.kicker, "story-title": copy.title, "story-intro": copy.intro, "story-step-1": copy.step1, "frequency-prompt": copy.frequencyPrompt, "story-baseline-note": copy.baselineNote, "story-step-2": copy.step2, "story-foods-tab": copy.foods, "story-meals-tab": copy.meals, "story-step-3": copy.step3, "story-result-title": copy.compare, "story-start-label": copy.start, "story-once-label": copy.once, "story-ten-label": copy.ten, "story-map-help": copy.mapHelp, "story-disclaimer": copy.disclaimer, "story-full-button": copy.fullLab };
    Object.entries(copyMap).forEach(([id, value]) => { $("#" + id).textContent = value; });
    $("#frequency-screen-label").textContent = `${copy.screen} ${state.frequencyPage + 1} / ${FREQUENCY_GROUPS.length}`;
    $("#frequency-group-title").textContent = group[state.language];
    $("#frequency-rated").textContent = `${Object.keys(state.foodFrequency).length} ${copy.rated}`;
    $("#frequency-progress-bar").style.width = `${100 * (state.frequencyPage + 1) / FREQUENCY_GROUPS.length}%`;
    $("#frequency-foods").innerHTML = group.foods.map(id => {
      const food = FOODS.find(item => item.id === id), frequency = state.foodFrequency[id] || 0;
      return `<div class="frequency-food"><div class="frequency-food-name"><span aria-hidden="true">${food.icon}</span><strong>${foodName(food)}</strong></div><div class="frequency-scale" role="group" aria-label="${foodName(food)} · ${copy.frequencyPrompt}">${[0,1,2,3,4,5].map(value => `<button type="button" data-frequency-food="${id}" data-frequency-value="${value}" class="${frequency === value ? "active" : ""}" aria-pressed="${frequency === value}">${value}</button>`).join("")}</div></div>`;
    }).join("");
    $("#frequency-prev").textContent = copy.previous;
    $("#frequency-next").textContent = state.frequencyPage === FREQUENCY_GROUPS.length - 1 ? copy.finish : copy.next;
    $("#frequency-prev").disabled = state.frequencyPage === 0;
    $("#frequency-next").disabled = state.frequencyPage === FREQUENCY_GROUPS.length - 1;
    $$("[data-story-kind]").forEach(button => button.classList.toggle("active", button.dataset.storyKind === state.storyKind));
    const visibleStories = QUICK_STORIES.filter(item => item.kind === state.storyKind);
    $("#story-options").innerHTML = visibleStories.map(item => `<button type="button" class="story-option ${item.id === story.id ? "selected" : ""}" data-story-exposure="${item.id}" aria-pressed="${item.id === story.id}"><span>${item.icon}</span><strong>${item[state.language]}</strong><small>${item.note[state.language]}</small></button>`).join("");
    requestAnimationFrame(() => { if (window.innerWidth <= 760) $("#story-options").scrollLeft = Math.max(0, visibleStories.findIndex(item => item.id === story.id)) * $("#story-options").clientWidth * .84; });
    $("#story-evidence").innerHTML = `${story.note[state.language]}${story.source ? ` <a href="${story.source}" target="_blank" rel="noreferrer">${copy.source} ↗</a>` : ""}`;
    renderStoryChart(exposureRun);
    const baseline = exposureRun.trajectory[0].species;
    const profile = ecologyProfile(baseline);
    const topSpecies = Object.keys(SPECIES).sort((a, b) => baseline[b] - baseline[a]).slice(0, 3);
    $("#onboarding-baseline-summary").innerHTML = `<span><small>${state.language === "it" ? "Profilo" : "Profile"}</small><strong>${profile.label}</strong></span><span><small>${state.language === "it" ? "Varietà modellata" : "Modelled variety"}</small><strong>${modeledVariety(baseline)}/20 ≥2%</strong></span><span><small>${state.language === "it" ? "Specie più rappresentate" : "Largest shares"}</small><strong>${topSpecies.map(key => SPECIES[key].short).join(" · ")}</strong></span>`;
    saveState();
  }

  function renderFilters() {
    const categories = ["all", "grains", "legumes", "fruit", "plants", "fermented", "polyphenols", "animal", "other"];
    const categoryIt = { all: "Tutti", grains: "Cereali", legumes: "Legumi", fruit: "Frutta", plants: "Vegetali", fermented: "Fermentati", polyphenols: "Polifenoli", animal: "Animali", other: "Altro" };
    $("#food-filters").innerHTML = categories.map(category => `<button type="button" class="filter-button ${state.foodFilter === category ? "active" : ""}" data-food-filter="${category}">${state.language === "it" ? categoryIt[category] : (CATEGORY_LABELS[category] || "Plants")}</button>`).join("");
    const evidenceIt = { all: "tutti", intervention: "intervento", longitudinal: "longitudinale", cohort: "coorte", personalized: "personalizzato" };
    $("#evidence-filters").innerHTML = ["all", "intervention", "longitudinal", "cohort", "personalized"].map(type => `<button type="button" class="filter-button ${state.evidenceFilter === type ? "active" : ""}" data-evidence-filter="${type}">${state.language === "it" ? evidenceIt[type] : type}</button>`).join("");
  }

  function renderFoodLibrary() {
    const query = state.query.trim().toLowerCase();
    const matches = FOODS.filter(food => {
      const categoryMatch = state.foodFilter === "all" || food.group === state.foodFilter || (state.foodFilter === "plants" && ["vegetables", "starches", "nuts", "fats"].includes(food.group));
      return categoryMatch && (!query || `${food.name} ${foodName(food)} ${food.tags}`.toLowerCase().includes(query));
    });
    $("#food-library").innerHTML = matches.length ? matches.map(food => {
      const selected = state.selection[food.id] > 0;
      return `<button type="button" class="food-card ${selected ? "selected" : ""}" data-food="${food.id}" aria-label="${t("addFood")} ${foodName(food)}">
        <span class="food-add">${selected ? `${state.selection[food.id]}×` : "+"}</span><span class="food-icon" aria-hidden="true">${food.icon}</span><strong>${foodName(food)}</strong><small>${food.tags}</small>
      </button>`;
    }).join("") : `<div class="empty-diet">${state.language === "it" ? "Nessun alimento corrisponde alla ricerca." : "No food matches. Try fibre, fermented or polyphenols."}</div>`;
  }

  function renderSelectedDiet() {
    const foods = state.result.diet.foods;
    const unit = state.mode === "meal" ? t("oneMeal") : t("oneDay");
    $("#plant-count").textContent = state.result.diet.plantCount;
    $("#diet-summary").textContent = foods.length ? `${foods.length} ${t("foods")} · ${state.result.diet.totalPortions} ${t("portions")} · ${t("repeated")} ${state.repeats}×` : `${t("noFoods")} · ${unit}`;
    $("#selected-list").innerHTML = foods.length ? foods.map(food => `<div class="selected-chip">
      <span>${food.icon} ${foodName(food)}</span><button type="button" data-decrease="${food.id}" aria-label="Remove one portion of ${foodName(food)}">−</button><strong>${food.portions}×</strong><button type="button" data-increase="${food.id}" aria-label="${t("addFood")} ${foodName(food)}">+</button>
    </div>`).join("") : `<div class="empty-diet">${state.language === "it" ? "Seleziona gli alimenti per comporre l'esposizione." : `Select foods above to compose ${unit}.`}</div>`;
  }

  function renderEvidence() {
    const papers = EVIDENCE.filter(paper => state.evidenceFilter === "all" || paper.type === state.evidenceFilter);
    const typeIt = { intervention: "intervento", longitudinal: "longitudinale", cohort: "coorte", personalized: "personalizzato" };
    $("#evidence-list").innerHTML = papers.map(paper => `<a class="paper-row" href="${paper.url}" target="_blank" rel="noreferrer">
      <span class="paper-year">${paper.year}</span><span class="paper-title"><strong>${paper.title}</strong><small>${paper.authors}</small></span><span class="paper-finding">${state.language === "it" ? paper.it : paper.finding}</span><span class="paper-kind">${state.language === "it" ? typeIt[paper.type] : paper.type}</span><span class="paper-link">↗</span>
    </a>`).join("");
  }

  function mealResponders(selection) {
    const result = simulateExposure(selection, "typical", "meal", 5);
    return Object.keys(SPECIES).sort((a, b) => result.pressure[b] - result.pressure[a]).slice(0, 2);
  }

  function renderMealLibrary() {
    const types = ["all", "breakfast", "lunch", "dinner", "comfort", "snack"];
    $("#meal-dialog-filters").innerHTML = types.map(type => `<button type="button" class="filter-button ${state.mealFilter === type ? "active" : ""}" data-meal-filter="${type}">${t(type)}</button>`).join("");
    const meals = MEALS.filter(meal => state.mealFilter === "all" || meal.type === state.mealFilter);
    $("#meal-grid").innerHTML = meals.map(meal => {
      const scores = calculateMealScores(meal.selection, "meal");
      const responders = mealResponders(meal.selection);
      const foods = Object.keys(meal.selection).map(id => foodName(FOODS.find(food => food.id === id))).join(" · ");
      return `<article class="meal-card">
        <header><small>${t(meal.type)}</small><strong>${meal[state.language]}</strong></header>
        <p>${foods}</p>
        <div class="meal-card-scores"><span>${t("variety")} <b>${scores.variety}</b></span><span>${t("support")} <b>${scores.support}</b></span></div>
        <div class="meal-loves"><small>${t("loves")}</small>${responders.map(key => `<span><i style="background:${SPECIES[key].color}"></i><em>${SPECIES[key].short}</em></span>`).join("")}</div>
        <button type="button" data-load-meal="${meal.id}">${t("load")}</button>
      </article>`;
    }).join("");
  }

  function renderMealScores() {
    const scores = calculateMealScores(state.selection, state.mode);
    $("#variety-score").textContent = scores.variety;
    $("#support-score").textContent = scores.support;
    $("#variety-score-bar").style.width = `${scores.variety}%`;
    $("#support-score-bar").style.width = `${scores.support}%`;
  }

  function speciesDriver(result, key, delta = 0) {
    const rows = (result.attribution && result.attribution[key]) || [];
    if (!rows.length) return null;
    const direction = Math.sign(delta);
    const aligned = direction ? rows.filter(row => Math.sign(row.pressure) === direction) : rows;
    const row = (aligned.length ? aligned : rows)[0];
    const food = FOODS.find(item => item.id === row.foodId);
    return food ? { ...row, food } : null;
  }

  function driverCopy(result, key, delta, compact = false) {
    const driver = speciesDriver(result, key, delta);
    if (!driver) return state.language === "it" ? "Nessun alimento attribuibile" : "No attributable food";
    const sign = driver.pressure >= 0 ? "+" : "";
    const name = foodName(driver.food);
    if (compact) return `${name} (${sign}${driver.pressure.toFixed(2)})`;
    return state.language === "it"
      ? `Driver diretto principale nel modello: ${name} (${sign}${driver.pressure.toFixed(2)} pressione log). Prima di competizione e normalizzazione.`
      : `Largest direct modeled driver: ${name} (${sign}${driver.pressure.toFixed(2)} log-pressure). Before competition and normalization.`;
  }

  function renderCommunity(point) {
    const svg = $("#community-chart");
    const start = state.result.trajectory[0].species;
    const order = Object.keys(SPECIES);
    const maxValue = Math.max(...Object.values(point.species));
    const mobile = window.innerWidth <= 760, width = mobile ? 420 : 720, height = mobile ? 930 : 430, columns = mobile ? 2 : 5;
    const rows = Math.ceil(order.length / columns), cellWidth = width / columns, cellHeight = (height - 30) / rows;
    const nodes = order.map((key, index) => {
      const column = index % columns, row = Math.floor(index / columns);
      const x = cellWidth * (column + .5), y = 45 + cellHeight * row;
      const value = point.species[key], delta = value - start[key];
      const radius = 8 + 16 * Math.sqrt(value / maxValue);
      const direction = delta > .00005 ? "up" : delta < -.00005 ? "down" : "flat";
      const labelY = radius + 16;
      const driver = driverCopy(state.result, key, delta, true);
      return `<g class="community-node ${direction}" data-species-node="${key}" role="button" tabindex="0" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" aria-label="${SPECIES[key].name}, ${(100 * value).toFixed(2)} percent; ${driver}">
        <title>${SPECIES[key].name}: ${(100 * value).toFixed(2)}%, ${delta >= 0 ? "+" : ""}${(100 * delta).toFixed(2)} percentage points. ${driver}</title>
        <circle class="node-halo" r="${radius + 7}" stroke="${direction === "down" ? "#ff8c72" : SPECIES[key].color}" style="--pulse-delay:${(index * .11).toFixed(2)}s"/>
        <circle class="node-core" r="${radius}" fill="${SPECIES[key].color}"/>
        <circle class="node-glint" cx="${(-radius * .27).toFixed(1)}" cy="${(-radius * .28).toFixed(1)}" r="${Math.max(2, radius * .17).toFixed(1)}"/>
        <text y="${labelY}" text-anchor="middle">${SPECIES[key].short}</text>
      </g>`;
    }).join("");
    const mealLabel = state.result.diet.foods.length ? `${state.result.diet.foods.length} ${t("foods")}` : (state.language === "it" ? "aggiungi cibo" : "add food");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = `<title>${t("communityTitle")}</title><desc>${state.language === "it" ? "Le 20 specie mantengono sempre la stessa posizione; dimensione e alone cambiano con lo scenario." : "All 20 species keep the same position; size and halo change with the scenario."}</desc>${nodes}<text class="community-caption" x="${width / 2}" y="${height - 5}" text-anchor="middle">${state.mode === "meal" ? t("oneMeal") : t("oneDay")} · ${mealLabel}</text>`;
  }

  function evidenceLabel(level) {
    return t(`evidence${level.charAt(0).toUpperCase()}${level.slice(1)}`);
  }

  function openSpeciesDialog(key, contextResult = state.result, contextExposure = state.exposure) {
    const species = SPECIES[key], info = SPECIES_INFO[key], base = SPECIES_BASES[info.base];
    const point = contextResult.trajectory[Math.min(contextExposure, contextResult.repeats)], start = contextResult.trajectory[0];
    const delta = 100 * (point.species[key] - start.species[key]);
    const driver = driverCopy(contextResult, key, delta);
    const signals = [...base.signals, ...(info.extra || [])];
    const presentDomains = new Set(signals.map(signal => signal.domain));
    ["digestion", "metabolic", "immune", "neuro"].forEach(domain => {
      if (!presentDomains.has(domain)) signals.push({ domain, level: "none", en: "No species-specific human intervention evidence is established here.", it: "Qui non è stabilita un'evidenza da interventi umani specifica per questa specie." });
    });
    const domainNames = { digestion: t("digestion"), metabolic: t("metabolic"), immune: t("immune"), neuro: t("neuro") };
    $("#species-dialog-content").innerHTML = `<p class="eyebrow">${t("selectSpecies")}</p>
      <div class="species-dialog-heading"><i style="background:${species.color}"></i><div><h2><em>${species.name}</em></h2><p>${base.role[state.language]}</p></div></div>
      <div class="species-dialog-stats"><div><small>${t("abundance")}</small><strong>${(100 * point.species[key]).toFixed(2)}%</strong></div><div><small>${t("change")}</small><strong class="${delta > 0 ? "positive" : delta < 0 ? "negative" : ""}">${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pp</strong></div></div>
      <div class="species-facts"><div><small>${state.language === "it" ? "Alimento che contribuisce di più" : "Largest food contributor"}</small><p>${driver}</p></div></div>
      <div class="species-facts"><div><small>${t("affinity")}</small><p>${info.affinity[state.language]}</p></div><div><small>${t("products")}</small><p>${base.products.join(" · ")}</p></div></div>
      <h3>${t("evidence")}</h3><div class="effect-list">${signals.map(signal => `<article><header><span>${domainNames[signal.domain]}</span><b class="evidence-${signal.level}">${evidenceLabel(signal.level)}</b></header><p>${signal[state.language]}</p></article>`).join("")}</div>
      <div class="neuro-caution"><strong>${t("neuro")}</strong><p>${t("neuroCaution")}</p></div>
      <a href="${info.source}" target="_blank" rel="noreferrer">${t("readStudy")} ↗</a>`;
    state.selectedSpecies = key;
    if (!$("#species-dialog").open) $("#species-dialog").showModal();
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
    const order = Object.keys(SPECIES);
    const width = 820, height = 660, pad = { l: 176, r: 236, t: 25, b: 34 };
    const maxValue = Math.max(.05, Math.ceil(Math.max(...Object.values(start), ...Object.values(point.species)) * 20) / 20);
    const plotWidth = width - pad.l - pad.r;
    const rowHeight = (height - pad.t - pad.b) / order.length;
    const x = value => pad.l + (value / maxValue) * plotWidth;
    const ticks = [0, maxValue / 2, maxValue];
    const grid = ticks.map(tick => `<line x1="${x(tick)}" y1="${pad.t - 8}" x2="${x(tick)}" y2="${height - pad.b}" class="species-grid"/><text x="${x(tick)}" y="${height - 8}" text-anchor="middle">${(tick * 100).toFixed(tick ? 1 : 0)}%</text>`).join("");
    const rows = order.map((key, index) => {
      const y = pad.t + rowHeight * (index + .5);
      const before = start[key], after = point.species[key], delta = 100 * (after - before);
      const deltaText = Math.abs(delta) < .005 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} pp`;
      const driver = speciesDriver(state.result, key, delta);
      const driverName = driver ? foodName(driver.food) : (state.language === "it" ? "nessuno" : "none");
      const shortDriver = driverName.length > 15 ? `${driverName.slice(0, 14)}…` : driverName;
      const driverIcon = driver ? foodEmoji(driver.food) : "·";
      const driverDetail = driverCopy(state.result, key, delta);
      return `<g class="species-chart-row" data-species-node="${key}" role="button" tabindex="0" aria-label="${SPECIES[key].name}; ${deltaText}; ${driverDetail}"><title>${SPECIES[key].name}: ${(100 * before).toFixed(2)}% → ${(100 * after).toFixed(2)}%, ${deltaText}. ${driverDetail}</title>
        <rect class="species-row-bg" x="0" y="${y - rowHeight / 2}" width="${width}" height="${rowHeight}"/>
        <text class="species-label" x="${pad.l - 10}" y="${y + 4}" text-anchor="end">${SPECIES[key].short}</text>
        <line class="species-change-line" x1="${x(before)}" y1="${y}" x2="${x(after)}" y2="${y}" stroke="${SPECIES[key].color}"/>
        <circle class="species-before" cx="${x(before)}" cy="${y}" r="4"/>
        <circle class="species-after" cx="${x(after)}" cy="${y}" r="5" fill="${SPECIES[key].color}"/>
        <text class="species-driver-icon" x="${width - pad.r + 15}" y="${y + 5}">${driverIcon}</text>
        <text class="species-driver-name" x="${width - pad.r + 43}" y="${y + 4}">${shortDriver}</text>
        <text class="species-delta ${delta > .005 ? "up" : delta < -.005 ? "down" : ""}" x="${width - 5}" y="${y + 4}" text-anchor="end">${deltaText}</text>
      </g>`;
    }).join("");
    svg.innerHTML = `<title>${state.language === "it" ? "Confronto orizzontale prima e dopo per 20 specie, con alimento driver principale" : "Horizontal before-and-after comparison for 20 species with the strongest food driver"}</title>${grid}${rows}`;
  }

  function renderInsights(point) {
    const start = state.result.trajectory[0].species;
    const changes = Object.keys(SPECIES).map(key => ({ key, delta: 100 * (point.species[key] - start[key]), pressure: state.result.pressure[key] })).sort((a, b) => b.delta - a.delta);
    const gain = changes[0], loss = changes[changes.length - 1];
    const pressure = [...changes].sort((a, b) => Math.abs(b.pressure) - Math.abs(a.pressure))[0];
    const card = (label, item, value, note) => `<article><small>${label}</small><strong><em>${SPECIES[item.key].short}</em></strong><span>${value}</span><p>${note}<br><b>${driverCopy(state.result, item.key, item.delta)}</b></p></article>`;
    if (!state.result.diet.totalPortions || state.exposure === 0) {
      $("#species-insights").innerHTML = state.language === "it" ? `<article class="insight-empty"><small>Livello insight</small><strong>Aggiungi alimenti o supera l'esposizione 0</strong><p>Qui appariranno i responder modellati più forti e la loro direzione.</p></article>` : `<article class="insight-empty"><small>Insight layer</small><strong>Add foods or move beyond exposure 0</strong><p>The strongest modeled responders and their direction will appear here.</p></article>`;
      return;
    }
    const labels = state.language === "it" ? ["Maggiore aumento relativo", "Maggiore diminuzione relativa", "Pressione alimentare diretta più forte"] : ["Largest relative-share gain", "Largest relative-share loss", "Strongest direct food pressure"];
    $("#species-insights").innerHTML = [
      card(labels[0], gain, `${gain.delta >= 0 ? "+" : ""}${gain.delta.toFixed(2)} pp`, SPECIES[gain.key].note),
      card(labels[1], loss, `${loss.delta >= 0 ? "+" : ""}${loss.delta.toFixed(2)} pp`, state.language === "it" ? "Una diminuzione relativa può riflettere l'espansione di altre specie." : "A relative decline can also reflect other species expanding."),
      card(labels[2], pressure, `${pressure.pressure >= 0 ? "+" : ""}${pressure.pressure.toFixed(2)} log-pressure`, state.language === "it" ? "Prima della competizione e della normalizzazione della comunità." : "Before competition and normalization across the community.")
    ].join("");
  }

  function capacityCopy(delta) {
    if (state.language === "it") {
      if (delta > 4) return "La miscela amplia la capacità di fermentare carboidrati nello scenario.";
      if (delta < -4) return "Proteine, bile o pochi substrati fermentabili restringono la capacità modellata.";
      return "Una piccola spinta modellata; ripetizione ed ecologia iniziale ne determinano la direzione.";
    }
    if (delta > 4) return "This exposure mix widens carbohydrate-fermenting capacity in the scenario.";
    if (delta < -4) return "Protein, bile or low-fermentable-substrate pressure narrows the modeled capacity.";
    return "A small modeled nudge; repeated exposure and starting ecology shape the direction.";
  }

  function renderPathway() {
    const pathway = dominantPathway(state.result.diet);
    const pathwayIt = {
      resistant: { title: "Cross-feeding dell'amido resistente", copy: "L'amido che sfugge alla digestione nell'intestino tenue diventa un substrato condiviso. I degradatori primari liberano intermedi che i produttori di butirrato possono usare.", nodes: [["Amido resistente", "substrato"], ["Degradatori primari", "idrolisi"], ["Gruppo del butirrato", "cross-feeding"], ["Butirrato", "metabolita"]] },
      prebiotic: { title: "Via bifidogenica prebiotica", copy: "Fruttani tipo inulina e GOS favoriscono alcuni fermentatori primari. Acetato e lattato possono poi nutrire produttori secondari di butirrato.", nodes: [["Inulina / GOS", "substrato"], ["Bifidobatteri", "uso primario"], ["Cross-feeder", "uso secondario"], ["Acetato + butirrato", "metaboliti"]] },
      polyphenol: { title: "Biotrasformazione dei polifenoli", copy: "Molti polifenoli vengono trasformati prima o nel colon. Microbi e metaboliti rispondono, ma la causalità dipende dal composto e dalla persona.", nodes: [["Polifenoli", "matrice alimentare"], ["Biotrasformatori", "conversione"], ["Acidi fenolici", "metaboliti"], ["Variazione comunitaria", "associazione"]] },
      fermented: { title: "Esposizione ad alimenti fermentati", copy: "Microbi alimentari e prodotti della fermentazione entrano ripetutamente. La persistenza è di solito limitata, ma diversità e marker immunitari possono cambiare.", nodes: [["Cibo fermentato", "esposizione"], ["Microbi transitori", "passaggio"], ["Rete residente", "interazione"], ["Contesto immunitario", "risposta dell'ospite"]] },
      alcohol: { title: "Pressione perturbativa dell'etanolo", copy: "Lo scenario alcol applica una piccola perturbazione ecologica generica. Tipo di bevanda, dose e modalità di consumo contano; il modello non definisce un consumo sicuro né un beneficio per la salute.", nodes: [["Bevanda alcolica", "esposizione"], ["Etanolo", "perturbazione"], ["Rete residente", "selezione"], ["Variazione comunitaria", "scenario"]] },
      protein: { title: "Pressione da proteine e acidi biliari", copy: "Le proteine che raggiungono il colon sostengono la fermentazione degli amminoacidi; più grassi saturi possono modificare il flusso biliare e favorire organismi bile-tolleranti.", nodes: [["Proteine + grassi", "dieta"], ["Bile / peptidi", "substrati"], ["Gruppi tolleranti", "selezione"], ["Prodotti N/S", "metaboliti"]] },
      empty: { title: "Cross-feeding dei carboidrati complessi", copy: "Aggiungi alimenti per mostrare la via modellata più forte nell'ecosistema.", nodes: [["Matrice alimentare", "input"], ["Substrati", "colon"], ["Gruppi microbici", "ecologia"], ["Metaboliti", "output"]] }
    };
    const localized = state.language === "it" ? pathwayIt[pathway.key] : pathway;
    $("#pathway-title").textContent = localized.title;
    $("#pathway-copy").textContent = localized.copy;
    const confidence = state.language === "it" ? ["Molto bassa", "Bassa", "Moderata", "Alta", "Alta"] : ["Very low", "Low", "Moderate", "High", "High"];
    $("#confidence-label").textContent = confidence[pathway.confidence];
    $$("#confidence-dots i").forEach((dot, index) => dot.classList.toggle("filled", index < pathway.confidence));
    $("#pathway-visual").innerHTML = localized.nodes.map(([title, subtitle]) => `<div class="path-node"><span>${title}<small>${subtitle}</small></span></div>`).join("");
  }

  function renderSimulation() {
    state.result = simulateExposure(state.selection, "typical", state.mode, state.repeats, storyScenario().customDistribution);
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
    $(".simulation-toolbar h3").innerHTML = `${state.language === "it" ? "Esposizione" : "Exposure"} <span id="exposure-label">${state.exposure}</span> ${state.language === "it" ? "di" : "of"} <span id="exposure-total">${state.repeats}</span>`;
    $("#capacity-score").textContent = point.capacity;
    $("#hero-diversity").textContent = point.capacity;
    $("#capacity-ring").style.setProperty("--score", point.capacity);
    $("#capacity-copy").textContent = capacityCopy(delta);
    const deltaElement = $("#capacity-delta");
    deltaElement.textContent = delta === 0 ? (state.language === "it" ? "iniziale" : "baseline") : `${delta > 0 ? "+" : ""}${delta} ${state.language === "it" ? "vs inizio" : "vs start"}`;
    deltaElement.className = `delta-pill ${delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral"}`;
    $("#butyrate-potential").textContent = point.metabolites.butyratePotential;
    $("#butyrate-meter").style.width = `${point.metabolites.butyratePotential}%`;
    $("#acetate-share").textContent = `${point.metabolites.acetateShare}%`;
    $("#propionate-share").textContent = `${point.metabolites.propionateShare}%`;
    $("#proteolytic-pressure").textContent = point.metabolites.proteolyticPressure;
    renderMealScores();
    renderCommunity(point);
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
    $$("[data-mode]").forEach(item => { const active = item.dataset.mode === state.mode; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); });
  }

  function bindEvents() {
    $("#language-button").addEventListener("click", () => {
      state.language = state.language === "en" ? "it" : "en";
      applyStaticCopy(); syncChoiceButtons(); renderFilters(); renderFoodLibrary(); renderEvidence(); renderMealLibrary(); renderStory(); renderSimulation();
      if (state.selectedSpecies && $("#species-dialog").open) openSpeciesDialog(state.selectedSpecies);
    });
    $("#frequency-foods").addEventListener("click", event => {
      const button = event.target.closest("[data-frequency-food]"); if (!button) return;
      state.foodFrequency[button.dataset.frequencyFood] = Number(button.dataset.frequencyValue);
      renderStory(); renderSimulation();
    });
    $("#frequency-prev").addEventListener("click", () => { state.frequencyPage = Math.max(0, state.frequencyPage - 1); renderStory(); });
    $("#frequency-next").addEventListener("click", () => { state.frequencyPage = Math.min(FREQUENCY_GROUPS.length - 1, state.frequencyPage + 1); renderStory(); });
    $(".story-kind-tabs").addEventListener("click", event => {
      const button = event.target.closest("[data-story-kind]"); if (!button) return;
      state.storyKind = button.dataset.storyKind;
      state.storyExposure = QUICK_STORIES.find(item => item.kind === state.storyKind).id;
      renderStory();
    });
    $("#story-options").addEventListener("click", event => {
      const button = event.target.closest("[data-story-exposure]"); if (!button) return;
      state.storyExposure = button.dataset.storyExposure;
      renderStory();
    });
    $("#story-full-button").addEventListener("click", () => {
      const { story } = storyScenario();
      Object.assign(state, { selection: { ...story.selection }, mode: "meal", repeats: 10, exposure: 10 });
      syncChoiceButtons(); renderFoodLibrary(); renderSimulation();
      $("#advanced-lab-details").open = true;
      $("#model").scrollIntoView({ behavior: "smooth" });
    });
    $("#meal-library-button").addEventListener("click", () => { renderMealLibrary(); $("#meal-dialog").showModal(); });
    $("#meal-dialog-filters").addEventListener("click", event => { const button = event.target.closest("[data-meal-filter]"); if (!button) return; state.mealFilter = button.dataset.mealFilter; renderMealLibrary(); });
    $("#meal-grid").addEventListener("click", event => {
      const button = event.target.closest("[data-load-meal]"); if (!button) return;
      const meal = MEALS.find(item => item.id === button.dataset.loadMeal); if (!meal) return;
      state.selection = { ...meal.selection }; state.mode = "meal"; state.exposure = state.repeats;
      syncChoiceButtons(); renderFoodLibrary(); renderSimulation(); $("#meal-dialog").close();
    });
    const activateSpecies = event => {
      const target = event.target.closest("[data-species-node]");
      if (!target || (event.type === "keydown" && !["Enter", " "].includes(event.key))) return;
      if (event.type === "keydown") event.preventDefault();
      if (target.closest("#story-chart")) openSpeciesDialog(target.dataset.speciesNode, storyScenario().exposureRun, 10);
      else openSpeciesDialog(target.dataset.speciesNode);
    };
    $("#community-chart").addEventListener("click", activateSpecies); $("#community-chart").addEventListener("keydown", activateSpecies);
    $("#species-chart").addEventListener("click", activateSpecies); $("#species-chart").addEventListener("keydown", activateSpecies);
    $("#story-chart").addEventListener("click", activateSpecies); $("#story-chart").addEventListener("keydown", activateSpecies);
    $("#food-filters").addEventListener("click", event => { const button = event.target.closest("[data-food-filter]"); if (!button) return; state.foodFilter = button.dataset.foodFilter; renderFilters(); renderFoodLibrary(); });
    $("#food-library").addEventListener("click", event => { const card = event.target.closest("[data-food]"); if (card) addFood(card.dataset.food, 1); });
    $("#selected-list").addEventListener("click", event => { const increase = event.target.closest("[data-increase]"), decrease = event.target.closest("[data-decrease]"); if (increase) addFood(increase.dataset.increase, 1); if (decrease) addFood(decrease.dataset.decrease, -1); });
    $("#food-search").addEventListener("input", event => { state.query = event.target.value; renderFoodLibrary(); });
    $("#mode-options").addEventListener("click", event => { const button = event.target.closest("[data-mode]"); if (!button) return; state.mode = button.dataset.mode; syncChoiceButtons(); renderSimulation(); });
    $("#repeat-slider").addEventListener("input", event => { state.repeats = Number(event.target.value); state.exposure = state.repeats; renderSimulation(); });
    $("#exposure-slider").addEventListener("input", event => { state.exposure = Number(event.target.value); renderSimulation(); });
    $("#clear-foods").addEventListener("click", () => { state.selection = {}; renderFoodLibrary(); renderSimulation(); });
    $("#reset-button").addEventListener("click", () => { Object.assign(state, { selection: {}, mode: "meal", repeats: 5, exposure: 5 }); syncChoiceButtons(); renderFoodLibrary(); renderSimulation(); });
    $("#load-demo").addEventListener("click", () => { Object.assign(state, { selection: { oats: 1, lentils: 1, berries: 1, "onion-garlic": 1 }, mode: "meal", repeats: 5, exposure: 5 }); syncChoiceButtons(); renderFoodLibrary(); renderSimulation(); $("#advanced-lab-details").open = true; $("#model").scrollIntoView({ behavior: "smooth" }); });
    $("#evidence-filters").addEventListener("click", event => { const button = event.target.closest("[data-evidence-filter]"); if (!button) return; state.evidenceFilter = button.dataset.evidenceFilter; renderFilters(); renderEvidence(); });
    const dialog = $("#about-dialog"), mealDialog = $("#meal-dialog"), speciesDialog = $("#species-dialog");
    $("#about-button").addEventListener("click", () => dialog.showModal()); $("#dialog-close").addEventListener("click", () => dialog.close()); dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    $("#meal-dialog-close").addEventListener("click", () => mealDialog.close()); mealDialog.addEventListener("click", event => { if (event.target === mealDialog) mealDialog.close(); });
    $("#species-dialog-close").addEventListener("click", () => speciesDialog.close()); speciesDialog.addEventListener("click", event => { if (event.target === speciesDialog) speciesDialog.close(); });
    window.addEventListener("beforeunload", () => { if (animationFrame) cancelAnimationFrame(animationFrame); });
  }

  loadState();
  applyStaticCopy(); renderFilters(); renderFoodLibrary(); renderEvidence(); renderMealLibrary(); renderStory(); syncChoiceButtons(); initCanvas(); renderSimulation(); bindEvents();
})();
