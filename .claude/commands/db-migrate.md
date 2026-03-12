Help with a Prisma database schema change and migration for EasyPostV2.

Change description: $ARGUMENTS

Work inside `Nestjs_Backend/`.

---

## Step 1 — Read the current schema

Read `Nestjs_Backend/prisma/schema.prisma` to understand:
- Existing models and their fields
- Existing enums
- Existing relations

---

## Step 2 — Plan the schema change

Based on the description, determine what needs to change:
- **New model**: Define the model with fields, types, `@id`, `@default`, `@relation`, `@@map` (use snake_case table names)
- **New field**: Add to existing model with proper type + optional `?` + default if needed
- **New enum**: Define enum values in SCREAMING_SNAKE_CASE
- **New relation**: Add relation fields on both sides + foreign key field
- **Remove/rename**: Note that renames require careful migration (data loss risk — always warn user)

Follow the existing Prisma conventions in the codebase:
- `id String @id @default(cuid())`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Table names use `@@map("snake_case_table_name")`
- Soft delete pattern: `deletedAt DateTime?`

---

## Step 3 — Apply the schema change

Edit `Nestjs_Backend/prisma/schema.prisma` with the required changes.

---

## Step 4 — Generate migration

Run:
```bash
cd Nestjs_Backend
pnpm prisma migrate dev --name <migration-name-from-description>
pnpm prisma generate
```

The migration name should be short and descriptive (e.g., `add-campaign-budget`, `add-post-approval-status`).

---

## Step 5 — Update the service layer

If a new model was added, create or update the relevant NestJS service to use it:
- Inject `PrismaService`
- Use `this.prisma.<modelName>.create/findMany/findUnique/update/delete`
- Follow the existing module pattern (see `/nest-module` command for scaffolding)

If a field was added to an existing model, update the relevant DTOs and service methods.

---

## Step 6 — Checklist

- [ ] Schema change makes sense given existing architecture
- [ ] Migration ran without errors
- [ ] Prisma client regenerated
- [ ] Service/DTO updated to include new fields
- [ ] No existing data could be accidentally lost (warn if destructive)
