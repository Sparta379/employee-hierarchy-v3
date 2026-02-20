# EPI-USE Employee Hierarchy Management - Technical Document

## Overview
This document provides a technical overview of the EPI-USE Employee Hierarchy Management application. It covers the architecture, technology stack, database schema, API endpoints, and deployment considerations.

## Table of Contents
1.  [Architecture](#architecture)
2.  [Technology Stack](#technology-stack)
3.  [Project Structure](#project-structure)
4.  [Database Schema](#database-schema)
5.  [API Endpoints](#api-endpoints)
    *   [Employees API (`/api/employees`)](#employees-api-apiemployees)
    *   [Hierarchy API (`/api/hierarchy`)](#hierarchy-api-apihierarchy)
    *   [Profile API (`/api/profile`)](#profile-api-apiprofile)
    *   [Other APIs](#other-apis)
6.  [Authentication and Authorization](#authentication-and-authorization)
7.  [Deployment](#deployment)
    *   [Environment Variables](#environment-variables)
    *   [Vercel Deployment](#vercel-deployment)
    *   [Database Setup (Neon Postgres)](#database-setup-neon-postgres)
8.  [Future Enhancements](#future-enhancements)

---

## 1. Architecture
The application follows a modern full-stack architecture using Next.js for both frontend and backend (API routes). It's designed to be cloud-hosted with a remote PostgreSQL database.

*   **Frontend:** React.js components rendered by Next.js, styled with Tailwind CSS.
*   **Backend:** Next.js API Routes (serverless functions) handling business logic and database interactions.
*   **Database:** PostgreSQL, accessed via Prisma ORM.
*   **Authentication:** Session-based (though specifics like JWT are abstracted by a session management approach).
*   **Deployment:** Designed for Vercel, leveraging its serverless capabilities and seamless integration with Next.js.

## 2. Technology Stack
*   **Framework:** Next.js (React.js)
*   **Language:** JavaScript (with JSX), TypeScript for Prisma configuration
*   **Styling:** Tailwind CSS
*   **ORM:** Prisma
*   **Database:** PostgreSQL (e.g., Neon Postgres)
*   **Authentication Libraries:** `bcryptjs` for password hashing, `crypto-js`
*   **Other Libraries:** `react-icons`, `react-medium-image-zoom`, `react-modal`, `swagger-jsdoc`, `swagger-ui-react`
*   **Dev Tools:** ESLint, Prettier

## 3. Project Structure
The project is structured as a standard Next.js application with an `app` directory for routing and components.

```
/EPI-USE-EmployeeHierarchyManagement/org-hierarchy-app/
├── public/                 # Static assets
├── prisma/                 # Prisma schema, migrations, and seed
│   ├── migrations/
│   ├── prisma.config.ts
│   └── schema.prisma
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (management)/   # Grouped management pages (employees, branches, etc.)
│   │   │   ├── employees/page.jsx
│   │   │   ├── branches/route.js
│   │   │   └── ...
│   │   ├── (swagger)/      # Swagger UI route
│   │   ├── api/            # API Routes
│   │   │   ├── employees/route.js
│   │   │   ├── hierarchy/route.js
│   │   │   ├── profile/route.js
│   │   │   └── ...
│   │   ├── components/     # Reusable React components (e.g., Header, EmployeeList)
│   │   │   ├── EmployeeList/EmployeeList.jsx
│   │   │   ├── Header.jsx
│   │   │   └── ...
│   │   ├── hierarchy/page.jsx # Employee Hierarchy Visualization Page
│   │   ├── login/page.jsx
│   │   ├── profile/page.jsx
│   │   ├── register/page.jsx
│   │   └── user-manual/page.jsx
│   └── lib/                # Utility functions and configurations
│       ├── prisma.js       # Prisma client initialization
│       └── swaggerSpec.js  # Swagger documentation setup
├── .env                    # Environment variables (local)
├── next.config.mjs
├── package.json
├── README.md
└── ...
```

## 4. Database Schema
The database schema is defined in `prisma/schema.prisma` and uses a PostgreSQL database.

```prisma
// prisma/schema.prisma
generator client {
  provider   = "prisma-client-js"
  engineType = "library"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Employee {
  employee_number  String                 @id @unique @map("employee_number")
  dept_number      Int                    @map("dept_number")
  branch_number    Int                    @map("branch_number")
  role_number      Int                    @map("role_number")
  name             String
  surname          String
  birth_date       DateTime               @map("birth_date") @db.Date
  salary           Float
  branch           Branch                 @relation(fields: [branch_number], references: [branch_id])
  department       Department             @relation(fields: [dept_number], references: [dept_id])
  role             Role                   @relation(fields: [role_number], references: [role_id])
  managerOf        ReportingLineManager[] @relation("Employee")
  managedEmployees ReportingLineManager[] @relation("Manager")
  user             User?

  @@map("employees")
}

model User {
  employee_number String    @id @unique @map("employee_number")
  email           String    @unique
  password        String
  token           String?
  token_expire    DateTime? @map("token_expire")
  employee        Employee  @relation(fields: [employee_number], references: [employee_number])

  @@map("users")
}

model ReportingLineManager {
  employee_id String   @map("employee_id")
  manager_id  String   @map("manager_id")
  employee    Employee @relation("Employee", fields: [employee_id], references: [employee_number])
  manager     Employee @relation("Manager", fields: [manager_id], references: [employee_number])

  @@id([employee_id, manager_id])
  @@map("reporting_line_managers")
}

model Branch {
  branch_id Int        @id @default(autoincrement()) @map("branch_id")
  name      String     @unique
  employees Employee[]

  @@map("branches")
}

model Department {
  dept_id   Int        @id @default(autoincrement()) @map("dept_id")
  name      String     @unique
  employees Employee[]

  @@map("departments")
}

model Role {
  role_id   Int        @id @default(autoincrement()) @map("role_id")
  name      String     @unique
  employees Employee[]

  @@map("roles")
}
```

## 5. API Endpoints
The application exposes several API endpoints implemented as Next.js API routes. All endpoints return JSON responses.

### Employees API (`/api/employees`)
*   **`GET /api/employees`**:
    *   **Description:** Retrieves a list of all employees. Optionally, can retrieve a single employee by `employee_number` query parameter.
    *   **Parameters:** `employee_number` (optional, string)
    *   **Responses:** `200 OK` (Employee object or array), `404 Not Found` (if single employee not found), `500 Internal Server Error`
*   **`POST /api/employees`**:
    *   **Description:** Adds a new employee and creates a corresponding user account.
    *   **Request Body:** `Employee` object including `employee_number`, `dept_number`, `branch_number`, `role_number`, `name`, `surname`, `birth_date`, `salary`, `email`, and `password`.
    *   **Responses:** `201 Created`, `500 Internal Server Error`
*   **`PUT /api/employees`**:
    *   **Description:** Updates an existing employee's details.
    *   **Request Body:** `Employee` object with updated fields (identified by `employee_number`).
    *   **Responses:** `200 OK`, `500 Internal Server Error`
*   **`DELETE /api/employees`**:
    *   **Description:** Deletes an employee by `employee_number`. Automatically reassigns managed employees to the deleted employee's manager (if available).
    *   **Parameters:** `employee_number` (required, string)
    *   **Responses:** `200 OK`, `400 Bad Request` (missing `employee_number` or cannot reassign), `500 Internal Server Error`

### Hierarchy API (`/api/hierarchy`)
*   **`GET /api/hierarchy`**:
    *   **Description:** Retrieves reporting line relationships. Optionally, filters by `employee_id`.
    *   **Parameters:** `employee_id` (optional, string)
    *   **Responses:** `200 OK` (array of `ReportingLineManager` objects), `404 Not Found`, `500 Internal Server Error`
*   **`POST /api/hierarchy`**:
    *   **Description:** Establishes a new reporting line relationship (subordinate to manager). Includes checks for self-management and circular references.
    *   **Request Body:** `{ employee_id: string, manager_id: string }`
    *   **Responses:** `201 Created`, `400 Bad Request` (invalid input or circular reference), `500 Internal Server Error`
*   **`PUT /api/hierarchy`**:
    *   **Description:** Updates an employee's manager. Can optionally remove an old manager relationship. Includes checks for self-management and circular references.
    *   **Request Body:** `{ employee_id: string, manager_id: string, old_manager_id?: string }`
    *   **Responses:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`
*   **`DELETE /api/hierarchy`**:
    *   **Description:** Removes a specific reporting line relationship.
    *   **Request Body:** `{ employee_id: string, manager_id: string }`
    *   **Responses:** `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Profile API (`/api/profile`)
*   **`GET /api/profile`**:
    *   **Description:** Fetches Gravatar profile data for a given email address by querying the Gravatar API. Requires `GRAVATAR_API_KEY` environment variable.
    *   **Parameters:** `email` (required, string)
    *   **Responses:** `200 OK` (Gravatar profile JSON), `400 Bad Request`, `404 Not Found` (Gravatar profile), `5XX Gravatar API Error` or `500 Internal Server Error`

### Other APIs
*   **`/api/branches`**, **`/api/departments`**, **`/api/roles`**: CRUD operations for branches, departments, and roles respectively. (Details omitted for brevity, similar structure to employees API).
*   **`/api/login`**, **`/api/register`**, **`/api/session`**, **`/api/users`**: Endpoints for user authentication and management.

## 6. Authentication and Authorization
The application uses a session-based authentication mechanism. User registration (`/api/register`) and login (`/api/login`) endpoints are provided. Upon successful login, a session token is stored (likely in local storage or cookies on the client-side). This token is then used to authenticate subsequent API requests. Authorization logic (e.g., role-based access control) can be implemented within the API routes if required.

## 7. Deployment

The application is designed for cloud hosting, with Vercel being the recommended platform due to its integration with Next.js. A remote PostgreSQL database like Neon is required.

### Environment Variables
The following environment variables are essential for production deployment:

*   **`DATABASE_URL`**: The connection string for the PostgreSQL database (e.g., from Neon). This is used by Prisma.
*   **`DIRECT_URL`**: Similar to `DATABASE_URL`, used by Prisma for direct connections, especially during migrations. For Neon, this is usually the same as `DATABASE_URL`.
*   **`NEXTAUTH_URL`**: The base URL of your deployed application (e.g., `https://your-app.vercel.app`).
*   **`NEXTAUTH_SECRET`**: A secret used to sign session tokens. Generate a strong, random string.
*   **`GRAVATAR_API_KEY`**: An API key required to fetch Gravatar profiles.

### Vercel Deployment
1.  **Link GitHub Repository:** Connect your GitHub repository to Vercel.
2.  **Configure Project:** Vercel will automatically detect Next.js.
3.  **Set Environment Variables:** Go to your project settings on Vercel and add the environment variables listed above (especially `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `GRAVATAR_API_KEY`).
4.  **Database Connection:** Ensure your Neon PostgreSQL database is publicly accessible (or whitelisted for Vercel's IP ranges) and the `DATABASE_URL`/`DIRECT_URL` are correctly configured.
5.  **Build & Deploy:** Vercel will automatically build and deploy your application on pushes to the main branch.

### Database Setup (Neon Postgres)
1.  **Create a Neon Account:** Sign up for a Neon.tech account.
2.  **Create a New Project:** Create a new project and a new database instance.
3.  **Obtain Connection String:** Neon will provide a PostgreSQL connection string. Copy this and use it for `DATABASE_URL` and `DIRECT_URL` environment variables.
4.  **Run Migrations:** After deployment, you will need to run Prisma migrations on your Neon database to set up the schema. This can typically be done via a Vercel deployment hook or a CI/CD pipeline step (e.g., `npx prisma migrate deploy`).

## 8. Future Enhancements
*   **Robust Authentication:** Implement full NextAuth.js or a similar solution with social logins, password reset, etc.
*   **Role-Based Access Control:** Implement more granular permissions for different user roles.
*   **Advanced Hierarchy Visualization:** Integrate a more interactive and feature-rich visualization library (e.g., D3.js based solution).
*   **Employee Profile Page Enhancements:** Allow users to update their own details, profile picture, etc.
*   **Testing:** Comprehensive unit, integration, and end-to-end tests.
*   **Internationalization (i18n):** Support for multiple languages.

---
End of Technical Document
