// Application state
let currentUser = null;
let currentPage = 'loginPage';
let challenges = [];
let userProgress = {};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Coding Challenge App initializing...');
    initializeDemoData();
    initializeApp();
    setupEventListeners();
    
    // Make functions available globally for onclick handlers
    setupGlobalFunctions();
});

// Make all functions available globally for onclick handlers
function setupGlobalFunctions() {
    window.showLogin = showLogin;
    window.showSignup = showSignup;
    window.showDashboard = showDashboard;
    window.showChallenges = showChallenges;
    window.showOverallScore = showOverallScore;
    window.showAdmin = showAdmin;
    window.logout = logout;
    window.openCompiler = openCompiler;
    window.runCode = runCode;
    window.submitCode = submitCode;
    window.submitMCQ = submitMCQ;
    window.showAdminTab = showAdminTab;
    window.loadAllUsers = loadAllUsers;
    window.exportUserData = exportUserData;
    window.generateReports = generateReports;
    window.changeUserRole = changeUserRole;
    
    console.log('Global functions exposed successfully');
}

// Initialize demo data and users
function initializeDemoData() {
    // Create demo users with proper roles
    const demoUsers = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@dailychallenge.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date('2025-09-01').toISOString()
        },
        {
            id: 2,
            name: 'Regular User',
            email: 'user@example.com',
            password: 'user123',
            role: 'user',
            createdAt: new Date('2025-09-02').toISOString()
        },
        {
            id: 3,
            name: 'John Doe',
            email: 'john@example.com',
            password: 'demo123',
            role: 'user',
            createdAt: new Date('2025-09-03').toISOString()
        }
    ];

    // Initialize users if not exists
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(demoUsers));
        console.log('Demo users created');
    }

    // Mock challenges based on provided data
    const mockChallenges = [
        {
            id: 1,
            question: "Write a program in Python to print the following pattern for n=5:",
            expectedOutput: "*\n* *\n* * *\n* * * *\n* * * * *",
            answer: "for i in range(1, 6):\n    print('* ' * i)",
            date: "2025-09-09",
            category: "technical",
            type: "coding",
            difficulty: "Easy",
            createdBy: "admin@dailychallenge.com"
        },
        {
            id: 2,
            question: "Which of the following is a key benefit of writing clean code?",
            options: ["A. Slower execution", "B. Easier maintenance", "C. More bugs", "D. Less readability"],
            answer: "B",
            date: "2025-09-09",
            category: "non-technical",
            type: "mcq",
            difficulty: "Easy",
            createdBy: "admin@dailychallenge.com"
        }
    ];
    
    // Save to localStorage if not exists
    if (!localStorage.getItem('challenges')) {
        localStorage.setItem('challenges', JSON.stringify(mockChallenges));
    }
    
    challenges = JSON.parse(localStorage.getItem('challenges') || '[]');
    
    // Initialize progress for demo users
    demoUsers.forEach(user => {
        const progressKey = `progress_${user.id}`;
        if (!localStorage.getItem(progressKey)) {
            const progress = {
                totalScore: user.role === 'admin' ? 500 : Math.floor(Math.random() * 400) + 100,
                completedChallenges: user.role === 'admin' ? 15 : Math.floor(Math.random() * 12) + 3,
                currentStreak: user.role === 'admin' ? 12 : Math.floor(Math.random() * 8) + 2,
                lastActivity: new Date().toISOString(),
                submissions: []
            };
            localStorage.setItem(progressKey, JSON.stringify(progress));
        }
    });
    
    console.log('Demo data initialized');
}

// Initialize the application
function initializeApp() {
    console.log('Checking authentication state...');
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Found saved user:', currentUser.name, 'Role:', currentUser.role);
            showDashboard();
            return;
        } catch (e) {
            console.log('Invalid saved user data, clearing...');
            localStorage.removeItem('currentUser');
        }
    }
    
    // Always start with login page
    showLogin();
    
    // Set today's date
    const today = new Date().toDateString();
    const dateElements = document.querySelectorAll('#todayDate');
    dateElements.forEach(el => {
        if (el) el.textContent = today;
    });
}

// Role-based access control functions
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

