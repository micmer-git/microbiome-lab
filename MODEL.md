# Model specification

Version 0.1 · August 2026

## Purpose

The model answers a narrow counterfactual question:

> Given a starting ecological profile and a repeated dietary pattern, which functional microbial guilds would receive more or less substrate pressure, in what direction, and on what approximate timescale?

It does **not** answer “what bacteria are in my stool?” A defensible answer to that question requires a biological sample and an explicit laboratory method, ideally repeated over time.

## State representation

The model tracks eight broad guilds:

1. butyrate producers;
2. bifidobacteria;
3. complex-carbohydrate degraders;
4. mucin specialists;
5. lactate producers;
6. proteolytic fermenters;
7. bile-tolerant organisms;
8. ecological generalists.

Guilds are not taxonomic bins. A species may participate in multiple functions, and strain-level capabilities differ. The aggregation is used because a functional view is often more interpretable than treating isolated taxa as universally “good” or “bad”.

The displayed percentage is the guild's normalized share of the **model state**:

$$p_{g,t}=\frac{x_{g,t}}{\sum_h x_{h,t}}$$

It is not a predicted read count or absolute microbial load.

## Dietary feature layer

Each food serving contributes dimensionless feature weights: total fermentable fibre, resistant starch, GOS, inulin-type fructans, pectin, beta-glucan, arabinoxylan, polyphenols, fermented-food exposure, plant diversity, animal protein, saturated fat and processing-related features.

Repeated servings are converted to a daily average. To avoid linear “more is always more” behavior, feature pressure is saturating:

$$s_f = 1.7\tanh(d_f/1.7)$$

where $d_f$ is the daily feature exposure. This is a modeling choice, not an estimated human dose-response curve.

Unique plant foods add a small breadth term separately from serving quantity. This prevents twenty servings of one food from being treated like twenty distinct ecological substrates.

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
- Guild labels simplify strain-level and context-dependent biology.
- The coefficient matrix has not been prospectively validated.

Any health or disease-facing use would require clinical governance, versioned datasets, external validation, calibration analysis and appropriate regulatory review.
