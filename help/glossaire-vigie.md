# Glossaire BOGY / YouSchool ↔ Diabolocom

## Les personnes

| Concept | BOGY / YouSchool | Diabolocom | Notes |
|---------|-----------------|------------|-------|
| Quelqu'un qui remplit un formulaire sur youschool.fr | **Lead** | — | Existe uniquement dans BOGY tant qu'il n'est pas importé dans une campagne |
| Un lead importé dans une campagne d'appels | — | **Contact** | Une fiche technique rattachée à une campagne. Un même lead BOGY peut devenir plusieurs contacts Diabolocom s'il est importé dans plusieurs campagnes |
| Un agent du centre d'appels | **Conseiller Admissions** (= celui qui appelle les leads) | **User** / **Agent** | `user_login1` dans MySQL, `agentId` dans l'API |
| Un superviseur | **Superviseur** | **User** (profil superviseur) | Même entité API, droits différents |
| Quelqu'un inscrit à une formation | **Élève** / **Apprenant** | — | N'existe plus dans Diabolocom à ce stade |

## Le parcours

```
youschool.fr          BOGY              Diabolocom
───────────          ─────              ──────────
Visiteur
    │
    ▼
Formulaire ────────► Lead ────────────► Contact (dans une campagne)
                      │                     │
                      │                     ▼
                      │                 Appels (interactions)
                      │                     │
                      │                     ▼
                      │                 Wrapup (code de clôture)
                      │                     │
                      ◄─────────────────────┘
                      │               (retour info vers BOGY)
                      ▼
                    Élève (si inscrit)
```

## Les appels

| Concept | BOGY / YouSchool | Diabolocom (API) | MySQL (`call_logs_v3`) |
|---------|-----------------|-----------------|----------------------|
| Un appel | — | **Interaction** | Une ligne dans `call_logs_v3` |
| La qualification après un appel | — | **Wrapup** (code de clôture) | `wrapup_name` |
| Le type de qualification | — | **Wrapup status** : `tocall`, `argued`, `arguedpositive`, `nonargued`, `unreachable` | — |
| La durée de conversation | — | ❌ Non dispo via API Contacts | `talk_duration` |
| Le nombre de tentatives | — | `triesNumber` | `try_number` |

## Les regroupements

| Concept | BOGY / YouSchool | Diabolocom | Exemple |
|---------|-----------------|------------|---------|
| Un ensemble de formations regroupées | **Pôle** | **Campagne** | Pôle "Métiers de Bouche" = Campagne "CA - Métiers de Bouche" (CAP Cuisine + CAP Pâtissier + CAP Boulanger) |
| Un groupe d'agents | **Équipe** | **Groupe** (`groupId`) | — |
| Un ensemble de codes de clôture | — | **Dossier wrapup** (`wrapupFolderId`) | Dossier 62251 = clôtures Admissions |

## Les statuts d'un contact Diabolocom

| Wrapup status | Signification | Exemples de wrapups YouSchool |
|---------------|--------------|-------------------------------|
| `tocall` | À rappeler | Répondeur, RDV, Appel intermédiaire, Besoin de réflexion |
| `argued` | Perdu | Perdu, Pas intéressé, Raccroche |
| `arguedpositive` | Gagné (inscrit) | Gagné |
| `nonargued` | Hors cible | — |
| `unreachable` | Injoignable | Injoignable, Faux numéro |

## Les IDs — Attention aux confusions

| ID | Où | Ce que c'est |
|----|----|-------------|
| `id` | API Contacts V2 | ID **système** du contact (unique globalement) |
| `contactId` | API Contacts V2 | ID **métier** du contact (unique dans la campagne, pas globalement) |
| `campaign_contact_id` | MySQL | Correspond au `contactId` de l'API |
| `campaign_id` | MySQL + API | ID de la campagne (identique partout) |
| `wrapupId` | API | ID numérique du wrapup |
| `wrapup_name` | MySQL | Nom texte du wrapup (pas l'ID !) |
| `agentId` | API | ID numérique de l'agent |
| `user_login1` | MySQL | Login texte de l'agent (pas l'ID !) |

## Règle d'or

> **BOGY parle de leads. Diabolocom parle de contacts. La Vigie parle le langage Diabolocom.**
> 
> Dans tout le code, les prompts et la documentation Vigie : utiliser **contact**, jamais "lead".
