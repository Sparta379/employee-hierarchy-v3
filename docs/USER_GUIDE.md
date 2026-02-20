# EPI-USE Employee Hierarchy Management - User Guide

## Overview
Welcome to the EPI-USE Employee Hierarchy Management application. This guide will walk you through the essential features and functionalities of the system, enabling you to effectively manage employee data and visualize the organizational hierarchy.

## Table of Contents
1.  [Login and Registration](#login-and-registration)
2.  [Dashboard/Home Page](#dashboardhome-page)
3.  [Managing Employees](#managing-employees)
    *   [Viewing Employees](#viewing-employees)
    *   [Adding a New Employee](#adding-a-new-employee)
    *   [Editing Employee Details](#editing-employee-details)
    *   [Deleting an Employee](#deleting-an-employee)
    *   [Searching, Sorting, and Filtering Employees](#searching-sorting-and-filtering-employees)
4.  [Visualizing Hierarchy](#visualizing-hierarchy)
5.  [Profile Management](#profile-management)
6.  [Troubleshooting](#troubleshooting)

---

## 1. Login and Registration
### Registration
If you are a new user, you will need to register an account.
1.  Click on the "Register" button in the navigation bar.
2.  Fill in the required details (Employee Number, Email, Password).
3.  Click "Register" to create your account.

### Login
1.  Click on the "Login" button in the navigation bar.
2.  Enter your registered email and password.
3.  Click "Login" to access the application.

## 2. Dashboard/Home Page
Upon successful login, you will be redirected to the Home Page, which provides a general overview or quick access to key features.

## 3. Managing Employees
The "Employees" section (accessible via the navigation bar after logging in) allows you to perform CRUD (Create, Read, Update, Delete) operations on employee records.

### Viewing Employees
On the "Employees" page, you will see a table listing all employees in the system. Each row displays an employee's details such as Employee Number, Name, Branch, Department, Role, Salary, and Birth Date.

### Adding a New Employee
1.  Navigate to the "Employees" page.
2.  Click on a prominent "Add New Employee" button (if available) or locate the form to input new employee data.
3.  Fill in all required fields:
    *   **Employee Number:** A unique identifier for the employee.
    *   **Branch:** Select the employee's branch from the dropdown.
    *   **Department:** Select the employee's department from the dropdown.
    *   **Role:** Select the employee's role from the dropdown.
    *   **Name:** The employee's first name.
    *   **Surname:** The employee's last name.
    *   **Birth Date:** The employee's date of birth.
    *   **Salary:** The employee's salary.
    *   **Email:** The employee's email address (used for Gravatar and user account).
    *   **Password:** A temporary password for the employee's user account.
4.  Click "Add Employee" to save the new record.

### Editing Employee Details
1.  On the "Employees" page, find the employee you wish to edit in the table.
2.  Click the "Edit" button in the "Actions" column for that employee.
3.  The employee's details will become editable. Make the necessary changes.
4.  **Managing Reporting Lines:**
    *   Within the edit form, you can see who the employee manages.
    *   To remove a subordinate, click "Remove" next to their name.
    *   To add a new subordinate, use the "Search and add employee to report to this person..." dropdown. Select an employee, and they will be assigned as a subordinate.
    *   *Note: The system prevents an employee from managing themselves or creating circular reporting relationships.*
5.  Click "Save" to apply the changes, or "Cancel" to discard them.

### Deleting an Employee
1.  On the "Employees" page, find the employee you wish to delete.
2.  Click the "Delete" button in the "Actions" column for that employee.
3.  A confirmation dialog will appear. Confirm your decision to proceed.
    *   *Note: If the deleted employee managed others, their subordinates will be automatically reassigned to the deleted employee's manager (if one exists).*

### Searching, Sorting, and Filtering Employees
The employee list provides robust tools to find and organize employee data:

*   **Search:** Use the "Search by Employee Number or Name" input field to quickly find employees matching your text.
*   **Filters:** Click "Show Filters" to reveal additional filtering options:
    *   **Branch, Department, Role:** Select from dropdowns to view employees belonging to specific organizational units.
    *   **Salary Range:** Enter minimum and maximum salary values to see employees within that pay bracket.
    *   **Birth Date Range:** Select "from" and "to" dates to filter employees by their birth date.
    *   Click "Clear All Filters" to reset all active filters.
*   **Sorting:** Click on any table column header (e.g., "Employee #", "Name", "Salary") to sort the list by that column. Click again to reverse the sort order (ascending/descending).

## 4. Visualizing Hierarchy
Navigate to the "Hierarchy" page (via the navigation bar) to view the organizational structure in a tree-like or graphical format. This page visually represents who reports to whom within the company.

## 5. Profile Management
Click on your Gravatar image (or default avatar) in the header to go to your profile page. Here, you can view your details and potentially update your Gravatar image (if integrated with a Gravatar editor).

## 6. Troubleshooting
*   **Cannot Login:** Ensure your email and password are correct. If you forgot your password, contact your administrator (password reset functionality is not implemented in this version).
*   **Missing Data:** If branches, departments, or roles are missing from dropdowns, ensure they have been configured in the system.
*   **Hierarchy Errors:** If you encounter issues with reporting lines, ensure that no circular references are being created and that managers/employees exist.
*   **API Key for Gravatar:** If Gravatar images are not appearing, ensure the `GRAVATAR_API_KEY` is correctly set in the environment variables on the server.

---
End of User Guide
