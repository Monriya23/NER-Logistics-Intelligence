# NEVIA Offline Field Intelligence & Store-and-Forward Sync

## 1. Operating Environment Challenges

High-altitude Himalayan logistics corridors frequently suffer from total cellular network blackout, deep mountain shadows, and power outages. Field officers, ambulance drivers, and depot operators cannot rely on continuous server connectivity.

NEVIA implements an **Offline-First Store-and-Forward Architecture** built on client-side IndexedDB persistence.

---

## 2. Field Report Lifecycle & Sync Protocol

```
[FIELD OFFICER CAPTURES INCIDENT]
             │
             ▼
  Is Network Available?
   ├── YES ──► POST /api/v1/incidents ──► [SYNCED TO CENTRAL SERVER]
   │
   └── NO
        │
        ▼
   [PENDING_LOCAL] (Stored in browser IndexedDB `ner_offline_reports`)
        │
        ▼ (Network link restored / manual trigger)
   [SYNCING] (Batch dispatched with unique idempotency UUIDs)
        │
        ▼
   [SYNCED] (Server acknowledges receipt, updates central state)
```

---

## 3. Dual Sync Queue Engine

The synchronization pipeline manages two concurrent asynchronous queues:

1. **Uplink Queue (Field Telemetry & Evidence)**:
   - Queues emergency road incident reports, GPS coordinates, timestamp, and compressed photographic evidence.
   - Status states: `PENDING_LOCAL` $\rightarrow$ `SYNCING` $\rightarrow$ `SYNCED`
2. **Downlink Queue (Critical Operational Alerts)**:
   - Caches incoming hazard notifications, road closure alerts, and detour commands locally so drivers can view them even while traversing network dead zones.
   - Delivery states: `QUEUED` $\rightarrow$ `DELIVERED` $\rightarrow$ `ACKNOWLEDGED`

---

## 4. Idempotency & Conflict Resolution

- **Idempotency Keys**: Every offline report receives a client-generated UUIDv4 timestamped token, ensuring repeated sync retries upon intermittent connectivity never create duplicate records.
- **Local Fallback Datasets**: Core geographic nodes, emergency contacts, hospital depots, and offline road network topologies are pre-cached in local memory for instant zero-latency query execution.
