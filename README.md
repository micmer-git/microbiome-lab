# MICROBIOME lab

An interactive, evidence-aware model for exploring how one meal or one day may apply directional pressure to a simplified gut ecosystem.

The model is deliberately conservative: a food log cannot reconstruct a person's stool metagenome, and a single meal does not imply an instantly measurable abundance shift. The site keeps estimated ecological pressure separate from measured biology.

## What v0.3 does

- Works in English or Italian and composes one meal or one day from 46 foods and food matrices.
- Includes an atlas of 30 Western-style meal examples, each with transparent variety and microbiome-support scenario scores.
- Starts from one of three presets or an editable 20-species relative distribution.
- Repeats the same exposure 1–10 times with saturating, baseline-dependent dynamics.
- Shows an animated, clickable 20-species community; each species opens an evidence-graded digestion, metabolic, immune and neuroactive profile.
- Shows trajectories for the strongest responders and a start-versus-model comparison for all 20 species.
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
