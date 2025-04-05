document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('aside');
    
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
