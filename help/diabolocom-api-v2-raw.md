# Diabolocom API - Documentation extraite

## Source
Extrait de https://developer.diabolocom.com/ par copier-coller manuel (février 2025)

---

# CONTACTS V2

## Data structure for contacts

Contacts are represented as JSON objects with the following properties.

| Name | Type | Read-only | Description |
|------|------|-----------|-------------|
| id | Integer | Yes | The system ID of the contact. Example: 123456 |
| campaignId | Integer | Yes | The ID of the campaign where to find this contact. Example: 1111 |
| contactId | Integer | Yes | The ID of the contact created in the context of the campaign. Example: 3974 |
| state | String | Yes | The current state of the contact. Possible values: processing_not_in_progress, processing_in_progress. Example: "processing_not_in_progress" |
| comment | String | No | Content of the last wrapup comment. If not set, null. |
| excluded | Boolean | No | Contact exclude state. Example: false |
| excludedDetail | String | Yes | Reason for exclusion. Possible values: noValidPhone, duplicate, bloctel, manualByAgent, manual, excludedByAdmin, tooShort, tooLong. Null if not excluded. |
| priority | Integer | No | Priority of the contact in the campaign. Default = campaign default priority. Example: 10 |
| retryDate | String | No | Date-time scheduled for next call. ISO 8601. Null if not set. Example: "2020-12-23T15:00:00Z" |
| triesNumber | Integer | No | Current number of call attempts (>=0). Can't be null. Example: 2 |
| wrapupId | Integer | No | ID of the last wrapup used. Null if not set. Example: 4563 |
| agentId | Integer | No | ID of the last agent who handled this contact. Null if not set. Example: 543 |
| assignedAgentId | Integer | No | ID of agent assigned to handle this contact. Must be assigned to the campaign. Null if not set. Example: 276 |
| assignedGroupId | Integer | No | ID of group assigned to handle this contact. Must be assigned to the campaign. Null if not set. Example: 1234 |
| assignedAgentExpirationTime | String | No | Expiration datetime for agent assignment. ISO 8601. (Will be available soon) |
| assignedGroupExpirationTime | String | No | Expiration datetime for group assignment. ISO 8601. (Will be available soon) |
| duplicateContactIds | Array of integers | Yes | List of contacts ids that are duplicated by this contact. Example: [] |
| minCallingDateTime | String | No | Minimum calling datetime (production start). ISO 8601. Null if not set. |
| maxCallingDateTime | String | No | Maximum calling datetime (production end). ISO 8601. Null if not set. |
| lastCallTime | String | Yes | Datetime of last call. ISO 8601. Null if not set. |
| lastAttemptTime | String | Yes | Datetime of last attempt (possibly no call made). ISO 8601. Null if not set. |
| lastAgentId | Integer | Yes | ID of the last agent that had an interaction with that contact. (Will be available soon) |
| lastCallerType | String | Yes | Who initiated the call: contact, agent, system. |
| createdBy | String | Yes | Login of the user who created the contact. |
| createdAt | String | Yes | Creation datetime. ISO 8601. |
| lastUpdatedBy | String | Yes | Login of the user who last updated the contact. |
| lastUpdatedAt | String | Yes | Last modification datetime. ISO 8601. |
| contactCardDisplayNumber | String | No | Phone number displayed to contact (E.164). If null, campaign settings apply. French mobile numbers cannot be used. |
| currentPhoneName | String | No | Name of the phone field that will be called next. Example: "phone1" |
| calendarId | Integer | No | ID of calendar used for this contact. Null if not set. Example: 1191 |
| customFields | Object | No | JSON object with custom fields as key:value. Values are strings only. Call script fields also placed here. |
| phones | Object | No | JSON object with phone fields as key:value. (E.164 format) |
| purgeDate | String | Yes | Date when purge will occur for this contact. Example: "2024-12-01" |
| region | Integer | No | Option to choose specific displayed number (following campaign mapping). Example: 123 |

---

## GET Get contact by Id

**Endpoint:** `GET /api/v2/voice/campaigns/{{campaignId}}/contacts/{{contactId}}`

**Description:** Show contact information.

**Request body:** No request body allowed.

**Response body:** Returns contact details in JSON. See data structure above.

**Status codes:**

| Behavior | HTTP Code | Response |
|----------|-----------|----------|
| Valid request | 200 | Contact information |
| No/wrong/expired token | 401 | error.unauthorized |
| Wrong HTTP method | 405 | error.method.not.allowed |
| Wrong campaign ID | 404 | error.campaign.not.exists |
| Wrong contact ID | 404 | error.contact.not.exists |

