if (checkAuth()) {
    initUserInfo();
    loadDocuments();
}

async function loadDocuments() {
    try {
        const user = getUser();
        const response = await apiCall(`/documents/employee/${user.employeeId}`);
        
        if (response.success) {
            displayDocuments(response.documents);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function displayDocuments(documents) {
    const container = document.getElementById('documentsTable');
    
    if (!container) return;
    
    if (documents.length === 0) {
        container.innerHTML = '<p class="empty-state">No documents found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Document Type</th>
                    <th>Document Name</th>
                    <th>Upload Date</th>
                    <th>Verification Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${documents.map(doc => `
                    <tr>
                        <td>${doc.documentType}</td>
                        <td>${doc.documentName}</td>
                        <td>${formatDate(doc.uploadDate)}</td>
                        <td><span class="status status-${doc.verificationStatus.toLowerCase()}">${doc.verificationStatus}</span></td>
                        <td>
                            <a href="${doc.fileUrl}" class="btn btn-primary btn-sm" target="_blank">View</a>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}