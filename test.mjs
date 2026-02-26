const url = 'https://jgahrcwcocgrzcvjlysg.supabase.co';
const key = 'sb_publishable_qha3TbOMr6h0pc9TA8REBg_vGrrg-Yf';

async function check() {
    const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    };

    const mulRes = await fetch(`${url}/rest/v1/multiply_logs?select=*&order=played_at.desc&limit=3`, { headers });
    console.log('MUL STATUS:', mulRes.status);
    console.log('MUL BODY:', await mulRes.text());

    const divRes = await fetch(`${url}/rest/v1/divide_logs?select=*&order=played_at.desc&limit=3`, { headers });
    console.log('DIV STATUS:', divRes.status);
    console.log('DIV BODY:', await divRes.text());
}
check();
