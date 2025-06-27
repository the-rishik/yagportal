document.addEventListener('DOMContentLoaded', () => {
    initMyBills();
});

function initMyBills() {
    // Initialize tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button));
    });

    // Initialize modal
    const modal = document.getElementById('billPreviewModal');
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => closeModal());

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initialize edit and delete buttons
    document.getElementById('edit-bill-button').addEventListener('click', editCurrentBill);
    document.getElementById('delete-bill-button').addEventListener('click', deleteCurrentBill);

    // Load bills
    loadBills();
}

function switchTab(selectedTab) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    selectedTab.classList.add('active');

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    const targetId = selectedTab.dataset.tab === 'submitted' ? 'submitted-bills' : 'draft-bills';
    document.getElementById(targetId).classList.add('active');

    // Reload bills for the selected tab
    loadBills();
}

function loadBills() {
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    const billsList = activeTab === 'submitted' ? 
        document.getElementById('submitted-bills-list') : 
        document.getElementById('draft-bills-list');

    // Clear current list
    billsList.innerHTML = '';

    if (activeTab === 'submitted') {
        loadSubmittedBills(billsList);
    } else {
        loadDraftBills(billsList);
    }
}

function loadSubmittedBills(container) {
    // Get submitted bills from localStorage
    const submittedBills = JSON.parse(localStorage.getItem('submittedBills')) || [];

    if (submittedBills.length === 0) {
        container.innerHTML = '<div class="no-bills-message">No submitted bills found.</div>';
        return;
    }

    submittedBills.forEach(bill => {
        container.appendChild(createBillCard(bill, 'submitted'));
    });
}

function loadDraftBills(container) {
    // Get draft from localStorage
    const draft = localStorage.getItem('billDraft');

    if (!draft) {
        container.innerHTML = '<div class="no-bills-message">No drafts found.</div>';
        return;
    }

    const draftBill = JSON.parse(draft);
    container.appendChild(createBillCard(draftBill, 'draft'));
}

function createBillCard(bill, status) {
    const card = document.createElement('div');
    card.className = 'bill-card';
    card.innerHTML = `
        <h3>${bill.title || 'Untitled Bill'}</h3>
        <div class="meta">
            <p>Author(s): ${bill.author || 'Not specified'}</p>
            <p>Delegation: ${bill.delegation || 'Not specified'}</p>
            <p>Last modified: ${formatDate(bill.timestamp)}</p>
        </div>
        <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
    `;

    card.addEventListener('click', () => openBillPreview(bill, status));
    return card;
}

function openBillPreview(bill, status) {
    const modal = document.getElementById('billPreviewModal');
    document.getElementById('preview-bill-title').textContent = bill.title || 'Untitled Bill';
    document.getElementById('preview-author').textContent = bill.author || 'Not specified';
    document.getElementById('preview-delegation').textContent = bill.delegation || 'Not specified';
    document.getElementById('preview-status').textContent = status.charAt(0).toUpperCase() + status.slice(1);
    document.getElementById('preview-content').textContent = bill.content || '';

    // Show/hide edit button based on status
    const editButton = document.getElementById('edit-bill-button');
    editButton.style.display = status === 'draft' ? 'block' : 'none';

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('billPreviewModal');
    modal.style.display = 'none';
}

function editCurrentBill() {
    // Redirect to the submission form
    window.location.href = 'index.html#submit-bill';
}

function deleteCurrentBill() {
    const activeTab = document.querySelector('.tab-button.active').dataset.tab;
    
    if (activeTab === 'drafts') {
        localStorage.removeItem('billDraft');
    } else {
        // For submitted bills, you would typically make an API call here
        // For now, we'll just show an alert
        alert('This feature is not yet implemented for submitted bills.');
        return;
    }

    closeModal();
    loadBills();
}

function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

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