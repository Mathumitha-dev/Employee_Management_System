if (checkAuth()) {
    initUserInfo();
    loadPayrolls();
}

async function loadPayrolls() {
    try {
        const user = getUser();
        let response;
        if (user && (user.role === 'admin' || user.role === 'hr')) {
            response = await apiCall('/payroll/all');
        } else {
            response = await apiCall(`/payroll/employee/${user.employeeId}`);
        }
        const month = document.getElementById('monthFilter').value;
        const year = document.getElementById('yearFilter').value;
        let payrolls = response.payrolls || [];
        if (month) payrolls = payrolls.filter(p => p.month == month);
        if (year) payrolls = payrolls.filter(p => p.year == year);
        const container = document.getElementById('payrollTable');
        if (!container) return;
        if (payrolls.length === 0) {
            container.innerHTML = '<p class="empty-state">No payroll records found</p>';
            return;
        }
        container.innerHTML = `<table><thead><tr>${(user.role === 'admin' || user.role === 'hr') ? '<th>Employee</th>' : ''}<th>Month/Year</th><th>Basic Salary</th><th>Gross Salary</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Action</th></tr></thead><tbody>${payrolls.map(payroll => {
            const totalDeductions = Object.values(payroll.deductions).reduce((a, b) => a + b, 0);
            const emp = payroll.employeeId;
            return `<tr>${(user.role === 'admin' || user.role === 'hr') ? `<td>${emp ? emp.firstName + ' ' + emp.lastName + ' (' + emp.employeeCode + ')' : ''}</td>` : ''}<td>${getMonthName(payroll.month)} ${payroll.year}</td><td>${formatCurrency(payroll.basicSalary)}</td><td>${formatCurrency(payroll.grossSalary)}</td><td>${formatCurrency(totalDeductions)}</td><td><strong>${formatCurrency(payroll.netSalary)}</strong></td><td><span class="status status-${payroll.paymentStatus?.toLowerCase() || 'pending'}">${payroll.paymentStatus || 'Pending'}</span></td><td><button class="btn btn-primary btn-sm" onclick="viewPaySlip('${payroll._id}')">View Slip</button></td></tr>`;
        }).join('')}</tbody></table>`;
    } catch (error) {
        document.getElementById('payrollTable').innerHTML = '<p class="empty-state">Error loading payrolls</p>';
    }
}

function filterPayroll() {
    loadPayrolls();
}

function getMonthName(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
}

async function viewPaySlip(payrollId) {
    try {
        const response = await apiCall(`/payroll/${payrollId}/slip`);
        if (response.success) {
            const payroll = response.payroll;
            const emp = payroll.employeeId;
            const totalAllowances = Object.values(payroll.allowances).reduce((a, b) => a + b, 0);
            const totalDeductions = Object.values(payroll.deductions).reduce((a, b) => a + b, 0);
            const slipHTML = `<div style="max-width: 800px; margin: 20px auto; padding: 30px; background: white; font-family: Arial, sans-serif;"><h2 style="text-align: center; color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">PAY SLIP</h2><div style="margin: 20px 0;"><p><strong>Employee Name:</strong> ${emp.firstName} ${emp.lastName}</p><p><strong>Employee Code:</strong> ${emp.employeeCode}</p><p><strong>Department:</strong> ${emp.department}</p><p><strong>Designation:</strong> ${emp.designation}</p><p><strong>Month/Year:</strong> ${getMonthName(payroll.month)} ${payroll.year}</p><p><strong>Working Days:</strong> ${payroll.workingDays}</p><p><strong>Present Days:</strong> ${payroll.presentDays}</p></div><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><thead><tr style="background: #3498db; color: white;"><th style="padding: 10px; text-align: left;">Earnings</th><th style="padding: 10px; text-align: right;">Amount</th></tr></thead><tbody><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Basic Salary</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.basicSalary)}</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">HRA</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.allowances.hra)}</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Transport Allowance</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.allowances.transport)}</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Medical Allowance</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.allowances.medical)}</td></tr><tr style="border-bottom: 2px solid #3498db; font-weight: bold;"><td style="padding: 8px;">Gross Salary</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.grossSalary)}</td></tr></tbody></table><table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><thead><tr style="background: #e74c3c; color: white;"><th style="padding: 10px; text-align: left;">Deductions</th><th style="padding: 10px; text-align: right;">Amount</th></tr></thead><tbody><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Tax</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.deductions.tax)}</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Provident Fund</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.deductions.pf)}</td></tr><tr style="border-bottom: 1px solid #ddd;"><td style="padding: 8px;">Insurance</td><td style="padding: 8px; text-align: right;">${formatCurrency(payroll.deductions.insurance)}</td></tr><tr style="border-bottom: 2px solid #e74c3c; font-weight: bold;"><td style="padding: 8px;">Total Deductions</td><td style="padding: 8px; text-align: right;">${formatCurrency(totalDeductions)}</td></tr></tbody></table><div style="background: #27ae60; color: white; padding: 15px; margin-top: 20px; text-align: center; border-radius: 5px;"><h3 style="margin: 0;">Net Salary: ${formatCurrency(payroll.netSalary)}</h3></div><div style="margin-top: 30px; text-align: center;"><button onclick="window.print()" style="background: #3498db; color: white; padding: 10px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print Pay Slip</button></div></div>`;
            const newWindow = window.open('', '_blank');
            newWindow.document.write(slipHTML);
            newWindow.document.close();
        }
    } catch (error) {
        alert('Error loading pay slip: ' + error.message);
    }
}

async function loadEmployeesForPayroll() {
    try {
        const response = await apiCall('/employees?status=Active');
        if (response.success) {
            const select = document.getElementById('employeeSelect');
            if (select) {
                select.innerHTML = '<option value="">Select Employee</option>' +
                    response.employees.map(emp => `<option value="${emp._id}">${emp.firstName} ${emp.lastName} (${emp.employeeCode})</option>`).join('');
            }
        }
    } catch (error) {
        const select = document.getElementById('employeeSelect');
        if (select) select.innerHTML = '<option value="">Error loading employees</option>';
    }
}

function showGeneratePayrollModal() {
    loadEmployeesForPayroll();
    document.getElementById('payrollModal').classList.add('active');
}

function closePayrollModal() {
    document.getElementById('payrollModal').classList.remove('active');
    document.getElementById('payrollForm').reset();
}

document.getElementById('payrollForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
        const response = await apiCall('/payroll/generate', 'POST', data);
        if (response.success) {
            alert('Payroll generated successfully!');
            closePayrollModal();
            loadPayrolls();
        } else {
            if (response.message && response.message.includes('duplicate key')) {
                alert('Payroll for this employee, month, and year already exists.');
            } else {
                alert(response.message || 'Failed to generate payroll');
            }
        }
    } catch (error) {
        if (error.message && error.message.includes('duplicate key')) {
            alert('Payroll for this employee, month, and year already exists.');
        } else {
            alert('Error generating payroll: ' + error.message);
        }
    }
});