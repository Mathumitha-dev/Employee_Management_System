// frontend/js/leave.js
if (checkAuth()) {
    initUserInfo();
    loadLeaveBalance();
    loadLeaves();
}

async function loadLeaveBalance() {
    try {
        const user = getUser();
        const response = await apiCall(`/leave/balance/${user.employeeId}`);
        
        if (response.success) {
            const balance = response.balance;
            const container = document.getElementById('leaveBalance');
            
            container.innerHTML = `
                <div class="balance-item">
                    <h4>Sick Leave</h4>
                    <div class="balance-number">${balance.remaining.sick}</div>
                    <p>of ${balance.sick} remaining</p>
                </div>
                <div class="balance-item">
                    <h4>Casual Leave</h4>
                    <div class="balance-number">${balance.remaining.casual}</div>
                    <p>of ${balance.casual} remaining</p>
                </div>
                <div class="balance-item">
                    <h4>Vacation</h4>
                    <div class="balance-number">${balance.remaining.vacation}</div>
                    <p>of ${balance.vacation} remaining</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading leave balance:', error);
    }
}

async function loadLeaves() {
    try {
        const user = getUser();
        const response = await apiCall(`/leave/employee/${user.employeeId}`);
        
        if (response.success) {
            displayLeaves(response.leaves);
        }
    } catch (error) {
        console.error('Error loading leaves:', error);
    }
}

function displayLeaves(leaves) {
    const container = document.getElementById('leaveTable');
    
    if (leaves.length === 0) {
        container.innerHTML = '<p class="empty-state">No leave records found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                </tr>
            </thead>
            <tbody>
                ${leaves.map(leave => `
                    <tr>
                        <td>${leave.leaveType}</td>
                        <td>${formatDate(leave.startDate)}</td>
                        <td>${formatDate(leave.endDate)}</td>
                        <td>${leave.numberOfDays}</td>
                        <td>${leave.reason}</td>
                        <td><span class="status status-${leave.status.toLowerCase()}">${leave.status}</span></td>
                        <td>${formatDate(leave.appliedDate)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showApplyLeaveModal() {
    document.getElementById('leaveModal').classList.add('active');
}

function closeLeaveModal() {
    document.getElementById('leaveModal').classList.remove('active');
    document.getElementById('leaveForm').reset();
}

document.getElementById('leaveForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const user = getUser();
    data.employeeId = user.employeeId;
    
    try {
        const response = await apiCall('/leave/apply', 'POST', data);
        
        if (response.success) {
            alert('Leave application submitted successfully!');
            closeLeaveModal();
            loadLeaves();
            loadLeaveBalance();
        }
    } catch (error) {
        alert('Error submitting leave application: ' + error.message);
    }
});

// Calculate days automatically
document.querySelector('input[name="startDate"]')?.addEventListener('change', calculateLeaveDays);
document.querySelector('input[name="endDate"]')?.addEventListener('change', calculateLeaveDays);

function calculateLeaveDays() {
    const startDate = document.querySelector('input[name="startDate"]').value;
    const endDate = document.querySelector('input[name="endDate"]').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        document.querySelector('input[name="numberOfDays"]').value = days > 0 ? days : 0;
    }
}