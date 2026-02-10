# Changelog - 10 février 2026

## Réorganisation de la page de détail des alertes

### 🎯 Objectif
Améliorer la lisibilité et l'organisation de la page `/alerts/[id]` en restructurant les cartes pour une meilleure cohérence et clarté.

---

## 📋 Modifications apportées

### 1. Carte "Détails de l'alerte" (Sidebar)

#### Changements visuels
- ✅ **Badge de sévérité déplacé** : Aligné dans le header à droite du titre "Détails de l'alerte"
- ✅ **Règle avec tooltip** : Affichage formaté comme les autres lignes (label à gauche, valeur à droite)
  - Label "Règle" à gauche
  - Nom de la règle à droite
  - Icône `Info` avec tooltip affichant la description au survol
- ✅ **Section "Description" supprimée** : La description est maintenant accessible via le tooltip, réduisant l'encombrement visuel

#### Structure finale
```
Détails de l'alerte                    [Badge Critique]
├── Règle                              Lead Dormant ⓘ
├── ID Alerte                          a48a85e... [copier]
└── Date de détection                  10/02/2026 14:30
                                       il y a 2 heures
```

---

### 2. Nouvelle carte "Métriques du lead" (Sidebar)

#### Objectif
Séparer les informations système de l'alerte des données métier du lead pour une meilleure organisation.

#### Contenu
- Priorité
- Date création lead
- Temps sans appels
- Durée dernier appel
- Code de clôture
- Tentatives
- Date de retry

---

### 3. Carte "Informations du prospect" (Colonne principale)

#### Changements
- ✅ **Titre modifié** : "Informations du lead" → "Informations du prospect"
- ✅ **Champ "Dernier agent" supprimé**
- ✅ **Champ "Campagne" ajouté** : Affiche le nom traduit de la campagne
- ✅ **Label "Créé le" modifié** : "Fiche créée dans Diabolocom le"

#### Structure
```
Informations du prospect
├── Nom
├── Email
├── Téléphone
├── Campagne                           Métiers Animaliers
├── Créé par
├── Fiche créée dans Diabolocom le
├── Dernier appel
├── État
└── Raison exclusion (si applicable)
```

---

### 4. Carte "Informations Diabolocom" (Colonne principale)

#### Changements
- ✅ **Déplacée** : De la sidebar vers la colonne principale
- ✅ **Campaign ID** : Affiche l'ID brut (ex: `5612`) au lieu du nom traduit
- ✅ **Mise en grid** : Positionnée côte à côte avec "Historique des appels" (2 colonnes sur desktop, 1 sur mobile)

#### Contenu
- Contact ID (avec bouton copier)
- Agent
- Campaign ID (ID numérique brut)
- Provenance (avec icône)
- System ID (avec bouton copier)

#### Note technique
- **Contact ID** : ID métier du lead (campaign_contact_id), utilisé dans l'interface Diabolocom
- **System ID** : ID technique interne de l'API V2 Diabolocom (rarement utilisé)

---

### 5. Carte "Historique" (Sidebar)

#### Statut
- ✅ **Restaurée** après avoir été temporairement supprimée

#### Objectif
Suivre l'historique de traitement de l'alerte depuis sa détection jusqu'à sa résolution.

#### Contenu
- **Alerte détectée** : Date de détection avec timestamp relatif
- **Actions effectuées** : Timeline chronologique
  - Type d'action (Prise en charge, Résolue, Ignorée, Réouverte)
  - Utilisateur ayant effectué l'action
  - Timestamp relatif

---

## 🏗️ Structure finale de la page

### Colonne principale (gauche)
1. **Informations du prospect**
2. **Grid 2 colonnes** (responsive) :
   - Informations Diabolocom
   - Historique des appels
3. **Données brutes** (JSON)

### Sidebar (droite)
1. **Détails de l'alerte**
   - Badge sévérité + Règle avec tooltip
   - ID + Date de détection
2. **Métriques du lead**
   - Données contextuelles du lead
3. **Historique**
   - Timeline des actions de traitement

---

## 🔧 Modifications techniques

### Fichier modifié
- `app/alerts/[id]/page.tsx`

### Nouveaux imports
```typescript
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
```

### Interface étendue
```typescript
interface TransformedAlert extends Omit<Alert, 'data'> {
  data: AlertData;
  campaignId?: string; // Ajout pour stocker l'ID numérique de campagne
}
```

### Transformation des données
```typescript
const transformed: TransformedAlert = {
  // ...
  campaign: getCampaignName(data.campaign),
  campaignId: data.campaign, // Nouveau champ
  // ...
};
```

---

## 📊 Impact

### Lisibilité
- ✅ Meilleure séparation entre infos système et infos métier
- ✅ Réduction de l'encombrement visuel (tooltip au lieu de texte complet)
- ✅ Organisation plus logique des cartes

### UX
- ✅ Tooltip interactif pour la description des règles
- ✅ Grid responsive pour optimiser l'espace sur desktop
- ✅ Historique de traitement facilement accessible

### Maintenance
- ✅ Structure plus claire et modulaire
- ✅ Séparation des responsabilités entre les cartes

---

## 📝 Commit

```
refactor: réorganisation page détail alerte

- Ajout badge sévérité dans header "Détails de l'alerte"
- Règle avec tooltip pour afficher la description
- Séparation en 2 cartes: "Détails de l'alerte" et "Métriques du lead"
- Renommage "Informations du lead" → "Informations du prospect"
- Déplacement "Informations Diabolocom" vers colonne principale
- Affichage Campaign ID au lieu du nom
- Grid 2 colonnes: Informations Diabolocom + Historique des appels
- Restauration carte "Historique" dans sidebar pour suivi des actions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Commit hash** : `a48a85e`

---

## 🚀 Déploiement

- ✅ Pushed sur `main`
- ✅ Déploiement automatique sur Vercel : https://vigie-diabolocom.vercel.app

---

*Généré le 10 février 2026*
