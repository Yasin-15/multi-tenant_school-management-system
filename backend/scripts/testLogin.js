import axios from 'axios';

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@demo.com',
            password: 'admin123'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': '6928292a4d34df7ffafb0738'
            }
        });

        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Login failed!');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
    }
};

testLogin();
