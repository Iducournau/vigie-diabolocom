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
| `campaign_contact_id` | ID du lead (clé principale) |
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
- `alerts` : Alertes générées (id, rule_id, lead_id, campaign, status, detected_at, alert_data)
- `alert_history` : Historique des actions sur les alertes
- `logs` : Logs de synchronisation n8n

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