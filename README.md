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
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 1: USER SCENARIOS: Users (Admin, Manager or Employee) attempting to Login (*POST /api/login*)


# Client →
↓
# LoginRouter.ts →
↓
# LoginController.ts →
↓
# User.ts →
↓
# PasswordHandler.ts →
↓
# UserDTOToken.ts →
↓
# jsonwebtoken →
↓
# ResponseHandler →
↓
# Client →
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 2: Employee requesting annual leave (*POST /api/leave-requests*)


# Client → Sends a POST request to the API.
↓
# LeaveRequestRouter.ts → Recieves the request and forwards it to LeaveRequestController.ts
↓
# LeaveRequestController.ts → Processes the logic, validates data format and saves the leave request using TypeORM
↓
# LeaveRequest.ts → Maps the request to MySQL
↓
# LeaveRequestController.ts → Calls the save function and inserts a new record into MySQL table via the configured data-source.ts
↓
# ResponseHandler.ts → Formats the response in JSON style
↓
# Client -> Recieves the API response with JSON payload
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 3: Employee cancelling their own annual leave (*DELETE /api/leave-requests*)


# Client → Employee sends a DELETE request through the Postman API. A JWT is required
↓
# MiddlewareFactory.ts → Verifies that the JWT is valid and attaches the user object to the request
↓
# LeaveRequestRouter.ts → Maps the DELETE route to a controller
↓
# LeaveRequestController.ts → Looks up the leave request in the DB, sets the row to cancelled, returns a clean JSON result
↓
# LeaveRequest.ts → It is then mapped to the acutal leave_request DB table in MySQL.
↓
# ResponseHandler.ts → Returns a JSON structured message to Postman for the Client
↓
# Client → Client receives the JSON
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 4: MANAGER SCENARIOS: Manager views all outstanding leave requests from employees in their team (*GET /api/leave-requests/pending?team=true*)


# Client → Sends a GET method (with no body) to view all leave requests
↓
# MiddlewareFactory.ts → Decodes JWT, attaches req.user = { id: 99, role: 'manager' } so only the manager can view this info
↓
# LeaveRequestRouter.ts → Handles the GET request and forwards all pending GET requests to the leave request controller
↓
# LeaveRequestController.ts → Filters staff linked to the logged-in manager, executes SQL and gets leave req objects, returns a JSON
↓
# LeaveRequest.ts → Maps each user to their manager
↓
# MySQL → Retrieves the employee annual leave status and sends it to the response handler.
↓
# ResponseHandler.ts → Formats the results and displays it in Postman
↓
# Client → Recieves the JSON of all current outstanding leave requests from employees
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 5: Manager approves their employees annual leave request (*PATCH /api/leave-requests/:id/approve*)


# Client → Sends a PATCH request along with JWT auth token
↓
# MiddlewareFactory.ts → Decodes the JWT token and attaches the user info to the request
↓
# LeaveRequestRouter.ts → Routes the PATCH request to the approve() method in the Leave Controller
↓
# LeaveRequestController.ts → Checks whether the manager is authorised to execute request
↓
# LeaveRequest.ts + User.ts → Reads the request, checks if userId belongs to managerId, makes changes to DB
↓
# TypeORM + MySQL → Updates the log with essencial info (status, Id that made request, taking the AL days away)
↓
# ResponseHandler.ts → Formats a standardised JSON response to send back to the front end
↓
# Client → Recieves any of the possible HTTP responses in JSON: 403 (Forbidden), 400 (Bad Req), 404 (Not Found) or 200 (OK)
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 6: Manager rejects their employees annual leave request (*PATCH /api/leave-requests/:id/reject*)


# Client → Manager sends a PATCH request to reject employees annual leave, with JWT Token
↓
# MiddlewareFactory.ts → Authenicates the JWT Token, ensures only manager and admin can reject employees annual leave

# LeaveRequestRouter.ts → Routes the PATCH requests to the reject() method in LeaveRequestController.ts

