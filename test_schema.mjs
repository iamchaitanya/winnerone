const url = 'https://jgahrcwcocgrzcvjlysg.supabase.co';
const key = 'sb_publishable_qha3TbOMr6h0pc9TA8REBg_vGrrg-Yf';

async function check() {
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  };

  const res = await fetch(`${url}/rest/v1/divide_logs`, {
    method: 'OPTIONS',
    headers
  });
  console.log('OPTIONS STATUS:', res.status);
  const text = await res.text();
  console.log('OPTIONS BODY:', text.substring(0, 1000));
}
check();
