(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MicrobiomeContent = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MEALS = [
    { id: "oat-berry", type: "breakfast", en: "Oats, berries & almonds", it: "Avena, frutti di bosco e mandorle", selection: { oats: 1, berries: 1, almonds: 1 } },
    { id: "yogurt-apple", type: "breakfast", en: "Yogurt, apple & walnuts", it: "Yogurt, mela e noci", selection: { yogurt: 1, apple: 1, walnuts: 1 } },
    { id: "avocado-toast", type: "breakfast", en: "Avocado toast & coffee", it: "Toast con avocado e caffè", selection: { wholegrain: 1, avocado: 1, coffee: 1 } },
    { id: "eggs-toast", type: "breakfast", en: "Eggs, wholegrain toast & tomato", it: "Uova, pane integrale e pomodoro", selection: { eggs: 1, wholegrain: 1, tomato: 1 } },
    { id: "cereal-milk", type: "breakfast", en: "Sweet cereal, milk & banana", it: "Cereali dolci, latte e banana", selection: { "sweet-cereal": 1, milk: 1, "ripe-banana": 1 } },
    { id: "pancakes", type: "breakfast", en: "Pancakes, berries & yogurt", it: "Pancake, frutti di bosco e yogurt", selection: { pancakes: 2, berries: 1, yogurt: 1 } },
    { id: "bacon-eggs", type: "breakfast", en: "Bacon-style breakfast", it: "Colazione stile bacon e uova", selection: { "processed-meat": 1, eggs: 1, "white-bread": 1 } },
    { id: "kefir-smoothie", type: "breakfast", en: "Kefir berry smoothie", it: "Frullato di kefir e frutti di bosco", selection: { kefir: 1, berries: 1, "ripe-banana": 1 } },
    { id: "pear-porridge", type: "breakfast", en: "Pear & walnut porridge", it: "Porridge con pera e noci", selection: { oats: 1, pear: 1, walnuts: 1 } },
    { id: "cocoa-yogurt", type: "breakfast", en: "Cocoa berry yogurt bowl", it: "Yogurt con cacao e frutti di bosco", selection: { yogurt: 1, cocoa: 1, berries: 1 } },
    { id: "chicken-sandwich", type: "lunch", en: "Chicken salad sandwich", it: "Panino integrale con pollo e insalata", selection: { chicken: 1, wholegrain: 1, "leafy-greens": 1, tomato: 1 } },
    { id: "salmon-salad", type: "lunch", en: "Salmon & avocado salad", it: "Insalata con salmone e avocado", selection: { salmon: 1, "leafy-greens": 1, avocado: 1, wholegrain: 1 } },
    { id: "lentil-soup", type: "lunch", en: "Lentil soup & wholegrain bread", it: "Zuppa di lenticchie e pane integrale", selection: { lentils: 1, carrots: 1, wholegrain: 1 } },
    { id: "chickpea-bowl", type: "lunch", en: "Chickpea grain bowl", it: "Bowl di ceci e riso integrale", selection: { chickpeas: 1, "brown-rice": 1, tomato: 1, "olive-oil": 1 } },
    { id: "burger-meal", type: "comfort", en: "Burger, fries & soda", it: "Burger, patatine e bibita", selection: { burger: 1, fries: 1, "sugary-drink": 1 } },
    { id: "pizza-meal", type: "comfort", en: "Pizza & soda", it: "Pizza e bibita", selection: { pizza: 2, "sugary-drink": 1 } },
    { id: "ham-cheese", type: "lunch", en: "Ham & cheese sandwich", it: "Panino con prosciutto e formaggio", selection: { "processed-meat": 1, cheese: 1, "white-bread": 2 } },
    { id: "caesar", type: "lunch", en: "Chicken Caesar-style salad", it: "Insalata Caesar con pollo", selection: { chicken: 1, "leafy-greens": 1, cheese: 1, "white-bread": 1 } },
    { id: "bean-burrito", type: "lunch", en: "Bean, rice & avocado bowl", it: "Bowl di fagioli, riso e avocado", selection: { beans: 1, "brown-rice": 1, avocado: 1, cheese: 1 } },
    { id: "tomato-pasta", type: "lunch", en: "Tomato pasta & broccoli", it: "Pasta al pomodoro e broccoli", selection: { pasta: 1, tomato: 1, "olive-oil": 1, broccoli: 1 } },
    { id: "salmon-potato", type: "dinner", en: "Salmon, cooled potato & broccoli", it: "Salmone, patate raffreddate e broccoli", selection: { salmon: 1, "cooled-potato": 1, broccoli: 1 } },
    { id: "steak-potato", type: "dinner", en: "Steak, potato & carrots", it: "Bistecca, patate e carote", selection: { "red-meat": 1, "cooled-potato": 1, carrots: 1 } },
    { id: "chicken-rice", type: "dinner", en: "Chicken, rice & peas", it: "Pollo, riso e piselli", selection: { chicken: 1, "white-rice": 1, peas: 1 } },
    { id: "beans-rice", type: "dinner", en: "Beans, brown rice & avocado", it: "Fagioli, riso integrale e avocado", selection: { beans: 1, "brown-rice": 1, avocado: 1, tomato: 1 } },
    { id: "bolognese", type: "dinner", en: "Beef tomato pasta", it: "Pasta al ragù", selection: { "red-meat": 1, pasta: 1, tomato: 1, cheese: 1 } },
    { id: "roast-chicken", type: "dinner", en: "Roast chicken & vegetables", it: "Pollo arrosto con verdure", selection: { chicken: 1, carrots: 1, broccoli: 1, "cooled-potato": 1 } },
    { id: "takeaway", type: "comfort", en: "Processed-meat takeaway meal", it: "Pasto take-away con carne lavorata", selection: { "processed-meat": 1, fries: 1, "sugary-drink": 1 } },
    { id: "veggie-chili", type: "dinner", en: "Bean & lentil vegetable chilli", it: "Chili vegetale di fagioli e lenticchie", selection: { beans: 1, lentils: 1, tomato: 1, carrots: 1, wholegrain: 1 } },
    { id: "mac-cheese", type: "comfort", en: "Creamy macaroni & cheese", it: "Maccheroni al formaggio", selection: { pasta: 2, cheese: 1, butter: 1 } },
    { id: "snack-plate", type: "snack", en: "Apple, almonds & kefir", it: "Mela, mandorle e kefir", selection: { apple: 1, almonds: 1, kefir: 1 } }
  ];

  const mergeMeals = (...ids) => {
    const selection = {};
    ids.forEach(id => {
      const meal = MEALS.find(item => item.id === id);
      if (!meal) return;
      Object.entries(meal.selection).forEach(([food, portions]) => { selection[food] = (selection[food] || 0) + portions; });
    });
    return selection;
  };

  const DAY_PATTERNS = [
    { id: "mediterranean", en: "Mediterranean-ish day", it: "Giornata mediterranea", meals: ["oat-berry", "chickpea-bowl", "salmon-potato"], note: { en: "Oats · chickpeas · salmon and vegetables", it: "Avena · ceci · salmone e verdure" } },
    { id: "italian-balanced", en: "Balanced Italian day", it: "Giornata italiana bilanciata", meals: ["yogurt-apple", "tomato-pasta", "roast-chicken"], note: { en: "Yogurt and fruit · tomato pasta · roast chicken", it: "Yogurt e frutta · pasta al pomodoro · pollo arrosto" } },
    { id: "plant-diverse", en: "Plant-diverse day", it: "Giornata vegetale varia", meals: ["pear-porridge", "lentil-soup", "veggie-chili"], note: { en: "Porridge · lentil soup · bean and lentil chilli", it: "Porridge · zuppa di lenticchie · chili di legumi" } },
    { id: "mixed", en: "Typical mixed day", it: "Giornata mista tipica", meals: ["eggs-toast", "chicken-sandwich", "bolognese"], note: { en: "Eggs and toast · chicken sandwich · ragù pasta", it: "Uova e pane · panino al pollo · pasta al ragù" } },
    { id: "convenience", en: "Convenience-food day", it: "Giornata pronta e veloce", meals: ["cereal-milk", "burger-meal", "pizza-meal"], note: { en: "Sweet cereal · burger meal · pizza", it: "Cereali dolci · burger · pizza" } },
    { id: "high-protein", en: "Animal-protein day", it: "Giornata ricca di proteine animali", meals: ["bacon-eggs", "caesar", "steak-potato"], note: { en: "Bacon-style breakfast · chicken salad · steak", it: "Colazione bacon-style · Caesar · bistecca" } },
    { id: "vegetarian", en: "Vegetarian mixed day", it: "Giornata vegetariana mista", meals: ["cocoa-yogurt", "chickpea-bowl", "beans-rice"], note: { en: "Yogurt bowl · chickpea bowl · beans and rice", it: "Yogurt bowl · bowl di ceci · fagioli e riso" } },
    { id: "pescatarian", en: "Pescatarian day", it: "Giornata pescetariana", meals: ["avocado-toast", "salmon-salad", "salmon-potato"], note: { en: "Avocado toast · salmon salad · salmon and potato", it: "Toast avocado · insalata al salmone · salmone e patate" } },
    { id: "low-fibre", en: "Low-fibre day", it: "Giornata povera di fibre", meals: ["bacon-eggs", "ham-cheese", "mac-cheese"], note: { en: "Eggs and white bread · ham sandwich · mac and cheese", it: "Uova e pane bianco · panino al prosciutto · mac and cheese" } },
    { id: "family", en: "Family-style day", it: "Giornata formato famiglia", meals: ["pancakes", "chicken-rice", "roast-chicken"], note: { en: "Pancakes · chicken and rice · roast vegetables", it: "Pancake · pollo e riso · arrosto con verdure" } },
    { id: "fast-food", en: "Fast-food day", it: "Giornata fast-food", meals: ["cereal-milk", "burger-meal", "takeaway"], note: { en: "Sweet cereal · burger and soda · takeaway", it: "Cereali dolci · burger e bibita · take-away" } },
    { id: "legume-forward", en: "Legume-forward day", it: "Giornata ricca di legumi", meals: ["oat-berry", "lentil-soup", "bean-burrito"], note: { en: "Oats · lentils · beans and brown rice", it: "Avena · lenticchie · fagioli e riso integrale" } },
    { id: "dairy-heavy", en: "Dairy-heavy day", it: "Giornata ricca di latticini", meals: ["yogurt-apple", "ham-cheese", "mac-cheese"], note: { en: "Yogurt · ham and cheese · creamy pasta", it: "Yogurt · prosciutto e formaggio · pasta cremosa" } },
    { id: "italian-classic", en: "Classic Italian day", it: "Giornata italiana classica", meals: ["avocado-toast", "tomato-pasta", "bolognese"], note: { en: "Coffee and toast · tomato pasta · ragù", it: "Caffè e toast · pasta al pomodoro · ragù" } },
    { id: "flexitarian", en: "Flexitarian day", it: "Giornata flexitariana", meals: ["kefir-smoothie", "chicken-sandwich", "veggie-chili"], note: { en: "Kefir smoothie · chicken sandwich · vegetable chilli", it: "Frullato di kefir · panino al pollo · chili vegetale" } },
    { id: "wholegrain", en: "Wholegrain day", it: "Giornata integrale", meals: ["pear-porridge", "chickpea-bowl", "beans-rice"], note: { en: "Porridge · brown-rice bowls · legumes", it: "Porridge · bowl di riso integrale · legumi" } },
    { id: "refined-carb", en: "Refined-carb day", it: "Giornata di carboidrati raffinati", meals: ["pancakes", "pizza-meal", "mac-cheese"], note: { en: "Pancakes · pizza · macaroni and cheese", it: "Pancake · pizza · maccheroni al formaggio" } },
    { id: "salad-centric", en: "Salad-centric day", it: "Giornata centrata sulle insalate", meals: ["avocado-toast", "salmon-salad", "caesar"], note: { en: "Avocado toast · salmon salad · chicken salad", it: "Toast avocado · insalata al salmone · Caesar" } },
    { id: "weekend", en: "Weekend comfort day", it: "Giornata comfort del weekend", meals: ["bacon-eggs", "pizza-meal", "steak-potato"], note: { en: "Bacon-style breakfast · pizza · steak", it: "Colazione bacon-style · pizza · bistecca" } },
    { id: "light-snacker", en: "Light meals and snacks", it: "Pasti leggeri e spuntini", meals: ["yogurt-apple", "snack-plate", "tomato-pasta"], note: { en: "Yogurt and fruit · nuts and kefir · tomato pasta", it: "Yogurt e frutta · frutta secca e kefir · pasta al pomodoro" } }
  ].map(pattern => ({ ...pattern, selection: mergeMeals(...pattern.meals) }));

  const QUICK_STORIES = [
    { id: "coffee", kind: "food", icon: "∿", en: "One coffee", it: "Un caffè", selection: { coffee: 1 }, note: { en: "A reproducible food–species association; not proof of a health effect.", it: "Associazione cibo–specie riproducibile; non prova un effetto sulla salute." }, source: "https://www.nature.com/articles/s41564-024-01858-9" },
    { id: "kombucha", kind: "food", icon: "◌", en: "One kombucha", it: "Una kombucha", selection: { kombucha: 1 }, note: { en: "Small trials show modest, product-variable microbiome effects.", it: "Piccoli studi mostrano effetti modesti e variabili tra prodotti." }, source: "https://pubmed.ncbi.nlm.nih.gov/39738315/" },
    { id: "alcohol", kind: "food", icon: "▽", en: "One alcoholic drink", it: "Una bevanda alcolica", selection: { alcohol: 1 }, note: { en: "Generic ethanol pressure; beverage type and dose matter. This is not a safe-intake recommendation.", it: "Pressione generica dell'etanolo; tipo e dose contano. Non è una raccomandazione di consumo sicuro." }, source: "https://pubmed.ncbi.nlm.nih.gov/33096423/" },
    { id: "apple", kind: "food", icon: "○", en: "One apple", it: "Una mela", selection: { apple: 1 }, note: { en: "Pectin and polyphenol substrate pulse.", it: "Impulso di pectina e polifenoli." }, source: "https://pubmed.ncbi.nlm.nih.gov/30696735/" },
    { id: "lentils", kind: "food", icon: "●", en: "One lentil portion", it: "Una porzione di lenticchie", selection: { lentils: 1 }, note: { en: "GOS, fibre and resistant-starch substrate pulse.", it: "Impulso di GOS, fibre e amido resistente." }, source: "https://pubmed.ncbi.nlm.nih.gov/30696735/" },
    { id: "oat-berry-story", kind: "meal", icon: "✣", en: "Oats, berries & almonds", it: "Avena, frutti di bosco e mandorle", selection: MEALS.find(meal => meal.id === "oat-berry").selection, note: { en: "Fibre- and polyphenol-rich breakfast.", it: "Colazione ricca di fibre e polifenoli." } },
    { id: "lentil-story", kind: "meal", icon: "◉", en: "Lentil soup & wholegrain bread", it: "Zuppa di lenticchie e pane integrale", selection: MEALS.find(meal => meal.id === "lentil-soup").selection, note: { en: "Legume and wholegrain substrate mix.", it: "Miscela di substrati da legumi e cereali integrali." } },
    { id: "salmon-story", kind: "meal", icon: "≈", en: "Salmon, potato & broccoli", it: "Salmone, patate e broccoli", selection: MEALS.find(meal => meal.id === "salmon-potato").selection, note: { en: "Mixed animal protein, resistant starch and vegetables.", it: "Proteine animali, amido resistente e verdure." } },
    { id: "pizza-story", kind: "meal", icon: "△", en: "Pizza & soda", it: "Pizza e bibita", selection: MEALS.find(meal => meal.id === "pizza-meal").selection, note: { en: "Refined, saturated-fat and processed-food pressure.", it: "Pressione da raffinati, grassi saturi e alimenti lavorati." } },
    { id: "burger-story", kind: "meal", icon: "≡", en: "Burger, fries & soda", it: "Burger, patatine e bibita", selection: MEALS.find(meal => meal.id === "burger-meal").selection, note: { en: "A Western takeaway scenario, not a clinical prediction.", it: "Scenario take-away occidentale, non una previsione clinica." } }
  ];

  const STORY_UI = {
    en: { kicker: "Start with your real routine", title: "What does your usual day look like?", intro: "Choose one of 20 preloaded day patterns. It creates a modelled starting ecology—not a stool-test result.", step1: "1 · Starting point", chooseDay: "Choose your usual day", baselineNote: "Modelled from 10 repeats of this day", step2: "2 · Try one exposure", foods: "5 foods & drinks", meals: "5 meals", step3: "3 · See the nudge", once: "After one", ten: "After 10×", start: "Start", compare: "Largest modelled species changes", fullLab: "Open this in the full lab", source: "Evidence note", disclaimer: "Directional scenario only. One meal can change substrates before stool abundance, and 10× is a repeated-exposure thought experiment." },
    it: { kicker: "Parti dalla tua routine", title: "Com'è la tua giornata abituale?", intro: "Scegli uno dei 20 schemi giornalieri precaricati. Crea un'ecologia iniziale modellata, non il risultato di un test fecale.", step1: "1 · Punto di partenza", chooseDay: "Scegli la tua giornata abituale", baselineNote: "Modellata da 10 ripetizioni di questa giornata", step2: "2 · Prova un'esposizione", foods: "5 alimenti e bevande", meals: "5 pasti", step3: "3 · Osserva la spinta", once: "Dopo una", ten: "Dopo 10×", start: "Inizio", compare: "Principali variazioni modellate", fullLab: "Apri nel laboratorio completo", source: "Nota sulle evidenze", disclaimer: "Solo scenario direzionale. Un pasto può cambiare i substrati prima dell'abbondanza fecale; 10× è un esperimento mentale su esposizioni ripetute." }
  };

  const SOURCES = {
    personalized: "https://pubmed.ncbi.nlm.nih.gov/31194939/",
    rapidDiet: "https://pubmed.ncbi.nlm.nih.gov/24336217/",
    resistantStarch: "https://pubmed.ncbi.nlm.nih.gov/22343308/",
    fiberResponse: "https://pubmed.ncbi.nlm.nih.gov/30696735/",
    akkermansiaTrial: "https://www.nature.com/articles/s41591-019-0495-2",
    prevotellaTrial: "https://pubmed.ncbi.nlm.nih.gov/26552345/",
    coffee: "https://www.nature.com/articles/s41564-024-01858-9",
    gaba: "https://www.nature.com/articles/s41564-018-0307-3",
    faecalibacterium: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7567499/",
    fermented: "https://doi.org/10.1016/j.cell.2021.06.019",
    kombucha: "https://pubmed.ncbi.nlm.nih.gov/39738315/",
    alcohol: "https://pubmed.ncbi.nlm.nih.gov/33096423/",
    bifidoMood: "https://doi.org/10.1053/j.gastro.2017.05.003"
  };

  const common = {
    butyrate: {
      role: { en: "Ferments complex carbohydrates within a cross-feeding network.", it: "Fermenta carboidrati complessi in una rete di cross-feeding." },
      products: ["butyrate", "acetate"],
      signals: [
        { domain: "digestion", level: "mechanistic", en: "Supports fermentation of fibre-derived substrates; activity depends on available cross-feeding partners.", it: "Supporta la fermentazione dei substrati derivati dalle fibre; l'attività dipende dai partner di cross-feeding." },
        { domain: "immune", level: "mechanistic", en: "Butyrate can support colonocyte metabolism and regulate inflammatory signalling; species abundance alone does not measure butyrate flux.", it: "Il butirrato può sostenere il metabolismo dei colonociti e regolare segnali infiammatori; l'abbondanza della specie non misura il flusso di butirrato." }
      ]
    },
    bifido: {
      role: { en: "Uses selected oligosaccharides and releases acetate/lactate for cross-feeders.", it: "Utilizza alcuni oligosaccaridi e rilascia acetato/lattato per altri microrganismi." },
      products: ["acetate", "lactate"],
      signals: [
        { domain: "digestion", level: "mechanistic", en: "Can use inulin-type fructans, GOS or resistant starch in a strain- and substrate-dependent way.", it: "Può utilizzare inulina, GOS o amido resistente in modo dipendente dal ceppo e dal substrato." },
        { domain: "immune", level: "strain", en: "Immune and symptom effects reported for specific probiotic strains cannot be inferred from total species abundance.", it: "Gli effetti immunitari o sui sintomi osservati per specifici ceppi probiotici non si deducono dall'abbondanza totale della specie." }
      ]
    },
    saccharolytic: {
      role: { en: "Degrades plant glycans or starch and supplies metabolites to the community.", it: "Degrada glicani vegetali o amido e fornisce metaboliti alla comunità." },
      products: ["acetate", "propionate"],
      signals: [
        { domain: "digestion", level: "mechanistic", en: "Expands the community's capacity to access otherwise indigestible carbohydrate structures.", it: "Amplia la capacità della comunità di utilizzare strutture glucidiche altrimenti indigeribili." },
        { domain: "metabolic", level: "association", en: "Metabolic links are substrate- and person-specific; abundance is not a blood-glucose prediction.", it: "I legami metabolici dipendono da substrato e persona; l'abbondanza non predice la glicemia." }
      ]
    },
    generalists: {
      role: { en: "Uses a flexible range of community metabolites.", it: "Utilizza una gamma flessibile di metaboliti della comunità." },
      products: ["acetate"],
      signals: [{ domain: "digestion", level: "association", en: "Its role changes with strain, food matrix and neighbouring organisms.", it: "Il suo ruolo cambia con ceppo, matrice alimentare e microrganismi vicini." }]
    },
    risk: {
      role: { en: "Tolerates protein-, bile- or oxygen-linked ecological conditions.", it: "Tollera condizioni ecologiche legate a proteine, bile o ossigeno." },
      products: ["amino-acid metabolites"],
      signals: [
        { domain: "digestion", level: "association", en: "Relative expansion can mark a changed substrate environment, not a diagnosis or intrinsic harm.", it: "L'espansione relativa può indicare un ambiente diverso, non una diagnosi o un danno intrinseco." },
        { domain: "immune", level: "preclinical", en: "Inflammatory effects are often strain-specific or strongest in animal models.", it: "Gli effetti infiammatori sono spesso specifici del ceppo o più solidi nei modelli animali." }
      ]
    }
  };

  const SPECIES_INFO = {
    faecalibacterium: { base: "butyrate", affinity: { en: "Fibre and resistant-starch cross-feeding", it: "Fibre e cross-feeding da amido resistente" }, source: SOURCES.faecalibacterium },
    roseburia: { base: "butyrate", affinity: { en: "Arabinoxylans, β-glucans and fibre", it: "Arabinoxilani, β-glucani e fibre" }, source: SOURCES.rapidDiet },
    eubacterium: { base: "butyrate", affinity: { en: "Resistant starch and cross-feeding", it: "Amido resistente e cross-feeding" }, source: SOURCES.fiberResponse },
    anaerobutyricum: { base: "butyrate", affinity: { en: "Lactate and acetate from primary fermenters", it: "Lattato e acetato dai fermentatori primari" }, source: SOURCES.fiberResponse },
    bifidoAdolescentis: { base: "bifido", affinity: { en: "Inulin, GOS and some resistant starches", it: "Inulina, GOS e alcuni amidi resistenti" }, source: SOURCES.fiberResponse },
    bifidoLongum: { base: "bifido", affinity: { en: "Oligosaccharides; effects are strain-specific", it: "Oligosaccaridi; gli effetti sono specifici del ceppo" }, source: SOURCES.bifidoMood, extra: [{ domain: "neuro", level: "strain", en: "One B. longum strain has been tested in a small IBS mood trial; this does not generalize to all B. longum or to food-driven abundance changes.", it: "Un ceppo di B. longum è stato testato in un piccolo studio su IBS e umore; il risultato non si estende a tutti i B. longum né alle variazioni indotte dal cibo." }] },
    bacteroidesTheta: { base: "saccharolytic", affinity: { en: "Pectin and diverse plant glycans", it: "Pectina e diversi glicani vegetali" }, source: SOURCES.gaba, extra: [{ domain: "neuro", level: "association", en: "Some Bacteroides can produce GABA in vitro; a direct mood effect from this species or meal is not established.", it: "Alcuni Bacteroides producono GABA in vitro; non è dimostrato un effetto diretto sull'umore da questa specie o dal pasto." }] },
    bacteroidesVulgatus: { base: "saccharolytic", affinity: { en: "Broad glycans; also tolerates Western-style matrices", it: "Diversi glicani; tollera anche matrici occidentali" }, source: SOURCES.rapidDiet },
    prevotella: { base: "saccharolytic", affinity: { en: "Whole grains and plant polysaccharides", it: "Cereali integrali e polisaccaridi vegetali" }, source: SOURCES.prevotellaTrial, extra: [{ domain: "metabolic", level: "human", en: "Enrichment marked responders to a short barley intervention with improved glucose metabolism; this was not a universal effect.", it: "L'arricchimento caratterizzava i responder a un breve intervento con orzo e migliore metabolismo del glucosio; l'effetto non era universale." }] },
    ruminococcus: { base: "saccharolytic", affinity: { en: "Resistant starch; a primary degrader", it: "Amido resistente; degradatore primario" }, source: SOURCES.resistantStarch },
    akkermansia: { base: "generalists", affinity: { en: "Host mucin; polyphenol-rich patterns are associated", it: "Mucina dell'ospite; associazioni con pattern ricchi di polifenoli" }, source: SOURCES.akkermansiaTrial, extra: [{ domain: "metabolic", level: "human", en: "Pasteurized A. muciniphila improved insulin sensitivity in a small proof-of-concept supplementation trial; abundance changes from food are not equivalent to supplementation.", it: "A. muciniphila pastorizzata ha migliorato la sensibilità insulinica in un piccolo studio di supplementazione; le variazioni da cibo non equivalgono alla supplementazione." }, { domain: "immune", level: "human", en: "The same exploratory trial reported changes in selected inflammatory and liver markers, requiring larger confirmation.", it: "Lo stesso studio esplorativo ha osservato variazioni in alcuni marker infiammatori ed epatici, da confermare in studi più ampi." }] },
    blautia: { base: "generalists", affinity: { en: "Community acetate and mixed plant substrates", it: "Acetato della comunità e substrati vegetali misti" }, source: SOURCES.personalized },
    coprococcus: { base: "butyrate", affinity: { en: "Fibre and pectin cross-feeding", it: "Fibre e cross-feeding da pectina" }, source: SOURCES.personalized },
    lawsonibacter: { base: "generalists", affinity: { en: "Coffee-associated compounds", it: "Composti associati al caffè" }, source: SOURCES.coffee, extra: [{ domain: "metabolic", level: "human", en: "Coffee association is highly reproducible and supported by culture work; a host-health effect of the species itself is not established.", it: "L'associazione con il caffè è molto riproducibile e supportata da colture; non è dimostrato un effetto della specie sulla salute dell'ospite." }] },
    alistipes: { base: "risk", affinity: { en: "Protein- and animal-diet-linked environments", it: "Ambienti legati a proteine e diete animali" }, source: SOURCES.rapidDiet },
    parabacteroides: { base: "generalists", affinity: { en: "Flexible plant and host-derived glycans", it: "Glicani vegetali e dell'ospite" }, source: SOURCES.personalized },
    collinsella: { base: "generalists", affinity: { en: "Readily available carbohydrates", it: "Carboidrati facilmente disponibili" }, source: SOURCES.personalized },
    bilophila: { base: "risk", affinity: { en: "Bile-rich, higher-animal-fat conditions", it: "Condizioni ricche di bile e grassi animali" }, source: SOURCES.rapidDiet, extra: [{ domain: "immune", level: "preclinical", en: "Expansion occurred on an animal-based human diet; inflammatory causality is supported mainly by susceptible-mouse models.", it: "È aumentata con una dieta animale nell'uomo; la causalità infiammatoria deriva soprattutto da modelli murini suscettibili." }] },
    escherichia: { base: "risk", affinity: { en: "Oxygen, refined substrates and disturbed ecosystems", it: "Ossigeno, substrati raffinati ed ecosistemi disturbati" }, source: SOURCES.personalized, extra: [{ domain: "immune", level: "strain", en: "E. coli includes harmless commensals and pathogenic strains; species-level abundance cannot distinguish them.", it: "E. coli comprende commensali innocui e ceppi patogeni; l'abbondanza a livello di specie non li distingue." }] },
    enterococcus: { base: "risk", affinity: { en: "Fermented-food passage and protein-rich contexts", it: "Passaggio da alimenti fermentati e contesti ricchi di proteine" }, source: SOURCES.fermented, extra: [{ domain: "neuro", level: "mechanistic", en: "Some strains transform aromatic amino acids, but this does not prove increased brain dopamine or a mood effect.", it: "Alcuni ceppi trasformano amminoacidi aromatici, ma ciò non dimostra un aumento della dopamina cerebrale o effetti sull'umore." }] }
  };

  const UI = {
    en: {
      language: "Italiano", mealsButton: "Explore 30 example meals", mealsTitle: "30 Western-style meal examples", mealsIntro: "Load a meal, then inspect which species receive the strongest positive pressure. Scores compare only this simplified model—not overall nutrition quality.", all: "All", breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", comfort: "Comfort / takeaway", snack: "Snack", load: "Load meal", loves: "Top responders", variety: "Microbiome variety", support: "Microbiome-support", scoreCaution: "Scenario heuristic · not a health score", communityTitle: "Living species community", communityIntro: "Node size shows relative abundance; the halo shows direction and modeled magnitude. Select a species for evidence.", selectSpecies: "Select a species", abundance: "Model share", change: "Change", affinity: "Food affinity", products: "Likely products / roles", evidence: "Host-effect evidence", evidenceHuman: "Human intervention", evidenceMechanistic: "Mechanistic", evidenceAssociation: "Association", evidencePreclinical: "Preclinical", evidenceStrain: "Strain-specific", evidenceNone: "Not established", digestion: "Digestion", metabolic: "Blood / metabolic", immune: "Immune", neuro: "Mood / neuroactive", neuroCaution: "Gut microbes can make or transform neuroactive molecules, but gut dopamine does not cross the blood–brain barrier. No meal-to-brain-dopamine effect is predicted here.", readStudy: "Open supporting study", close: "Close", oneMeal: "one meal", oneDay: "one day", portions: "portions", repeated: "repeated", foods: "foods", addFood: "Add one portion of", noFoods: "No foods added", plantSources: "plant sources"
    },
    it: {
      language: "English", mealsButton: "Esplora 30 pasti di esempio", mealsTitle: "30 esempi di pasti occidentali", mealsIntro: "Carica un pasto e osserva quali specie ricevono la pressione positiva più forte. I punteggi confrontano solo questo modello semplificato, non la qualità nutrizionale complessiva.", all: "Tutti", breakfast: "Colazione", lunch: "Pranzo", dinner: "Cena", comfort: "Comfort / take-away", snack: "Spuntino", load: "Carica pasto", loves: "Responder principali", variety: "Varietà microbiotica", support: "Supporto al microbioma", scoreCaution: "Euristica di scenario · non è un punteggio di salute", communityTitle: "Comunità microbica viva", communityIntro: "La dimensione indica l'abbondanza relativa; l'alone mostra direzione e intensità modellata. Seleziona una specie per le evidenze.", selectSpecies: "Seleziona una specie", abundance: "Quota modellata", change: "Variazione", affinity: "Affinità alimentare", products: "Prodotti / ruoli probabili", evidence: "Evidenze sugli effetti per l'ospite", evidenceHuman: "Intervento umano", evidenceMechanistic: "Meccanicistica", evidenceAssociation: "Associazione", evidencePreclinical: "Preclinica", evidenceStrain: "Specifica del ceppo", evidenceNone: "Non dimostrato", digestion: "Digestione", metabolic: "Sangue / metabolismo", immune: "Immunità", neuro: "Umore / neuroattivi", neuroCaution: "I microbi intestinali possono produrre o trasformare molecole neuroattive, ma la dopamina intestinale non attraversa la barriera emato-encefalica. Qui non viene previsto alcun effetto pasto→dopamina cerebrale.", readStudy: "Apri lo studio di supporto", close: "Chiudi", oneMeal: "un pasto", oneDay: "un giorno", portions: "porzioni", repeated: "ripetuto", foods: "alimenti", addFood: "Aggiungi una porzione di", noFoods: "Nessun alimento aggiunto", plantSources: "fonti vegetali"
    }
  };

  const FOOD_IT = {
    oats: "Avena", lentils: "Lenticchie", chickpeas: "Ceci", beans: "Fagioli", "cooled-potato": "Patate raffreddate", "green-banana": "Banana verde", apple: "Mela", berries: "Frutti di bosco", "onion-garlic": "Cipolla e aglio", artichoke: "Carciofo", broccoli: "Broccoli", wholegrain: "Pane integrale", almonds: "Mandorle", cocoa: "Cacao fondente", coffee: "Caffè", kombucha: "Kombucha", alcohol: "Bevanda alcolica", "olive-oil": "Olio extravergine", kefir: "Kefir", yogurt: "Yogurt vivo", kimchi: "Kimchi / crauti", "red-meat": "Carne rossa", "processed-meat": "Carne lavorata", cheese: "Formaggio stagionato", "upf-snack": "Snack ultra-processato", eggs: "Uova", chicken: "Pollo", salmon: "Salmone", "white-bread": "Pane bianco", pasta: "Pasta", "brown-rice": "Riso integrale", "white-rice": "Riso bianco", "leafy-greens": "Verdure a foglia", tomato: "Pomodoro", avocado: "Avocado", carrots: "Carote", peas: "Piselli", pear: "Pera", "ripe-banana": "Banana matura", walnuts: "Noci", milk: "Latte", butter: "Burro", "sugary-drink": "Bibita zuccherata", fries: "Patatine fritte", pizza: "Pizza", burger: "Burger", "sweet-cereal": "Cereali dolci", pancakes: "Pancake"
  };

  return { MEALS, DAY_PATTERNS, QUICK_STORIES, STORY_UI, SOURCES, SPECIES_INFO, SPECIES_BASES: common, UI, FOOD_IT };
});
