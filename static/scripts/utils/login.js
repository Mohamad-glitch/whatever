document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Login form submitted");

    // const email = document.getElementById('email').value;
    // const passkey = document.getElementById('password').value;
    const email = "email_11@malik";
    const passkey = "123";
    const data = {
        user_email: email,
        password: passkey
    };
    try {
        const response = await fetch('https://whatever-qw7l.onrender.com/login_1', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // Ensure the body is sent as JSON
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Success:', responseData);

        window.location.href = "index.html";
    } catch (error) {
        console.error('Error:', error);
    }
});