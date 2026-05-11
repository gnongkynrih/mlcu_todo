STEPS to install the backend
mkdir backend
cd backend
npm init -y
npm install express cors dotenv
npm install -D nodemon

npm install zod @prisma/client
npm install prisma

initialize prisma
npx prisma init

whenever we make changes to the prisma schema, we need to run:
npx prisma migrate dev --name init_todo
npx prisma generate


TO EXPORT TO EXCEL
https://github.com/exceljs/exceljs#readme
npm install exceljs