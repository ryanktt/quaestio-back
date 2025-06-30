# Quaestio Backend

## Description
A questionnaire platform built with NestJS, GraphQL, and MongoDB, designed for flexible and scalable survey, quiz, and exam management. The platform supports user authentication (admin/respondent), session management, questionnaire creation, response handling, and advanced metrics and analytics. Serverless deployment on AWS Lambda is supported via Serverless Framework.

## Tech Stack
- **Backend Framework:** NestJS
- **API:** GraphQL (Apollo Server)
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JWT-based, with session support
- **Serverless:** AWS Lambda (via Serverless Framework & serverless-webpack)
- **Testing:** Jest
- **Utilities:** Bluebird, Moment.js, Bcrypt, geoip-lite

## Setup Guide
1. **Install dependencies**
   - Ensure you have `yarn` installed
   - Run: `yarn install`

2. **Environment Variables**
   - Copy `.env-example` to `.env`
   - Fill in required fields (Mongo URI, JWT secret, AWS configs etc.)

3. **Run the application**
   - For development: `yarn start`
   - For serverless offline: `yarn start:dev`

4. **Other Commands**
   - Build: `yarn build`
   - Format: `yarn format`
   - Clean: `yarn clean`

5. **GraphQL Playground**
   - Access the playground at the server URL after startup (see logs for port)

6. **Testing**
   - Run tests with: `yarn test`

---
For advanced serverless deployment and AWS configuration, see `serverless.yml` and `serverless-env.js`.
