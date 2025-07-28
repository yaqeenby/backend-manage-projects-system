## Manage Projects System

## Description

backend system that supports hierarchical data management with role-based
permissions and efficient notification handling

## Database Schema / Model Definitions

npm install
npm install -D ts-node

## Create Migration

npx ts-node ./node_modules/typeorm/cli.js migration:generate
src/migrations/InitialSchema -d ./data-source.ts

## Run Migration

npx typeorm-ts-node-commonjs migration:run -d ./data-source.ts

- Clean Build
  Remove-Item -Recurse -Force .\dist
  npm run build

## Sample Users

Admin: admin@test.com | P@ssw0rd!@#
{
fullName: "Admin User",
email: "admin@demo.com",
phone: "+962778885588",
departmentsIds: [dept1.id, dept2.id],
roleId: role.id,
password: “12345678”,
organizationId: org.id
}

## Notification Output

GET | http://localhost:3001/notifications/my
{
"message": "4 tasks updated in Project X"
}

Notifications can be grouped and sent in batches, stored in DB and Cached
worker handle grouping and send notification (just print log) and update
isProcessed: true after delivery.

## Seeder / Generator Usage Guide

1. Set Scaling Factor

# .env file

SEED_SCALE=0.1 2. Run Seeder
POST | http://localhost:3001/seed 3. Output Generated
● 1 Organization
● ~100 Departments
● 50–80 Projects per Department
● 100–200 Tasks per Project
● 1 Manager + 1 Employee per Department

🔗 **GitHub Repository:**

- clone : https://github.com/yaqeenby/backend-manage-projects-system.git
