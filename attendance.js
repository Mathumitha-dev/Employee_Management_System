// frontend/js/attendance.js
if (checkAuth()) {
    initUserInfo();
    loadTodayStatus();
    loadAttendance();
}

async function loadTodayStatus() {
    try {
        const user = getUser();
        const today = new Date().toISOString().split('T')[0];
        
        const response = await apiCall(`/attendance/employee/${user.employeeId}?startDate=${today}&endDate=${today}`);
        
        const container = document.getElementById('todayStatus');
        
        if (response.success && response.attendance.length > 0) {
            const att = response.attendance[0];
            container.innerHTML = `
                <div class="status-grid">
                    <div class="status-item">
                        <strong>Check In:</strong> ${att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'Not checked in'}
                    </div>
                    <div class="status-item">
                        <strong>Check Out:</strong> ${att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : 'Not checked out'}
                    </div>
                    <div class="status-item">
                        <strong>Working Hours:</strong> ${att.workingHours || 0} hours
                    </div>
                    <div class="status-item">
                        <strong>Status:</strong> <span class="badge badge-success">${att.status}</span>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<p>No attendance record for today. Please check in.</p>';
        }
    } catch (error) {
        console.error('Error loading today status:', error);
    }
}

async function checkIn() {
    try {
        const user = getUser();
        const response = await apiCall('/attendance/checkin', 'POST', { 
            employeeId: user.employeeId 
        });
        
        if (response.success) {
            alert('Checked in successfully!');
            loadTodayStatus();
            loadAttendance();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function checkOut() {
    try {
        const user = getUser();
        const response = await apiCall('/attendance/checkout', 'POST', { 
            employeeId: user.employeeId 
        });
        
        if (response.success) {
            alert('Checked out successfully!');
            loadTodayStatus();
            loadAttendance();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadAttendance() {
    try {
        const user = getUser();
        const response = await apiCall(`/attendance/employee/${user.employeeId}`);
        
        if (response.success) {
            displayAttendance(response.attendance);
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function displayAttendance(records) {
    const container = document.getElementById('attendanceTable');
    
    if (records.length === 0) {
        container.innerHTML = '<p class="empty-state">No attendance records found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${records.map(record => `
                    <tr>
                        <td>${formatDate(record.date)}</td>
                        <td>${record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</td>
                        <td>${record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                        <td>${record.workingHours || 0} hrs</td>
                        <td><span class="status status-${record.status.toLowerCase()}">${record.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function filterAttendance() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    try {
        const user = getUser();
        const response = await apiCall(`/attendance/employee/${user.employeeId}?startDate=${startDate}&endDate=${endDate}`);
        
        if (response.success) {
            displayAttendance(response.attendance);
        }
    } catch (error) {
        alert('Error filtering attendance: ' + error.message);
    }
}