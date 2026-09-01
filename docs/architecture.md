# My Sindbad — Architecture Reference

My Sindbad is an AI-Powered Travel Navigation & Discovery Platform. This document
describes the data model and module map so the system stays coherent and extensible.

## Product concept
Discover → Understand → Plan → Navigate. The user is not searching a map; My Sindbad
understands the whole trip and helps decide and reach the place.

## Core data models

### User → Location
- User identity is handled by Supabase auth (utils/supabaseClient.js, utils/auth.js).
- Live location is NEVER stored. utils/msLocation.js exposes real GPS only
  (current / watch) and is privacy-first: no location history, no fake coordinates.

### Place
Canonical shape lives in lib/placeModel.js. Every Place has:
id, name, category, coordinates{lat,lng}, lat, lon, address, description,
openingHours, website, phone, email, source, sourceId, metadata,
rating, reviews, estimatedCost, duration, dataQuality{...}.

- source = 'osm' | 'local:verified' | (future sources).
- dataQuality.<field> = 'real' | 'estimated' | 'absent'. The AI and UI MUST NOT
  present an absent field as a fact. Ratings/reviews/price are 'absent' unless a
  trusted source provides them — we never invent them.
- Extensible: add a normalizer (e.g. normalizeXxx) and register it in
  normalizePlace(source, raw, ctx). Discovery APIs return canonical Places.

### Trip → Days → Activities
- Trips live in local storage (utils/appState.js) and sync via utils/sync.js.
- A Trip has destination, dates{start,end}, days[{day, activities}].
- Activities can link to a Place (coordinates) so the itinerary drives the map and
  navigation (see itinerary.html, today.html navigate/map buttons).

### Navigation Session
utils/msNavigation.js exposes window.MSNavigation: { start, stop, setProfile, on, snapshot }.
A session holds: origin, destination, profile, route (Mapbox geometry), current
position, status (idle|navigating|arrived|off_route), ETA, remaining distance/duration,
and off-route detection with automatic recalculation. Depends on msLocation.js
(real GPS) and msRouting.js (Mapbox Directions). No external hand-off.

### AI Assistant (Travel Intelligence Layer)
api/assistant.js + api/plan.js build a Trip Context using lib/tripContext.js:
- Weather (Open-Meteo, real daily forecast) — getWeatherContext / weatherContextText.
- Nearby real places (Overpass, normalized via placeModel.js) —
  getNearbyPlacesContext / placesContextText.
The AI receives real weather + real places + the trip plan and suggests actions
(REPLACE/REMOVE/MOVE/REPLAN). It must distinguish real data from AI recommendation
from estimated info, and never invent facts.

## Module map
- utils/msLocation.js — real GPS (current/watch), permission handling, no fakes.
- utils/msRouting.js — Mapbox Directions v5 (walking/cycling/driving), real routes.
- utils/msNavigation.js — Navigation Session (live tracking, off-route, ETA).
- lib/placeModel.js — canonical Place model + dataQuality + source abstraction.
- lib/tripContext.js — shared weather + nearby-places context for AI/planning.
- api/places.js — discovery endpoint (Overpass + verified local fallback).
- api/plan.js — AI trip planner (weather + nearby-aware).
- api/assistant.js — AI travel assistant (always weather-aware, real places on suggestions).
- api/weather.js — daily forecast endpoint.
- api/map-token.js — Mapbox public token for the client.

## Future extensibility (by design, not built now)
- Business/owner Place claims: add an 'owner' source normalizer + Supabase table;
  the Place model already supports images, services, opening hours, contact, offers.
- Aggregated popularity: store only anonymized/aggregated counts (never personal
  trails) with explicit consent, to rank recommendations.
- Additional discovery sources: register in normalizePlace(); consumers stay unchanged.