**Example Response:**
```json
{
    "id": 123456,
    "campaignId": 1111,
    "contactId": 23,
    "state": "processing_not_in_progress",
    "comment": null,
    "excluded": false,
    "excludedDetail": null,
    "priority": 10,
    "retryDate": null,
    "triesNumber": 0,
    "wrapupId": null,
    "agentId": null,
    "agentName": null,
    "assignedAgentId": null,
    "assignedGroupId": null,
    "assignedAgentExpirationTime": "2022-11-01T16:52:54Z",
    "assignedGroupExpirationTime": "2022-11-01T16:52:54Z",
    "duplicateContactIds": [],
    "minCallingDateTime": null,
    "maxCallingDateTime": null,
    "lastCallTime": null,
    "lastAttemptTime": null,
    "lastAgentId": 12345,
    "lastCallerType": "agent",
    "createdBy": "admin1",
    "createdAt": "2022-11-01T16:52:54Z",
    "lastUpdatedBy": "admin1",
    "lastUpdatedAt": "2022-11-01T16:52:54Z",
    "contactCardDisplayNumber": null,
    "region": 123,
    "displayedNumberIds": ["33123456789"],
    "currentPhoneName": "Telephone_1",
    "calendarId": 42,
    "customFields": {
        "First_Name": "Louis",
        "Last_Name": "Dupont",
        "Category": "Gold",
        "Telephone_1": "33123456789",
        "Telephone_2": "33612345678",
        "Email_Address": "louis.dupont@gmail.com"
    },
    "phones": {
        "Telephone_1": "33123456789",
        "Telephone_2": "33612345678"
    },
    "purgeDate": "2024-12-01"
}
```

---


## POST Create a contact

**Endpoint:** `POST /api/v2/voice/campaigns/{{campaignId}}/contacts?priorityMode=false`

**Description:** Create a new contact in the campaign.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priorityMode | Boolean | OPTIONAL | Whether New contact priority mode is taken into account from campaign setup. If true, applies Relative or Absolute mode logic. If false, always sets default campaign priority (10). Default: false. If priority set in body, all contacts get that priority. |

**Request body:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priority | Integer | OPTIONAL | Priority of the contact. Default = campaign default. Example: 13 |
| excluded | Boolean | OPTIONAL | Whether contact is excluded. Default: false. |
| retryDate | String | OPTIONAL | Next call datetime. ISO 8601. |
| triesNumber | Integer | OPTIONAL | Current number of tries. Default: 0. |
| comment | String | OPTIONAL | Wrapup comment. Default: null. |
| wrapupId | Integer | OPTIONAL | Wrapup ID at creation. Default: null. |
| agentId | Integer | OPTIONAL | ID of last agent that handled a call. Default: null. |
| assignedAgentId | Integer | OPTIONAL | ID of agent assigned. Must be assigned to campaign. |
| assignedGroupId | Integer | OPTIONAL | ID of group assigned. Must be assigned to campaign. |
| assignedAgentExpirationTime | String | OPTIONAL | Expiration for agent assignment. ISO 8601. (Soon) |
| assignedGroupExpirationTime | String | OPTIONAL | Expiration for group assignment. ISO 8601. (Soon) |
| minCallingDateTime | String | OPTIONAL | Minimum calling datetime (production start). ISO 8601. |
| maxCallingDateTime | String | OPTIONAL | Maximum calling datetime (production end). ISO 8601. |
| contactCardDisplayNumber | String | OPTIONAL | Phone displayed to contact (E.164). WARNING: non-validated numbers = 400 error. |
| calendarId | Integer | OPTIONAL | Calendar ID for contact timeslots. |
| customFields | Object | **MANDATORY** | JSON object with custom fields as key:value. All strings. Phones in E.164. |
| region | Integer | OPTIONAL | Specific displayed number mapping. Example: 123 |

**Status codes:** 201 (created), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (invalid params or invalid displayed phone number)

---


## PUT Update contact by Id

**Endpoint:** `PUT /api/v2/voice/campaigns/{{campaignId}}/contacts/{{contactId}}`

**Description:** Update contact information. At least one field needed in request body. Only non-read-only fields can be updated.

**Important:** If you omit a custom field in the PUT request, its value remains unchanged.

