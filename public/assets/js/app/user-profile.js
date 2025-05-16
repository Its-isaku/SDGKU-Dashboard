document.addEventListener("DOMContentLoaded", function() {
    const userRoleElement = document.querySelector('.profile-info h4');
    const userNameElement = document.querySelector('.profile-info small');
    
    if (!userRoleElement || !userNameElement) {
        console.error('User profile elements not found in the DOM');
        return;
    }
    
    const storedUserData = localStorage.getItem('sdgkuUserData');
    
    if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        updateProfileDisplay(userData);
        
        const thirtyMinutes = 30 * 60 * 1000;
        if ((new Date().getTime() - userData.timestamp) > thirtyMinutes) {
            refreshUserDataFromServer();
        }
    } else {
        refreshUserDataFromServer();
    }
    
    function updateProfileDisplay(userData) {
        let displayRole = 'User';
        switch (userData.role) {
            case 'super_admin':
                displayRole = 'Master Admin';
                break;
            case 'admin':
                displayRole = 'Admin';
                break;
            case 'faculty':
                displayRole = 'Faculty';
                break;
            default:
                displayRole = userData.role;
        }

        userRoleElement.textContent = displayRole;
        userNameElement.textContent = userData.full_name;
        
        if (userData.role === 'super_admin' && document.getElementById('userFoto')) {
            document.getElementById('userFoto').classList.add('admin-icon');
        }
    }
    
    function refreshUserDataFromServer() {
        fetch('/SDGKU-Dashboard/src/users/check-session.php', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.authenticated && data.user) {
                const freshUserData = {
                    id: data.user.id,
                    full_name: data.user.full_name,
                    email: data.user.email,
                    role: data.user.role,
                    timestamp: new Date().getTime()
                };
                
                localStorage.setItem('sdgkuUserData', JSON.stringify(freshUserData));
                
                updateProfileDisplay(data.user);
            } else {
                localStorage.removeItem('sdgkuUserData');
                window.location.href = '/SDGKU-Dashboard/public/views/auth/login.html';
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
    }
});