function requireAdmin() {
    if (!isAdmin()) {
        console.log('Access denied: Admin privileges required');
        showAccessDenied();
        return false;
    }
    return true;
}

function updateUIForRole() {
    console.log('Updating UI for role:', currentUser?.role);
    
    // Show/hide admin navigation link based on role
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        if (isAdmin()) {
            console.log('Showing admin link for admin user');
            adminLink.classList.remove('hidden');
        } else {
            console.log('Hiding admin link for regular user');
            adminLink.classList.add('hidden');
        }
    }

    // Show/hide admin dashboard card based on role
    const adminDashboardCard = document.getElementById('adminDashboardCard');
    if (adminDashboardCard) {
        if (isAdmin()) {
            console.log('Showing admin dashboard card');
            adminDashboardCard.classList.remove('hidden');
            adminDashboardCard.classList.add('visible');
        } else {
            console.log('Hiding admin dashboard card');
            adminDashboardCard.classList.add('hidden');
            adminDashboardCard.classList.remove('visible');
        }
    }
}

// Setup event listeners for forms
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login form submitted');
            handleLogin();
        });
    }

    // Signup form event listener  
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Signup form submitted');
            handleSignup();
        });
    }

    // Add challenge form event listener
    const addChallengeForm = document.getElementById('addChallengeForm');
    if (addChallengeForm) {
        addChallengeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add challenge form submitted');
            handleAddChallenge();
        });
    }
    
    // Challenge type selector
    const challengeTypeSelect = document.getElementById('challengeType');
    if (challengeTypeSelect) {
        challengeTypeSelect.addEventListener('change', function(e) {
            const optionsGroup = document.getElementById('optionsGroup');
            if (optionsGroup) {
                optionsGroup.style.display = e.target.value === 'non-technical' ? 'block' : 'none';
            }
        });
    }
    
    console.log('Event listeners set up successfully');
}

// Authentication functions
function handleLogin() {
    console.log('Processing login...');
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput) {
        console.error('Login form inputs not found');
        alert('Form error. Please refresh the page.');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Get users from localStorage
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        console.log('Error parsing users');
        users = [];
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('Login successful:', user.name, 'Role:', user.role);
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Clear the form
        emailInput.value = '';
        passwordInput.value = '';
        
        // Navigate to dashboard
        showDashboard();
    } else {
        console.log('Login failed - invalid credentials');
        alert('Invalid credentials. Try:\nAdmin: admin@dailychallenge.com / admin123\nUser: user@example.com / user123');
    }
}

function handleSignup() {
    console.log('Processing signup...');
    
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const userRoleInput = document.getElementById('userRole');
    
    if (!nameInput || !emailInput || !passwordInput || !userRoleInput) {
        console.error('Signup form inputs not found');
        alert('Form error. Please refresh the page.');
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = userRoleInput.value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    // Get existing users
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        console.log('Error parsing users, creating fresh list');
        users = [];
    }
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        alert('An account with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('User created successfully:', newUser.name, 'Role:', newUser.role);
    
    // Initialize user progress
    const progress = {
        totalScore: 0,
        completedChallenges: 0,
        currentStreak: 0,
        lastActivity: null,
        submissions: []
    };
    localStorage.setItem(`progress_${newUser.id}`, JSON.stringify(progress));
    
    alert('🎉 Account created successfully! Please sign in with your credentials.');
    
    // Clear the form
    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    userRoleInput.value = 'user';
    
    showLogin();
}

function logout() {
    console.log('User logging out...');
    
    // Clear current user state
    currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('currentUser');
    
    // Clear any form data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.reset) {
            form.reset();
        }
    });
    
    // Force page to login state
    showLogin();
    
    console.log('Logout completed successfully');
}

