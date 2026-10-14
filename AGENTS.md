# Project architecture

- Keep the original karate activity catalog in a typed local data module and its reusable animated floor diagrams separate from the page; this lets coaches browse detailed drills without a paid external dependency.
- Show the Activities entry and guard its route using roles read by useAuth from user_roles; never use browser storage or user-editable metadata for role decisions. The bundled instructional catalog is not confidential data.