# Prisma Setup and Troubleshooting

This document explains the Prisma setup in the AES platform and provides troubleshooting steps for common issues.

## Setup Overview

The project uses Prisma as the ORM (Object-Relational Mapping) tool to interact with the database.

Key files:
- `prisma/schema.prisma` - Database schema definition
- `lib/prisma.ts` - Singleton instance of PrismaClient
- `scripts/check-prisma.js` - Script to check Prisma health

## Configuration

Prisma is configured to generate client files in the `generated/prisma` directory. This is set in the schema.prisma file:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}
```

## Common Errors and Solutions

### "Prisma Client did not initialize yet"

This error occurs when trying to use the PrismaClient before it has been properly initialized.

**Solution:**
1. Run `npx prisma generate` to generate the Prisma client
2. Make sure you're using the singleton pattern from `lib/prisma.ts`
3. Check that imports are from `'../generated/prisma'` not `'@prisma/client'`

### Database Connection Issues

If you're having issues connecting to the database:

1. Check your database URL in `.env`
2. Run `npm run check:prisma` to test the database connection
3. Make sure your database is running and accessible

## Development Workflow

When making schema changes:

1. Update the schema.prisma file
2. Run `npx prisma generate` to update the client
3. Run `npx prisma migrate dev` to create and apply a migration

## Scripts

- `npm run check:prisma` - Check Prisma health
- `npm run db:seed` - Seed the database
- `npx prisma generate` - Generate the Prisma client
- `npx prisma migrate dev` - Create and apply migrations

## Deployment Considerations

When deploying to production:

1. Make sure to run `prisma generate` during the build process
2. Set the production database URL in the environment variables
3. Consider using connection pooling for improved performance