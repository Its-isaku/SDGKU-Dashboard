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

        let notificationActive = false;
        const notificationQueue = [];
        let lastNotificationText = '';
        let lastNotificationTimestamp = 0;
        let lastSearchTerm = '';
        const activeRequests = new Map();

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
        function toggleButtonLoading(button, isLoading) {
            if (isLoading) {
                button.classList.add('btn-loading');
                button.disabled = true;
            } else {
                button.classList.remove('btn-loading');
                button.disabled = false;
            }
        }

        addUserForm.addEventListener('submit', function(e){
            e.preventDefault();

            if (this.classList.contains('processing')) {
                return;
            }
            
            this.classList.add('processing');

            const submitBtn = this.querySelector('button[type="submit"]');
            toggleButtonLoading(submitBtn, true);

            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value.trim();

            /* if(!email.toLowerCase().endsWith('@sdgku.edu')) {
                showNotification('Only @sdgku.edu email domains are allowed', 'error');
                toggleButtonLoading(submitBtn, false);
                this.classList.remove('processing');
                return;
            } */

            const formData = {
                full_name: fullName,
                email: email,
                role: 'faculty'  //~ default role for new users
            };

            fetchData('add_user', formData)
            .then((data) => {
                closeModal();
                addUserForm.reset();
                showNotification('Invitation sent successfully!', 'success');

                if(data.newUser){
                    const users = [data.newUser];
                    renderUsers(users, true); 
                } else {loadUsers();} //~ reload all users if no new user data returned
            })
            .catch(err => {
                /* console.error(err); */
                const errorMessage = err.message || '';

                if (errorMessage.toLowerCase().includes('email already exists') || 
                    errorMessage.toLowerCase().includes('duplicate') ||
                    errorMessage.toLowerCase().includes('409')) {
                    
                    showNotification('This email is already registered in the system', 'error');
                } else {
                    showNotification(errorMessage || 'Failed to add user', 'error');
                }
            })
            .finally(() => {
                toggleButtonLoading(submitBtn, false);
                this.classList.remove('processing');
            });
        });

        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('submitting')) {
                /* console.log('Form already submitting'); */
                return;
            }
            
            this.classList.add('submitting');
            
            const userId = document.getElementById('edit-user-id').value;
            const selectedRole = document.getElementById('edit-role').value;

            if (selectedRole === 'super_admin'){
                closeModal();
                document.getElementById('super-admin-user-id').value = userId;
                modals.superAdminConfirm.style.display = 'flex';
                this.classList.remove('submitting');
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            toggleButtonLoading(submitBtn, true);

            const formData = {
                user_id: userId,
                role: selectedRole
            };

            fetchData('update_user_role', formData)
            .then((data) => {
                /* console.log('Update role response:', data); */
                showNotification('User role updated successfully!', 'success');
                closeModal('edit');
                
                const updatedUser = data.updatedUser || {
                    id: String(userId),
                    role: selectedRole
                };

                const updated = updateUserInTable(updatedUser);

                if (!updated) {
                    /* console.warn('Failed to update user in table, reloading all users'); */
                    setTimeout(() => loadUsers(), 100);
                }
            })
            .catch(err => {
                /* console.error('Error updating user role:', err); */
                showNotification(err.message || 'Failed to update user role', 'error');
            })
            .finally(() => {
                toggleButtonLoading(submitBtn, false);
                this.classList.remove('submitting');
            });
        });

        superAdminConfirmBtn.addEventListener('click', function() {
            if (this.classList.contains('processing')) {
                return;
            }
            
            this.classList.add('processing');
            
            const userId = document.getElementById('super-admin-user-id').value;
            toggleButtonLoading(this, true);

            fetchData('update_user_role', { user_id: userId, role: 'super_admin' })
            .then((data) => {
                /* console.log('Super admin update response:', data); */
                showNotification('User role updated to Master Admin!', 'success');
                closeModal('superAdminConfirm');

                const updatedUser = data.updatedUser || {
                    id: String(userId),
                    role: 'super_admin'
                };

                const updated = updateUserInTable(updatedUser);

                if (!updated) {
                    /* console.warn('Failed to update user in table, reloading all users'); */
                    setTimeout(() => loadUsers(), 100);
                }
            })
            .catch(err => {
                /* console.error('Error updating to super admin:', err); */
                showNotification(err.message || 'Failed to update user role', 'error');
            })
            .finally(() => {
                toggleButtonLoading(this, false);
                this.classList.remove('processing');
            });
        });

        resendInvitationBtn.addEventListener('click', function() {
            if (this.classList.contains('processing')) {
                return;
            }
            
            this.classList.add('processing');
            
            const userId = document.getElementById('resend-invitation-user-id').value;
            toggleButtonLoading(this, true);

            const timestamp = new Date().getTime();
            
            fetchData('resend_invite', { user_id: userId, timestamp })
            .then(() => {
                showNotification('Invitation resent successfully!', 'success');
                closeModal('resendInvitation');
            })
            .catch(err => {
                /* console.error('Resend invitation error:', err); */
                showNotification(err.message || 'Failed to resend invitation', 'error');
            })
            .finally(() => {
                toggleButtonLoading(this, false);
                this.classList.remove('processing');
            });
        });

        deleteUserBtn.addEventListener('click', function() {
            if (this.classList.contains('processing')) {
                return;
            }
            
            this.classList.add('processing');
            const userId = document.getElementById('delete-user-id').value;

            toggleButtonLoading(this, true);

            fetchData('delete_user', { user_id: userId })
            .then(() => {
                showNotification('User deleted successfully!', 'success');
                closeModal('delete');
                
                removeUserFromTable(userId);
            })
            .catch(err => {
                /* console.error(err); */
                showNotification(err.message || 'Failed to delete user', 'error');
            })
            .finally(() => {
                toggleButtonLoading(this, false);
                this.classList.remove('processing');
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
        
        function loadUsers(search = '') {
            try {
                /* console.log('Starting loadUsers with search:', search); */
                
                if (search === lastSearchTerm && lastSearchTerm !== '') {
                    console.log('Search term unchanged, skipping reload');
                    return;
                }
                
                lastSearchTerm = search;
                
                fetchData('fetch_users', {}, { search: search })
                .then(data => {
                    /* console.log('Users data received:', data); */
                    if (data.users) {
                        renderUsers(data.users);
                    } else {
                        /* console.error('No users data in response'); */
                        usersTableBody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
                    }
                })
                .catch(err => {
                    /* console.error('Error loading users:', err); */
                    usersTableBody.innerHTML = `<tr><td colspan="5">Error loading users: ${err.message}</td></tr>`;
                    showNotification(err.message || 'Failed to load users', 'error');
                });
            } catch (error) {
                /* console.error('Exception in loadUsers:', error); */
                usersTableBody.innerHTML = `<tr><td colspan="5">Error processing users request: ${error.message}</td></tr>`;
            }
        }

        function renderUsers(users, appendMode = false){
            if(!appendMode){usersTableBody.innerHTML = '';}
            
            users.sort((a, b) => {
                const rolePriority = {
                    'super_admin': 1,
                    'admin': 2,
                    'faculty': 3
                };
                return rolePriority[a.role] - rolePriority[b.role];
            });

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
                if (currentUserRole === 'super_admin' && user.id !== currentUserId && user.role !== 'super_admin'){
                    actionButtons += `<button class="action-btn edit" data-id="${user.id}" data-role="${user.role}">
                    <i class="material-icons">manage_accounts</i>
                    </button>`;
                }
                
                //? delete button
                if ((currentUserRole === 'admin' && user.role === 'faculty') || 
                    (currentUserRole === 'super_admin' && (
                        user.id !== currentUserId ))) {
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
        addUserBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openModal('add');
        });

        function addButtonEventListeners() {

            /* console.log('Adding event listeners to buttons:', {
                resendInvite: document.querySelectorAll('.resend-invite').length,
                edit: document.querySelectorAll('.edit').length,
                delete: document.querySelectorAll('.delete').length
            }); */

            document.querySelectorAll('.edit').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.processing === 'true') {
                        return;
                    }
                    this.dataset.processing = 'true';
                    
                    const userId = this.dataset.id;
                    const currentRole = this.dataset.role;
                    
                    document.getElementById('edit-user-id').value = userId;
                    document.getElementById('edit-role').value = currentRole;
                    
                    openModal('edit');
                    
                    setTimeout(() => {
                        this.dataset.processing = 'false';
                    }, 500);
                });
            });

            document.querySelectorAll('.delete').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.processing === 'true') {return;}

                    this.dataset.processing = 'true';
                    
                    const userId = this.dataset.id;
                    const userName = this.closest('tr').querySelector('td:nth-child(1)').textContent;
                    const userRole = this.dataset.role;

                    document.getElementById('delete-user-id').value = userId;
                    
                    const modalText = document.querySelector('#delete-user-modal .modal-body p');

                    if (modalText) {
                        if (userRole === 'super_admin'){
                            modalText.textContent = 'WARNING: You are about to delete a Master Admin account. This action cannot be undone.';
                            modalText.classList.add('warning-text');
                        } else {
                            modalText.textContent = `Are you sure you want to delete ${userName}? This action cannot be undone.`;
                            modalText.classList.remove('warning-text');
                        }
                    }
                    
                    openModal('delete');
                    
                    setTimeout(() => {
                        this.dataset.processing = 'false';
                    }, 500);
                });
            });

            document.querySelectorAll('.resend-invite').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (this.dataset.processing === 'true') {
                        return;
                    }
                    this.dataset.processing = 'true';
                    
                    const userId = this.dataset.id;
                    const email = this.dataset.email;
                    const name = this.dataset.name;
                    
                    document.getElementById('resend-invitation-user-id').value = userId;
                    const modalText = document.querySelector('#resend-invitation-modal .modal-body p');
                    if (modalText) {
                        modalText.textContent = `Are you sure you want to resend the invitation to ${name} (${email})?`;
                    }
                    
                    openModal('resendInvitation');
                    
                    setTimeout(() => {
                        this.dataset.processing = 'false';
                    }, 500);
                });
            });
        }

        //? fetch data function --------------------------------->
        function fetchData(action, data = {}, params = {}) {
            const requestKey = createRequestKey(action, data, params);

            /* console.log(`Making request: ${requestKey}`); */
            
            //~check if this exact request is already in progress
            if (activeRequests.has(requestKey)) {
                /* console.log(`Request already in progress: ${requestKey}`); */
                return activeRequests.get(requestKey);
            }
            
            const url = new URL('/SDGKU-Dashboard/src/users/fetch-data.php', window.location.origin);
            url.searchParams.append('action', action);

            for (const [key, value] of Object.entries(params)) {
                url.searchParams.append(key, value);
            }

            const requestPromise = fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        /* console.error('Error response:', text); */
                        try {
                            const json = JSON.parse(text);
                            /* console.error(`Server error for ${action}:`, json); */
                            throw new Error(json.message || 'Request failed');
                        } catch (e) {
                            throw new Error('Server error (Status: ' + response.status + ')');
                        }
                    });
                }
                
                return response.text().then(text => {
                    /* console.log('Server response for', action, ':', text); */
                    try {
                        if (!text || text.trim() === '') {
                            /* console.warn('Empty response received'); */

                            if(action === 'update_user_role') {
                                return {
                                    success: true,
                                    message: 'User role updated successfully',
                                    updatedUser: {
                                        id: data.user_id,
                                        role: data.role
                                    }
                                };
                            }

                            return { success: true, message: 'Operation completed' };
                        }
                        
                        const jsonData = JSON.parse(text);

                        if(action === 'update_user_role' && !jsonData.updatedUser) {
                            jsonData.updatedUser = {
                                id: data.user_id,
                                role: data.role
                            };
                        }

                        return jsonData;
                    } catch (e) {
                        /* console.error('Failed to parse response:', text); */
                        if (action === 'update_user_role' && 
                            (text.includes('success') || text.includes('updated'))) {
                            return { 
                                success: true, 
                                message: 'User role updated successfully',
                                updatedUser: {
                                    id: data.user_id,
                                    role: data.role
                                }
                            };
                        }
                        
                        throw new Error('Invalid server response');
                    }
                });
            })
            .then(data => {
                if (data.success === false) {
                    throw new Error(data.message || 'Operation failed');
                }
                return data;
            })
            .finally(() => {
                activeRequests.delete(requestKey);
                /* console.log(`Request completed and removed: ${requestKey}`); */
            });

            activeRequests.set(requestKey, requestPromise);
            
            return requestPromise;
        }

        //? modal action functions --------------------------------->

        function openModal(modalName){
            modals[modalName].style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeModal(modalId) {
            /* console.log('Closing modal:', modalId || 'all'); */
            
            if (modalId && modals[modalId]) {
                modals[modalId].style.display = 'none';
            } else {
                Object.keys(modals).forEach(key => {
                    if (modals[key]) {
                        modals[key].style.display = 'none';
                    }
                });
            }
            
            document.body.style.overflow = 'auto';
            
            if (document.getElementById('add-user-form')) {
                document.getElementById('add-user-form').reset();
            }
            /* console.log('Modal(s) closed'); */
        }

        function showNotification(message, type = 'success') {
            /* console.log('Notification requested:', message); */

            if (!notificationQueue) {
                /* console.error('notificationQueue is not defined'); */
                return;
            }

            const notificationId = `${message}-${type}-${new Date().getTime()}`;

            if (message === lastNotificationText && Date.now() - lastNotificationTimestamp < 2000) {
                /* console.log('Duplicate notification prevented:', message); */
                return;
            }

            lastNotificationText = message;
            lastNotificationTimestamp = Date.now();

            notificationQueue.push({ message, type, id: notificationId });

            if (!notificationActive) {
                processNextNotification();
            }
        }

        function processNextNotification() {
            if (notificationQueue.length === 0) {
                notificationActive = false;
                return;
            }
            
            notificationActive = true;
            const { message, type } = notificationQueue.shift();

            const notification = document.getElementById('notification') || createNotificationElement();

            notification.textContent = message;
            notification.className = `notification toast-bottom-right ${type}`;
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';

                setTimeout(processNextNotification, 300);
            }, 3000);
        }

        function createNotificationElement() {
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
            return notification;
        }

        //? debounce function for searching users --------------------------------->
        function debounce(func, timeout = 300) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => { func.apply(this, args); }, timeout);
            };
        }
        
        function updateUserInTable(updatedUser) {
            /* console.log('Updating user in table:', updatedUser); */
            
            if (!updatedUser || !updatedUser.id) {
                /* console.error('Invalid user data for table update'); */
                return false;
            }

            const userIdToUpdate = String(updatedUser.id);
            const rows = usersTableBody.querySelectorAll('tr');
            let found = false;

            for (const row of rows) {
                const actionBtns = row.querySelectorAll('.action-btn');
                
                for (const btn of actionBtns) {
                    if (String(btn.dataset.id) === userIdToUpdate) {
                        found = true;
                        /* console.log(`Found user row to update for ID: ${userIdToUpdate}`); */
                        
                        if (updatedUser.role) {
                            const roleTd = row.querySelector('td:nth-child(3)');
                            if (roleTd) {
                                let roleName = updatedUser.role.charAt(0).toLowerCase() + updatedUser.role.slice(1).replace('_', ' ');
                                
                                if (updatedUser.role === 'super_admin') {
                                    roleName = 'master admin';
                                }
                                
                                /* console.log(`Updating role display to: ${roleName}`); */
                                roleTd.innerHTML = `<span class="role-badge role-${updatedUser.role}">${roleName}</span>`;

                                row.querySelectorAll('.action-btn').forEach(actionBtn => {
                                    actionBtn.dataset.role = updatedUser.role;
                                });

                                addButtonEventListeners();
                                
                                return true;
                            }
                        }

                        row.remove();

                        const completeUser = {
                            id: userIdToUpdate,
                            role: updatedUser.role,
                            full_name: row.querySelector('td:nth-child(1)').textContent,
                            email: row.querySelector('td:nth-child(2)').textContent,
                            status: row.querySelector('td:nth-child(4) span').textContent
                        };
                        
                        /* console.log('Creating new row with:', completeUser); */
                        renderUsers([completeUser], true);
                        return true;
                    }
                }
            }

            if (!found) {
                /* console.warn('User not found in table, reloading all'); */
                loadUsers();
                return false;
            }
        }

        function removeUserFromTable(userId) {
            const rows = usersTableBody.querySelectorAll('tr');
            
            for (const row of rows) {
                const actionBtns = row.querySelectorAll('.action-btn');
                for (const btn of actionBtns) {
                    if (btn.dataset.id === userId) {
                        row.remove();
                        return;
                    }
                }
            }
            loadUsers();
        }
        
        function createRequestKey(action, data, params) {
            try {
                if (action === 'update_user_role' || action === 'delete_user' || action === 'resend_invite') {
                    return `${action}-${data.user_id}`;
                } else if (action === 'add_user') {
                    return `${action}-${data.email}`;
                } else {
                    const timestamp = new Date().getTime();
                    return `${action}-${JSON.stringify(params || {})}-${timestamp}`;
                }
            } catch (error) {
                /* console.error('Error creating request key:', error); */
                return `${action}-${new Date().getTime()}`;
            }
        }
    }
})