<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--? icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=delete" />
    <!--? Main Style -->
    <link rel="stylesheet" href="../../assets/css/app/mainStyle.css">
    <!--? Users Style -->
    <link rel="stylesheet" href="../../assets/css/app/users.css"> 
    <title>SDGKU Users</title>
</head>
    
<!--  -->
<body data-user-id="<?= $_SESSION['user_id'] ?? 0 ?>" data-user-role="<?= $_SESSION['user_role'] ?? 'faculty' ?>">
    <!--? Header  -->
    <header class="header">
        <div class="headerLogo">
            
            <img src="../../assets/images/SDGKU_Small_Logo.png" alt="logo" class="small-logo">
            <div class="full-logo"></div>
            <h1 class="header-title">SDGKU Survey Platform</h1>
        </div>
        <div class="hamburger" id="hamburger">
            <i class="fas fa-bars"></i>
        </div>
        <div class="headerBtn">
            <button class="headerBtnOut">Logout</button>
        </div>
    </header>
    <div class="dashboard-container">
        <aside>
            <nav>
                <a href="../app/dashboard.html" class="sideLink">
                    <i class="fa-solid fa-house-user"></i>
                    <p>Dashboard</p>
                </a>
                
                <a href="../surveys/mySurveys.html" class="sideLink">
                    <i class="fa-solid fa-clipboard-list"></i>
                    <p>My Surveys</p>
                </a>
                
                <a href="../surveys/createSurvey.html" class="sideLink">
                    <i class="fa-solid fa-circle-plus"></i>
                    <p>Create Survey</p>
                </a>
                
                <a href="../analytics/analytics.html" class="sideLink">
                    <i class="fa-solid fa-square-poll-vertical"></i>
                    <p>Analytics</p>
                </a>
                
                <a href="../app/users.php" class="sideLink selectLink">
                    <i class="fa-solid fa-users"></i>
                    <p>Users</p>
                </a>
                
                <a href="../app/settings.html" class="sideLink">
                    <i class="fa-solid fa-cog"></i>
                    <p>Settings</p> 
                </a>

                <div class="asideLogOutBtn">
                    <button class="asideBtnOut">Logout</button>
                </div>
            </nav>
            
            <div class="profile">
                <div class="profile-img">
                    <!--? Imagen del Usuario(if no image, use icon) -->
                    <i class="fa-solid fa-circle-user" id = "userFoto"></i>
                </div>
                
                <div class="profile-info">
                    <h4>
                        <!--? Rol del Usuario -->
                        Rol del Usuario
                    </h4>

                    <small>
                        <!--? Nombre del Usuario -->
                        Nombre del Usuario
                    </small>
                </div>
            </div>
        </aside>

        <main class="principalDashboard">
            <div class="user-management-header">
                <div>
                    <h2>User Management</h2>
                    <p>Manage users and their permissions</p>
                </div>
                <div class="user-actions">
                    <div class="search-container">
                        <i class="fas fa-search"></i>
                        <input type="text" id="search-input" placeholder="Search users...">
                    </div>
                    <button id="add-user-btn" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Add User
                    </button>
                </div>
            </div>

            <div class="users-container">
                <div class="users-header">
                    <h3>Users</h3>
                    <p>Manage user accounts and permissions</p>
                </div>
                <div class="users-table-container">
                    <table id="users-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <!-- User rows will be populated by js -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Add User Modal -->
    <div id="add-user-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New User</h2>
                <p>Create a new faculty account</p>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="add-user-form">
                    <input type="hidden" name="role" value="faculty">
                    <div class="form-group">
                        <label for="full-name">Full Name</label>
                        <input type="text" id="full-name" name="full_name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">Send Invitation</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="edit-user-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update User Role</h2>
                <p>Change the role of this user</p>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="edit-user-form">
                    <input type="hidden" id="edit-user-id">
                    <div class="form-group">
                        <label for="edit-role">Role</label>
                        <select id="edit-role" required>
                            <option value="faculty">Faculty</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Master Admin</option>
                        </select>

                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-cancel" id="cancel-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Give Main Admin Role Warning -->
    <div id="super-admin-confirm-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Warning: Main Admin Privileges</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>You are about to grant Main Admin privileges. This user will have full control over the system, including the ability to modify or delete your account.</p>
                <p>Are you absolutely sure you want to proceed?</p>
                <input type="hidden" id="super-admin-user-id">
                <div class="form-actions">
                    <button type="button" class="btn btn-cancel">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-super-admin">Grant Main Admin</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Confirm resend Invitation email modal -->
    <div id="resend-invitation-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Resend Invitation</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to resend the invitation email to this user?</p>
                <input type="hidden" id="resend-invitation-user-id">
                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" id="cancel-resend">Cancel</button>
                    <button type="button" class="btn btn-primary" id="confirm-resend">Resend Invitation</button>
                </div>
            </div>
        </div>
    </div>
    

    <!-- Delete User Modal -->
    <div id="delete-user-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Delete User</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                <input type="hidden" id="delete-user-id">
                <div class="form-actions">
                    <button type="button" class="btn btn-cancel" id="cancel-delete">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Notification -->
    <div id="notification" class="notification toast-bottom-right"></div>

    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
    <script src="../../assets/js/app/main.js"></script>
    <script src="../../assets/js/app/users.js"></script>
    <script src="../../assets/js/auth/logout.js"></script>
</body>
</html>