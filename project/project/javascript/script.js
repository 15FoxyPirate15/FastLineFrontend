const form = document.getElementById('createAccountForm');



if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const termsAgreed = formData.get('terms_agreement') === 'on';
        if (!termsAgreed) {
            alert('Please agree to the Terms of Service and Privacy Policy.');
            return;
        }
        const userData = {
            fullName: formData.get('full_name'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        const backendEndpoint = 'https://fastline-host.onrender.com/auth/register'; //////////!!!!!!!!!!! те саме

        fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Account created successfully! Welcome to FastLine!');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
    });
} else {
    console.error("Form with id='createAccountForm' not found.");
}
