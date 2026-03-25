# Test Fixtures

## Directory Structure

```
tests/fixtures/
├── README.md            ← This file
├── chat-messages/       ← Phase 2: 500 labeled chat messages for intent classifier
│   └── README.md        ← Labeling rules, provenance, domain distribution
├── receipts/            ← Phase 4: 50 sample receipt photos for OCR testing
│   └── README.md        ← Photo sources, redaction policy
├── school-emails/       ← Phase 4: 20 school newsletter emails for parsing
│   └── README.md        ← Sources (Seesaw, ClassDojo, etc.), PII redaction
└── calendar/            ← Phase 1: Google Calendar test account event exports
    └── README.md        ← Test account info, event structure
```

## Data Requirements (from development-plan.md)

| Dataset | Count | Purpose | Phase |
|---------|-------|---------|-------|
| Chat messages | 500 (250 deterministic, 250 intelligent) | Intent classifier validation | Phase 2 |
| Receipt photos | 50 (grocery, restaurant, gas, online) | OCR accuracy testing | Phase 4 |
| School emails | 20 (Seesaw, ClassDojo, ParentSquare) | Email parsing testing | Phase 4 |
| Calendar events | 30 events, 2 family members | Calendar sync testing | Phase 1 |

## Labeling Rules

- Each chat message must have: `message`, `expected_intent`, `expected_agent`, `is_deterministic`
- All PII in fixtures must be redacted or synthetic
- Receipts must include a mix of clear and challenging (crumpled, faded, angled) photos
- School emails must be anonymized — replace real names, schools, addresses

## Adding New Fixtures

1. Create a subdirectory with a descriptive name
2. Add a README.md documenting provenance, labeling rules, and redaction
3. Use JSON or JSONL format for structured data
4. Keep individual files under 1MB where possible
