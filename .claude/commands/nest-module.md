Scaffold a complete NestJS module for EasyPostV2 following the established project conventions.

Module name: $ARGUMENTS

Create all of these files in `Nestjs_Backend/src/modules/<name>/`:

1. **`<name>.module.ts`**
   - `@Module` decorator with `imports: [PrismaModule]`, `controllers`, `providers`
   - Export the service so other modules can import it

2. **`<name>.controller.ts`**
   - `@ApiTags('<name>')` for Swagger grouping
   - `@Controller('<name>')` with route prefix
   - `@UseGuards(JwtAuthGuard)` on the class
   - Use `@CurrentUser()` decorator to get authenticated user
   - Use `@Get()`, `@Post()`, `@Patch(':id')`, `@Delete(':id')` for CRUD
   - Import and use the `@ApiPaginatedResponse()` decorator on list endpoints

3. **`<name>.service.ts`**
   - `@Injectable()` class
   - Constructor injects `private readonly prisma: PrismaService`
   - Implement: `findAll(userId, workspaceId)`, `findOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`
   - Use `this.prisma.<model>` for all DB access

4. **`dto/create-<name>.dto.ts`**
   - Use `class-validator` decorators (`@IsString()`, `@IsOptional()`, `@IsUUID()`, etc.)
   - Add `@ApiProperty()` from `@nestjs/swagger` on each field

5. **`dto/update-<name>.dto.ts`**
   - `export class Update<Name>Dto extends PartialType(Create<Name>Dto) {}`

6. **`<name>.service.spec.ts`**
   - Basic Jest unit test stub with `TestingModule`
   - Mock `PrismaService` with `jest.fn()`

After creating the files, also:
- Add the new module to the `imports` array in `Nestjs_Backend/src/app.module.ts`
- If a new Prisma model is needed, note what fields to add to `prisma/schema.prisma` and remind to run `pnpm prisma migrate dev --name add-<name>`

Follow these import paths:
- `../prisma/prisma.module` for PrismaModule
- `../prisma/prisma.service` for PrismaService
- `../common/guards/jwt-auth.guard` for JwtAuthGuard
- `../common/decorators/current-user.decorator` for @CurrentUser
