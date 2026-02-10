export async function registerUserOnServer(userData) {
    console.log("Script.js Started...");
    console.log("Data gained:", userData);

    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Succesful reg:', data);
            return { success: true, data: data };
        } else {
            console.error('Error server:', data);
            return { success: false, message: data.message || 'Registration failed' };
        }

    } catch (error) {
        console.error('Network error:', error);
        return { success: false, message: 'Failed connection to server' };
    }
}