**Request body:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priority | Integer | OPTIONAL | Priority. Example: 13 |
| excluded | Boolean | OPTIONAL | Exclude state. Default: false. |
| retryDate | String | OPTIONAL | Next call datetime. ISO 8601. |
| triesNumber | Integer | OPTIONAL | Number of tries. Default: 0. |
| comment | String | OPTIONAL | Last wrapup comment. |
| wrapupId | Integer | OPTIONAL | Last wrapup ID. |
| agentId | Integer | OPTIONAL | Last agent who handled contact. |
| assignedAgentId | Integer | OPTIONAL | Assigned agent. Must be assigned to campaign. |
| assignedGroupId | Integer | OPTIONAL | Assigned group. Must be assigned to campaign. |
| assignedAgentExpirationTime | String | OPTIONAL | Agent assignment expiration. ISO 8601. (Soon) |
| assignedGroupExpirationTime | String | OPTIONAL | Group assignment expiration. ISO 8601. (Soon) |
| minCallingDateTime | String | OPTIONAL | Min calling datetime (production start). ISO 8601. |
| maxCallingDateTime | String | OPTIONAL | Max calling datetime (production end). ISO 8601. |
| contactCardDisplayNumber | String | OPTIONAL | Displayed phone (E.164). WARNING: non-validated = 400 error. |
| calendarId | Integer | OPTIONAL | Calendar ID for timeslots. |
| regionalizationCode | Integer | OPTIONAL | Region code for regionalized displayed phone. (Soon) |
| customFields | Object | OPTIONAL | JSON key:value. Omitted fields remain unchanged. Phones in E.164. |
| region | Integer | OPTIONAL | Specific displayed number mapping. |

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign/contact not found), 405 (wrong method), 400 (invalid displayed phone number)

---


## DELETE Delete contact by Id

**Endpoint:** `DELETE /api/v2/voice/campaigns/{{campaignId}}/contacts/{{contactId}}`

**Description:** Remove a specific contact from the campaign. Permanent, can't be undone. Contacts in archived or deleted campaigns cannot be deleted.

**Request body:** None.

**Response:** 204 No Content (empty body).

**Status codes:** 204 (deleted), 401 (unauthorized), 404 (campaign/contact not found), 405 (wrong method), 409 (contact is on an ongoing call)

---


## POST Search contacts

**Endpoint:** `POST /api/v2/voice/campaigns/{{campaignId}}/contacts/search`

**Description:** Advanced search API to retrieve contacts based on filters. POST method with JSON body containing pageable part and query part.

### Pageable part

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| page | Integer | OPTIONAL | Results page to retrieve. Example: 2 |
| pageSize | Integer | OPTIONAL | Records per page. Max 500, default 10. |

### Query part (filters)

| Name | Type | Presence | Null as filter | Description |
|------|------|----------|----------------|-------------|
| assignedAgentIds | Array of int | OPTIONAL | Yes | Agent IDs assigned to contact. Max 500. |
| assignedGroupIds | Array of int | OPTIONAL | Yes | Group IDs assigned to contact. Max 500. |
| assignedAgentExpirationTimeBefore | String | OPTIONAL | No | Agent assignment expiration before date. ISO 8601. (Soon) |
| assignedAgentExpirationTimeAfter | String | OPTIONAL | No | Agent assignment expiration after date. ISO 8601. (Soon) |
| assignedGroupExpirationTimeBefore | String | OPTIONAL | No | Group assignment expiration before date. ISO 8601. (Soon) |
| assignedGroupExpirationTimeAfter | String | OPTIONAL | No | Group assignment expiration after date. ISO 8601. (Soon) |
| contactIds | Array of int | OPTIONAL | No | List of contact IDs. Example: [6,89,975] |
| createdAfter | String | OPTIONAL | No | Contact created after. ISO 8601. |
| createdBefore | String | OPTIONAL | No | Contact created before. ISO 8601. |
| customFieldConditions | Array of Objects | OPTIONAL | Yes (only for eq/notEq) | Filter on custom fields. Contains: customFieldName, condition (eq, notEq, lt, lte, gt, gte, startsWith, endsWith, notStartswith, notEndswith, contains, like, notContains), value. Phones in E.164. Max 500. |
| excluded | Boolean | OPTIONAL | No | Whether contact is excluded. |
| excludedCause | String | OPTIONAL | No | Reason: noValidPhone, duplicate, bloctel, manualByAgent, manual, excludedByAdmin. |
| agentIds | Array of int | OPTIONAL | Yes | Agent ID who handled contact last. Max 500. |
| lastCallAfter | String | OPTIONAL | No | Last call after. ISO 8601. |
| lastCallBefore | String | OPTIONAL | No | Last call before. ISO 8601. |
| lastAgentIds | Array of int | OPTIONAL | Yes | Last agent that interacted. Max 500. (Soon) |
| lastCallerType | String | OPTIONAL | Yes | Who initiated call: contact, agent, system. |
| lastWrapupIds | Array of int | OPTIONAL | Yes | Last wrapup IDs. Max 500. |
| maxPriority | Integer | OPTIONAL | No | Maximum priority. |
| maxTries | Integer | OPTIONAL | No | Maximum tries. |
| minPriority | Integer | OPTIONAL | No | Minimum priority. |
| minTries | Integer | OPTIONAL | No | Minimum tries. |
| phones | Array of Strings | OPTIONAL | No | Phone numbers to search (E.164). |
| minCallingDateTimeBefore | String | OPTIONAL | No | Production start before date. ISO 8601. |
| minCallingDateTimeAfter | String | OPTIONAL | No | Production start after date. ISO 8601. |
| maxCallingDateTimeBefore | String | OPTIONAL | No | Production end before date. ISO 8601. |
| maxCallingDateTimeAfter | String | OPTIONAL | No | Production end after date. ISO 8601. |
| retryAfter | String | OPTIONAL | No | Callback scheduled after. ISO 8601. |
| retryBefore | String | OPTIONAL | No | Callback scheduled before. ISO 8601. |
| retryIsNull | Boolean | OPTIONAL | No | If true, only contacts without retry date. |
| updateAfter | String | OPTIONAL | No | Updated after. ISO 8601. |
| updateBefore | String | OPTIONAL | No | Updated before. ISO 8601. |
| wrapupStatuses | Array of Strings | OPTIONAL | Yes | Last wrapup status: new_contact, argued, arguedpositive, nonargued, tocall, unreachable, canceled. Max 500. |
| regions | Array of int | OPTIONAL | Yes | Region IDs for displayed number mapping. Max 500. |

