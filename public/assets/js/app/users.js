document.addEventListener("DOMContentLoaded", function () {

    fetch('/SDGKU-Dashboard/src/users/check-session.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(sessionData => {
        /* console.log('Session data loaded:', sessionData); */
        
        if (!sessionData.authenticated) {
            //~redirect to login if not authenticated
            window.location.href = '../auth/login.html';
            return;
        }
        
        //~ use server-provided user data instead of HTML attributes
        const currentUserId = sessionData.user.id;
        const currentUserRole = sessionData.user.role;
        
        //~ set to window for potential use elsewhere
        window.currentUserId = currentUserId;
        window.currentUserRole = currentUserRole;

        /* console.log('Current user:', { id: currentUserId, role: currentUserRole }); */

        initializeUserManagement(currentUserId, currentUserRole);
    })
    .catch(error => {
        console.error('Failed to load session data:', error);
        // redirect to login on error
        // window.location.href = '../auth/login.html';
    });

    function initializeUserManagement(currentUserId, currentUserRole) {
        const usersTableBody = document.getElementById('users-table-body');
        const searchInput = document.getElementById('search-input');
        const addUserBtn = document.getElementById('add-user-btn');
        const addUserForm = document.getElementById('add-user-form');
        const editUserForm = document.getElementById('edit-user-form');
        const deleteUserBtn = document.getElementById('confirm-delete');
        const superAdminConfirmBtn = document.getElementById('confirm-super-admin');
        const resendInvitationBtn = document.getElementById('confirm-resend');

        const modals = {
            add: document.getElementById('add-user-modal'),
            edit: document.getElementById('edit-user-modal'),
            delete: document.getElementById('delete-user-modal'),
            superAdminConfirm: document.getElementById('super-admin-confirm-modal'),
            resendInvitation: document.getElementById('resend-invitation-modal')
        }

        //~ hide add user button to faculty users
        if(currentUserRole === 'faculty') {addUserBtn.style.display = 'none';} 

        loadUsers();

        //? search users
        searchInput.addEventListener('input', debounce(() => {
            loadUsers(searchInput.value);
        }, 300));

        //* forms submission --------------------------------->
        addUserForm.addEventListener('submit', function(e){
            e.preventDefault();

            const formData = {
                full_name: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                role: 'faculty'  //~ default role for new users
            };

            fetchData('add_user', formData)
            .then(() => {
                showNotification('Invitation sent successfully!', 'success');
                closeModal();
                loadUsers();
                addUserForm.reset();
            })
            .catch(err => {
                console.error(err);
                showNotification(err.message || 'Failed to add user', 'error');
            });
        });

        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const userId = document.getElementById('edit-user-id').value;
            const selectedRole = document.getElementById('edit-role').value;

            if (selectedRole === 'super_admin'){
                closeModal();
                document.getElementById('super-admin-user-id').value = userId;

                modals.superAdminConfirm.style.display = 'flex';
                return;
            }

            const formData = {
                user_id: document.getElementById('edit-user-id').value,
                role: document.getElementById('edit-role').value
            };

            fetchData('update_user_role', formData)
            .then(() => {
                showNotification('User role updated successfully!', 'success');
                closeModal();
                loadUsers();
            })
            .catch(err => {
                console.error(err);
                showNotification(err.message || 'Failed to update user role', 'error');
            });
        });

        superAdminConfirmBtn.addEventListener('click', function() {
            const userId = document.getElementById('super-admin-user-id').value;

            fetchData('update_user_role', { user_id: userId, role: 'super_admin' })
            .then(() => {
                showNotification('User role updated to Main Admin!', 'success');
                closeModal();
                loadUsers();
            })
            .catch(err => {
                console.error(err);
                showNotification(err.message || 'Failed to update user role', 'error');
            });
        });

        resendInvitationBtn.addEventListener('click', function() {
            const userId = document.getElementById('resend-invitation-user-id').value;

            fetchData('resend_invite', { user_id: userId })
            .then(() => {
                showNotification('Invitation resent successfully!', 'success');
                closeModal();
                loadUsers();
            })
            .catch(err => {
                console.error(err);
                showNotification(err.message || 'Failed to resend invitation', 'error');
            });
        });

        deleteUserBtn.addEventListener('click', function() {
            const userId = document.getElementById('delete-user-id').value;

            fetchData('delete_user', { user_id: userId })
            .then(() => {
                showNotification('User deleted successfully!', 'success');
                closeModal();
                loadUsers();
            })
            .catch(err => {
                console.error(err);
                showNotification(err.message || 'Failed to delete user', 'error');
            });
        });

        //* modal handling --------------------------------->
        document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        });

        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); 
                closeModal();
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(cancelBtn => {
            cancelBtn.addEventListener('click', function(e) {
                e.stopPropagation(); 
                closeModal();
            });
        });

        document.querySelectorAll('.modal-content').forEach(content => {
            content.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });

        //! HELPER FUNCTIONS --------------------------------->

        function loadUsers(search = ''){
            /* console.log('Loading users with search:', search); */
            
            fetchData('fetch_users', {}, { search: search })
            .then(data => {
                if (data.users) {
                    renderUsers(data.users);
                } else {
                    console.error('No users data in response');
                    usersTableBody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
                }
            })
            .catch(err => {
                console.error('Error loading users:', err);
                usersTableBody.innerHTML = '<tr><td colspan="5">Error loading users</td></tr>';
                showNotification(err.message || 'Failed to load users', 'error');
            });
        }

        function renderUsers(users){
            usersTableBody.innerHTML = '';

            users.forEach(user => {
                const row = document.createElement('tr');
                //~ status badges
                let statusBadge = '';
                if (user.status === 'active') {
                    statusBadge = '<span class="status-badge status-active">active</span>';
                } else if (user.status === 'pending') {
                    statusBadge = '<span class="status-badge status-pending">pending</span>';
                } else if (user.status === 'locked') {
                    statusBadge = '<span class="status-badge status-locked">locked</span>';
                }

                let roleName = user.role.charAt(0).toLowerCase() + user.role.slice(1).replace('_', ' ');

                if (user.role === 'super_admin') {
                    roleName = 'master admin';
                }
                const roleBadge = `<span class="role-badge role-${user.role}">${roleName}</span>`;

                //~ action buttons
                let actionButtons = '';

                
                //? edit button
                if (currentUserRole === 'super_admin' && user.id !== currentUserId){
                    actionButtons += `<button class="action-btn edit" data-id="${user.id}" data-role="${user.role}">
                    <i class="material-icons">manage_accounts</i>
                    </button>`;
                }
                
                //? delete button
                if ((currentUserRole === 'admin' && user.role === 'faculty') || 
                (currentUserRole === 'super_admin' && user.id !== currentUserId && user.role !== 'super_admin')) {
                    actionButtons += `<button class="action-btn delete" data-id="${user.id}" data-role="${user.role}">
                    <span class="material-symbols-outlined" id="trashcan-users">delete</span>
                    </button>`;
                }
                
                //? resend invite button
                if (user.status === 'pending' && currentUserRole !== 'faculty'){
                    actionButtons += `<button class="action-btn resend-invite" 
                    data-id="${user.id}"
                    data-role="${user.role}"
                    data-email="${user.email}"
                    data-name="${user.full_name}">
                    <span class="material-icons" id="resend-invite">forward_to_inbox</span>
                </button>`;
                }
                
                row.innerHTML = `
                    <td>${user.full_name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td class="text-end">${actionButtons}</td>`;

                usersTableBody.appendChild(row);
            });

            addButtonEventListeners();
        }

        //* button event listeners --------------------------------->
        addUserBtn.addEventListener('click', function() {
            openModal('add');
        });

        function addButtonEventListeners(){

            //? resend invite button
            document.querySelectorAll('.resend-invite').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.dataset.id;
                    const email = this.dataset.email;
                    const name = this.dataset.name;

                    document.getElementById('resend-invitation-user-id').value = userId;

                    const modalText = document.querySelector('#resend-invitation-modal .modal-body p');
                    modalText.textContent = `Are you sure you want to resend the invitation to ${name} (${email})?`;
                    
                    openModal('resendInvitation');  
                });
            });

            //? edit button
            document.querySelectorAll('.edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = this.dataset.id;
                    const currentRole = this.dataset.role;
                    
                    document.getElementById('edit-user-id').value = userId;
                    document.getElementById('edit-role').value = currentRole;
                    
                    if (currentUserRole === 'super_admin' && 
                        document.getElementById('edit-role').value === 'super_admin') {
                        document.getElementById('super-admin-user-id').value = userId;
                        openModal('superAdminConfirm');
                    } else {
                        openModal('edit');
                    }
                });
            });

            //? delete button
            document.querySelectorAll('.delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.getElementById('delete-user-id').value = this.dataset.id;
                    openModal('delete');
                });
            });
        }

        //? fetch data function --------------------------------->
        function fetchData(action, data = {}, params = {}){
            const url = new URL('/SDGKU-Dashboard/src/users/fetch-data.php', window.location.origin); //TODO: CHANGE TO PRODUCTION URL
            //const url = new URL('src/users/fetch-data.php', window.location.origin);
            url.searchParams.append('action', action);

            for (const [key, value] of Object.entries(params)) {url.searchParams.append(key, value);}

            /* console.log('Fetching from:', url.toString()); */

            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            .then(response => {
                /* console.log('Response status:', response.status) */;
                
                return response.text()
                .then(text => {
                    /* console.log('Raw response:', text); */
                    if(!response.ok) {
                        try {
                            /* const json = JSON.parse(text); */
                            throw new Error(json.message || 'Request failed');
                        } catch (e) {
                            console.error('Failed to parse error response:', text);
                            throw new Error('Server error (Status: ' + response.status + ')');
                        }
                    }
                    
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse response:', text);
                        throw new Error('Invalid server response');
                    }
                });
            })
            .then(data => {
                /* console.log('Response data:', data); */
                if (!data.success) {
                    throw new Error(data.message || 'Operation failed');
                }
                return data;
            })
            .catch(err => {
                console.error('Fetch error:', err);
                throw err;
            });
        }

        //? modal action functions --------------------------------->

        function openModal(modalName){
            modals[modalName].style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId){
        if (modalId && modals[modalId]) {
            modals[modalId].style.display = 'none';
        } else {
            Object.values(modals).forEach(modal => {
                modal.style.display = 'none';
            });
        }
        document.body.style.overflow = 'auto'; 
    }

        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification toast-bottom-right ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }

        //? debounce function for searching users --------------------------------->
        function debounce(func, timeout = 300) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }
    }
})