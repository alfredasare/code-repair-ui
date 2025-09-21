# Code Repair Tool UI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Demo Video

Check out the tool demo here: [https://youtu.be/5IcGz-NJXAY](https://youtu.be/5IcGz-NJXAY)

## Prerequisites

Before starting the project, make sure you have the following environment variable defined:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Add this to your `.env.local` file in the root directory of the project.

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

## Sample Vulnerability for Testing

The project includes a `sample-vul.json` file that contains a sample vulnerability with CWE and CVE information along with vulnerable C++ code. You can use this file to test the code repair functionality of the tool. The sample includes:

- CWE-755 vulnerability
- CVE-2019-3558 reference
- Vulnerable C++ code from Apache Thrift project

Simply use the contents of this file when testing vulnerability assessments and code repairs through the UI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
