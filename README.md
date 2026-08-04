# MICROBIOME lab

An interactive, evidence-aware model for exploring how one meal or one day may apply directional pressure to a simplified gut ecosystem.

The model is deliberately conservative: a food log cannot reconstruct a person's stool metagenome, and a single meal does not imply an instantly measurable abundance shift. The site keeps estimated ecological pressure separate from measured biology.

## What v0.7 does

- Uses a seven-screen weekly-frequency onboarding: rate 35 common foods from 0–5 times per week to condition the modeled starting ecology.
- Works in English or Italian and composes one meal or one day from 48 foods and food matrices.
- Includes an atlas of 30 Western-style meal examples, each with transparent variety and microbiome-support scenario scores.
- Offers five single food/drink stories and five meal stories, including coffee, kombucha and a generic alcoholic-drink scenario with evidence cautions.
- Keeps all 20 species in fixed visual positions while comparing the modeled start, one exposure and 10 repeated exposures.
- Exports the onboarding result as a bilingual 1080×1920 circular ecosystem portrait with a descriptive ecology profile and a transparent count of species at or above 2%.
- Attributes each species' direct modeled pressure to the selected food that contributed most, before competition and compositional normalization.
- Gives every species a specific, evidence-calibrated profile with a linked primary study; species and strain findings are kept distinct.
- Uses a larger readability floor for controls, explanations, evidence cards and charts on both mobile and desktop.
- Uses the 35-food onboarding result as the advanced lab baseline, then lets the visitor add foods or load any of the 30 meals as the exposure.
- Repeats the same exposure 1–10 times with saturating, baseline-dependent dynamics.
- Shows an animated, clickable 20-species community; each species opens an evidence-graded digestion, metabolic, immune and neuroactive profile.
- Keeps the custom meal builder, trajectory and evidence tools inside an optional advanced-lab disclosure to avoid repeating the onboarding result.
- Restores the horizontal before/after chart for all 20 species and labels each row with the food contributing the strongest aligned direct pressure.
- Surfaces the largest modeled gain, loss and direct food pressure.
- Retains functional-guild, SCFA-share, butyrate-potential and proteolytic-pressure heuristics.
- Stores the scenario only in the visitor's browser. No personal or health data is transmitted.

The meal scores rank scenarios inside this simplified model. They are not diet-quality or health scores. Neuroactive-molecule notes do not imply that gut dopamine reaches the brain or that a meal changes mood.

Read [MODEL.md](MODEL.md) for equations, assumptions, limitations and the evidence ladder.

## Run locally

No build step or dependency is required.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

```bash
npm test
npm run check
```

## Deploy

The included GitHub Actions workflow tests and publishes the static project to GitHub Pages on every push to `main`.

## Scientific boundary

This is an educational counterfactual model, not a diagnostic device, medical advice, or a validated predictor of an individual's microbiome. Species percentages are normalized model states. Metabolic values are indices or relative modeled shares, not laboratory concentrations.

## License

MIT for code. Scientific papers remain the property of their publishers and authors.