### Response body structure

| Field | Type | Description |
|-------|------|-------------|
| content | Array | Array of contact objects |
| totalElements | Integer | Total contacts found (approx - do NOT use for pagination) |
| totalPages | Integer | Total pages (approx - do NOT use for pagination) |
| last | Boolean | Is this the last page? |
| first | Boolean | Is this the first page? |
| number | Integer | Current page number |
| empty | Boolean | Is result empty? |
| numberOfElements | Integer | Contacts on current page |

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method)

**Example Request Body:**
```json
{
    "pageable": { "pageSize": 100 },
    "query": {
        "phones": ["33679348347"],
        "customFieldConditions": [
            { "condition": "eq", "customFieldName": "Categorie", "value": "Silver" }
        ]
    }
}
```

---


## POST Search contacts by phone

**Endpoint:** `POST /api/v2/voice/campaigns/contacts/search/by-phone?fromId=1234&limit=100`

**Description:** Retrieve contacts across MULTIPLE campaigns based on phone numbers.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| fromId | Integer | OPTIONAL | Start from specific system ID (field `id`, not `contactId`). Default: first record. |
| limit | Integer | OPTIONAL | Records per page. Max 100. |

**Pagination:** Use `next` URL from response. Stop when `next` is `null`. Records sorted by ID.

**Request body:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| campaignIds | Array of Integers | OPTIONAL | Campaign IDs to narrow search. If null, searches all campaigns. |
| phones | Array of Strings | OPTIONAL | Phone numbers to search (E.164). |

**Response body:**

| Field | Type | Description |
|-------|------|-------------|
| contacts | Array | Contact objects |
| count | Integer | Number of elements in current page |
| next | String/null | URL for next page. null = last page. |

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method)

---


## GET Search contacts by dates

**Endpoint:** `GET /api/v2/voice/campaigns/{{campaignId}}/contacts/search/by-date`

**Description:** Retrieve contacts in a campaign based on a datetime field.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| fromId | Integer | OPTIONAL | Start from specific system ID. Default: first record. |
| fromDate | Datetime | **MANDATORY** | Start datetime filter. ISO 8601. 400 if not set. |
| toDate | Datetime | OPTIONAL | End datetime filter. ISO 8601. |
| limit | Integer | OPTIONAL | Records per page. Max 500. Default 500. |
| dateField | String | OPTIONAL | Field to filter on. Only value: lastUpdatedAt (default). |

**Pagination:** Use `next` URL from response (auto-fills fromId, limit, fromDate, toDate). Stop when `next` is `null`. Records sorted by sortDate.

**Request body:** None.

**Response body:**

| Field | Type | Description |
|-------|------|-------------|
| contacts | Array | Contact objects |
| count | Integer | Elements in current page |
| next | String/null | URL for next page. null = last page. |

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method)

---


## POST Create a batch of contacts

**Endpoint:** `POST /api/v2/voice/campaigns/{{campaignId}}/contact-batch/create?priorityMode=false`

**Description:** Create multiple contacts in a campaign. Max 300 contacts per request. Use SFTP for more.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priorityMode | Boolean | OPTIONAL | Same as single create. Default: false. |