// Navigation functions
function showPage(pageId) {
    console.log('Navigating to page:', pageId);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        console.log('Page displayed successfully:', pageId);
    } else {
        console.error('Page not found:', pageId);
        return false;
    }
    
    // Show/hide navbar based on page
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (pageId === 'loginPage' || pageId === 'signupPage') {
            navbar.classList.add('hidden');
        } else {
            // Only show navbar if user is authenticated
            if (currentUser) {
                navbar.classList.remove('hidden');
                updateUIForRole();
            } else {
                navbar.classList.add('hidden');
                // Redirect to login if trying to access protected pages
                if (pageId !== 'loginPage' && pageId !== 'signupPage') {
                    console.log('Redirecting unauthenticated user to login');
                    setTimeout(() => showLogin(), 100);
                    return false;
                }
            }
        }
    }
    
    currentPage = pageId;
    return true;
}
function showLogin() {
    console.log('Showing login page');
    return showPage('loginPage');
}

function showSignup() {
    console.log('Showing signup page');
    return showPage('signupPage');
}

function showDashboard() {
    console.log('Showing dashboard');
    
    if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        showLogin();
        return;
    }
    
    if (showPage('dashboardPage')) {
        updateDashboardStats();
    }
}

function showChallenges() {
    console.log('Showing challenges page');
    
    if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        showLogin();
        return;
    }
    
    if (showPage('challengePage')) {
        loadTodayChallenges();
    }
}

function showOverallScore() {
    console.log('Showing progress page');
    
    if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        showLogin();
        return;
    }
    
    if (showPage('overallScorePage')) {
        setTimeout(() => {
            loadScoreCharts();
            loadRecentActivity();
        }, 100);
    }
}

function showAdmin() {
    console.log('Admin access requested');
    
    if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        showLogin();
        return;
    }
    
    if (!requireAdmin()) {
        return;
    }
    
    console.log('Showing admin panel');
    if (showPage('adminPage')) {
        showAdminTab('challenges');
        loadAdminAnalytics();
    }
}

function showAccessDenied() {
    console.log('Showing access denied page');
    showPage('accessDeniedPage');
}

// Dashboard functions
function updateDashboardStats() {
    if (!currentUser) return;
    
    let progress;
    try {
        progress = JSON.parse(localStorage.getItem(`progress_${currentUser.id}`) || '{}');
    } catch (e) {
        console.log('Error parsing progress, using defaults');
        progress = {
            totalScore: isAdmin() ? 500 : 325,
            currentStreak: isAdmin() ? 12 : 10,
            completedChallenges: isAdmin() ? 15 : 10
        };
    }
    
    const userNameEl = document.getElementById('userName');
    const currentStreakEl = document.getElementById('currentStreak');
    const totalScoreEl = document.getElementById('totalScore');
    const completedChallengesEl = document.getElementById('completedChallenges');
    
    if (userNameEl) userNameEl.textContent = currentUser.name;
    if (currentStreakEl) currentStreakEl.textContent = progress.currentStreak || (isAdmin() ? 12 : 10);
    if (totalScoreEl) totalScoreEl.textContent = progress.totalScore || (isAdmin() ? 500 : 325);
    if (completedChallengesEl) completedChallengesEl.textContent = progress.completedChallenges || (isAdmin() ? 15 : 10);
    
    console.log('Dashboard stats updated for:', currentUser.role);
}

// Challenge functions
function loadTodayChallenges() {
    console.log('Loading today\'s challenges');
    updateProgressIndicators();
}

function updateProgressIndicators() {
    if (!currentUser) return;
    
    let progress;
    try {
        progress = JSON.parse(localStorage.getItem(`progress_${currentUser.id}`) || '{}');
    } catch (e) {
        console.log('Error parsing progress');
        progress = {};
    }
    
    const today = new Date().toDateString();
    
    // Check if challenges are completed today
    const todaySubmissions = (progress.submissions || []).filter(s => 
        new Date(s.submittedAt).toDateString() === today
    );
    
    const technicalCompleted = todaySubmissions.some(s => s.type === 'technical');
    const mcqCompleted = todaySubmissions.some(s => s.type === 'mcq');
    
    const technicalStatusEl = document.getElementById('technicalStatus');
    const mcqStatusEl = document.getElementById('mcqStatus');
    
    if (technicalStatusEl) {
        technicalStatusEl.textContent = technicalCompleted ? 'Completed' : 'Pending';
        technicalStatusEl.className = technicalCompleted ? 'status status--success' : 'status status--info';
    }
    
    if (mcqStatusEl) {
        mcqStatusEl.textContent = mcqCompleted ? 'Completed' : 'Pending';
        mcqStatusEl.className = mcqCompleted ? 'status status--success' : 'status status--info';
    }
}

