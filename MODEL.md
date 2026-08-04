# Model specification

Version 0.5 · August 2026

## Purpose

The model answers a narrow counterfactual question:

> Given an editable 20-species starting distribution, which organisms receive more or less directional pressure from one meal or one day, and how could that pressure accumulate if the exposure is repeated?

It does **not** answer “what bacteria are in my stool?” A defensible answer to that question requires a biological sample and an explicit laboratory method, ideally repeated over time.

## Species exposure layer

The interactive view tracks 20 named gut species selected to span resistant-starch degradation, prebiotic response, butyrate production, mucin use, bile tolerance, proteolysis and ecological generalism. These are illustrative species proxies, not a complete community. Species and strains can perform multiple functions, and a species name does not imply a universal health effect.

Three presets provide different normalized starting distributions. Every value can also be edited; input values are treated as relative parts and normalized to 100%. The starting state is therefore an assumption unless it comes from an appropriate species-resolved assay.

Foods are composed as either one meal or one full day. Each portion contributes substrate features. A meal uses a smaller dose scale than a day. Species pressure combines its primary functional-guild pressure with transparent species-specific modifiers—for example resistant starch for *Ruminococcus bromii*, inulin/GOS for bifidobacteria, coffee for *Lawsonibacter asaccharolyticus*, and saturated fat/bile pressure for *Bilophila wadsworthia*.

For exposure $e$, a normalized target is calculated in log space and approached with inertia:

$$x^*_{i,e}=x_{i,0}\exp(q_m r_e P_i)$$

$$p_{i,e}=\mathrm{norm}\left[p_{i,e-1}+a_m\left(p^*_{i,e}-p_{i,e-1}\right)\right]$$

where $q_m$ and $a_m$ depend on meal/day mode, $r_e$ is a small saturating exposure ramp, and $P_i$ is dimensionless directional pressure. Repetition therefore accumulates with diminishing increments. The constants are heuristic and uncalibrated; a first exposure should be read as an ecological nudge, not an observed abundance change.

## Functional representation

The species distribution is also aggregated into eight broad guilds for metabolic and capacity heuristics:

1. butyrate producers;
2. bifidobacteria;
3. complex-carbohydrate degraders;
4. mucin specialists;
5. lactate producers;
6. proteolytic fermenters;
7. bile-tolerant organisms;
8. ecological generalists.

Guild assignments are simplified primary roles. A species may participate in multiple functions, and strain-level capabilities differ. The aggregation is used because a functional view is often more interpretable than treating isolated taxa as universally “good” or “bad”.

The displayed percentage is the guild's normalized share of the **model state**:

$$p_{g,t}=\frac{x_{g,t}}{\sum_h x_{h,t}}$$

It is not a predicted read count or absolute microbial load.

## Dietary feature layer

Each food serving contributes dimensionless feature weights: total fermentable fibre, resistant starch, GOS, inulin-type fructans, pectin, beta-glucan, arabinoxylan, polyphenols, fermented-food exposure, plant diversity, animal protein, saturated fat and processing-related features.

Repeated servings are converted to a daily average. To avoid linear “more is always more” behavior, feature pressure is saturating:

$$s_f = 1.7\tanh(d_f/1.7)$$

where $d_f$ is the daily feature exposure. This is a modeling choice, not an estimated human dose-response curve.

Unique plant foods add a small breadth term separately from serving quantity. This prevents twenty servings of one food from being treated like twenty distinct ecological substrates.

## Meal atlas and scenario scores

The interface includes 30 bilingual meal presets spanning breakfasts, lunches, dinners, snacks and Western-style comfort or takeaway meals. They are editable starting points, not recommendations or fixed nutritional prescriptions.

Two 0–100 heuristics summarize only the modeled food-feature mix:

- **microbiome variety** combines unique plant sources with the breadth of distinct fermentable substrate features;
- **microbiome support** combines positive carbohydrate, polyphenol and fermented-food pressures and subtracts modeled low-fibre, saturated-fat and processing pressure.

Both scores are bounded display indices. They are not validated clinical endpoints, diet-quality scores or estimates of alpha diversity. The “top responders” shown on a meal card are the two species receiving the largest positive model coefficient under a mixed starting ecology; they are not organisms proven to increase in every person.

## Guided weekly-frequency baseline

The mobile-first onboarding presents seven screens of five common foods. Each item is rated from 0 to 5 times per week. Example frequencies are preloaded and editable. The weekly values are converted to average daily portions by dividing by seven, then run for 10 modeled day exposures from the generic mixed preset. The resulting normalized species state becomes the starting ecology for the chosen food, drink or meal story. This is a transparent scenario construction, not an inference of the visitor's real microbiome from a food-frequency questionnaire.

The story view then compares the modeled start, one meal-sized exposure and 10 repeated meal-sized exposures. The coffee scenario encodes the replicated *Lawsonibacter* association already described in the species layer. Kombucha uses a mild fermented-food and tea-polyphenol feature mix because small human trials report modest and product-variable effects. The generic alcoholic-drink scenario encodes a small ethanol pressure; it does not model beverage-specific polyphenols, establish a safe dose or outweigh the health risks of alcohol.

All 20 story and community nodes use a stable species order and fixed coordinates. Abundance changes alter dot or ring size and direction styling, not position. This makes within-scenario comparisons easier but does not imply physical proximity or ecological interaction between neighboring dots.

