if (checkAuth()) {
    initUserInfo();
    loadPerformanceReviews();
}

async function loadPerformanceReviews() {
    try {
        const user = getUser();
        const response = await apiCall(`/performance/employee/${user.employeeId}`);
        
        if (response.success) {
            displayPerformanceReviews(response.reviews);
        }
    } catch (error) {
        console.error('Error loading performance reviews:', error);
    }
}

function displayPerformanceReviews(reviews) {
    const container = document.getElementById('performanceTable');
    
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="empty-state">No performance reviews found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Review Period</th>
                    <th>Overall Rating</th>
                    <th>Work Quality</th>
                    <th>Productivity</th>
                    <th>Communication</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${reviews.map(review => `
                    <tr>
                        <td>${formatDate(review.reviewPeriod.startDate)} - ${formatDate(review.reviewPeriod.endDate)}</td>
                        <td><strong>${review.overallRating.toFixed(1)}/5</strong></td>
                        <td>${review.ratings.workQuality}/5</td>
                        <td>${review.ratings.productivity}/5</td>
                        <td>${review.ratings.communication}/5</td>
                        <td><span class="status status-${review.status.toLowerCase()}">${review.status}</span></td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="viewReview('${review._id}')">View Details</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function viewReview(reviewId) {
    try {
        const response = await apiCall(`/performance/${reviewId}`);
        // Display review details in a modal
        alert('Review details loaded. Implement modal display here.');
    } catch (error) {
        alert('Error loading review: ' + error.message);
    }
}

// frontend/js/training.js
if (checkAuth()) {
    initUserInfo();
    loadTrainings();
}

async function loadTrainings() {
    try {
        const response = await apiCall('/training');
        
        if (response.success) {
            displayTrainings(response.trainings);
        }
    } catch (error) {
        console.error('Error loading trainings:', error);
    }
}

function displayTrainings(trainings) {
    const container = document.getElementById('trainingTable');
    
    if (!container) return;
    
    if (trainings.length === 0) {
        container.innerHTML = '<p class="empty-state">No training programs found</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Participants</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${trainings.map(training => `
                    <tr>
                        <td>${training.title}</td>
                        <td>${training.trainingType}</td>
                        <td>${formatDate(training.startDate)}</td>
                        <td>${formatDate(training.endDate)}</td>
                        <td>${training.participants.length}/${training.maxParticipants || 'Unlimited'}</td>
                        <td><span class="status status-${training.status.toLowerCase()}">${training.status}</span></td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="enrollInTraining('${training._id}')">Enroll</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

async function enrollInTraining(trainingId) {
    try {
        const user = getUser();
        const response = await apiCall(`/training/${trainingId}/enroll`, 'POST', {
            employeeId: user.employeeId
        });
        
        if (response.success) {
            alert('Enrolled successfully!');
            loadTrainings();
        }
    } catch (error) {
        alert('Error enrolling: ' + error.message);
    }
}