function submitMCQ() {
    console.log('Submitting MCQ answer');
    const selected = document.querySelector('input[name="mcq"]:checked');
    if (!selected) {
        alert('Please select an answer before submitting.');
        return;
    }
    
    const today = new Date().toDateString();
    const mcqChallenge = challenges.find(c => 
        c.category === 'non-technical' && new Date(c.date).toDateString() === today
    );
    
    if (!mcqChallenge) {
        alert('No MCQ challenge found for today.');
        return;
    }
    
    const isCorrect = selected.value === mcqChallenge.answer;
    const points = isCorrect ? 10 : 0;
    
    console.log('MCQ result:', { selected: selected.value, correct: mcqChallenge.answer, isCorrect, points });
    
    // Update user progress
    let progress;
    try {
        progress = JSON.parse(localStorage.getItem(`progress_${currentUser.id}`) || '{}');
    } catch (e) {
        progress = {};
    }
    
    progress.totalScore = (progress.totalScore || 0) + points;
    progress.submissions = progress.submissions || [];
    
    // Check if already submitted today
    const alreadySubmitted = progress.submissions.some(s => 
        s.challengeId === mcqChallenge.id && 
        new Date(s.submittedAt).toDateString() === today
    );
    
    if (alreadySubmitted) {
        alert('You have already submitted this challenge today.');
        return;
    }
    
    progress.submissions.push({
        challengeId: mcqChallenge.id,
        type: 'mcq',
        answer: selected.value,
        isCorrect,
        points,
        submittedAt: new Date().toISOString()
    });
    
    // Update completed challenges if this is the first submission today
    const todaySubmissions = progress.submissions.filter(s => 
        new Date(s.submittedAt).toDateString() === today
    );
    
    if (todaySubmissions.length === 1) {
        progress.completedChallenges = (progress.completedChallenges || 0) + 1;
        progress.currentStreak = (progress.currentStreak || 0) + 1;
    }
    
    localStorage.setItem(`progress_${currentUser.id}`, JSON.stringify(progress));
    
    if (isCorrect) {
        alert('🎉 Excellent! That\'s the correct answer. You earned 10 points!');
    } else {
        alert(`❌ Not quite right. The correct answer is ${mcqChallenge.answer}. Keep learning!`);
    }
    
    updateProgressIndicators();
    updateDashboardStats();
}

// Compiler functions
function openCompiler() {
    console.log('Opening code compiler');
    if (showPage('compilerPage')) {
        // Set default code template
        const codeEditor = document.getElementById('codeEditor');
        if (codeEditor) {
            codeEditor.value = '# Write your Python code here\nfor i in range(1, 6):\n    print("* " * i)';
        }
    }
}

function runCode() {
    console.log('Running code simulation');
    const codeEditor = document.getElementById('codeEditor');
    
    if (!codeEditor) {
        alert('Code editor not found. Please refresh the page.');
        return;
    }
    
    const code = codeEditor.value;
    
    if (!code.trim()) {
        alert('Please write some code first.');
        return;
    }
    
    // Simulate code execution
    const output = simulateCodeExecution(code);
    const outputDisplay = document.getElementById('outputDisplay');
    if (outputDisplay) {
        outputDisplay.textContent = output;
    }
    
    alert('✅ Code executed! Check the output below.');
}

function simulateCodeExecution(code) {
    console.log('Simulating code execution');
    // Simple pattern simulation
    const expectedPattern = [
        '*',
        '* *',
        '* * *',
        '* * * *',
        '* * * * *'
    ];
    
    // Check if code contains pattern generation logic
    const hasLoop = code.includes('for') || code.includes('while') || code.includes('range');
    const hasPrint = code.includes('print') || code.includes('cout') || code.includes('console.log') || code.includes('System.out');
    
    if (hasLoop && hasPrint) {
        return expectedPattern.join('\n');
    } else {
        return 'Error: Code does not seem to generate the expected pattern.\nPlease check your logic and try again.\n\nHint: You need a loop and print statements.';
    }
}

