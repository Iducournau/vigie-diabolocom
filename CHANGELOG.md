# Changelog - Vigie Diabolocom

## [1.1.0] - 2026-02-03

### Nouvelles fonctionnalités

- **Webhook n8n** : Le bouton "Rafraîchir" (Dashboard + Alertes) appelle désormais le webhook n8n pour synchroniser les alertes en temps réel
  - URL : `https://n8n.vps.youschool.fr/webhook/refresh-alerts`
  - Toast de succès/erreur après l'appel

- **Actions de masse** : Les boutons "Résoudre" et "Ignorer" dans la page Alertes sont maintenant fonctionnels
  - Sélection multiple via checkboxes
  - Actions groupées avec feedback toast

- **Actions menu contextuel** : Les actions "Résoudre" et "Ignorer" du menu dropdown fonctionnent

### Corrections de bugs

- **URL Diabolocom** : Correction du lien vers le lead (`/desk/contacts/` → `/desk/campaign-contacts/`)
- **Agent non affiché** : Le nom de l'agent (`user_login1`) apparaît maintenant dans le tableau des alertes
- **RULES_MAP cohérent** : La page détail utilise maintenant les 8 règles centralisées (au lieu de 5)
- **CAMPAIGNS_MAP cohérent** : La page détail utilise les 12 campagnes Admissions officielles
- **Feedback bouton Rafraîchir** : Affiche "Chargement..." avec spinner pendant le refresh

### Améliorations UI

- **Bordures table** : Alignées avec les règles UI (`gray-100` pour les lignes, `gray-200` pour le header)
- **Lien Logs grisé** : Le lien /logs est visible mais non cliquable avec badge "(V2)"
- **Toast sur toggle règles** : Feedback visuel lors de l'activation/désactivation d'une règle

### Refactoring

- **Centralisation du code** : Suppression des duplications dans `/alerts/[id]/page.tsx`
  - Import de `RULES_MAP`, `CAMPAIGNS_MAP` depuis `lib/constants.ts`
  - Import des fonctions utilitaires (`formatTimeAgo`, `formatDateTime`, `mapStatus`, etc.)
- **Gestion d'erreurs** : Ajout de try/catch et vérifications d'erreur Supabase

---

## [1.0.0] - 2026-01-27

### Release initiale

- Dashboard avec statistiques et graphiques
- Page Alertes avec DataTable (filtres, pagination, tri)
- Page Règles avec toggle activation
- Page Détail alerte avec historique
- Thème centralisé (`lib/theme.ts`, `lib/styles.ts`)
- 8 règles de détection configurées
- 12 campagnes Admissions surveillées