**Request body:** Same fields as single create, but `customFields` is an **Array** (not Object) containing multiple contacts.

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priority | Integer | OPTIONAL | Priority for all contacts. |
| excluded | Boolean | OPTIONAL | Default: false. |
| retryDate | String | OPTIONAL | Next call datetime. ISO 8601. |
| triesNumber | Integer | OPTIONAL | Default: 0. |
| comment | String | OPTIONAL | Wrapup comment. |
| wrapupId | Integer | OPTIONAL | Wrapup ID. |
| agentId | Integer | OPTIONAL | Last agent ID. |
| assignedAgentId | Integer | OPTIONAL | Assigned agent. |
| assignedGroupId | Integer | OPTIONAL | Assigned group. |
| assignedAgentExpirationTime | String | OPTIONAL | ISO 8601. (Soon) |
| assignedGroupExpirationTime | String | OPTIONAL | ISO 8601. (Soon) |
| minCallingDateTime | String | OPTIONAL | Production start. ISO 8601. |
| maxCallingDateTime | String | OPTIONAL | Production end. ISO 8601. |
| contactCardDisplayNumber | String | OPTIONAL | Displayed phone (E.164). WARNING: non-validated = 400. |
| calendarId | Integer | OPTIONAL | Calendar ID. |
| customFields | **Array** | **MANDATORY** | Array of objects, each with custom fields as key:value. Phones in E.164. |
| region | Integer | OPTIONAL | Displayed number mapping. |

**Response:** Returns batch token to check status via "GET batch result".

```json
{ "token": "88874456-b133-47c0-bf45-c978da586660" }
```

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (invalid params or invalid displayed phone)

---


## POST Update a batch of contacts

**Endpoint:** `POST /api/v2/voice/campaigns/{{campaignId}}/contact-batch/update`

**Description:** Mass update contacts matching query filters. POST with JSON body containing `query` and `data` parts. Only one batch task per campaign at a time (409 if busy).

**⚠️ Important:**
- Wrong/misspelled fields in `query` are silently discarded. If ALL fields discarded → updates ALL contacts in campaign!
- Cannot update `phones` via batch (creates duplicates). Use single update API instead.

### Query part (same filters as Search contacts)
Same filters as POST Search contacts: assignedAgentIds, assignedGroupIds, contactIds, createdAfter/Before, customFieldConditions, excluded, excludedCause, agentIds, lastCallAfter/Before, lastAgentIds, lastCallerType, lastWrapupIds, maxPriority, maxTries, minPriority, minTries, phones, minCallingDateTime Before/After, maxCallingDateTime Before/After, retryAfter/Before, retryIsNull, updateAfter/Before, wrapupStatuses, purgeDateBefore/After, regions.

### Data part (fields to update)

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| priority | Integer | OPTIONAL | Priority. |
| retryDate | String | OPTIONAL | Next call datetime. ISO 8601. |
| triesNumber | Integer | OPTIONAL | Number of tries. |
| excluded | Boolean | OPTIONAL | Exclude state. |
| agentId | Integer | OPTIONAL | Last agent. |
| wrapupId | Integer | OPTIONAL | Wrapup ID. |
| assignedAgentId | Integer | OPTIONAL | Assigned agent. |
| minCallingDateTime | String | OPTIONAL | Production start. ISO 8601. |
| maxCallingDateTime | String | OPTIONAL | Production end. ISO 8601. |
| contactCardDisplayNumber | String | OPTIONAL | Displayed phone (E.164). WARNING: non-validated = 400. |
| calendarId | Integer | OPTIONAL | Calendar ID. |
| customFields | Object | OPTIONAL | Key:value. Omitted fields unchanged. |
| region | Integer | OPTIONAL | Displayed number mapping. |

**Response:** Returns batch token.
```json
{ "token": "88874456-b133-47c0-bf45-c978da586660" }
```

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (bad format or invalid displayed phone), 409 (another batch task ongoing for this campaign)

---


## POST Delete a batch of contacts

**Endpoint:** `POST /api/v2/voice/campaigns/{{campaignId}}/contact-batch/delete`

**Description:** Mass delete contacts matching query filters. Only one batch task per campaign at a time (409 if busy).

**⚠️ Important:** Wrong/misspelled fields in request body are silently discarded. If ALL fields discarded → deletes ALL contacts in campaign!

**Request body:** Same query filters as Search contacts / Update batch (assignedAgentIds, contactIds, createdAfter/Before, customFieldConditions, excluded, phones, wrapupStatuses, etc.)

**Response:** Returns batch token.
```json
{ "token": "a0237df7-76bf-407b-bb1f-4b193563b102" }
```

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (bad format), 409 (another batch task ongoing)

---


## GET Get batch result

**Endpoint:** `GET /api/v2/voice/campaigns/contact-batch/status/{{batchId}}`