function submitCode() {
    console.log('Submitting code solution');
    const codeEditor = document.getElementById('codeEditor');
    
    if (!codeEditor) {
        alert('Code editor not found. Please refresh the page.');
        return;
    }
    
    const code = codeEditor.value;
    
    if (!code.trim()) {
        alert('Please write some code first.');
        return;
    }
    
    // Run the code first
    const output = simulateCodeExecution(code);
    
    // Check if output is correct
    const expectedPattern = '*\n* *\n* * *\n* * * *\n* * * * *';
    const isCorrect = output === expectedPattern;
    const points = isCorrect ? 20 : 5;
    
    console.log('Code submission result:', { isCorrect, points });
    
    // Update user progress
    let progress;
    try {
        progress = JSON.parse(localStorage.getItem(`progress_${currentUser.id}`) || '{}');
    } catch (e) {
        progress = {};
    }
    
    const today = new Date().toDateString();
    const technicalChallenge = challenges.find(c => 
        c.category === 'technical' && new Date(c.date).toDateString() === today
    );
    
    if (!technicalChallenge) {
        alert('No technical challenge found for today.');
        return;
    }
    
    progress.totalScore = (progress.totalScore || 0) + points;
    progress.submissions = progress.submissions || [];
    progress.submissions.push({
        challengeId: technicalChallenge.id,
        type: 'technical',
        code,
        output,
        isCorrect,
        points,
        submittedAt: new Date().toISOString()
    });
    
    localStorage.setItem(`progress_${currentUser.id}`, JSON.stringify(progress));
    
    if (isCorrect) {
        alert(`🎉 Outstanding work! Your code produces the perfect pattern. You earned ${points} points!`);
    } else {
        alert(`💡 Good effort! Your code runs but doesn't match the expected pattern exactly. You earned ${points} points for trying. Keep practicing!`);
    }
    
    // Go back to challenges page
    showChallenges();
}

