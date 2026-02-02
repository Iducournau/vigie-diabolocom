# Guide du Thème - Vigie Diabolocom

> Référence rapide pour modifier les couleurs, styles et constantes de l'application.

---

## Structure des fichiers

```
lib/
├── theme.ts      # Couleurs sémantiques (sévérités, statuts, charts)
├── styles.ts     # Classes CSS réutilisables (cards, tables, badges)
├── constants.ts  # RULES_MAP, CAMPAIGNS_MAP, labels FR, formatage
└── types.ts      # Types TypeScript (Severity, AlertStatus, etc.)

app/
└── globals.css   # Variables CSS globales (--primary, --background, etc.)
```

---

## 1. Modifier les couleurs

### Couleurs principales (globals.css)

> **Thème actuel** : Vega Gray (shadcn) - Format OKLCH

```css
:root {
  /* Primary (gris foncé) */
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);

  /* Backgrounds */
  --background: oklch(1 0 0);           /* Blanc */
  --card: oklch(1 0 0);

  /* Borders */
  --border: oklch(0.928 0.006 264.531);

  /* Textes */
  --foreground: oklch(0.13 0.028 261.692);
  --muted-foreground: oklch(0.551 0.027 264.364);
}

.dark {
  --background: oklch(0.13 0.028 261.692);
  --card: oklch(0.21 0.034 264.665);
  --primary: oklch(0.928 0.006 264.531);
  --border: oklch(1 0 0 / 10%);
  /* ... */
}
```

### Couleurs de sévérité (lib/theme.ts)

```typescript
// Modifier les couleurs des alertes par sévérité
export const colors = {
  severity: {
    critical: {
      bg: "bg-red-100 dark:bg-red-900/50",
      text: "text-red-700 dark:text-red-400",
      hex: "#ef4444",  // Pour les charts
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-900/50",
      text: "text-amber-700 dark:text-amber-400",
      hex: "#f59e0b",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-700 dark:text-blue-400",
      hex: "#3b82f6",
    },
  },
  // ...
}
```

### Couleurs des statuts (lib/theme.ts)

```typescript
status: {
  new: {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-700 dark:text-blue-400",
  },
  acknowledged: {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-700 dark:text-amber-400",
  },
  resolved: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  dismissed: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
  },
}
```

### Couleurs des charts (lib/theme.ts)

```typescript
chart: {
  critical: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#10b981",
  series: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#3b82f6"],
}
```

---

## 2. Modifier les styles des composants

### Cards (lib/styles.ts)

```typescript
card: {
  base: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",
  flat: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800",
  withPadding: "... p-5",
}
```

> **Note** : Pas de shadow sur les cards (design flat).

**Utilisation :**
```tsx
import { styles } from "@/lib/styles";

<div className={styles.card.base}>...</div>
```

### Tables (lib/styles.ts)

```typescript
table: {
  wrapper: "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden",
  header: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
  headerCell: "text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
  row: "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
  cell: "px-5 py-4",
}
```

### Stats Cards (lib/styles.ts)

> **Règle UI** : Fond blanc + picto coloré. Seul le conteneur de l'icône porte la couleur de sévérité.

```typescript
export const statsCardVariants = {
  critical: {
    bg: "bg-white dark:bg-gray-900",           // Fond neutre
    border: "border-gray-200 dark:border-gray-800", // Bordure neutre
    icon: "text-red-600 bg-red-100 ...",       // Picto coloré
    value: "text-gray-900 dark:text-gray-100", // Valeur neutre
  },
  warning: { /* même structure */ },
  info: { /* même structure */ },
  success: { /* même structure */ },
  default: { /* même structure */ },
}
```

### Titres de page (lib/styles.ts)

```typescript
page: {
  title: "text-2xl font-semibold text-gray-900 dark:text-gray-100",
  subtitle: "text-gray-500 dark:text-gray-400 mt-1 text-sm",
}
```

### Banners d'info (lib/styles.ts)

