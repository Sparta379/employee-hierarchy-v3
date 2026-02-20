-- CreateTable
CREATE TABLE "employees" (
    "employee_number" TEXT NOT NULL,
    "dept_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "role_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_number")
);

-- CreateTable
CREATE TABLE "users" (
    "employee_number" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("employee_number")
);

-- CreateTable
CREATE TABLE "reporting_line_managers" (
    "employee_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,

    CONSTRAINT "reporting_line_managers_pkey" PRIMARY KEY ("employee_id","manager_id")
);

-- CreateTable
CREATE TABLE "branches" (
    "branch_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "dept_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_number_key" ON "employees"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_number_key" ON "users"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_dept_number_fkey" FOREIGN KEY ("dept_number") REFERENCES "departments"("dept_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_branch_number_fkey" FOREIGN KEY ("branch_number") REFERENCES "branches"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_number_fkey" FOREIGN KEY ("role_number") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_number_fkey" FOREIGN KEY ("employee_number") REFERENCES "employees"("employee_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_line_managers" ADD CONSTRAINT "reporting_line_managers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_line_managers" ADD CONSTRAINT "reporting_line_managers_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("employee_number") ON DELETE RESTRICT ON UPDATE CASCADE;
