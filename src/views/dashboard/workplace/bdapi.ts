/* eslint-disable */
const url = `http://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=q7VG6K18Qk3zAbl4FTqsWFBvo85jPDef&redirect_uri=oob&scope=basic&display=popup`;
const apiKey = 'q7VG6K18Qk3zAbl4FTqsWFBvo85jPDef';
const SecretKey = '6axk2HYSYuQde3tVoW0D3SClNbfIaLOi';
const code = '36140c6a0ae725767e6cea1e403e4a09';
const getToken = `http://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code=36140c6a0ae725767e6cea1e403e4a09&client_id=q7VG6K18Qk3zAbl4FTqsWFBvo85jPDef&client_secret=6axk2HYSYuQde3tVoW0D3SClNbfIaLOi&redirect_uri=oob`;
const res = {
  expires_in: 2592000,
  refresh_token:
    '122.856d9a75815157a1f27b9f44c7d94e52.YG5lcKduOsUJSvwrlWQ4pglvO10Y5T2czLwr1zw._IN9Fw',
  access_token:
    '121.48d1b5d54412b7a696758874f747cc82.Y_uiMh3R2AHxYbdJtv77Oz9Jyr3TkukXShXSfb-.JeNm5g',
  session_secret: '',
  session_key: '',
  范围: '基本',
};
// 调用
const api = `https://openapi.baidu.com/rest/2.0/tongji/config/getSiteList?access_token=${res.access_token}`;

// 刷新token
const token = `http://openapi.baidu.com/oauth/2.0/token?grant_type=refresh_token&refresh_token=${res.refresh_token}&client_id=${apiKey}&client_secret=${SecretKey}`;

// 站点列表
const siteList = {
  list: [
    {
      site_id: 18269632,
      domain: 'jiang-xia.top',
      status: 0,
      create_time: '2022-08-09 11:27:23',
      sub_dir_list: [],
    },
    {
      site_id: 18270231,
      domain: 'admin.jiang-xia.top',
      status: 0,
      create_time: '2022-08-09 14:19:29',
      sub_dir_list: [],
    },
  ],
};
const siteAll =
  'https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=121.48d1b5d54412b7a696758874f747cc82.Y_uiMh3R2AHxYbdJtv77Oz9Jyr3TkukXShXSfb-.JeNm5g&site_id=18269632&start_date=20220404&end_date=20220903&metrics=&method=overview%2FgetTimeTrendRpt';
const access_token =
  '121.48d1b5d54412b7a696758874f747cc82.Y_uiMh3R2AHxYbdJtv77Oz9Jyr3TkukXShXSfb-.JeNm5g';
const refresh_token =
  '122.856d9a75815157a1f27b9f44c7d94e52.YG5lcKduOsUJSvwrlWQ4pglvO10Y5T2czLwr1zw._IN9Fw';
const site_id = 18269632;
const base_url = 'https://openapi.baidu.com/rest/2.0/tongji/report/getData';
export default { access_token, refresh_token, site_id, base_url, siteAll };
