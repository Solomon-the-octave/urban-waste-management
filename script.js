document.addEventListener('DOMContentLoaded', function () {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
});

document.addEventListener('DOMContentLoaded', function () {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    function loadCalendarDays(month, year) {
        const daysContainer = document.getElementById('dates');
        daysContainer.innerHTML = ''; // Clear previous cells
        let date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            const dayCell = document.createElement('span');
            dayCell.innerText = date.getDate();
            if (date.getDate() === currentDate.getDate() && date.getMonth() === currentDate.getMonth()) {
                dayCell.classList.add('today');
            }
            daysContainer.appendChild(dayCell);
            date.setDate(date.getDate() + 1);
        }
    }

    document.querySelector('.prev-month').addEventListener('click', () => {
        loadCalendarDays(currentMonth - 1, currentYear);
    });

    document.querySelector('.next-month').addEventListener('click', () => {
        loadCalendarDays(currentMonth + 1, currentYear);
    });

    loadCalendarDays(currentMonth, currentYear); // Load current month
});


const supabaseUrl = 'https://cgwfbohodsudyhyuuxwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnd2Zib2hvZHN1ZHloeXV1eHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwNjU1NzYsImV4cCI6MjAzNzY0MTU3Nn0.oLlmLnpGf09Edemcw8k8XanluU8wehFmTQ44HSg3dtM';
const client = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function () {
    // Get the user details from Supabase on authentication
    const { data: { user } } = await client.auth.getUser();

    console.log(user);

    // Function to update the welcome message with the user's full name
    function updateWelcomeMessage(userName) {
        const welcomeMessageElement = document.querySelector('.welcome-message h1');
        // Update the welcome message with the user's full name
        welcomeMessageElement.textContent = `Welcome, ${userName}`;
    }
    
    // Check if the user object exists and has the full_name property
    if (user && user.user_metadata.first_name) {
        // updateWelcomeMessage("Wengelawit");
        updateWelcomeMessage(user.user_metadata.first_name);
        updateprofilename(`${user.user_metadata.first_name} ${user.user_metadata.last_name}`)
    } else {
        console.error('User details not found');
    }

});

const navigation = {
    init() {
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.setupNavigationListeners();
        this.highlightCurrentPage();
    },

    setupNavigationListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.setActiveLink(link);
            });
        });
    },

    setActiveLink(activeLink) {
        // Remove active class from all links
        this.navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        activeLink.classList.add('active');
        
        // Store active page in localStorage
        localStorage.setItem('activePage', activeLink.getAttribute('href'));
    },

    highlightCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                this.setActiveLink(link);
            }
        });
    }
};      

// Dashboard Statistics
const dashboard = {
    async loadStats() {
        try {
            const response = await fetch('/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            const data = await response.json();
            this.updateStatCards(data);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    },

    updateStatCards(data) {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const stat = card.querySelector('.stat-number');
            const label = card.querySelector('h3').textContent.toLowerCase();
            if (data[label]) {
                stat.textContent = data[label];
            }
        });
    }
};

// Pickup Scheduling
const scheduling = {
    form: null,

    init() {
        this.form = document.getElementById('scheduleForm');
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            this.setupDateTimeValidation();
        }
    },

    setupDateTimeValidation() {
        const dateInput = this.form.querySelector('input[type="date"]');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.form);
        try {
            const response = await fetch('/api/schedule-pickup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            if (response.ok) {
                this.showSuccessMessage();
                this.form.reset();
            } else {
                throw new Error('Failed to schedule pickup');
            }
        } catch (error) {
            this.showErrorMessage(error.message);
        }
    },

    showSuccessMessage() {
        // Implementation of success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'Pickup scheduled successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    showErrorMessage(message) {
        // Implementation of error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// Real-time Tracking
const tracking = {
    map: null,
    markers: {},

    async initMap() {
        // Initialize map (implementation depends on your map provider)
        this.setupTracking();
    },

    async setupTracking() {
        // Set up WebSocket connection for real-time updates
        const ws = new WebSocket('ws://your-websocket-url');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateTracking(data);
        };
    },

    updateTracking(data) {
        // Update vehicle markers on map
        if (this.markers[data.vehicleId]) {
            this.markers[data.vehicleId].setPosition({
                lat: data.latitude,
                lng: data.longitude
            });
        }

        // Update progress tracker
        this.updateProgressTracker(data.status);
    },

    updateProgressTracker(status) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach(step => {
            step.classList.remove('active');
            if (step.dataset.status === status) {
                step.classList.add('active');
            }
        });
    }
};

// Collection History
const history = {
    async loadHistory(page = 1, filters = {}) {
        try {
            const queryParams = new URLSearchParams({
                page,
                ...filters
            });

            const response = await fetch(`/api/collection-history?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            const data = await response.json();
            this.renderHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    },

    renderHistory(data) {
        const tableBody = document.querySelector('.history-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        data.collections.forEach(collection => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(collection.date).toLocaleDateString()}</td>
                <td>${collection.time}</td>
                <td>${collection.location}</td>
                <td>${collection.type}</td>
                <td><span class="status-${collection.status.toLowerCase()}">${collection.status}</span></td>
                <td><button onclick="history.viewDetails('${collection.id}')" class="view-details-btn">View Details</button></td>
            `;
            tableBody.appendChild(row);
        });

        this.updatePagination(data.pagination);
    },

    updatePagination(pagination) {
        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) return;

        paginationElement.innerHTML = `
            <button ${pagination.currentPage === 1 ? 'disabled' : ''} 
                    onclick="history.loadHistory(${pagination.currentPage - 1})">
                Previous
            </button>
            <span>Page ${pagination.currentPage} of ${pagination.totalPages}</span>
            <button ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''} 
                    onclick="history.loadHistory(${pagination.currentPage + 1})">
                Next
            </button>
        `;
    }
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    
    // Initialize different sections based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('home')) {
        dashboard.loadStats();
    } else if (currentPage.includes('schedule')) {
        scheduling.init();
    } else if (currentPage.includes('tracking')) {
        tracking.initMap();
    } else if (currentPage.includes('history')) {
        history.loadHistory();
    }
});
                                                                                                                                                                                                                                                                                                                                          
