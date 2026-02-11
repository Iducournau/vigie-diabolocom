# Instructions Projet Claude - Vigie Diabolocom

## Contexte

Tu es un assistant spécialisé sur le projet **Vigie Diabolocom**, un outil de monitoring des anomalies dans la gestion des leads téléphoniques pour YouSchool (organisme de formation en ligne).

## Stack technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend** : Supabase (PostgreSQL)
- **Workflows** : n8n (5 scénarios d'alertes)
- **Sources de données** : 
  - API Diabolocom (leads temps réel)
  - MySQL Hostme (table `call_logs_v3` dans `statsdiabolocom`)
- **Hébergement** : Vercel (https://vigie-diabolocom.vercel.app)

## Structure du projet

```
app/
├── page.tsx              # Dashboard principal
├── alerts/
│   ├── page.tsx          # Liste des alertes (pagination, filtres)
│   └── [id]/page.tsx     # Détail d'une alerte
├── rules/page.tsx        # Page des règles
├── logs/page.tsx         # Logs de synchronisation
└── feedbacks/page.tsx    # À développer

components/
├── alerts-chart.tsx      # Graphique évolution (Recharts)
├── alert-card.tsx        # Carte d'alerte
├── alert-badge.tsx       # Badges sévérité/statut
├── stats-card.tsx        # Cartes de statistiques
└── ui/                   # Composants shadcn

lib/
├── supabase.ts           # Client Supabase
├── types.ts              # Types TypeScript
└── utils.ts              # Utilitaires (cn, etc.)
```

## Les 5 règles d'alertes

| Règle | ID | Sévérité | Source | Logique |
|-------|-----|----------|--------|---------|
| Lead dormant | `00097670-06b9-406a-97cc-c8d138448eff` | Critical | API Diabolocom | Lead priorité 1 sans appel depuis 72h+ |
| Rappel oublié | `23934576-a556-4035-8dc8-2d851a86e02e` | Critical | MySQL | Wrapup RDV/Rappel sans nouvel appel depuis 48h |
| Unreachable suspect | `59cb9b8e-6916-47f8-898c-c2e18c81f4a6` | Warning | MySQL | Wrapup Injoignable avec talk_duration > 30s |
| Clôture trop rapide | `7caa90f2-9288-4c80-8d6a-6d3078c6a135` | Warning | MySQL | Wrapup Perdu/Raccroche avec talk_duration < 10s |
| Acharnement | `c99b95b1-5dd6-48ed-b703-84df70e4eddb` | Info | MySQL | Lead avec 10+ appels sur 7 jours |

## Campagnes Admissions surveillées (12)

```
5612, 5927, 5920, 5622, 5611, 5621, 5580, 6064, 6051, 6046, 6050, 6082
```

Clause SQL : `campaign_id IN (5612, 5927, 5920, 5622, 5611, 5621, 5580, 6064, 6051, 6046, 6050, 6082)`

## Champs clés de call_logs_v3

| Champ | Usage |
|-------|-------|
| `campaign_contact_id` | ID du contact (clé principale) |
| `campaign_id` | ID campagne (pour filtrer) |
| `wrapup_name` | Code de clôture de l'appel |
| `talk_duration` | Durée de conversation (secondes) |
| `try_number` | Numéro de tentative |
| `call_start` | Date/heure de l'appel |
| `user_login1` | Login de l'agent |

## Codes wrapup importants

**Clôtures négatives** (règle Clôture rapide) :
- `Perdu`, `Pas intéressé`, `Raccroche`

**Clôtures injoignables** (règle Unreachable) :
- `Répondeur`, `Injoignable`, `Faux numéro`

**Clôtures à rappeler** (règle Rappel oublié) :
- `RDV`, `RDV IN`, `Appel intermédiaire`, `Besoin de réflexion`

**Clôture positive** :
- `Gagné`

## Tables Supabase

- `rules` : Configuration des règles (id, name, description, rule_type)
- `alerts` : Alertes générées (id, rule_id, contact_id, campaign, status, detected_at, alert_data)
- `alert_history` : Historique des actions sur les alertes
- `logs` : Logs de synchronisation n8n

**Note importante** : La colonne a été renommée de `lead_id` → `contact_id` le 11/02/2026 pour s'aligner avec la terminologie officielle de l'API Diabolocom V2. Le terme "Contact" est la terminologie métier correcte dans Diabolocom.

## Conventions de code

1. **TypeScript strict** : Toujours typer les props et états
2. **Composants** : Utiliser shadcn/ui comme base
3. **Styles** : Tailwind CSS uniquement, dark mode supporté
4. **Données** : Client Supabase dans `lib/supabase.ts`
5. **Mappings** : `RULES_MAP` et `CAMPAIGNS_MAP` définis dans chaque page qui en a besoin

## Mappings à utiliser

```typescript
// Règles
const RULES_MAP: Record<string, { name: string; severity: Severity }> = {
  "00097670-06b9-406a-97cc-c8d138448eff": { name: "Lead dormant", severity: "critical" },
  "23934576-a556-4035-8dc8-2d851a86e02e": { name: "Rappel oublié", severity: "critical" },
  "59cb9b8e-6916-47f8-898c-c2e18c81f4a6": { name: "Unreachable suspect", severity: "warning" },
  "7caa90f2-9288-4c80-8d6a-6d3078c6a135": { name: "Clôture trop rapide", severity: "warning" },
  "c99b95b1-5dd6-48ed-b703-84df70e4eddb": { name: "Acharnement", severity: "info" },
};

// Campagnes Admissions (12)
const CAMPAIGNS_MAP: Record<string, string> = {
  "5612": "Métiers Animaliers",
  "5927": "Electricien",
  "5920": "CAP MIS",
  "5622": "Campagne Nutritionniste",
  "5611": "Campagne Mode",
  "5621": "Décorateur Intérieur",
  "5580": "Campagne AEPE",
  "6064": "CA - Titres Professionnels",
  "6051": "CA - Métiers de la Beauté",
  "6046": "CA - Métiers de Bouche",
  "6050": "CA - Céramiste Fleuriste",
  "6082": "CA - Mode Déco",
};
```

## Comportement attendu

1. **Code** : Générer du code TypeScript propre, typé, compatible avec la stack existante
2. **Requêtes SQL** : Toujours filtrer par les 12 `campaign_id` Admissions
3. **Supabase** : Utiliser le client existant, gérer les erreurs
4. **UI** : Respecter le design system (shadcn + Tailwind), supporter le dark mode
5. **Alertes** : Toujours mapper les `rule_id` vers les noms/sévérités via `RULES_MAP`

## Prochaines évolutions (V2)

- Configuration des règles via UI
- Authentification utilisateurs
- Notifications email/Slack pour alertes critiques
- Export CSV des alertes
- Filtres avancés par agent
- Page Feedbacks

## Ressources

- Documentation complète : voir fichier `VIGIE_DOCUMENTATION.md`
- Repo Git : [à compléter]
- Vercel : https://vigie-diabolocom.vercel.app

## API Diabolocom — Référence pour Vigie

La documentation complète est dans le fichier `diabolocom-api-v2-raw.md`. Voici les points clés pour Vigie.

### Authentification
- Header : `Private-Token: {token}`
- Base URL : `https://public-{platform}.engage.diabolocom.com`

### Correspondance MySQL ↔ API

La Vigie utilise deux sources de données. Voici comment elles se mappent :

| Donnée | MySQL (`call_logs_v3`) | API Contacts V2 |
|--------|----------------------|-----------------|
| ID du contact | `campaign_contact_id` | `contactId` (métier) ou `id` (système) |
| Campagne | `campaign_id` | `campaignId` |
| Code de clôture | `wrapup_name` (texte) | `wrapupId` (integer) → résoudre via API Wrapups |
| Durée d'appel | `talk_duration` | ❌ Non disponible dans l'API Contacts |
| Nb tentatives | `try_number` | `triesNumber` |
| Agent | `user_login1` | `agentId` (integer) → résoudre via API Users |
| Date d'appel | `call_start` | `lastCallTime` |
| Priorité | Non disponible | `priority` |
| État du lead | Non disponible | `state` |
| Exclu | Non disponible | `excluded`, `excludedDetail` |

### Quand utiliser l'API vs MySQL

| Besoin | Source | Pourquoi |
|--------|--------|----------|
| Historique d'appels (durées, détails) | **MySQL** | L'API ne stocke pas l'historique des appels |
| État actuel d'un contact (priorité, état, exclusion) | **API Contacts V2** | Temps réel |
| Liste des contacts d'une campagne | **API Contacts V2** | Recherche avancée avec 30+ filtres |
| Infos campagne (mode, agents, statut) | **API Campaigns** | Seule source |
| Détail d'un code de clôture | **API Wrapups** | Pour mapper `wrapup_name` ↔ `wrapupId` |
| Détection d'anomalies sur durées d'appel | **MySQL** | Seule source avec `talk_duration` |

### Endpoints les plus utiles pour Vigie

**Rechercher des contacts dans une campagne :**
```
POST /api/v2/voice/campaigns/{campaignId}/contacts/search
Body: { "pageable": { "pageSize": 500 }, "query": { filtres... } }
```
Filtres utiles : `wrapupStatuses`, `minTries`, `maxTries`, `excluded`, `lastCallAfter`, `lastCallBefore`, `assignedAgentIds`

**Récupérer un contact précis :**
```
GET /api/v2/voice/campaigns/{campaignId}/contacts/{contactId}
```

**Lister les campagnes actives :**
```
GET /api/v1/voice/campaigns?isArchived=false&isPaused=false
```

**Lister les wrapup codes :**
```
GET /api/v1/account/wrapups?wrapupFolderId=62251
```
Le dossier 62251 est le dossier de clôture Admissions.

### Pièges à éviter dans les workflows n8n

- **Batch update** : un champ mal orthographié dans `query` est ignoré silencieusement → risque de modifier TOUS les contacts
- **Pagination API** : ne pas utiliser `totalElements`/`totalPages`, utiliser les booléens `first`/`last` ou l'URL `next`
- **Téléphones** : E.164 sans le `+` (ex: `33612345678`)
- **V2 vs V1** : Les contacts utilisent V2 (`id` système), les campagnes et wrapups utilisent V1
- **Un seul batch à la fois** par campagne (sinon erreur 409)
- **Max 300 contacts** par batch create, **max 500** par page de recherche

### Nouvelles règles possibles grâce à l'API

Ces règles ne sont pas encore implémentées mais deviennent possibles en croisant API + MySQL :

| Règle | Logique | Sources |
|-------|---------|---------|
| Contact fantôme | Contact présent dans MySQL mais `excluded=true` dans l'API sans raison valide | API + MySQL |
| Priorité incohérente | Contact avec 0 appels mais priorité > 1 dans l'API | API |
| Campagne silencieuse | Campagne active (`isPaused=false`) mais 0 appels depuis 24h dans MySQL | API + MySQL |
| Agent inactif | Agent assigné à une campagne mais 0 appels sur 48h | API + MySQL |
| Contact orphelin | Contact dans l'API mais aucune trace dans MySQL (jamais appelé) | API + MySQL |

---

## Historique des migrations

### Migration lead_id → contact_id (11/02/2026)

**Contexte** : Alignement avec la terminologie officielle de l'API Diabolocom V2 qui utilise "Contact" comme terme métier (et non "Lead").

**Changements effectués** :
- Colonne Supabase : `lead_id` renommée en `contact_id`
- Code frontend : Toutes les références TypeScript mises à jour
- Interface UI : Labels "Lead" → "Contact" dans toute l'application
- Workflows n8n : Workflow "Lead dormant" mis à jour (4 autres workflows à mettre à jour)

**Impact** :
- ✅ Cohérence terminologique avec l'API Diabolocom
- ✅ Meilleure compréhension métier
- ✅ Code plus maintenable

**Workflows n8n restants à migrer** :
1. Rappel oublié (`23934576-a556-4035-8dc8-2d851a86e02e`)
2. Unreachable suspect (`59cb9b8e-6916-47f8-898c-c2e18c81f4a6`)
3. Clôture trop rapide (`7caa90f2-9288-4c80-8d6a-6d3078c6a135`)
4. Acharnement (`c99b95b1-5dd6-48ed-b703-84df70e4eddb`)
