import { AppDataSource } from '../../dbconfig';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { TableSchema } from '../../entities/table-schema.entity';
import { FieldSchema } from '../../entities/field-schema.entity';
import { Role } from '../../common/enums/role.enum';
import { FieldType } from '../../common/enums/field-type.enum';

async function seedProduction() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for production seeding');

    // Check if admin user already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (existingUser) {
      console.log('Production data already exists, skipping seed');
      return;
    }

    // Create admin user
    const adminUser = userRepository.create({
      firebaseUid: 'admin-firebase-uid',
      email: 'admin@example.com',
      displayName: 'System Administrator',
    });
    await userRepository.save(adminUser);
    console.log('Admin user created');

    // Create default workspace
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const defaultWorkspace = workspaceRepository.create({
      name: 'default',
      displayName: 'Default Workspace',
      ownerId: adminUser.id,
    });
    await workspaceRepository.save(defaultWorkspace);
    console.log('Default workspace created');

    // Create admin role
    const roleRepository = AppDataSource.getRepository(WorkspaceUserRole);
    const adminRole = roleRepository.create({
      userId: adminUser.id,
      workspaceId: defaultWorkspace.id,
      role: Role.OWNER,
    });
    await roleRepository.save(adminRole);
    console.log('Admin role created');

    console.log('Production seeding completed successfully');
  } catch (error) {
    console.error('Production seeding failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Only run if called directly
if (require.main === module) {
  seedProduction();
}

export { seedProduction };