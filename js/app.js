// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

function initApp() {
    // Initialize form handling
    const billForm = document.getElementById('billForm');
    if (billForm) {
        billForm.addEventListener('submit', handleBillSubmission);
        
        // Add draft saving functionality
        const saveDraftBtn = billForm.querySelector('.save-draft-button');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', saveDraft);
        }

        // Load draft if exists
        loadDraft();
    }

    // Add smooth scrolling to navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // Example of dynamic content loading
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function handleBillSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        title: document.getElementById('billTitle').value,
        author: document.getElementById('author').value,
        delegation: document.getElementById('delegation').value,
        content: document.getElementById('billContent').value,
        timestamp: new Date().toISOString()
    };

    // Validate form data
    if (!validateBillForm(formData)) {
        return;
    }

    // Get existing submitted bills or initialize empty array
    const submittedBills = JSON.parse(localStorage.getItem('submittedBills')) || [];
    
    // Add new bill to the array
    submittedBills.push(formData);
    
    // Save back to localStorage
    localStorage.setItem('submittedBills', JSON.stringify(submittedBills));

    // Clear the form and draft
    e.target.reset();
    localStorage.removeItem('billDraft');

    // Show success message and redirect
    alert('Bill submitted successfully! You can view it in the My Bills section.');
    window.location.href = 'my-bills.html';
}

function validateBillForm(formData) {
    const errors = [];

    if (!formData.title.trim()) {
        errors.push('Bill title is required');
    }

    if (!formData.author.trim()) {
        errors.push('Author name(s) is required');
    }

    if (!formData.delegation.trim()) {
        errors.push('Delegation is required');
    }

    if (!formData.content.trim()) {
        errors.push('Bill content is required');
    } else if (formData.content.length < 100) {
        errors.push('Bill content must be at least 100 characters long');
    }

    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

function saveDraft() {
    const draftData = {
        title: document.getElementById('billTitle').value,
        author: document.getElementById('author').value,
        delegation: document.getElementById('delegation').value,
        content: document.getElementById('billContent').value,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('billDraft', JSON.stringify(draftData));
    alert('Draft saved successfully! You can access it in the My Bills section.');
}

function loadDraft() {
    const savedDraft = localStorage.getItem('billDraft');
    
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        
        document.getElementById('billTitle').value = draftData.title || '';
        document.getElementById('author').value = draftData.author || '';
        document.getElementById('delegation').value = draftData.delegation || '';
        document.getElementById('billContent').value = draftData.content || '';
    }
}

function smoothScroll(e) {
    const targetId = this.getAttribute('href');
    
    if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

function updateDateTime() {
    // Example of dynamic content update
    const now = new Date();
    const footer = document.querySelector('footer p');
    footer.textContent = `© ${now.getFullYear()} New Jersey Youth and Government. All rights reserved.`;
}

// Example of a utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Example of window resize handler with debounce
const handleResize = debounce(() => {
    console.log('Window resized');
    // Add your resize logic here
}, 250);

window.addEventListener('resize', handleResize);

// Update footer year
function updateFooterYear() {
    const footer = document.querySelector('footer p');
    if (footer) {
        const year = new Date().getFullYear();
        footer.textContent = `© ${year} New Jersey Youth and Government. All rights reserved.`;
    }
}

// Initialize footer
updateFooterYear(); 