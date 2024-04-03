/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

CORS = {
  async headers() {
    return [
      {
        // Enable CORS for all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow requests from any origin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT', // Allow the specified methods
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept', // Allow the specified headers
          },
        ],
      },
    ];
  },
};

server =  {
  port: process.env.PORT || 80, 
  host: '0.0.0.0'
}

pm2 = {
  apps: [
      {
          name: "Tradingview_Charting_Library",
          script: "node_modules/next/dist/bin/next",
          args: "start -p 80", //running on port 3000
          watch: false,
      },
  ],
};

timezone = {
  env: {
    TZ: 'Etc/GMT', // Set your desired timezone here
  },
};

module.exports = timezone,nextConfig,CORS,server,pm2