```typescript
banner: {
  info: "bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4",
  warning: "bg-amber-50 dark:bg-amber-950/50 ...",
  error: "bg-red-50 dark:bg-red-950/50 ...",
  success: "bg-emerald-50 dark:bg-emerald-950/50 ...",
}
```

---

## 3. Modifier les règles de détection

### Fichier : `lib/constants.ts`

```typescript
export const RULES_MAP: Record<string, { name: string; severity: Severity; description: string }> = {
  "00097670-06b9-406a-97cc-c8d138448eff": {
    name: "Lead dormant",
    severity: "critical",
    description: "Lead prioritaire sans appel depuis plus de 72h",
  },
  // Ajouter une nouvelle règle :
  "nouvelle-uuid-ici": {
    name: "Nom de la règle",
    severity: "warning",  // critical | warning | info
    description: "Description de la règle",
  },
};
```

### Helper pour récupérer une règle

```typescript
import { getRuleInfo } from "@/lib/constants";

const rule = getRuleInfo("00097670-06b9-406a-97cc-c8d138448eff");
// { name: "Lead dormant", severity: "critical", description: "..." }
```

---

## 4. Modifier les campagnes

### Fichier : `lib/constants.ts`

```typescript
export const CAMPAIGNS_MAP: Record<string, string> = {
  "5612": "Métiers Animaliers",
  "5927": "Electricien",
  "5920": "CAP MIS",
  // Ajouter une campagne :
  "1234": "Nouvelle Formation",
};
```

### Helper

```typescript
import { getCampaignName } from "@/lib/constants";

getCampaignName("5612");  // "Métiers Animaliers"
getCampaignName("9999");  // "Campagne 9999" (fallback)
```

---

## 5. Modifier les labels français

### Fichier : `lib/constants.ts`

```typescript
// Labels des statuts
export const STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  open: "Nouvelle",
  acknowledged: "En cours",
  resolved: "Résolue",
  dismissed: "Ignorée",
  ignored: "Ignorée",
};

// Labels des sévérités
export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critique",
  warning: "Attention",
  info: "Info",
};

// Labels des actions (historique)
export const ACTION_LABELS: Record<string, string> = {
  acknowledged: "Prise en charge",
  resolved: "Marquée résolue",
  ignored: "Ignorée",
  reopened: "Réouverte",
};
```

---

## 6. Fonctions de formatage

### Fichier : `lib/constants.ts`

```typescript
// Temps relatif
formatTimeAgo(new Date());  // "À l'instant", "Il y a 5min", "Il y a 2h", "Il y a 3j"

// Date complète
formatDateTime("2024-01-15T14:30:00");  // "15/01/2024 14:30"

// Durée en secondes
formatDuration(125);  // "2m 5s"
formatDuration(45);   // "45s"

// Téléphone
formatPhone("33612345678");  // "+33 6 12 34 56 78"
```

---

## 7. Composants réutilisables

### SeverityBadge

```tsx
import { SeverityBadge } from "@/components/alert-badge";

<SeverityBadge severity="critical" />  // Badge rouge "Critique"
<SeverityBadge severity="warning" />   // Badge orange "Attention"
<SeverityBadge severity="info" />      // Badge bleu "Info"
```

### StatusBadge

```tsx
import { StatusBadge } from "@/components/alert-badge";

<StatusBadge status="new" />          // "Nouvelle"
<StatusBadge status="acknowledged" /> // "En cours"
<StatusBadge status="resolved" />     // "Résolue"
```

### StatsCard

```tsx
import { StatsCard } from "@/components/stats-card";
import { AlertTriangle } from "lucide-react";

<StatsCard
  title="Critiques"
  value={42}
  icon={AlertTriangle}
  variant="critical"  // critical | warning | info | success | default
/>
```

---

## 8. Types TypeScript

### Fichier : `lib/types.ts`

```typescript
export type Severity = "critical" | "warning" | "info";

export type AlertStatus = "new" | "acknowledged" | "resolved" | "ignored" | "dismissed";

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  status: AlertStatus;
  leadId: string;
  campaign: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  data: Record<string, unknown>;
}
```

---

## 9. Règles UI/UX

