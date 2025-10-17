// frontend/js/employee.js
if (checkAuth()) {
    initUserInfo();
    loadEmployees();
}

let currentEmployeeId = null;

async function loadEmployees() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const department = document.getElementById('departmentFilter')?.value || '';
        const status = document.getElementById('statusFilter')?.value || '';

        let endpoint = '/employees?';
        if (searchTerm) endpoint += `search=${searchTerm}&`;
        if (department) endpoint += `department=${department}&`;
        if (status) endpoint += `status=${status}`;

        const response = await apiCall(endpoint);
        
        if (response.success) {
            displayEmployees(response.employees);
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function displayEmployees(employees) {
    const container = document.getElementById('employeesTable');
    
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
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map(emp => `
                    <tr>
                        <td>${emp.employeeCode}</td>
                        <td>${emp.firstName} ${emp.lastName}</td>
                        <td>${emp.email}</td>
                        <td>${emp.department}</td>
                        <td>${emp.designation}</td>
                        <td><span class="status status-${emp.status.toLowerCase()}">${emp.status}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="viewEmployee('${emp._id}')">View</button>
                                <button class="btn btn-warning btn-sm" onclick="editEmployee('${emp._id}')">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp._id}')">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function showAddEmployeeModal() {
    document.getElementById('modalTitle').textContent = 'Add New Employee';
    document.getElementById('employeeForm').reset();
    currentEmployeeId = null;
    document.getElementById('employeeModal').classList.add('active');
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
    currentEmployeeId = null;
}

async function editEmployee(id) {
    try {
        const response = await apiCall(`/employees/${id}`);
        if (response.success) {
            const emp = response.employee;
            currentEmployeeId = id;
            
            document.getElementById('modalTitle').textContent = 'Edit Employee';
            const form = document.getElementById('employeeForm');
            
            form.employeeCode.value = emp.employeeCode;
            form.firstName.value = emp.firstName;
            form.lastName.value = emp.lastName;
            form.email.value = emp.email;
            form.phone.value = emp.phone;
            form.dateOfBirth.value = emp.dateOfBirth.split('T')[0];
            form.gender.value = emp.gender;
            form.department.value = emp.department;
            form.designation.value = emp.designation;
            form.joiningDate.value = emp.joiningDate.split('T')[0];
            form.employmentType.value = emp.employmentType;
            form.salary.value = emp.salary;
            
            document.getElementById('employeeModal').classList.add('active');
        }
    } catch (error) {
        alert('Error loading employee: ' + error.message);
    }
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    
    try {
        const response = await apiCall(`/employees/${id}`, 'DELETE');
        if (response.success) {
            alert('Employee deleted successfully');
            loadEmployees();
        }
    } catch (error) {
        alert('Error deleting employee: ' + error.message);
    }
}

document.getElementById('employeeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const method = currentEmployeeId ? 'PUT' : 'POST';
        const endpoint = currentEmployeeId ? `/employees/${currentEmployeeId}` : '/employees';
        
        const response = await apiCall(endpoint, method, data);
        
        if (response.success) {
            alert(response.message);
            closeEmployeeModal();
            loadEmployees();
        }
    } catch (error) {
        alert('Error saving employee: ' + error.message);
    }
});

// Search and filter events
document.getElementById('searchInput')?.addEventListener('input', loadEmployees);
document.getElementById('departmentFilter')?.addEventListener('change', loadEmployees);
document.getElementById('statusFilter')?.addEventListener('change', loadEmployees);