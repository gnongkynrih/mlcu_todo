INSTALL MUI
https://mui.com/material-ui/getting-started/installation/
npm install @mui/material @emotion/react @emotion/styled

//for icon
npm install @mui/icons-material

for forms
npm install react-hook-form @hookform/resolvers

for validation
npm install zod

for routing
npm install react-router-dom

for tailwindcss
npm install -D tailwindcss @tailwindcss/vite clsx tailwind-merge
To use tailwindcss, add the following to your vite.config.js:
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
plugins: [react(), tailwindcss()],
});

in index.css, add:
@import "tailwindcss";

for api calls
npm install axios
