# Movie Curation Strategy: The 3-Layer Approach

## Executive Summary
Unlike typical "best of" lists that rely on critical acclaim (Rotten Tomatoes) or raw popularity (TMDB Vote Count), this strategy aims to curate a **"Likely Seen"** pool. It prioritizes cultural ubiquity—films you've likely encountered on cable TV, VHS, or streaming—over cinematic quality.

The curation engine uses a **3-Layer Approach** to build a target pool of ~5,000 movies.

---

## The 3 Layers

### Layer 1: Cable Canon (The Foundation)
**Goal:** Guarantee the inclusion of specific "cable staples" and cult classics that might otherwise fail data-driven thresholds (due to low vote counts or budget data).
**Mechanism:** A manually aggregated "Allowlist" of ~1,000 titles from three primary sources:
1.  **HBO 80s Database:** Top 50 most-aired movies on HBO (1980–1989).
2.  **USA Up All Night:** Documented playlist of the iconic late-night B-movie block (1989–1998).
3.  **TNT/TBS Consensus:** Crowd-sourced list of movies "always on" cable in the 90s/00s (e.g., *Shawshank Redemption*, *Tremors*).

**Action:** These movies are **auto-included** regardless of their score.

### Layer 2: Cultural Reach Scorer (The Broad Net)
**Goal:** organically identify "likely seen" movies from the broader pool of 5,000 candidates without manual curation.
**Mechanism:** A weighted scoring algorithm (0.00 - 1.00) that evaluates five signals:
1.  **Vote Count (25%):** Relative popularity within its own decade (percentile-based).
2.  **Genre (20%):** Bonus for "rewatchable" genres (Action, Comedy, Sci-Fi, Horror).
3.  **Era (20%):** Bonus for the "Peak Cable/VHS" era (1980–2005).
4.  **Quality (20%):** Slight bias toward better-rated films (to filter trash).
5.  **Budget (15%):** Proxy for theatrical distribution/marketing reach.

**Action:** Movies with a **Cultural Reach Score ≥ 0.50** are included.

### Layer 3: The "Global Hit" Filter
**Goal:** Exclude obscure foreign regional hits while strictly keeping global cultural phenomena.
**Mechanism:**
-   **Rule:** `original_language` must be `'en'` (English).
-   **Exception:** ALLOW foreign language IF `vote_count > 2,000`.
-   **Result:** Removes *Le Guignolo* (169 votes), Keeps *Parasite* (16,000 votes).

### Layer 4: Dedup & Merge
**Goal:** Combine the layers into a single, clean dataset.
**Mechanism:**
1.  Merge Layer 1 and Layer 2.
2.  Deduplicate by TMDB ID.
3.  Tag provenance (`source: 'canon'`, `'score'`, or `'both'`).
4.  Sort chronologically.

### Layer 5: Data Enrichment
**Goal:** Provide high-quality metadata for the UI.
**Mechanism:**
-   Iterate through the final list of ~4,700 movies.
-   Fetch detailed credits (`/movie/{id}/credits`) for each.
-   Append `director` and top 5 `cast` members.

---

## Target Distribution

| Decade | Target Count | Rationale |
| :--- | :--- | :--- |
| **1980s** | ~1,100 | The core nostalgia era; highest density of "cable staples." |
| **1990s** | ~1,100 | The peak of practical effects blockbusters and rental culture. |
| **2000s** | ~1,100 | Transition to DVD/digital; still high cultural monoculture. |
| **2010s** | ~1,000 | Fragmented viewing, but franchise blockbusters remain universal. |
| **2020s** | ~700 | Recent history; focus on major streaming hits and theatrical events. |

## Provenance Tags
Every movie in the final dataset carries a `curation_source` tag:
-   **`canon`:** Rescued solely by the Cable Canon list (would have failed scoring).
-   **`score`:** Qualified solely via high Cultural Reach Score.
-   **`both`:** A "Core Classic" — present in Canon lists AND high-scoring.

## Maintenance
-   **New Canon:** Add titles to `data/cable_canon.js`.
-   **Tuning:** Adjust weights or threshold (0.50) in `scripts/cultural_reach_scorer.js`.
-   **Rebuild:** Run `node scripts/fetch_movies.js` (raw fetch) then `node scripts/build_movie_pool.js` (curate).
