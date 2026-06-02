# TaskFlow — User Manual

**Version 1.2 | Enterprise Workspace**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Accessing TaskFlow](#2-accessing-taskflow)
3. [Authentication](#3-authentication)
   - 3.1 [Sign In](#31-sign-in)
   - 3.2 [Register a New Account](#32-register-a-new-account)
   - 3.3 [Sign Out](#33-sign-out)
4. [Navigation](#4-navigation)
   - 4.1 [Sidebar](#41-sidebar)
   - 4.2 [Header Bar](#42-header-bar)
   - 4.3 [Mobile Navigation](#43-mobile-navigation)
5. [Dashboard](#5-dashboard)
6. [Projects](#6-projects)
   - 6.1 [Viewing All Projects](#61-viewing-all-projects)
   - 6.2 [Creating a Project](#62-creating-a-project)
   - 6.3 [Reordering Projects](#63-reordering-projects)
7. [Project Board](#7-project-board)
   - 7.1 [Kanban Board View](#71-kanban-board-view)
   - 7.2 [List View](#72-list-view)
   - 7.3 [Filtering Tasks](#73-filtering-tasks)
8. [Tasks](#8-tasks)
   - 8.1 [Creating a Task](#81-creating-a-task)
   - 8.2 [Viewing Task Details](#82-viewing-task-details)
   - 8.3 [Editing a Task](#83-editing-a-task)
   - 8.4 [Moving Tasks Between Columns](#84-moving-tasks-between-columns)
   - 8.5 [Adding and Removing Labels](#85-adding-and-removing-labels)
   - 8.6 [Deleting a Task](#86-deleting-a-task)
   - 8.7 [Bulk Operations](#87-bulk-operations)
9. [Comments](#9-comments)
10. [Search](#10-search)
    - 10.1 [Quick Search Modal](#101-quick-search-modal)
    - 10.2 [Full Search Page](#102-full-search-page)
11. [Profile](#11-profile)
12. [Settings](#12-settings)
    - 12.1 [Theme Mode](#121-theme-mode)
    - 12.2 [Project Settings](#122-project-settings)
13. [Keyboard Shortcuts](#13-keyboard-shortcuts)
14. [Mobile Usage](#14-mobile-usage)
15. [Default Accounts](#15-default-accounts)

---

## 1. Introduction

TaskFlow is a team task management workspace that organizes work across multiple projects using a Kanban board model. It supports multiple users, project-based task tracking, real-time collaboration through comments, and role-based team member assignment.

Key concepts:

| Concept | Description |
|---|---|
| **Project** | A named workspace (e.g. "Website Redesign") that contains tasks and has assigned team members |
| **Task** | A unit of work inside a project with a title, status, priority, assignee, due date, and labels |
| **Status** | One of four stages: **To Do → In Progress → In Review → Done** |
| **Priority** | One of four levels: **Low, Normal, High, Urgent** |
| **Label** | A free-text tag attached to a task for categorization (e.g. `#frontend`, `#bug`) |

---

## 2. Accessing TaskFlow

| Mode | URL |
|---|---|
| Local development | http://localhost:3000 |
| Docker deployment | http://localhost:3500 |

Open the URL in any modern browser. The application loads with a full-page spinner while it restores your session. If no session is found, you are redirected to the login page.

---

## 3. Authentication

### 3.1 Sign In

The **Sign In** tab is shown by default on the login page.

**Steps:**

1. The page displays a list of all registered users as selectable profile cards.
2. Click the card of the user you want to sign in as. A blue ring appears around the selected card and a checkmark replaces the initials.
3. Your email address appears below the card list.
4. Enter your **password** in the password field. Click the eye icon to show or hide the password.
5. Click **Proceed to Dashboard**.

> **Default credentials for seeded accounts:** password is `password123` for all pre-loaded users. See [Section 15](#15-default-accounts) for the full list.

**Validation:**
- You must select a profile before the password field appears.
- Password is required to submit.

---

### 3.2 Register a New Account

1. Click the **Join Team** tab at the top of the login page.
2. Fill in the form:

| Field | Description | Validation |
|---|---|---|
| **Professional Name** | Your display name | Minimum 2 characters, max 25 |
| **Email Address** | Unique email address | Must contain `@` |
| **Password** | Login password | Minimum 6 characters |
| **Role** | Select from dropdown | Product Manager, Developer, Designer, QA Specialist, Content Writer, Team Lead |
| **Avatar Color** | Click one of 7 color swatches | Required (blue selected by default) |

3. A **live preview card** appears below as you type your name, showing how your avatar will look.
4. Click **Complete Onboarding & Enter**.
5. On success, you are automatically logged in and taken to the Dashboard.

> **Note:** Email addresses must be unique. If the address is already registered, an error banner appears.

---

### 3.3 Sign Out

1. Click your **user avatar** in the top-right corner of the header bar.
2. A small dropdown appears showing your name.
3. Click **Sign Out Session**.

You are returned to the login page and your session token is cleared.

---

## 4. Navigation

### 4.1 Sidebar

The sidebar appears on the left side of the screen on tablets and desktops.

| Item | Destination |
|---|---|
| **TaskFlow logo** | Dashboard (home) |
| **Dashboard** | `/` — your personal stats and overdue tasks |
| **All Projects** | `/projects` — list of all projects |
| **Faceted Search** | `/search` — advanced search with filters |
| **User Profile** | `/profile` — edit your name, color, and view the team directory |
| **Global Settings** | `/settings` — project configuration and theme |

**Projects quick-list:** Below the main navigation, the sidebar shows all your projects with colored dots and the count of unresolved (non-done) tasks. Click any project name to open its board directly.

**Collapsing the sidebar (desktop only):** Click the **chevron arrow** at the top-right of the sidebar to collapse it to icon-only mode. Click again to expand.

---

### 4.2 Header Bar

The header is always visible at the top of the screen.

| Element | Action |
|---|---|
| **Search bar** (desktop) or **search icon** (mobile) | Opens the Quick Search modal |
| **Moon / Sun icon** | Toggles dark mode / light mode |
| **Bell icon** | Opens the notifications panel |
| **User avatar** (top right) | Opens the account dropdown (Sign Out) |

---

### 4.3 Mobile Navigation

On screens narrower than 480 px, the sidebar is replaced by a **fixed bottom navigation bar** with five tabs:

| Icon | Destination |
|---|---|
| Home | Dashboard |
| Grid | All Projects |
| Plus (center) | Create Task (quick add) |
| Search | Faceted Search |
| Person | User Profile |

On screens between 480 px and 768 px, a **hamburger menu** button appears in the header. Tap it to slide in the sidebar as an overlay. Tap outside the sidebar or press the close button to dismiss it.

---

## 5. Dashboard

The Dashboard is your personal overview screen. It shows only tasks assigned to **you**.

### Welcome Banner

At the top of the page, a card shows:
- Your name with a greeting
- Today's date
- A **Quick Create Task** button (blue, top right) — opens the task creation drawer with status set to "To Do"

### Weekly Progress

A bar chart shows the distribution of your tasks across four statuses:

| Bar | Color | Meaning |
|---|---|---|
| To Do | Light blue | Tasks not yet started |
| Active | Amber | Tasks in progress |
| In Review | Blue | Tasks awaiting review |
| Done | Dark blue | Completed tasks |

Below the chart, three summary numbers are displayed:
- **Backlogged** — count of your To Do tasks
- **Overdue** — count of tasks past their due date and not done (shown in red)
- **Productivity Rate** — percentage of your tasks that are Done (shown in green)

### Urgent & Overdue

The red card on the right shows up to 3 of your tasks that have a **due date in the past** and are not yet marked Done. Each entry shows the task title, project name, and due date. Click any task to open its detail modal.

If more than 3 tasks are overdue, a "+ X more overdue tasks" message appears at the bottom.

### Active Projects

Shows up to 3 projects with a progress bar indicating what percentage of that project's tasks are Done. Click a project name to navigate to its board.

Click **View all project boards** to go to the Projects page.

### Active Responsibilities

A list of your active (non-Done) tasks, showing:
- Task title (click to open detail)
- Project name with colored indicator
- Status
- Priority badge

If you have more than 4 active tasks, a note at the bottom indicates how many more exist. Click **Filter List** to go to the full search page.

---

## 6. Projects

### 6.1 Viewing All Projects

Navigate to **All Projects** in the sidebar (or `/projects`).

Each project is shown as a card with:
- Project name and ID
- Task counts: **Total**, **Active** (in progress), **Resolved** (done)
- A **progress bar** showing the percentage of tasks completed
- **Team members** shown as overlapping avatar circles

Click anywhere on a project card to open its board.

---

### 6.2 Creating a Project

1. Click **Create New Project** (top right of the Projects page).
2. A creation form slides in from the right.
3. Fill in the fields:

| Field | Description | Validation |
|---|---|---|
| **Project Name** | The name of the project | 3–50 characters, must be unique |
| **Interface Color** | Choose one of 7 color swatches | Required |
| **Assign Members** | Click member avatars to add them to the project | At least 1 member required |

4. Click **Create Project** to save, or **Cancel** to discard.

> **Tip:** If the project name is already taken, an error message appears below the field: *"Project name must be unique in this workspace."*

---

### 6.3 Reordering Projects

On the Projects page, you can drag and drop project cards to change their display order.

1. Hover over a project card — a **grip icon** appears.
2. Click and hold the card, then drag it to a new position.
3. Release to drop. The new order is saved automatically.

> **Note:** While dragging, the card becomes semi-transparent and surrounding cards shift to indicate the drop position.

---

## 7. Project Board

Click any project name to open its board. At the top you'll see the project name, creation date, and total task count.

### 7.1 Kanban Board View

The default view shows four columns, one per status:

| Column | Status Value |
|---|---|
| To Do | `todo` |
| In Progress | `in_progress` |
| In Review | `in_review` |
| Done | `done` |

Each column shows:
- A colored dot, column name, and task count
- A scrollable list of task cards
- An **Add new task** button at the bottom of the column

**Task card contents:**
- Task title
- Priority badge
- Due date (shown in red if overdue)
- Assignee avatar
- Comment count

Click any task card to open the **Task Detail Modal**.

---

### 7.2 List View

Click the **List View** button (next to Kanban Board) to switch to a table layout.

The table has the following columns:

| Column | Sortable | Description |
|---|---|---|
| Checkbox | — | Select tasks for bulk operations |
| ID | — | Task ID (monospace) |
| Task Title | ✓ | Title and labels |
| Priority | ✓ | Color-coded priority badge |
| Status | — | Inline dropdown to change status |
| Assignee | — | Avatar and first name |
| Due Date | ✓ | Date or "—" if not set |

**Sorting:** Click a column header with the ↕ icon to sort ascending. Click again to sort descending.

**Changing task status inline:** Click the status dropdown in any row and select a new status. The change is saved immediately.

---

### 7.3 Filtering Tasks

The filter bar appears below the project header on both Kanban and List views.

**Keyword search:**
- Type in the search box to filter tasks by title or description in real time.

**Assignee filter:**
- Click any team member's avatar in the filter bar to show only their tasks. Click again to deselect.
- Multiple assignees can be selected simultaneously.

**Priority and Status filters:**

1. Click the **Priority / Status** button to expand the filter panel.
2. Click priority pills (**Low, Normal, High, Urgent**) to toggle them on/off.
3. Click status pills (**To Do, In Progress, In Review, Done**) to toggle them on/off.
4. Multiple options can be active at the same time.

**Clearing filters:**
- When any filter is active, a red **Clear All Filters** link appears. Click it to reset all filters at once.

---

## 8. Tasks

### 8.1 Creating a Task

There are three ways to create a task:

**Method 1 — Quick Create Task (Dashboard)**
- Click **Quick Create Task** on the Dashboard banner. The drawer opens with status set to "To Do".

**Method 2 — Add Task (Project Board header)**
- On any Project Board, click the blue **Add Task** button in the top-right area.

**Method 3 — Add new task (Kanban column)**
- Click the **+ Add new task** button at the bottom of any Kanban column. The drawer opens with that column's status pre-selected.

**Task creation drawer fields:**

| Field | Required | Description |
|---|---|---|
| **Task Title** | ✓ | Short description of the task. Max 200 characters. |
| **Description** | — | Detailed scope or requirements. Resizable textarea. |
| **Project** | ✓ | Select which project this task belongs to. |
| **Assignee** | — | Click a team member's avatar to assign. Click the "—" button to leave unassigned. |
| **Priority** | — | Segmented control: Low / Normal / High / Urgent. Default: Normal. |
| **Due Date** | — | Date picker. A warning appears if the selected date is in the past. |
| **Labels / Tags** | — | Type a tag name and press Enter or click **Add** to attach it. Click × on a tag to remove it. |

Click **Create Task** (bottom right of the drawer) to save, or **Cancel** to discard.

> **Note:** The drawer closes immediately after creating. The new task appears in the correct Kanban column within seconds.

---

### 8.2 Viewing Task Details

Click any task card (Kanban view) or task title (List view) to open the **Task Detail Modal**.

The modal is divided into two panels:

**Left panel:**
- Task ID and project name (header)
- Task title (click to edit inline)
- Description (click to expand and edit)
- Labels section
- Comment thread

**Right panel (Task Metadata):**
- Status dropdown
- Assignee dropdown
- Priority dropdown
- Due Date picker
- Created date

---

### 8.3 Editing a Task

All task fields can be edited directly in the Task Detail Modal.

**Editing the title:**
1. Click the task title text. It transforms into an editable input field with a blue border.
2. Type the new title (max 200 characters).
3. Press **Enter** or click outside the field to save. The change is saved automatically.

**Editing the description:**
1. Click anywhere in the description textarea.
2. Type or modify the text.
3. Click **Save Details** to save, or **Cancel** to discard changes.

**Changing status:**
- Click the **Status** dropdown in the right panel and select a new value.
- The change is saved immediately and a success toast appears.

**Changing priority:**
- Click the **Priority** dropdown and select Low, Normal, High, or Urgent.

**Changing assignee:**
- Click the **Assignee** dropdown. Select a team member to assign, or select **Unassigned** to clear the assignment.

**Changing due date:**
- Click the **Due Date** field and use the date picker to select a date. Clear the field to remove the due date.

---

### 8.4 Moving Tasks Between Columns

**Method 1 — Drag and drop (Kanban view):**
1. Click and hold a task card.
2. Drag it over the target column. The column highlights with a blue dashed border.
3. Release the mouse button to drop. A brief green ring animation confirms the move.

**Method 2 — Status dropdown (Task Detail Modal):**
- Change the **Status** field in the right panel of the Task Detail Modal.

**Method 3 — Inline status change (List View):**
- Click the status dropdown in the row and select a new status.

---

### 8.5 Adding and Removing Labels

Labels can be managed from the Task Detail Modal.

**Adding a label:**
1. In the **Labels** section of the left panel, click **+ Add Label**.
2. An input field appears. Type the label name (e.g. `frontend`, `bug`, `design`).
3. Press **Enter** to confirm. The label appears as a blue pill prefixed with `#`.

**Removing a label:**
- Click the **×** button on any label pill to remove it immediately.

Labels are also shown as gray tags below the task title in the List View table.

---

### 8.6 Deleting a Task

**From the Task Detail Modal:**
1. Click the **red trash icon** in the top-right corner of the modal header.
2. A confirmation dialog appears: *"Are you sure you want to delete this task? This action cannot be undone."*
3. Click **OK** to confirm. The task is deleted and the modal closes.

> **Warning:** Deleting a task also deletes all its comments. This action cannot be undone.

---

### 8.7 Bulk Operations

Bulk operations are only available in **List View**.

**Selecting tasks:**
- Click the **checkbox** on the left of any task row to select it.
- Click the **checkbox in the header row** to select or deselect all visible tasks.

When one or more tasks are selected, the **bulk action bar** appears at the top of the table in blue.

**Available bulk actions:**

| Action | How to use | Description |
|---|---|---|
| **Move to status** | Select from the dropdown | Moves all selected tasks to the chosen status |
| **Unassign Users** | Click the button | Removes assignees from all selected tasks |
| **Delete** | Click the red button | Deletes all selected tasks (with confirmation dialog) |
| **Deselect** | Click the link | Clears the selection without taking action |

> **Confirmation:** Bulk delete shows a dialog: *"Are you sure you want to delete these X tasks?"*

---

## 9. Comments

Every task has a threaded comment section in the lower-left panel of the Task Detail Modal.

**Viewing comments:**
- All comments appear in chronological order (oldest first).
- Each comment shows the author's avatar, name, comment text, and relative time (e.g. "2h ago", "3d ago").

**Posting a comment:**
1. Click the text area at the bottom of the comment section. Placeholder: *"Write a response... (Press Send)"*
2. Type your comment. Maximum 2 000 characters.
3. A character counter appears when you reach 1 800 characters.
4. Click the **Send** button (paper plane icon) or press it directly.
5. A brief spinner animation confirms the comment is being posted. It appears in the list within a second.

> **Note:** Comments are posted as the currently logged-in user. You cannot post comments when not logged in.

---

## 10. Search

### 10.1 Quick Search Modal

The Quick Search modal provides fast, instant search across all content.

**Opening the modal:**
- Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac)
- Or click the **search bar** in the header (desktop) / **search icon** (mobile)

**Using the modal:**
1. Start typing your search term. Results update in real time.
2. Results are grouped into three sections:
   - **Tasks** — shows up to 5 matching tasks with title, description preview, and status
   - **Projects** — shows all matching projects
   - **Team Members** — shows matching users

3. Click any result to navigate:
   - Task → opens Task Detail Modal
   - Project → opens the project's board
   - Team member → displays their card (no navigation)

4. To see all results, press **Enter** or click **"Press Enter to view all results page →"** in the footer.

**Closing the modal:**
- Press **Escape**
- Click anywhere outside the modal

---

### 10.2 Full Search Page

Navigate to **Faceted Search** in the sidebar (or `/search`).

**Searching:**
1. Type your keyword in the main search bar.
2. Press **Enter** or click the **Search** button.

**Filtering results** (left panel):

| Filter | Type | Options |
|---|---|---|
| **Project** | Dropdown | All Projects, or select a specific project |
| **Status** | Dropdown | All Statuses / To Do / In Progress / In Review / Done |
| **Priority** | Dropdown | All Priorities / Low / Normal / High / Urgent |
| **Assignee** | Dropdown | All Members, or select a specific team member |

All filters are applied together (AND logic). Results update as you change dropdowns.

**Result cards** show:
- Task ID, project name, and priority badge
- Task title (click to open detail)
- Description preview
- Labels
- Assignee avatar
- Status badge

**Resetting filters:** Click the red **Reset** link that appears in the filter panel when any filter is active.

---

## 11. Profile

Navigate to **User Profile** in the sidebar (or `/profile`).

### Editing Your Profile

The left card contains an editable form with:

| Field | Description |
|---|---|
| **Display Name** | Your visible name across the workspace. Min 2 characters. |
| **Avatar Initials** | Shown on your avatar bubble. Automatically derived from your name when saved. |
| **Accent Theme Color** | Click one of 7 color swatches to change your avatar color. |

The avatar preview at the top of the form updates live as you change the color.

Click **Save Profile Config** to persist changes to the database. A success toast confirms the save.

### Notification Preferences

Three checkboxes below the color picker allow you to configure notification preferences:
- **Dispatch email digests on assigned tasks**
- **Enable native system browser push triggers**
- **Receive relative digest summaries daily at 8:00 AM**

### Team Directory

The right card shows a read-only list of all workspace members with their name, role, and user ID.

Your own entry is highlighted with a **YOU** badge in blue.

### Signing Out

Click **Sign Out Session** (bottom left of the form) to log out and return to the login page.

---

## 12. Settings

Navigate to **Global Settings** in the sidebar (or `/settings`).

### 12.1 Theme Mode

At the top of the settings page, a **segmented toggle** switches between:

| Option | Effect |
|---|---|
| **Light** | Warm beige background (`#F1EFE8`), dark text |
| **Dark** | Deep black background (`#121212`), light text |

The theme change applies immediately across the entire application and is remembered for your next visit.

> **Tip:** You can also toggle dark mode from the **moon/sun icon** in the header bar at any time.

---

### 12.2 Project Settings

**Selecting a project:**
1. Use the **Active Selected Project** dropdown to choose which project to configure.
2. Click **Go to project board →** to navigate to that project's board directly.

**Editing project metadata:**

| Field | Description | Validation |
|---|---|---|
| **Project Name** | Rename the project | 3–50 characters, must be unique |
| **Accent Color** | Change the project's color identity | Select from 7 swatches |
| **Collaborators** | Check/uncheck team members | At least 1 must remain checked |

Click **Save Project Config** to save all changes. A success toast confirms.

**Column Management** (right panel):
- Displays the current list of board columns.
- The four default columns (**To Do, In Progress, In Review, Done**) are locked and cannot be deleted.
- Custom columns can be added and deleted.
- To add: type a column name and click **Add**.
- To delete: click the trash icon next to a custom column.

> **Note:** Column management is a preview feature. Changes to columns are shown locally but the board always uses the four built-in statuses.

---

## 13. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| **Ctrl+K** / **Cmd+K** | Open Quick Search modal |
| **Escape** | Close any open modal, drawer, or search overlay |
| **Enter** (search modal) | Navigate to full search results page |
| **Enter** (task title edit) | Save the title change |
| **Enter** (label input) | Add the typed label to the task |

---

## 14. Mobile Usage

TaskFlow is fully responsive across all screen sizes.

| Screen Width | Layout |
|---|---|
| ≥ 768 px (tablet/desktop) | Sidebar always visible, collapsible |
| 480 px – 767 px | Sidebar hidden; hamburger menu in header opens it as an overlay |
| < 480 px | Sidebar replaced by a bottom navigation bar with 5 icon tabs |

**Tips for mobile use:**
- Use the **center plus button** in the bottom nav to quickly create a task from any screen.
- The Kanban board scrolls horizontally on small screens — swipe left and right to see all four columns.
- The Task Detail Modal is scrollable; swipe up on the modal to see the comments section.
- Tap outside an open modal or drawer to close it.

---

## 15. Default Accounts

The following accounts are pre-loaded in the system. All share the password **`password123`**.

| Name | Email | Role |
|---|---|---|
| Alex Chen | alex@taskflow.dev | PM |
| Priya Sharma | priya@taskflow.dev | Developer |
| Jordan Lee | jordan@taskflow.dev | Designer |
| Marco Rossi | marco@taskflow.dev | Developer |
| Sara Kim | sara@taskflow.dev | QA |

> **Security note:** Change the default passwords after first login in a production environment. Passwords are hashed with bcrypt (cost factor 12) and are never stored in plain text.

---

*TaskFlow Enterprise Workspace v1.2 — User Manual*
