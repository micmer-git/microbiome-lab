# MICROBIOME lab

An interactive, evidence-aware model for exploring how recurring dietary inputs may nudge functional groups in the gut microbiome over time.

The core idea is deliberately conservative: a food log cannot reconstruct a person's stool metagenome. This site therefore models **directional ecological pressure** on broad functional guilds, makes the assumptions inspectable, and keeps estimated state separate from measured biology.

## What the first release does

- Builds a recurring diet from 23 foods and food matrices.
- Converts servings into substrate features such as resistant starch, inulin, GOS, beta-glucan, pectin, polyphenols, fermented-food exposure, animal protein and saturated fat.
- Simulates 28 days of saturating, lagged change from three starting ecologies.
- Shows normalized guild composition, percentage-point changes, an ecosystem-capacity heuristic, modeled SCFA pool shares and relative metabolic potentials.
- Links model assumptions to human interventions, dense longitudinal studies and large metagenomic cohorts, including ZOE PREDICT work.
- Stores the scenario only in the visitor's browser. No personal or health data is transmitted.

Read [MODEL.md](MODEL.md) for the equations, boundaries and evidence interpretation.

## Run locally

No build step or dependency is required.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

```bash
npm test
```

## Deploy

The included GitHub Actions workflow publishes the static project to GitHub Pages on every push to `main`. In the repository settings, set **Pages → Source** to **GitHub Actions** once.

## Scientific boundary

This is an educational counterfactual model, not a diagnostic device, medical advice or a validated predictor of an individual's microbiome. Guild percentages are normalized model states. Metabolic values are indices or relative modeled shares, not laboratory concentrations. Stool abundance also does not directly equal microbial activity or mucosal ecology.

## License

MIT for code. Scientific papers remain the property of their respective publishers and authors.
