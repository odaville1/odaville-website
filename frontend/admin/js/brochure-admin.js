// Brochure Requests Admin Functionality
document.addEventListener('DOMContentLoaded', function() {
    const requestsTableBody = document.getElementById('requestsTableBody');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    
    // If we're on the brochure-requests admin page
    if (requestsTableBody) {
        loadBrochureRequests();

        // Add event listeners for filters if they exist
        if (statusFilter) {
            statusFilter.addEventListener('change', loadBrochureRequests);
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', loadBrochureRequests);
        }
        
        // Set up refresh button if it exists
        const refreshBtn = document.getElementById('refreshRequests');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadBrochureRequests);
        }
    }

    async function loadBrochureRequests() {
        try {
            const statusValue = statusFilter ? statusFilter.value : 'all';
            const searchValue = searchInput ? searchInput.value : '';
            
            // Show loading indication
            if (requestsTableBody) {
                requestsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading requests...</td></tr>';
            }

            // Fetch the token from storage
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                window.location.href = 'admin-login.html'; // Redirect to login
                return;
            }

            // Fetch brochure requests from API
            const response = await fetch('/api/brochure/requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Failed to load brochure requests');
            }

            displayRequests(result.data, statusValue, searchValue);
        } catch (error) {
            console.error('Error loading requests:', error);
            if (requestsTableBody) {
                requestsTableBody.innerHTML = `<tr><td colspan="6" class="text-center error">Error loading requests: ${error.message}</td></tr>`;
            }
        }
    }

    function displayRequests(requests, statusFilter, searchQuery) {
        if (!requestsTableBody) return;

        // If no requests
        if (!requests || requests.length === 0) {
            requestsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No brochure requests found</td></tr>';
            return;
        }

        // Filter requests based on status and search query
        const filteredRequests = requests.filter(request => {
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            
            const matchesSearch = !searchQuery || 
                request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (request.phone && request.phone.includes(searchQuery));
                
            return matchesStatus && matchesSearch;
        });

        if (filteredRequests.length === 0) {
            requestsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No matching brochure requests found</td></tr>';
            return;
        }

        // Build table rows
        requestsTableBody.innerHTML = filteredRequests.map(request => {
            const date = new Date(request.requestDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <tr>
                    <td>${request.name}</td>
                    <td>${request.email}</td>
                    <td>${request.phone || 'N/A'}</td>
                    <td>${date}</td>
                    <td>
                        <span class="status-badge status-${request.status || 'pending'}">
                            ${request.status || 'pending'}
                        </span>
                    </td>
                    <td>
                        ${request.status === 'pending' ? `
                            <button class="action-btn send-btn" onclick="markAsSent('${request._id}')">
                                Mark as Sent
                            </button>
                        ` : ''}
                        <button class="action-btn delete-btn" onclick="deleteRequest('${request._id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
});

// Mark request as sent
async function markAsSent(requestId) {
    if (!confirm('Are you sure you want to mark this request as sent?')) return;

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(`/api/brochure/request/${requestId}/send`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('Request marked as sent successfully!');
            window.location.reload(); // Refresh to update UI
        } else {
            throw new Error(result.message || 'Failed to update request status');
        }
    } catch (error) {
        console.error('Error updating request:', error);
        alert(`Error updating request status: ${error.message}`);
    }
}

// Delete request
async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) return;

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(`/api/brochure/request/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('Request deleted successfully!');
            window.location.reload(); // Refresh to update UI
        } else {
            throw new Error(result.message || 'Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        alert(`Error deleting request: ${error.message}`);
    }
}