# LeaveRequestController.ts → Handles the business logic related to employee annual leave. Interacts with ORM to update records

# LeaveRequest.ts + User.ts → Provides manager/employee relation for authorisation

# TypeORM + MySQL → Updates status to Rejected in leave_request table, with description and employeeId

# ResponseHandler.ts → Strucures a 200 OK JSON response ready to display in the Client side

# Client → Either recieves HTTP Codes 403 (Forbidden), 400 (Bad Req), 404 (Not Found (no Id entereed)) or the 200 (OK)
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 7: Manager views remaining leave for employees in their team (*GET /api/users/:id/leave-balance*)


# Client → Manager sends a GET request to see remaining leave for employees in their team, with JWT Token

# MiddlewareFactory.ts → Authenicates the JWT Token, ensures only manager and admin can view the employees annual leave

# UserRouter.ts → Routes the GET request to getLeaveBalance() method in UserController.ts

# UserController.ts → Handles the business logic related to employee annual leave. Interacts with ORM to update records

# User.ts → Matches employee to manager, fetches annualLeaveBalance record in DB

# TypeORM + MySQL → Ensures manager is allowed to view set employee. Just a GET req so no update in the DB

# ResposeHandler.ts → Formats the JSON output. Likely to either be a 403 (Forbidden), 404 (Not found) or 200 (OK)

# Client → The request was successful and the system returns the employee's leave balance.
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 8: ADMIN SCENARIOS: Admin adds a new member of staff (*POST /api/users*)


# Client → Admin sends a POST request to add a new member of staff into the database, with JWT Token

# MiddlewareFactory.ts → Authenicates the JWT Token, ensures only admin can access this endpoint

# UserRouter.ts or UserManagementRouter.ts → Forwards the request to UserManagementController.ts

# UserManagementController.ts → Interacts with ORM to update records and create new user

# User.ts + Role.ts → Combined entities used if the admin wants to add a new user, and assigning the user a role

# PasswordHandler.ts → Uses scryptSync + randomBytes + PEPPER + hasing + saltig to generate a strong, secure password

# TypeORM + MySQL → Inserts a new role with email, hashed password, salt, roleId, managerId and annualLeaveBalance

# ResposeHandler.ts → Formats the JSON output. Likely to either be an error 400 (Bad Request), 403 (Forbidden), 404 (Not found) or 201 (Created)

# Client → The request was successful and the system returns the new employees credentials
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 9: Admin can update employee roles or departments (*PATCH /api/users/:id*)


# Client → Admin sends a PATCH request to update employee roles or departments in the database, with JWT Token

# MiddlewareFactory.ts → Authenicates the JWT Token, ensures only admin can access this endpoint

# UserRouter.ts or UserManagementRouter.ts → Forwards the request to UserManagementController.ts

# UserManagementController.ts → Interacts with ORM to update records and create new user

# User.ts + Role.ts → Combined entities used if the admin wants to add a new user, and assigning the user a role

# PasswordHandler.ts → Uses scryptSync + randomBytes + PEPPER + hasing + saltig to generate a strong, secure password

# TypeORM + MySQL → Inserts a new role with email, hashed password, salt, roleId, managerId and annualLeaveBalance

# ResposeHandler.ts → Formats the JSON output. Likely to either be an error 400 (Bad Request), 403 (Forbidden), 404 (Not found) or 201 (Created)

# Client → The request was successful and the system returns the new employees credentials
-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 10: Admin can view all pending leave requests for all employees (*GET /api/leave-requests/pending*)



-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 11: Admin can adjust any employees annual leave balance (*PATCH /api/users/:id/leave-allocatio*)



-------------------------------------------------------------------------------------------------------------------------------------
# Scenario 12: Admin can approve a leave request on behalf of the manager (*PATCH /api/leave-requests/:id/approve*)


-------------------------------------------------------------------------------------------------------------------------------------
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
------------------------------------------------------------------------------------------------------
