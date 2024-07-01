---
layout: default
title: Roadmap
---

# Roadmap

---

## Table of Contents

- [Current Version](#current-version)
- [Next Release](#next-release)
- [Future Plans](#future-plans)
- [Contribution](#contribution)
- [Feedback and Suggestions](#feedback-and-suggestions)

---

## Current Version

- **Version**: 1.2.3
- **Highlights**: ISO15118 Support. Directus Files managed certificates & digital asset management.
- **Ongoing Work**: Stable release

---

## Next Release

- **Target Version**: 1.3.0
- **Estimated Release Date**: 2024-07-03
- **Features & Improvements**:
  - Support for OCPP 2.0.1 Smart Charging
  - Support for OCPI 2.2.1
    - Registration (Credentials & Versions)
    - Cdrs
    - Charging Profiles
    - Commands - (Start, Stop, & Unlock Connector)
    - Locations - Push & Pull
    - Sessions - Push & Pull
    - Tariffs
    - Tokens (No Real Time Auth support yet, scheduled for 1.3.X)
  - Stackbox Payments Module Open Sourced - Web portal payment option via Stripe
    - Scan and Charge feature - QR Code on Charging Station UI payment via Stripe

---

## Future Plans

### 1.4.X
- OCPP 2.0.1: Reservations (including OCPI 2.2.1) & Local Auth List Management
- Unit Test Coverage
- Github Action Integration Tests

### 1.5.X
- Improve Modularity support (including documentation on how to create CitrineOS modules)
- Improved Offline Handling & Down Detection
- Configurable Alerts

### Long Term (Q4-2024, 2025)
- OpenADR support - CitrineOS as a Virtual End Node
- OCPI 3.0 support
- OCPP 2.1 support

---

## Contribution

We're always looking for contributors to help us improve **CitrineOS**. If you're interested, please check out our [CONTRIBUTING.md](https://github.com/citrineos/citrineos/blob/main/CONTRIBUTING.md) guide for more details.

---

## Feedback and Suggestions

Your feedback is valuable to us! If you have any suggestions or encounter any issues, please [create an issue](https://github.com/citrineos/citrineos/issues) on our GitHub repository. Note: Please do not create issues on the citrineos-core repository directly moving forward!

---

See something here that you wish was happening sooner, say support for the **Local Authorization List Management** OCPP Certification Profile? Begin working on it! Let us know as well so we can support you and make sure multiple people aren't pursuing the same goals separately.

See something that's not here that you think should be? Let us know! Maybe there's a reason, maybe we haven't considered it and we'd love your input and help. This roadmap will grow and change with your feedback.

Looking to start making a 3rd-party module now? Let us know now! Although thorough documentation for that process doesn't currently exist, we'd love to start figuring it out with you.

The more people interested in helping with development, the more development we can plan.

Thank you for being a part of the **CitrineOS** community! Together, we'll make this project better every day.

[Tests]: TESTS.md