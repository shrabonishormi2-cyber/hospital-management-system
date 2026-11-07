# CareSync — Hospital Management System (HMS)

A responsive, client-side Single Page Application (SPA) built with pure vanilla JavaScript, HTML5, and Tailwind CSS. The application simulates an enterprise medical practice environment with strict Role-Based Access Control (RBAC), persistent local storage, and simulated financial processing.

---

## Key Modules & Roles

1. **Patient Portal**:
   - Filter specialist directory by department (Cardiology, Medicine, Pediatrics, Orthopedics, Neurology).
   - Dynamic chamber slot booking with validation.
   - Interactive 3-step Bangladesh Mobile Financial Services (MFS) checkout for **bKash** and **Nagad** (Account entry, OTP validation, and secure PIN confirmation).

2. **Doctor Portal**:
   - Real-time chamber triage queue (`Upcoming`, `In-Chamber`, `Completed`).
   - Digital Prescription Pad with patient vitals tracking (BP, Pulse, Weight), clinical diagnosis, dynamic medication dosage rows, and dietary advice.
   - Print-ready clinical output matching Bangladesh healthcare layout standards.

3. **Admin Portal**:
   - Executive KPIs: Registered patient count, active specialists, daily queue volume, and total revenue in BDT (৳).
   - Doctor management: Add specialists, update chamber rooms, consultation fees, and toggle active statuses.
   - Financial ledger: Complete audit log of MFS transactions with filtering capabilities.

---

## Technical Stack & Design Choices

- **Architecture**: Single Page Application (SPA) with zero external frameworks.
- **Styling**: Tailwind CSS via CDN with custom print media stylesheets.
- **Icons**: FontAwesome 6.4.0.
- **Persistence**: Structured `localStorage` key-value collections (`hms_users`, `hms_doctors`, `hms_appointments`, `hms_prescriptions`, `hms_transactions`) with an automatic first-run seeder.

---

## How to Run Locally

1. Clone this repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/hospital-management-system.git](https://github.com/YOUR_USERNAME/hospital-management-system.git)