**Description:** Get result of a completed batch (create/update/delete). Replace {{batchId}} with the token returned by the batch operation.

**Request body:** None.

**Response body:**

| Name | Type | Description |
|------|------|-------------|
| status | String | ACCEPTED (initial), IN_PROGRESS (pending), COMPLETED (success), FAILED |
| modifiedElementsCount | Integer | Number of contacts modified |
| failed | Array of integers | Contact IDs eligible but not modified |
| excluded | Object | Reasons + IDs of excluded contacts (e.g. noValidPhone) |

**Example Response:**
```json
{
  "status": "COMPLETED",
  "modifiedElementsCount": 273,
  "failed": [],
  "excluded": { "noValidPhone": [23, 65] }
}
```

**Status codes:** 200 (ok), 401 (unauthorized), 404 (batch not found), 405 (wrong method)

---


# CAMPAIGNS

Campaigns are used to call a database of contacts.

## Data structure for campaigns

| Name | Type | Read-only | Description |
|------|------|-----------|-------------|
| id | Integer | YES | Campaign ID. Example: 3945 |
| name | String | NO | Campaign name. Example: "Marketing - Xmas 2019" |
| isPaused | Boolean | NO | true = paused, false = playing. |
| isArchived | Boolean | NO | true = archived, false = active. |
| folder | String | NO | Folder name containing the campaign. |
| mode | String | NO | Dialing mode: automatic, amd_progressive, progressive, predictive, preview. |
| userIds | Array of int | NO | Agent IDs assigned to campaign. |
| unassignedUserIds | Array of int | YES | Agent IDs who unassigned themselves. |
| groupIds | Array of int | NO | Group IDs assigned to campaign. |
| customFields | Array of strings | NO | Custom fields of the campaign for each contact. |
| createdAt | String | YES | Creation datetime. ISO 8601 UTC. |
| createdBy | String | YES | User who created the campaign. |
| lastUpdatedAt | String | YES | Last update datetime. ISO 8601 UTC. |
| lastUpdatedBy | String | YES | User who last updated. |
| wrapupFolderId | Integer | YES | Wrapup codes folder ID. |
| phoneFields | Array of strings | YES | Phone fields among custom fields. Example: ["phone1","phone2"] |
| displayedPhoneNumbers | Array of strings | NO | Phone numbers displayed (E.164, no plus). WARNING: non-validated = 400 error. |
| useAgentDisplayedPhoneNumber | Boolean | NO | Use agent's displayed phone instead of campaign's. Default: false. |
| minCallingDateOffset | Integer | NO | Days to wait before calling contacts after creation. 0-2, nullable. |
| maxCallingDateOffset | Integer | NO | Days contacts can be called after creation. Nullable. |
| maxTries | Integer | NO | Max tries if wrapup is tocall. Not null. |
| nextTryDelay | Integer | NO | Seconds before next try if tocall. Not null. Example: 86400 |
| isRecorded | Boolean | NO | Whether calls are recorded. |
| recordingPercentage | Integer | NO | % of calls recorded. Nullable. |
| calendarId | Integer | NO | Calendar ID linked to campaign. Nullable. |
| regionalization | Boolean | NO | Whether campaign is regionalized. |
| soundPlayedContactPickUp | Integer | NO | Sound file ID played when call picked up. Nullable. |
| contactPriority | Integer | NO | Initial contact priority when created. Example: 10 |
| personalCallbackPrioritization | Boolean | NO | Whether personal callbacks prioritized. |
| globalPriority | Integer | NO | Campaign priority vs others. Nullable. |
| deduplicationParams | Object | NO | Deduplication options. Nullable. (Future release) |
| deduplicationParams.excludeDomain | String | NO | "all" or "file". (Future) |
| deduplicationParams.excludeSamePhones | Boolean | NO | Deduplicate on phone fields. (Future) |
| deduplicationParams.excludeSameValues | Array of strings | NO | Deduplicate on other fields. (Future) |
| deduplicationParams.enableAgentIncludeExclude | Boolean | NO | Allow agents to include/exclude duplicates. (Future) |
| autoPurge | Object | NO | Nullable. Options: lastAttemptBeforeDays (int), maxTriesReached (bool), excluded (bool), notToCall (bool) |

---


## GET Get campaign by Id

**Endpoint:** `GET /api/v1/voice/campaigns/{{campaignId}}`

**Description:** Show campaign information.

**Request body:** None.

**Response:** Campaign details JSON (see data structure).

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method)

---

## PATCH Update campaign by Id

**Endpoint:** `PATCH /api/v1/voice/campaigns/{{campaignId}}`

