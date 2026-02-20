<p align="center">
    <img src="images/GithubLogo.png" alt="Logo" width="100%"/>
</p>

# EPI-USE-Employee Hierarchy Management

A web-based employee hierarchy management system designed to help EPI-USE visualize, manage, and maintain their employee reporting structures efficiently.  
The application features user registration and login, interactive hierarchy and list views, employee profile management, and administrative tools to manage branches, departments, and roles.  
Its intuitive interface allows users to easily navigate the organizational chart, modify reporting lines, search and filter employees, and update personal profile information, including integration with Gravatar for profile pictures.  

<h2 style="font-weight: bold;">Table of Contents</h2>

- [Documentation](#documentation)
- [User Manual](#user-manual)

# Deployment
[EPI-USE-Employee Hierarchy Management](https://epi-use-ehm.vercel.app)

<h2 style="font-weight: bold;">Documentation</h2>

- [Technical Document](docs/technical_document.md)

# User Manual

## Quick links
- [Register & Login](#register-&-login)
- [Hierarchy View](#hierarchy-view)
- [List View](#list-view)
- [Management Page](#management-page)
- [Your Profile](#your-profile)

## Register & Login

![Register your account](/images/help-page/register.png)  
Register your account. This will only work if you have a valid employee number.

![Login screen](/images/help-page/login.png)  
Then you can login with the details you provided during registration.

## Hierarchy View

![Employee hierarchy tree](/images/help-page/tree-view.png)  
When you are logged in you are presented with a tree view of the organisation's employee hierarchy.  
<br>You can drag in the hierarchy's open spaces to move around and use scroll to zoom in and out.
<br> You can also click on the open space around the profile picture to expand/collapse the nodes under the employee in the hierarchy.

![Employee profile details](/images/help-page/profile-details.png)  
You can click on an employee's profile photo to see more details on that employee. You can also remove an employee from the hierarchy in this menu.

![Drag employee card](/images/help-page/drag-employee.png)  
You can drag an employee's card to another employee's box to change the hierarchy (as long as it doesn't cause a circular reporting line).

![Search employee](/images/help-page/search-employee.png)  
You can search for a specific employee in the search box using name or employee number in the top left. When you click search, it will make sure the employee is visible in the tree (All parent nodes expanded), then you can click center for it to take you to that specific employee's card.

You can reset view, expand all nodes, and collapse all nodes in the top right.

![Add Employee](/images/help-page/add-employee.png)  
You can also add a new employee to the hierarchy here.

## List View

Then in the center top of the screen there is a list view button.

![List of employees](/images/help-page/list-view.png)  
This will take you to a list view of all the employees in the system.

![Search and filter employees](/images/help-page/list-search-filter.png)  
You can search and filter.

![Edit employee details](/images/help-page/edit-employee.png)  
You can edit all the saved details of an employee.
<br>You can delete any employee as long as they are not the CEO or at the top of a reporting chain.

## Management Page

![Management](/images/help-page/management.png)  
On the top right of the page there is a management button that links you to the management page.

![Manage employees](/images/help-page/manage-employees.png)  
Here you can add new employees to the database. These employees can register with the newly added employee number to create an account.

![Manage branches, departments, roles](/images/help-page/manage-branches.png)  
Manage Branches, Departments and Roles. You can add, edit, and delete these.

## Your Profile

You can also click on the profile picture at the top right to view your profile.

![Profile Page](/images/help-page/profile-page.png)  
Here you can see your information.

![Manage gravatar](/images/help-page/manage-gravatar.png)  
You can also click on your profile picture on this page to manage your gravatar.

![Edit profile picture and details](/images/help-page/edit-profile.png)  
Here you can edit your profile picture and any details you want to make available on gravatar accounts.

<br>Then you can logout by clicking the logout button on the top right of the page.

<br>You can also go to the home page by clicking on the EPI-USE logo on the top left.
