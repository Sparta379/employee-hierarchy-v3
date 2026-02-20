import React from 'react';
import styles from './user-manual.module.css';

const UserManual = () => (
  <main className={styles.page}>
    <h1 className={styles.heading}>User Manual</h1>

    <section className={styles.section}>
      <h2>Register & Login</h2>
      <div>
        <img src="/images/help-page/register.png" alt="Register your account" />
        <p className={styles['image-description']}>
          Register your account. This will only work if you have a valid employee number.
        </p>
      </div>
      <div>
        <img src="/images/help-page/login.png" alt="Login screen" />
        <p className={styles['image-description']}>
          Then you can login with the details you provided during registration.
        </p>
      </div>
    </section>

    <section className={styles.section}>
      <h2>Hierarchy View</h2>
      <div>
        <img src="/images/help-page/tree-view.png" alt="Employee hierarchy tree" />
        <p className={styles['image-description']}>
          When you are logged in you are presented with a tree view of the organisation&apos;s employee hierarchy.
          You can drag in the hierarchy&apos;s open spaces to move around and use scroll to zoom in and out.
        </p>
      </div>
      <div>
        <img src="/images/help-page/profile-details.png" alt="Employee profile details" />
        <p className={styles['image-description']}>
          You can click on an employee&apos;s profile photo to see more details on that employee. You can also remove an employee from the hierarchy in this menu.
          <br/> You can also click on the open space around the profile picture to expand/collapse the nodes under the employee in the hierarchy.
        </p>
      </div>
      <div>
        <img src="/images/help-page/drag-employee.png" alt="Drag employee card" />
        <p className={styles['image-description']}>
          You can drag an employee&apos;s card to another employee&apos;s box to change the hierarchy (as long as it doesn&apos;t cause a circular reporting line).
        </p>
      </div>
      <div>
        <img src="/images/help-page/search-employee.png" alt="Search employee" />
        <p className={styles['image-description']}>
          You can search for a specific employee in the search box using name or employee number in the top left. When you click search, it will make sure the employee is visible in the tree, then you can click center for it to take you to that specific employee&apos;s card.
        </p>
      </div>
      <div>
        <p>
          You can reset view, expand all nodes, and collapse all nodes in the top right.
        </p>
        <img src="/images/help-page/add-employee.png" alt="Add Employee" />
        <p className={styles['image-description']}>
          You can also add a new employee to the hierarchy here.
        </p>
      </div>
    </section>

    <section className={styles.section}>
      <h2>List View</h2>
      <p>Then in the center top of the screen there is a list view button.</p>
      <div>
        <img src="/images/help-page/list-view.png" alt="List of employees" />
        <p className={styles['image-description']}>
          This will take you to a list view of all the employees in the system.
        </p>
      </div>
      <div>
        <img src="/images/help-page/list-search-filter.png" alt="Search and filter employees" />
        <p className={styles['image-description']}>You can search and filter.</p>
      </div>
      <div>
        <img src="/images/help-page/edit-employee.png" alt="Edit employee details" />
        <p className={styles['image-description']}>
          You can edit all the saved details of an employee.
        </p>
      </div>
      <p>You can delete any employee as long as they are not the CEO or at the top of a reporting chain.</p>
    </section>

    <section className={styles.section}>
      <h2>Management Page</h2>
      <div>
        <img src="/images/help-page/management.png" alt="Management" />
        <p className={styles['image-description']}>
          On the top right of the page there is a management button that links you to the management page.
        </p>
      </div>
      <div>
        <img src="/images/help-page/manage-employees.png" alt="Manage employees" />
        <p className={styles['image-description']}>Here you can add new employees to the database.</p>
      </div>
      <div>
        <img src="/images/help-page/manage-branches.png" alt="Manage branches, departments, roles" />
        <p className={styles['image-description']}>
          Manage Branches, Departments and Roles. You can add, edit, and delete these.
        </p>
      </div>
    </section>

    <section className={styles.section}>
      <h2>Your Profile</h2>
      <p>You can also click on the profile picture at the top right to view your profile.</p>
      <div>
        <img src="/images/help-page/profile-page.png" alt="Profile Page" />
        <p className={styles['image-description']}>Here you can see your information.</p>
      </div>
      <div>
        <img src="/images/help-page/manage-gravatar.png" alt="Manage gravatar" />
        <p className={styles['image-description']}>
          You can also click on your profile picture on this page to manage your gravatar.
        </p>
      </div>
      <div>
        <img src="/images/help-page/edit-profile.png" alt="Edit profile picture and details" />
        <p className={styles['image-description']}>
          Here you can edit your profile picture and any details you want to make available on gravatar accounts.
        </p>
      </div>
      <p>Then you can logout by clicking the logout button on the top right of the page.</p>
      <p>You can also go to the home page by clicking on the EPI-USE logo on the top left.</p>
    </section>
  </main>
);

export default UserManual;