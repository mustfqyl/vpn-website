async function testDelete() {
    const username = process.argv[2];
    if (!username) {
        console.log('Usage: node test_delete.js <username>');
        process.exit(1);
    }

    const apiUrl = process.env.VPN_PANEL_API_URL;
    const adminUser = process.env.VPN_PANEL_ADMIN_USERNAME;
    const adminPass = process.env.VPN_PANEL_ADMIN_PASSWORD;

    console.log(`Config: URL=${apiUrl}, Admin=${adminUser}`);
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', adminUser);
        formData.append('password', adminPass);
        formData.append('grant_type', 'password');

        const loginRes = await fetch(`${apiUrl.replace(/\/$/, '')}/api/admin/token`, {
            method: 'POST',
            body: formData
        });

        if (!loginRes.ok) throw new Error('Login failed: ' + loginRes.status);
        const { access_token } = await loginRes.json();
        
        console.log(`Attempting to DELETE user: ${username}`);
        const delRes = await fetch(`${apiUrl.replace(/\/$/, '')}/api/user/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        
        console.log(`Response Status: ${delRes.status}`);
        const text = await delRes.text();
        console.log(`Response Body: ${text}`);

    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

testDelete();
