# Vercel Deployment Steps for EPI-USE-EmployeeHierarchyManagement

This document outlines the steps required to deploy the `org-hierarchy-app` to Vercel, including necessary environment variables and Prisma setup.

## Prerequisites

*   A Vercel account.
*   Vercel CLI installed (optional, but recommended for local deployment testing).
*   Access to a Neon Postgres database (or any PostgreSQL database compatible with Prisma).

## Deployment Steps

1.  **Clone the Repository:**
    If you haven't already, clone your project repository:
    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>/references/EPI-USE-EmployeeHierarchyManagement-main/org-hierarchy-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables on Vercel:**
    The application requires the following environment variables. You *must* configure these in your Vercel project settings.

    *   Go to your Vercel Project Dashboard.
    *   Navigate to "Settings" -> "Environment Variables".
    *   Add the following variables:

        *   `DATABASE_URL`: Your pooled connection string for Neon Postgres (or your primary database connection string for Prisma Client).
            Example: `postgresql://neondb_owner:npg_YOURPASSWORD@ep-divine-base-ag1gnypd-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
        *   `DIRECT_URL`: Your direct connection string for Neon Postgres (used by Prisma Migrate).
            Example: `postgresql://neondb_owner:npg_YOURPASSWORD@ep-divine-base-ag1gnypd.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
        *   `NEXTAUTH_SECRET`: A strong, random string used for NextAuth.js (if your application uses it - this project uses custom session handling, but a secret is generally good practice for production deployments).
            You can generate one using `openssl rand -base64 32`.
        *   `GRAVATAR_API_KEY`: (If you use Gravatar API, otherwise omit) Your Gravatar API key.

    **Important Note for Neon/Prisma:**
    Vercel automatically detects Prisma usage. During the build process, Vercel will attempt to run `npx prisma migrate deploy` to apply your migrations to the connected database. Ensure your `DIRECT_URL` is correctly configured in Vercel.

4.  **Configure Build Command (Optional, usually automatic for Next.js):**
    Vercel should automatically detect that this is a Next.js project and use `next build`. If for some reason it doesn't, or you have a custom setup, ensure your build command is `npm run build`.

5.  **Deployment:**

    *   **Via Git Integration:** The easiest way is to connect your Git repository (GitHub, GitLab, Bitbucket) to Vercel. Every push to your main branch will trigger an automatic deployment.
    *   **Via Vercel CLI:**
        ```bash
        vercel --prod
        ```
        This command deploys your project to production.

## Post-Deployment

*   **Verify Database Migrations:** After the first deployment, check your Vercel build logs to ensure that `prisma migrate deploy` ran successfully and applied all migrations to your Neon Postgres database.
*   **Test Application:** Access your deployed application URL and verify that all functionalities (employee CRUD, login, hierarchy view, etc.) are working as expected with the live database.

This completes the Vercel deployment setup.
