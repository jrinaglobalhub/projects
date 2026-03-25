document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication ---
    const loginScreen = document.getElementById('loginScreen');
    const loginForm = document.getElementById('adminLoginForm');
    const passwordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if already logged in (sessionStorage)
    if (sessionStorage.getItem('admin_auth') === 'true') {
        loginScreen.classList.remove('active');
        initDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (passwordInput.value === 'admin123') {
            sessionStorage.setItem('admin_auth', 'true');
            loginScreen.classList.remove('active');
            loginError.style.display = 'none';
            initDashboard();
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('admin_auth');
        loginScreen.classList.add('active');
    });

    // --- Dashboard Core ---
    function initDashboard() {
        setupTabs();
        loadPricing();
        loadMessages();
    }

    // --- Tab Switching ---
    function setupTabs() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabPanes = document.querySelectorAll('.tab-pane');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active classes
                navItems.forEach(n => n.classList.remove('active'));
                tabPanes.forEach(t => t.classList.remove('active'));

                // Add active
                item.classList.add('active');
                const targetTab = document.getElementById(item.getAttribute('data-tab'));
                if (targetTab) targetTab.classList.add('active');
            });
        });
    }

    // --- Pricing Manager ---
    function loadPricing() {
        const pricing = JSON.parse(localStorage.getItem('admin_pricing')) || {
            education: 1500,
            health: 800,
            livelihood: 5000
        };

        const eduInput = document.getElementById('priceEdu');
        const healthInput = document.getElementById('priceHealth');
        const livInput = document.getElementById('priceLiv');

        if(eduInput) eduInput.value = pricing.education;
        if(healthInput) healthInput.value = pricing.health;
        if(livInput) livInput.value = pricing.livelihood;

        const form = document.getElementById('pricingForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const updatedPricing = {
                    education: parseInt(eduInput.value),
                    health: parseInt(healthInput.value),
                    livelihood: parseInt(livInput.value)
                };
                localStorage.setItem('admin_pricing', JSON.stringify(updatedPricing));
                
                const msg = document.getElementById('pricingSuccess');
                msg.innerText = 'Pricing Updated Successfully! (Live on main site)';
                msg.style.opacity = '1';
                setTimeout(() => msg.style.opacity = '0', 3000);
            });
        }
    }

    // --- Messages & Appointments Manager ---
    function loadMessages() {
        const messagesList = document.getElementById('messagesList');
        const countBadge = document.getElementById('notifBadge');
        if (!messagesList) return;

        // Fetch from localstorage (populated by index.html script.js)
        let messages = JSON.parse(localStorage.getItem('admin_messages')) || [];

        // If empty, inject dummy data for preview
        if (messages.length === 0) {
            messages = [
                {
                    id: 1, type: 'appointment', name: 'Ayisha Rahman', email: 'ayisha@gmail.com',
                    message: 'I would like to discuss sponsoring a community health camp in November.',
                    date: '2026-11-15', timestamp: new Date().toISOString(), isImportant: true, isRead: false
                },
                {
                    id: 2, type: 'donate', name: 'Rahul K', email: 'rahul.k@outlook.com',
                    message: 'Interested in the new livelihood training fundraiser. Please send details.',
                    date: null, timestamp: new Date(Date.now() - 86400000).toISOString(), isImportant: false, isRead: true
                }
            ];
            localStorage.setItem('admin_messages', JSON.stringify(messages));
        }

        const renderMessages = () => {
            messagesList.innerHTML = '';
            let unreadCount = 0;

            if (messages.length === 0) {
                messagesList.innerHTML = '<p class="text-muted">No messages or appointments yet.</p>';
            }

            messages.forEach(msg => {
                if (!msg.isRead) unreadCount++;

                const dateStr = new Date(msg.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                const card = document.createElement('div');
                card.className = `msg-card ${msg.isImportant ? 'important' : ''} ${!msg.isRead ? 'unread' : ''}`;
                
                let appointmentHtml = msg.type === 'appointment' && msg.date 
                    ? `<strong>Req. Date:</strong> ${msg.date} <br>` : '';

                card.innerHTML = `
                    <div class="msg-content">
                        <h4>
                            ${msg.name} 
                            <span class="msg-type ${msg.type === 'appointment' ? 'appointment' : ''}">${msg.type}</span>
                            ${!msg.isRead ? '<span style="color:var(--clr-accent); font-size:0.8rem; margin-left:10px;">• New</span>' : ''}
                        </h4>
                        <div class="msg-details">
                            <a href="mailto:${msg.email}">${msg.email}</a> &nbsp;|&nbsp; ${dateStr} <br>
                            ${appointmentHtml}
                        </div>
                        <div class="msg-text">${msg.message}</div>
                    </div>
                    <div class="msg-actions">
                        <button class="icon-btn star ${msg.isImportant ? 'active' : ''}" data-id="${msg.id}" title="Mark Important">
                            <i class="${msg.isImportant ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                        </button>
                        <button class="icon-btn check" data-id="${msg.id}" title="Mark Read/Unread">
                            <i class="fa-solid ${msg.isRead ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                        </button>
                        <button class="icon-btn trash" data-id="${msg.id}" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                messagesList.appendChild(card);
            });

            countBadge.innerText = unreadCount;
            if (unreadCount === 0) countBadge.style.display = 'none';
            else countBadge.style.display = 'inline-block';

            bindMessageActions();
        };

        const bindMessageActions = () => {
            // Star
            document.querySelectorAll('.icon-btn.star').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    const msg = messages.find(m => m.id === id);
                    if (msg) {
                        msg.isImportant = !msg.isImportant;
                        saveAndRender();
                    }
                });
            });

            // Read/Unread
            document.querySelectorAll('.icon-btn.check').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    const msg = messages.find(m => m.id === id);
                    if (msg) {
                        msg.isRead = !msg.isRead;
                        saveAndRender();
                    }
                });
            });

            // Delete
            document.querySelectorAll('.icon-btn.trash').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this message?')) {
                        const id = parseInt(e.currentTarget.getAttribute('data-id'));
                        messages = messages.filter(m => m.id !== id);
                        saveAndRender();
                    }
                });
            });
        };

        const saveAndRender = () => {
            localStorage.setItem('admin_messages', JSON.stringify(messages));
            renderMessages();
        };

        // Initial render
        renderMessages();
    }

});
