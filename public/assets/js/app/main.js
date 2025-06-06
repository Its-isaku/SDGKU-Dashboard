document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('aside');
    const isLoginPage = window.location.pathname.includes('auth/login.html') || window.location.pathname.includes('auth/forgot-password.html') || window.location.pathname.includes('auth/reset-password.html');

    const lastSessionCheck = sessionStorage.getItem('lastSessionCheck');
    const currentTime = Date.now();
    const sessionCheckInterval = 5000;
    
    if (!isLoginPage && (!lastSessionCheck || currentTime - lastSessionCheck > sessionCheckInterval)) {
        sessionStorage.setItem('lastSessionCheck', currentTime);
        
        fetch('/SDGKU-Dashboard/src/users/check-session.php', {
            credentials: 'include',
            cache: 'no-store'
        })
        .then(response => response.json())
        .then(data => {
            if(!data.authenticated) {
                console.warn('User not authenticated, redirecting to login page.');
                setTimeout(() => {
                    window.location.href = '/SDGKU-Dashboard/public/views/auth/login.html';
                }, 300);
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
            if (error.name !== 'AbortError' && error.name !== 'TypeError') {
                setTimeout(() => {
                    window.location.href = '/SDGKU-Dashboard/public/views/auth/login.html';
                }, 300);
            }
        });
    }
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            hamburger.classList.toggle('active');
            
            if (sidebar.classList.contains('show')) {
                sidebar.style.animation = 'slideIn 0.3s forwards';
            } else {
                sidebar.style.animation = 'slideOut 0.3s forwards';
            }
        });
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 960 && sidebar) {
            sidebar.style.removeProperty('display');
            sidebar.style.removeProperty('transform');
            sidebar.style.removeProperty('opacity');
            sidebar.style.removeProperty('animation');
        }
    });
    
    const sideLinks = document.querySelectorAll('.sideLink a');
    
    sideLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            const href = this.getAttribute('href');
            const parentLink = this.closest('.sideLink');
            
            document.querySelectorAll('.sideLink').forEach(el => {
                el.classList.remove('selectLink');
            });
            
            parentLink.classList.add('selectLink');
            parentLink.style.transition = 'background-color 0.3s ease';
            
            setTimeout(() => {
                window.location.href = href;
            }, 300); 
        });
    });
});
