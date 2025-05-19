# Annual Leave System using RESTful APIs:


# This project is a prototype RESTful API built using TypeScript, Node.js, and TypeORM to manage annual leave booking for an organization. 
-------------------------------------------------------------------------------------------------------------------------------------
# User Authentication & Role-Based Access:
  - Users log in with secure hashed passwords.
  - JWT authentication tokens are issued and validated.
  - Role restrictions enforced (staff, manager, admin).

# Admin Actions:
  - Create and manage users, roles, and departments.
  - Modify annual leave allowances.
  - View system-wide reports and analytics.

# Manager Actions:
  - View and approve/reject staff leave requests.
  - View staff leave usage and balances.

# Employee Actions:
  - Request leave (subject to validation and manager approval).
  - Cancel a leave request.
  - View leave requests and balances.

# Security:
  - Passwords are salted and hashed using scrypt.
  - JWT tokens used for authentication.
  - Rate limiting and helmet middleware enabled.
  - Logs unauthorised access attempts.

# Testing:
  - Unit and integration tests using Jest.
  - Test coverage across controllers, routes, and entities.
-------------------------------------------------------------------------------------------------------------------------------------
# Overview on how the API Works :


# Client → Person trying to access the system. Using Postman for the (Req, Res) RESTful API callings
↓
# Routers → Defines each API endpoint and HTTP method (Create, Read, Update & Delete)
↓
# Controllers → Handles incoming API req, calls helper functions, uses TypeORM to interact with DB & stores business logic
↓
# Helper (Service/Business Logic) → Uses encapsulation in password hashing and error logging to follow SRP
↓
# TypeORM Entities → Defines the tables and structures of the annual leave DB and maps its in Typescript classes
↓
# Handlers → Encapsulate reusable business logic, to avoud repeating code across controllers
↓
# PHPMyAdmin Database → Relational Database that holds all the structure and data of the annual leave system
-------------------------------------------------------------------------------------------------------------
# Role Access Matrix:


------------------------------------------------------------------------------------------------------
| **Action**                                                | **Employee** | **Manager** | **Admin** |
|-----------------------------------------------------------|:------------:|:-----------:|:---------:|
| Request leave                                             | ✅          | ✅          | ✅       |
| Cancel own leave request                                  | ✅          | ✅          | ✅       |
| View own leave status                                     | ✅          | ✅          | ✅       |
| View own remaining leave                                  | ✅          | ✅          | ✅       |
| View pending leave requests (their team)                  | ❌          | ✅          | ✅       |
| Approve leave requests (their team)                       | ❌          | ✅          | ✅       |
| Reject leave requests (their team)                        | ❌          | ✅          | ✅       |
| View leave balance of team members                        | ❌          | ✅          | ✅       |
| Add new staff member                                      | ❌          | ❌          | ✅       |
| Amend staff roles or departments                          | ❌          | ❌          | ✅       |
| View all pending leave requests (filtered/company-wide)   | ❌          | ❌          | ✅       |
| Update leave allocation (annual entitlement)              | ❌          | ❌          | ✅       |
| Approve requests on behalf of any manager                 | ❌          | ❌          | ✅       |
| Access analytics and system-wide reports                  | ❌          | ❌          | ✅       |
-------------------------------------------------------------------------------------------------------------