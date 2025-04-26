// just for testing purposes, remove this in production
if (!localStorage.getItem('users')) {
    const initialUsers = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@sdgku.edu',
            role: 'admin',
            password: 'admin123'
        },
        {
            id: 2,
            name: 'Teacher User',
            email: 'teacher@sdgku.edu',
            role: 'faculty',
            password: 'teacher123'
        },
        {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert.johnson@sdgku.edu',
            role: 'faculty',
            password: 'robert123'
        },
        {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@sdgku.edu',
            role: 'faculty',
            password: 'emily123'
        }
    ];
    localStorage.setItem('users', JSON.stringify(initialUsers));
}
// elems
const usersTableBody = document.getElementById('users-table-body');
const searchInput = document.getElementById('search-input');
const addUserBtn = document.getElementById('add-user-btn');
const addUserModal = document.getElementById('add-user-modal');
const editUserModal = document.getElementById('edit-user-modal');
const deleteUserModal = document.getElementById('delete-user-modal');
const addUserForm = document.getElementById('add-user-form');
const editUserForm = document.getElementById('edit-user-form');
const notification = document.getElementById('notification');

//modal elems for btns
const closeButtons = document.querySelectorAll('.close-modal');
const cancelAddBtn = document.getElementById('cancel-add');
const cancelEditBtn = document.getElementById('cancel-edit');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');

// load users from ls
function loadUsers(){
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users;
}

//display users in table
function displayUsers(users = loadUsers()) {
    usersTableBody.innerHTML = ''; //clear table body

    if (users.length === 0){
        usersTableBody.innerHTML = `
            <tr>  
            <th colspan="4" style="text-align: center;">No users found <br><i class="fa-regular fa-face-frown"></i></br></th>
            </tr>
        `;
        return;
    }
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${user.role}</span></td>
            <td>
                <button class="action-btn edit" data-id="${user.id}">
                    <i class="material-icons">manage_accounts</i>
                </button>
                <button class="action-btn delete" data-id="${user.id}">
                    <span class="material-symbols-outlined" id="trashcan-users">
                    delete
                    </span>
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });

    // add event listeners to edit and delete buttons
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
}

// filter users by search input
function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const users = loadUsers();
    const filteredUsers = users.filter(user => {
        return user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
    });
    displayUsers(filteredUsers);
}

// generate unique ID for new user
function generateId(){
    const users = loadUsers();
    return users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;
}

// display notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

//open add user modal
function openAddModal() {
    addUserModal.style.display = 'flex';
    document.getElementById('full-name').focus();
    addUserForm.reset(); // reset form
}

//open edit user modal
function openEditModal(userId) {
    const users = loadUsers();
    const user = users.find(u => u.id === parseInt(userId));
    if(user) {
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-role').value = user.role;
        editUserModal.style.display = 'flex';
    }
}

//open delete user modal
function openDeleteModal(userId) {
    document.getElementById('delete-user-id').value = userId;
    deleteUserModal.style.display = 'flex';
}

//close modals
function closeModals() {
    addUserModal.style.display = 'none';
    editUserModal.style.display = 'none';
    deleteUserModal.style.display = 'none';
    
    // reset forms
    addUserForm.reset();
    editUserForm.reset();
}

//function to add new user
function addUser(e) {
    e.preventDefault();
    const name = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const users = loadUsers();

    // check if email already exists
    if (users.some(user => user.email === email)) {
        showNotification('A user with this email already exists.', 'error');
        return;
    }

    const newUser = {
        id: generateId(),
        name,
        email,
        role,
        password
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    closeModals();
    displayUsers();
    showNotification('User added successfully!');
}

//function to edit user
function editUser(e){
    e.preventDefault();
    const userId = parseInt(document.getElementById('edit-user-id').value);
    const newRole = document.getElementById('edit-role').value;
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        closeModals();
        displayUsers();
        showNotification('User updated successfully!');
    } 
}

//function to delete user
function deleteUser(){
    const userId = parseInt(document.getElementById('delete-user-id').value);
    let users = loadUsers();

    //cant delete last admin user
    const admins = users.filter(user => user.role === 'admin');
    const userToDelete = users.find(user => user.id === userId);

    if (userToDelete.role === 'admin' && admins.length === 1) {
        showNotification('Cannot delete the last admin user.', 'error');
        closeModals();
        return;
    }
    users = users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    closeModals();
    displayUsers();
    showNotification('User deleted successfully!');
}

// event listeners
window.addEventListener('DOMContentLoaded', () => {
    displayUsers();
});
searchInput.addEventListener('input', filterUsers);
addUserBtn.addEventListener('click', openAddModal);
addUserForm.addEventListener('submit', addUser);
editUserForm.addEventListener('submit', editUser);
confirmDeleteBtn.addEventListener('click', deleteUser);

// close modals on buttons
closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModals);
});
cancelAddBtn.addEventListener('click', closeModals);
cancelEditBtn.addEventListener('click', closeModals);
cancelDeleteBtn.addEventListener('click', closeModals);

// close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target === addUserModal || e.target === editUserModal || e.target === deleteUserModal) {
        closeModals();
    }
});
