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

for RBAC (backend)
npm install bcryptjs jsonwebtoken
//bcryptjs for hashing passwords before storing them.
//jsonwebtoken for JWT-based auth.

After updating the schema, run:
npx prisma migrate dev --name add_user_and_relations

Generate Prisma Client
npx prisma generate

/For Charts we will use react-chart
https://react-chartjs-2.js.org/
npm install --save chart.js react-chartjs-2

export to pdf
https://github.com/parallax/jsPDF
https://github.com/simonbengtsson/jsPDF-AutoTable

npm install jspdf jspdf-autotable

razorpay
npm install react-razorpay
https://github.com/piyushgarg-dev/react-razorpay#readme
