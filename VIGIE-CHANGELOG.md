# VIGIE DIABOLOCOM — Changelog

> Outil de surveillance des anomalies du centre d'appels YouSchool

---

## [0.3.0] - 9 janvier 2026

### ✅ Système de Feedbacks
- Bouton flottant orange en bas à droite (toutes pages)
- Modal de création : 3 types (Bug, Amélioration, Question)
- Page `/feedbacks` pour gérer les retours
- 5 statuts : Nouveau → Vu → Planifié → Fait / Écarté
- Stockage localStorage (V1)
- Bouton "Nouveau feedback" dans la page admin

### 🚀 Déploiement
- Repository GitHub : `Iducournau/vigie-diabolocom`
- Déployé sur Vercel

---

## [0.2.0] - 9 janvier 2026

### 🌙 Dark Mode
- Installation `next-themes`
- ThemeProvider dans layout.tsx
- Toggle Moon/Sun dans la sidebar
- Tous les composants mis à jour avec `dark:` variants
- Configuration Tailwind v4 : `@custom-variant dark`

### 📊 Graphique Alertes
- `AlertsChart` : Area chart avec Recharts
- Filtres par période : 7j, 15j, 1m, 3m, 1an
- Tooltip personnalisé avec backdrop-blur
- Calcul de tendance vs période précédente

---

## [0.1.0] - 9 janvier 2026

### 🎨 UI/UX Initial
- Setup Next.js 15 + Tailwind v4 + shadcn/ui
- Sidebar collapsible avec navigation
- Logo "V" orange
- 4 pages : Dashboard, Alertes, Règles, Logs

### 📋 Dashboard
- 4 cartes stats (Critiques, Warnings, Infos, Taux résolution)
- Section alertes critiques
- Section alertes récentes

### 🚨 Alertes
- Liste avec filtres par sévérité
- Page détail `/alerts/[id]`
- Badges de sévérité colorés
- Cards avec timeline

### ⚙️ Règles
- 5 règles de détection configurées
- Toggle actif/inactif
- Seuils paramétrables

### 📝 Logs
- Tableau des événements système
- Filtres par type

### 🗃️ Mock Data
- Types TypeScript complets
- Données de démo réalistes
- 11 campagnes YouSchool

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 + App Router |
| UI | shadcn/ui + Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Theme | next-themes |
| Hébergement | Vercel |

---

## En attente (API Diabolocom)

### Infos collectées
- **Plateforme** : FR2
- **Base URL** : `https://public-fr2.engage.diabolocom.com`
- **Auth** : Header `Private-Token: {{token}}`

### Endpoints documentés
| Endpoint | Status |
|----------|--------|
| `GET /api/v1/voice/campaigns` | ✅ Prêt |
| `GET /api/v2/.../contacts/{{id}}` | ✅ Prêt |
| `GET /api/v2/.../contacts` (liste) | ❓ À trouver |
| Statistics | ❓ À documenter |

### Bloqué par
- [ ] Private Token à générer (Settings > Account > Public APIs)
- [ ] Endpoint liste contacts à confirmer
- [ ] Accès MySQL (décision N+1)

---

## Prochaines étapes

### V1 - MVP
- [ ] Tester connexion API Diabolocom
- [ ] Créer workflow n8n "Lead fantôme"
- [ ] Connecter vraies données (MySQL ou API)
- [ ] Favicon V orange

### V2 - Évolutions
- [ ] Stockage feedbacks en BDD (Supabase/MySQL)
- [ ] Notifications email sur alerte critique
- [ ] Export CSV des alertes
- [ ] Historique des règles déclenchées

---

## Liens utiles

- **Repo** : https://github.com/Iducournau/vigie-diabolocom
- **Vercel** : (URL à compléter)
- **Doc API Diabolocom** : https://developer.diabolocom.com

---

*Dernière mise à jour : 9 janvier 2026*