**Description:** Update one or several properties. Only specified properties are updated, others unchanged.

**⚠️ Note:** Once a campaign is archived or deleted, it cannot be updated. Can only archive a campaign already paused.

**Request body (all OPTIONAL):**

| Name | Type | Nullable | Description |
|------|------|----------|-------------|
| name | String | No | Campaign name. |
| isPaused | Boolean | No | Paused state. |
| isArchived | Boolean | No | Archived state. Must be paused first. |
| folder | String | Yes | Folder name. |
| userIds | Array | Yes | Agent IDs assigned. |
| groupIds | Array | Yes | Group IDs assigned. |
| useAgentDisplayedPhoneNumber | Boolean | No | Use agent phone instead of campaign's. (Soon) |
| displayedPhoneNumbers | Array of strings | No | Displayed phones (E.164). WARNING: non-validated = 400. |
| minCallingDateOffset | Integer | Yes | Days to wait before calling. |
| maxCallingDateOffset | Integer | Yes | Max days to call after creation. |
| maxTries | Integer | No | Max tries per contact. |
| nextTryDelay | Integer | No | Seconds between tries. |
| isRecorded | Boolean | No | Recording enabled. |
| recordingPercentage | Integer | No | % recorded (0-100). Only if isRecorded=true. |
| calendarId | Integer | Yes | Calendar ID. |
| soundPlayedContactPickUp | Integer | Yes | Sound file ID on pickup. |
| contactPriority | Integer | No | Initial contact priority. |
| globalPriority | Integer | No | Campaign priority (1-50, null=no priority). |
| deduplicationParams | Object | No | Deduplication options. (Future) |
| autoPurge | Object | No | Auto-purge options: enabled, lastAttemptBeforeDays, maxTriesReached, excluded, notToCall. |

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (invalid displayed phone)

---


## GET Get campaigns

**Endpoint:** `GET /api/v1/voice/campaigns`

**Description:** Retrieve campaigns on the platform.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| name | String | OPTIONAL | Filter by name (contains, case insensitive). |
| mode | String | OPTIONAL | Filter by dialing mode (predictive, preview, etc.). |
| isPaused | Boolean | OPTIONAL | Filter paused/playing. |
| isArchived | Boolean | OPTIONAL | Filter archived/active. |
| page | Integer | OPTIONAL | Page number. |
| pageSize | Integer | OPTIONAL | Page size. Default 50, max 200. |

**Pagination:** Max 200 per page. Use `next`/`previous` URLs. Stop when `next` is null.

**Request body:** None.

**Response body:**

| Field | Type | Description |
|-------|------|-------------|
| count | Integer | Number of campaigns |
| campaigns | Array | Campaign objects |
| next | String/null | URL for next page |
| previous | String/null | URL for previous page |

**Status codes:** 200 (ok), 401 (unauthorized), 405 (wrong method)

---


## POST Add campaign custom field(s)

**Endpoint:** `POST /api/v1/voice/campaigns/{{campaignId}}/field`

**Description:** Add custom field(s) (phone or not) to an existing campaign.

**Request body:**
```json
{
  "newCustomFields": [
    {"name": "field1", "isPhoneNumber": false},
    {"name": "fieldPhone1", "isPhoneNumber": true}
  ]
}
```

**Response:** Full campaign details with updated customFields & phoneFields.

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method), 400 (field already exists)

---


## DELETE Delete campaign by Id

**Endpoint:** `DELETE /api/v1/voice/campaigns/{{campaignId}}`

**Description:** Remove a campaign permanently. Cannot be undone. **Must be archived first!**

**Request body:** None.

**Response:** Deleted campaign details JSON.

**Status codes:** 200 (ok), 401 (unauthorized), 404 (campaign not found), 405 (wrong method)

---


# WRAPUP CODES

Wrap-up codes are used to qualify at the end of an interaction (call or email).

## Data structure for wrapup codes

| Name | Type | Read-only | Description |
|------|------|-----------|-------------|
| id | Integer | YES | Unique ID. Example: 3945 |
| name | String | NO | Name. Example: "Client not interested" |
| status | String | NO | Type. Values: arguedpositive, argued, nonargued, unreachable, tocall |
| wrapupPath | String | YES | Folder path containing the wrapup. Folders separated by /. Example: "Outbound Marketing Campaign/Paris/SALES N2" |
| isSystem | Boolean | YES | Created by system (true) or manually (false). |
| isHidden | Boolean | NO | Hidden from agents or not. |
| unpinAfter | Number | NO | If status=tocall and personal callback: reservation time in seconds. Otherwise null. Example: 90000 |
| createdAt | String | YES | Creation datetime. ISO 8601. |
| createdBy | String | YES | User who created it. |
| lastUpdatedAt | String | YES | Last update datetime. ISO 8601. |
| lastUpdatedBy | String | YES | User who last updated. |