// Score page functions
function loadScoreCharts() {
    console.log('Loading progress charts');
    
    try {
        if (!currentUser) return;
        
        // Score progression chart
        const scoreCtx = document.getElementById('scoreChart');
        if (!scoreCtx) {
            console.error('Score chart canvas not found');
            return;
        }
        
        // Sample data for demo based on user role
        const isUserAdmin = isAdmin();
        const scoreData = isUserAdmin ? 
            [0, 20, 45, 70, 100, 135, 170, 210, 250, 290, 330, 380, 430, 500] :
            [0, 10, 30, 50, 75, 100, 130, 160, 190, 220, 250, 280, 325];
        const dates = ['Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8', 'Sep 9', 'Sep 10', 'Sep 11', 'Sep 12', 'Sep 13'];
        
        new Chart(scoreCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Total Score',
                    data: scoreData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(99, 102, 241, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(99, 102, 241, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Challenge distribution chart
        const distCtx = document.getElementById('distributionChart');
        if (distCtx) {
            const techCount = isUserAdmin ? 8 : 6;
            const mcqCount = isUserAdmin ? 7 : 4;
            
            new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Technical Challenges', 'MCQ Challenges'],
                    datasets: [{
                        data: [techCount, mcqCount],
                        backgroundColor: ['#6366f1', '#94a3b8'],
                        borderColor: ['#ffffff', '#ffffff'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

function loadRecentActivity() {
    if (!currentUser) return;
    
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    // Sample activity data based on user role
    const isUserAdmin = isAdmin();
    const sampleActivity = isUserAdmin ? [
        { type: 'technical', isCorrect: true, points: 20, date: 'Sep 9, 2025' },
        { type: 'mcq', isCorrect: true, points: 10, date: 'Sep 8, 2025' },
        { type: 'technical', isCorrect: true, points: 20, date: 'Sep 7, 2025' },
        { type: 'mcq', isCorrect: true, points: 10, date: 'Sep 6, 2025' },
        { type: 'technical', isCorrect: true, points: 20, date: 'Sep 5, 2025' }
    ] : [
        { type: 'technical', isCorrect: true, points: 20, date: 'Sep 9, 2025' },
        { type: 'mcq', isCorrect: true, points: 10, date: 'Sep 8, 2025' },
        { type: 'technical', isCorrect: false, points: 5, date: 'Sep 7, 2025' },
        { type: 'mcq', isCorrect: true, points: 10, date: 'Sep 6, 2025' },
        { type: 'technical', isCorrect: true, points: 20, date: 'Sep 5, 2025' }
    ];
    
    let html = '';
    sampleActivity.forEach(activity => {
        const status = activity.isCorrect ? '✅' : '❌';
        const type = activity.type === 'technical' ? '💻 Technical Challenge' : '🧠 MCQ Challenge';
        
        html += `
            <div style="padding: 16px; margin-bottom: 12px; background: var(--light-gradient-subtle); border-radius: var(--radius-lg); border: 1px solid var(--color-light-accent);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--color-text);">${status} ${type}</span>
                    <span style="font-size: 12px; color: var(--color-text-secondary);">${activity.date}</span>
                </div>
                <div style="font-size: 14px; color: var(--color-primary); font-weight: 500;">
                    +${activity.points} points earned
                </div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
}

// Admin functions
function showAdminTab(tabName) {
    if (!requireAdmin()) {
        return;
    }
    
    console.log('Showing admin tab:', tabName);
    
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(tabName)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load content based on tab
    switch(tabName) {
        case 'users':
            loadAllUsers();
            break;
        case 'reports':
            loadStudentReports();
            break;
        case 'analytics':
            loadAdminAnalytics();
            break;
    }
}

function handleAddChallenge() {
    if (!requireAdmin()) {
        return;
    }
    
    console.log('Adding new challenge');
    
    const type = document.getElementById('challengeType').value;
    const question = document.getElementById('challengeQuestion').value;
    const answer = document.getElementById('challengeAnswer').value;
    const date = document.getElementById('challengeDate').value;
    
    if (!question || !answer || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newChallenge = {
        id: Date.now(),
        question,
        answer,
        date,
        category: type,
        type: type === 'technical' ? 'coding' : 'mcq',
        createdBy: currentUser.email,
        createdAt: new Date().toISOString()
    };
    
    if (type === 'non-technical') {
        const options = [
            document.getElementById('optionA').value,
            document.getElementById('optionB').value,
            document.getElementById('optionC').value,
            document.getElementById('optionD').value
        ];
        
        if (options.some(opt => !opt.trim())) {
            alert('Please fill in all MCQ options');
            return;
        }
        
        newChallenge.options = options;
    } else {
        newChallenge.expectedOutput = answer;
    }
    
    challenges.push(newChallenge);
    localStorage.setItem('challenges', JSON.stringify(challenges));
    
    alert('✨ Challenge added successfully!');
    document.getElementById('addChallengeForm').reset();
    document.getElementById('optionsGroup').style.display = 'none';
    
    // Update analytics
    loadAdminAnalytics();
}

function loadAllUsers() {
    if (!requireAdmin()) {
        return;
    }
    
    const usersList = document.getElementById('usersList');
    if (!usersList) return;
    
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem('users') || '[]');
    } catch (e) {
        console.error('Error loading users:', e);
        users = [];
    }
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>No users found</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const progress = JSON.parse(localStorage.getItem(`progress_${user.id}`) || '{}');
        
        html += `
            <div class="user-item">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>📧 ${user.email}</p>
                    <p>📅 Joined: ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="user-role ${user.role}">${user.role.toUpperCase()}</span>
                    <div style="text-align: center; padding: 8px;">
                        <div style="font-weight: bold; color: var(--color-text);">${progress.totalScore || 0}</div>
                        <div style="font-size: 12px; color: var(--color-text-secondary);">Score</div>
                    </div>
                    <button class="btn btn--sm btn--secondary" onclick="changeUserRole('${user.id}', '${user.role === 'admin' ? 'user' : 'admin'}')">
                        ${user.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </button>
                </div>
            </div>
        `;
    });
    
    usersList.innerHTML = html;
}

function changeUserRole(userId, newRole) {
    if (!requireAdmin()) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === parseInt(userId));
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    const user = users[userIndex];
    const oldRole = user.role;
    
    if (confirm(`Change ${user.name}'s role from ${oldRole} to ${newRole}?`)) {
        users[userIndex].role = newRole;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user if they changed their own role
        if (currentUser && currentUser.id === parseInt(userId)) {
            currentUser.role = newRole;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForRole();
        }
        
        alert(`✅ ${user.name}'s role changed from ${oldRole} to ${newRole}`);
        loadAllUsers();
        loadAdminAnalytics();
    }
}

function exportUserData() {
    if (!requireAdmin()) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `users_export_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('📥 User data exported successfully!');
}

function generateReports() {
    if (!requireAdmin()) {
        return;
    }
    
    loadStudentReports();
    alert('📊 Reports generated successfully!');
}

function loadStudentReports() {
    if (!requireAdmin()) {
        return;
    }
    
    const reportsList = document.getElementById('reportsList');
    if (!reportsList) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const studentUsers = users.filter(u => u.role === 'user');
    
    if (studentUsers.length === 0) {
        reportsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👨‍🎓</div>
                <p>No student users found</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    studentUsers.forEach(student => {
        const progress = JSON.parse(localStorage.getItem(`progress_${student.id}`) || '{}');
        const submissionCount = (progress.submissions || []).length;
        const avgScore = submissionCount > 0 ? Math.round(progress.totalScore / submissionCount) : 0;
        
        html += `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card__body">
                    <h4 style="color: var(--color-text); margin-bottom: 8px;">👨‍💻 ${student.name}</h4>
                    <p style="color: var(--color-text-secondary); margin-bottom: 16px;">📧 ${student.email}</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px;">
                        <div style="text-align: center; padding: 12px; background: var(--light-gradient-subtle); border-radius: var(--radius-base); border: 1px solid var(--color-light-accent);">
                            <div style="font-size: 24px; font-weight: bold; color: var(--color-text);">${progress.totalScore || 0}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Total Score</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: var(--light-gradient-subtle); border-radius: var(--radius-base); border: 1px solid var(--color-light-accent);">
                            <div style="font-size: 24px; font-weight: bold; color: var(--color-text);">${progress.completedChallenges || 0}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Completed</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: var(--light-gradient-subtle); border-radius: var(--radius-base); border: 1px solid var(--color-light-accent);">
                            <div style="font-size: 24px; font-weight: bold; color: var(--color-text);">${progress.currentStreak || 0}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Streak</div>
                        </div>
                        <div style="text-align: center; padding: 12px; background: var(--light-gradient-subtle); border-radius: var(--radius-base); border: 1px solid var(--color-light-accent);">
                            <div style="font-size: 24px; font-weight: bold; color: var(--color-text);">${submissionCount}</div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Submissions</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    reportsList.innerHTML = html;
}

function loadAdminAnalytics() {
    if (!requireAdmin()) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const challenges = JSON.parse(localStorage.getItem('challenges') || '[]');
    
    // Calculate analytics
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const activeToday = Math.floor(regularUsers * 0.6); // Simulated
    const totalChallenges = challenges.length;
    const completionRate = totalUsers > 0 ? Math.round((activeToday / totalUsers) * 100) : 0;
    
    // Update analytics display
    const totalUsersEl = document.getElementById('totalUsers');
    const activeTodayEl = document.getElementById('activeToday');
    const totalChallengesEl = document.getElementById('totalChallenges');
    const completionRateEl = document.getElementById('completionRate');
    
    if (totalUsersEl) totalUsersEl.textContent = totalUsers;
    if (activeTodayEl) activeTodayEl.textContent = activeToday;
    if (totalChallengesEl) totalChallengesEl.textContent = totalChallenges;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;
    
    // Load admin chart
    setTimeout(() => {
        const adminCtx = document.getElementById('adminChart');
        if (adminCtx) {
            new Chart(adminCtx, {
                type: 'bar',
                data: {
                    labels: ['Admin Users', 'Regular Users', 'Active Today', 'Total Challenges'],
                    datasets: [{
                        label: 'System Statistics',
                        data: [adminUsers, regularUsers, activeToday, totalChallenges],
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
                        borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(99, 102, 241, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(99, 102, 241, 0.1)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }, 100);
}

// Initialize everything when script loads
console.log('App script loaded successfully');
