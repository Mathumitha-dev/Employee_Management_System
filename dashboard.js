if (checkAuth()) {
    initUserInfo();
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Load stats
        const statsResponse = await apiCall('/dashboard/stats');
        if (statsResponse.success) {
            const stats = statsResponse.stats;
            document.getElementById('totalEmployees').textContent = stats.totalEmployees;
            document.getElementById('presentToday').textContent = stats.presentToday;
            document.getElementById('pendingLeaves').textContent = stats.pendingLeaves;
            document.getElementById('totalDepartments').textContent = stats.totalDepartments;
        }

        // Load recent employees
        const employeesResponse = await apiCall('/employees?limit=5');
        if (employeesResponse.success) {
            displayRecentEmployees(employeesResponse.employees);
        }

        // Load pending leaves
        const leavesResponse = await apiCall('/leave/pending');
        if (leavesResponse.success) {
            displayPendingLeaves(leavesResponse.leaves);
        }

        // Load attendance chart
        loadAttendanceChart();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function displayRecentEmployees(employees) {
    const container = document.getElementById('recentEmployees');
    
    if (employees.length === 0) {
        container.innerHTML = '<p class="empty-state">No employees found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr>
                        <td>${emp.employeeCode}</td>
                        <td>${emp.firstName} ${emp.lastName}</td>
                        <td>${emp.department}</td>
                        <td><span class="badge badge-${emp.status === 'Active' ? 'success' : 'danger'}">${emp.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function displayPendingLeaves(leaves) {
    const container = document.getElementById('pendingLeaveRequests');
    
    if (leaves.length === 0) {
        container.innerHTML = '<p class="empty-state">No pending leave requests</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${leaves.slice(0, 5).map(leave => `
                    <tr>
                        <td>${leave.employeeId.firstName} ${leave.employeeId.lastName}</td>
                        <td>${leave.leaveType}</td>
                        <td>${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="approveLeave('${leave._id}')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="rejectLeave('${leave._id}')">Reject</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function approveLeave(leaveId) {
    try {
        const result = await apiCall(`/leave/${leaveId}/approve`, 'PUT');
        if (result.success) {
            alert('Leave approved successfully');
            loadDashboardData();
        }
    } catch (error) {
        alert('Error approving leave: ' + error.message);
    }
}

async function rejectLeave(leaveId) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
        const result = await apiCall(`/leave/${leaveId}/reject`, 'PUT', { reason });
        if (result.success) {
            alert('Leave rejected');
            loadDashboardData();
        }
    } catch (error) {
        alert('Error rejecting leave: ' + error.message);
    }
}

function loadAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Present',
                data: [85, 90, 88, 92, 87, 45],
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
            }, {
                label: 'Absent',
                data: [15, 10, 12, 8, 13, 5],
                backgroundColor: 'rgba(231, 76, 60, 0.8)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById('createEmployeeUserForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const messageDiv = document.getElementById('createUserMessage');
    messageDiv.textContent = '';
    try {
        const response = await apiCall('/users/create', 'POST', { name, email, password, role: 'employee' });
        if (response.success) {
            messageDiv.textContent = 'Employee account created successfully!';
            form.reset();
        } else {
            messageDiv.textContent = response.message || 'Failed to create account.';
        }
    } catch (error) {
        messageDiv.textContent = 'Error: ' + error.message;
    }
});