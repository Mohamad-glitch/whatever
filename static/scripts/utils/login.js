document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    const email = document.getElementById('email').value;
    const passkey = document.getElementById('password').value;
    const data = { user_email: email, password: passkey };

    try {
        const response = await fetch('https://whatever-qw7l.onrender.com/login_1', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Success:', responseData);

        // Save token to localStorage
        localStorage.setItem('authToken', responseData.token);

        window.location.href = "https://whatever-qw7l.onrender.com/home";
    } catch (error) {
        console.error('Error:', error);
    }
});

// Auto-login if token exists
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch('https://whatever-qw7l.onrender.com/validate_token', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                console.log('Token validated. Auto-login successful.');
                window.location.href = "https://whatever-qw7l.onrender.com";
            } else {
                console.warn('Token invalid. Clearing token.');
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Error validating token:', error);
        }
    }
});