### Boutons - Tailles

| Contexte | Taille | Classe |
|----------|--------|--------|
| **Actions principales** (header, CTA) | `default` | `h-9` (36px) |
| **Filtres / Navigation** | `sm` | `h-8` (32px) |
| **Actions dans cards/modals** | `sm` | `h-8` (32px) |
| **Submit formulaire** | `default` | `h-9` (36px) |
| **Boutons icône seule** | `icon` / `icon-sm` | `size-9` / `size-8` |

### Boutons - Variantes

| Variante | Usage | Exemple |
|----------|-------|---------|
| `default` | Action principale, CTA | "Rafraîchir", "Ajouter", "Enregistrer" |
| `secondary` | Action secondaire | "Annuler", "Retour" |
| `outline` | Action tertiaire, filtres non actifs | Filtres désélectionnés |
| `ghost` | Action discrète, navigation | "Fermer", liens dans modals |
| `destructive` | Action dangereuse | "Supprimer", "Révoquer" |
| `link` | Lien textuel | "Voir plus", "En savoir plus" |

### Boutons - Bonnes pratiques

```tsx
// Action principale dans header
<Button onClick={handleAction}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Rafraîchir
</Button>

// Filtres (toggle actif/inactif)
<Button
  variant={isActive ? "default" : "outline"}
  size="sm"
>
  Filtre
</Button>

// Actions dans modal
<div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Annuler</Button>
  <Button onClick={onSubmit}>Confirmer</Button>
</div>

// Action dangereuse
<Button variant="destructive" size="sm">
  <Trash2 className="h-4 w-4 mr-2" />
  Supprimer
</Button>
```

### Espacement et layout

| Élément | Espacement |
|---------|------------|
| Gap entre boutons | `gap-2` (8px) ou `gap-3` (12px) |
| Padding sections | `p-4` à `p-6` |
| Margin entre sections | `space-y-6` |
| Padding cards | `p-4` ou `p-5` |

### Hiérarchie visuelle

1. **Une seule action principale** par section (bouton `default`)
2. **Actions secondaires** en `outline` ou `ghost`
3. **Pas de couleurs custom** sur les boutons (utiliser les variantes)
4. **Icônes à gauche** du texte pour les actions, **à droite** pour navigation

### Couleurs de sévérité

| Principe | Application |
|----------|-------------|
| **Fond des cards** | Toujours blanc (neutre) |
| **Bordures** | Toujours grises (neutres) |
| **Pictos/Icônes** | Couleur de sévérité + fond coloré arrondi |
| **Valeurs/Textes** | Gris foncé (neutre) |
| **Badges** | Fond coloré + texte coloré |
| **Dots/Indicateurs** | Couleur pleine de sévérité |

> La couleur de sévérité est portée par les **éléments ponctuels** (pictos, badges, dots), pas par les **conteneurs** (cards, sections).

### Design flat

- **Pas de shadow** sur les cards, boutons, inputs, tables
- **Shadows autorisées** uniquement sur éléments flottants (dropdowns, modals, tooltips)

---

## Checklist rapide

| Je veux modifier... | Fichier à éditer |
|---------------------|------------------|
| Couleur orange principale | `app/globals.css` → `--primary` |
| Couleurs de sévérité (badges) | `lib/theme.ts` → `colors.severity` |
| Couleurs de statut (badges) | `lib/theme.ts` → `colors.status` |
| Couleurs des graphiques | `lib/theme.ts` → `colors.chart` |
| Style des cards (shadow, border) | `lib/styles.ts` → `styles.card` |
| Style des tables | `lib/styles.ts` → `styles.table` |
| Style des stats cards | `lib/styles.ts` → `statsCardVariants` |
| Ajouter une règle | `lib/constants.ts` → `RULES_MAP` |
| Ajouter une campagne | `lib/constants.ts` → `CAMPAIGNS_MAP` |
| Labels français | `lib/constants.ts` → `*_LABELS` |
| Formatage dates/durées | `lib/constants.ts` → `format*()` |

---

*Dernière mise à jour : 27 Janvier 2026*