**Wrapup statuses explained:**
- **arguedpositive** = contact joint, résultat positif (ex: inscrit, intéressé)
- **argued** = contact joint, résultat neutre
- **nonargued** = contact joint, résultat négatif (ex: pas intéressé)
- **unreachable** = contact non joignable
- **tocall** = à rappeler

---


## GET Get wrapup by Id

**Endpoint:** `GET /api/v1/account/wrapups/{{wrapupId}}`

**Description:** Retrieve info about a specific wrapup code.

**Request body:** None.

**Response:** Wrapup code details JSON.

**Status codes:** 200 (ok), 401 (unauthorized), 404 (wrapup not found), 405 (wrong method)

---


## GET Get wrapups

**Endpoint:** `GET /api/v1/account/wrapups`

**Description:** Retrieve wrapup codes of the account.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| name | String | OPTIONAL | Filter by name (contains, case insensitive). |
| status | String | OPTIONAL | Filter by status (argued, arguedpositive, nonargued, unreachable, tocall). |
| isSystem | Boolean | OPTIONAL | Filter system vs custom wrapups. |
| isHidden | Boolean | OPTIONAL | Filter hidden/visible. |
| page | Integer | OPTIONAL | Page number. |
| wrapupFolderId | Integer | OPTIONAL | Filter by folder ID. |
| unpinAfter | Integer | OPTIONAL | Filter by callback reservation duration (seconds). (Soon) |

**Pagination:** Max 50 per page. Use `next`/`previous` URLs. Stop when `next` is null.

**Request body:** None.

**Response body:**

| Field | Type | Description |
|-------|------|-------------|
| count | Integer | Number of wrapups |
| wrapups | Array | Wrapup objects |
| next | String/null | URL for next page |
| previous | String/null | URL for previous page |

**Status codes:** 200 (ok), 401 (unauthorized), 405 (wrong method)

---


## GET Get wrapups folders

**Endpoint:** `GET /api/v1/account/wrapups/folders`

**Description:** Retrieve wrapup folders of the account.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| name | String | OPTIONAL | Filter by name (contains, case insensitive). |
| isSystem | Boolean | OPTIONAL | Filter system vs custom folders. |
| page | Integer | OPTIONAL | Page number. |
| parentFolderId | Integer | OPTIONAL | Filter by parent folder ID. |

**Pagination:** Max 50 per page. Use `next`/`previous`. Stop when `next` is null.

**Response body:**

| Field | Type | Description |
|-------|------|-------------|
| count | Integer | Number of folders |
| folders | Array | Folder objects (id, level, locked, name, order, parentFolderId, system, folderPath, createdBy, createdAt, lastUpdatedBy, lastUpdatedAt) |
| next | String/null | Next page URL |
| previous | String/null | Previous page URL |

**Status codes:** 200 (ok), 400 (bad request), 401 (unauthorized), 405 (wrong method)

---


# COLD STATISTICS

## Billing

### GET Get licenses billed

**Endpoint:** `GET /api/v1/statistic-cold/billing/licenses?month=YYYY-MM`

**Description:** Retrieve licenses billed for a month. Only useful if billed per-user model.

**Query parameters:**

| Name | Type | Presence | Description |
|------|------|----------|-------------|
| month | String | **MANDATORY** | Year-month (YYYY-MM / ISO 8601). Example: ?month=2020-08 |

**Request body:** None.

**Response body:**

| Name | Type | Description |
|------|------|-------------|
| month | Date | The month (YYYY-MM). |
| licenseModelBilled | String | Billing model used for that month. Example: "Connected users" |
| currentAccountLicenseModel | String | Model currently set on account. |
| details | Array of objects | Users billed details. |
| details[].model | String | Model name. Example: "Peak Users" |
| details[].count | Integer | Number of users billed. |
| details[].users | Array of strings | Usernames. |
| details[].peakDateTime | DateTime | First peak datetime (UTC, ISO 8601). Only for "Peak Users" model. |

**Status codes:** 200 (ok), 401 (unauthorized), 405 (wrong method)

---


# ARCHIVES

## Voice - Recordings

### GET Voice interaction recording content by Id

**Endpoint:** `GET /api/v1/recordings/interactions/{{interactionId}}/content`

**Description:** Download the audio recording (MP3) of a specific voice interaction. Need the interactionId (obtained from Archives endpoints).

**Request body:** None.

**Response:** Audio file (Content-Type: audio/mpeg).

**Status codes:** 200 (ok, returns audio file), 401 (unauthorized), 405 (wrong method)

---

