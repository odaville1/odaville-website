// Handle form submission
brochureForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable the submit button to prevent multiple submissions
    const submitBtn = brochureForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
    }
    
    // Get form data
    const formData = new FormData(brochureForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };

    console.log('Sending brochure request:', data);

    try {
        // Send data to backend
        const response = await fetch('/api/brochure/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Brochure request response:', result);

        if (result.success) {
            // Show success message
            alert('Thank you! Your request has been received.');
            
            // Close modal and reset form
            brochureModal.style.display = 'none';
            document.body.style.overflow = '';
            brochureForm.reset();
        } else {
            throw new Error(result.message || 'Error submitting form');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Sorry, there was an error processing your request. Please try again later.');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Brochure';
        }
    }
});