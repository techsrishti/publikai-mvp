This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Prisma 

1. Prisma is a database ORM. You can define the DB schema using prisma schema.
2. The prisma schema is to be placed in ```prisma/schema.prisma```.
3. Once you're done defining the schema, run ```pnpm prisma db push```. This command will create the tables or change the existing tables as per the prisma schema.
4. Once you've pushed and you're ready to run the application, use ```pnpm prisma generate``` to generate prisma client. You can import this prisma client in your API's for example and make db operations. For example: prisma client can be import using ```import { PrismaClient } from '@prisma/client';```
5. It's always good practice to run ```pnpm prisma generate``` before ```pnpm run dev```.
6. Spin a free neon DB [here](https://neon.tech) and create your first neon database.
7. Tip: On neon console, click the DB you want to connect to and then click "Connect to your database" and click on ".env" and copy the environment variable and paste it in your env. 

## Contributing

We welcome contributions to improve this project! Here's how you can contribute:

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
2. Make your changes and commit them with descriptive commit messages:
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```
3. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request (PR) from your fork to our main repository's `main` branch
5. Describe your changes in the PR description and link any related issues

Please ensure your code follows our existing code style and includes appropriate tests if applicable.