## Ecological update

Feature pressure is mapped to guild-specific directional coefficients $\beta_{f,g}$. Coefficients encode the direction and relative strength of evidence-backed hypotheses; they are not clinical effect sizes.

The target abundance is computed in log space:

$$x^*_{g,t}=x_{g,0}\exp\left[r_t\sum_f \beta_{f,g}s_f\right]$$

with an exposure ramp:

$$r_t=1-e^{-t/3.2}$$

The normalized target is approached with inertia:

$$p_{g,t}=\mathrm{norm}\left[p_{g,t-1}+0.14\left(p^*_{g,t}-p_{g,t-1}\right)\right]$$

This produces changes over days to weeks and avoids an implausible instantaneous jump. The constants are transparent heuristic choices and should be calibrated if longitudinal training data become available.

## Metabolic layer

The site exposes:

- **butyrate potential (0–100):** a relative index combining modeled butyrate-producer share with fermentable-carbohydrate availability;
- **SCFA pool shares:** normalized acetate, propionate and butyrate production heuristics;
- **proteolytic pressure (0–100):** a relative index combining the proteolytic guild, animal-protein pressure and competing carbohydrate substrate;
- **gas potential (0–100):** a relative fermentation index, not a symptom prediction.

These are not fecal or plasma concentrations. Absorption means fecal SCFA can be a particularly ambiguous proxy for total production.

## Personalization and uncertainty

Three starting profiles are provided to make baseline dependence visible. The interface displays a deliberately broad uncertainty statement because baseline microbiome, transit time, medication, recent antibiotics, geography, age, illness, host genetics and food preparation are unobserved.

Real personalization should use repeated measurements rather than a single sample. A future inference layer should distinguish:

- observed food quantities;
- laboratory measurements and method metadata;
- inferred latent ecological state;
- model forecasts and credible intervals.

## Evidence ladder

Rules prioritize human evidence:

1. controlled dietary interventions for direction and time course;
2. dense longitudinal sampling for within-person variability;
3. large shotgun-metagenomic cohorts for reproducible associations;
4. mechanistic culture, metabolomic and cross-feeding evidence for biological plausibility.

The species detail view displays digestion, blood/metabolic, immune and neuroactive domains. Missing domains are marked **not established** rather than inferred. Evidence badges distinguish human intervention, mechanistic, association, preclinical and strain-specific findings. Species abundance is not equivalent to metabolite production or administration of a cultured organism. In particular, microbial production or transformation of neuroactive compounds does not demonstrate a meal-to-mood effect, and intestinal dopamine does not cross the blood–brain barrier.

Key starting papers:

- Wastyk et al., *Cell* (2021), [doi:10.1016/j.cell.2021.06.019](https://doi.org/10.1016/j.cell.2021.06.019)
- Johnson et al., *Cell Host & Microbe* (2019), [doi:10.1016/j.chom.2019.05.005](https://doi.org/10.1016/j.chom.2019.05.005)
- Asnicar et al., *Nature Medicine* / ZOE PREDICT 1 (2021), [doi:10.1038/s41591-020-01183-8](https://doi.org/10.1038/s41591-020-01183-8)
- Baxter et al., *mBio* (2019), [doi:10.1128/mBio.02566-18](https://doi.org/10.1128/mBio.02566-18)
- Healey et al., *British Journal of Nutrition* (2018), [doi:10.1017/S0007114517003440](https://doi.org/10.1017/S0007114517003440)
- David et al., *Nature* (2014), [doi:10.1038/nature12820](https://doi.org/10.1038/nature12820)
- Zeevi et al., *Cell* (2015), [doi:10.1016/j.cell.2015.11.001](https://doi.org/10.1016/j.cell.2015.11.001)
- Bermingham et al., *Nature Medicine* / ZOE (2024), [doi:10.1038/s41591-024-02951-6](https://doi.org/10.1038/s41591-024-02951-6)
- Suez et al., *Cell* (2022), [doi:10.1016/j.cell.2022.07.016](https://doi.org/10.1016/j.cell.2022.07.016)
- Fackelmann et al., *Nature Microbiology* (2025), [doi:10.1038/s41564-024-01870-z](https://doi.org/10.1038/s41564-024-01870-z)
- Manghi et al., *Nature Microbiology* / ZOE (2024), [doi:10.1038/s41564-024-01858-9](https://doi.org/10.1038/s41564-024-01858-9)

## Known limitations

- Relative abundance is compositional: one guild can appear to decrease because another increases.
- Food composition varies with cultivar, processing, cooking, cooling and portion size.
- Stool under-samples mucosal and small-intestinal communities.
- Taxonomic abundance is not gene expression or metabolic flux.
- Observational diet–microbiome links are vulnerable to confounding and reverse causation.
- “Diversity” is not intrinsically beneficial in every clinical context.
- The 20 species are illustrative proxies, not a reconstruction of a complete microbiome.
- Primary guild labels simplify strain-level and context-dependent biology.
- One meal may change substrate availability or activity before stool relative abundance changes.
- The coefficient matrix has not been prospectively validated.

Any health or disease-facing use would require clinical governance, versioned datasets, external validation, calibration analysis and appropriate regulatory review.
