import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { User } from '../../entities/user.entity';
import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceUserRole } from '../../entities/workspace-user-role.entity';
import { TableSchema } from '../../entities/table-schema.entity';
import { FieldSchema } from '../../entities/field-schema.entity';
import { Role } from '../../common/enums/role.enum';
import { FieldType } from '../../common/enums/field-type.enum';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding');

    // Create sample user
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({
      firebaseUid: 'sample-firebase-uid',
      email: 'admin@example.com',
      displayName: 'Admin User',
    });
    await userRepository.save(user);
    console.log('Sample user created');

    // Create sample workspace
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = workspaceRepository.create({
      name: 'sample-workspace',
      displayName: 'Sample Workspace',
      ownerId: user.id,
    });
    await workspaceRepository.save(workspace);
    console.log('Sample workspace created');

    // Create workspace user role
    const roleRepository = AppDataSource.getRepository(WorkspaceUserRole);
    const userRole = roleRepository.create({
      userId: user.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    });
    await roleRepository.save(userRole);
    console.log('Sample user role created');

    // Create sample table
    const tableRepository = AppDataSource.getRepository(TableSchema);
    const table = tableRepository.create({
      name: 'contacts',
      displayName: 'Contacts',
      workspaceId: workspace.id,
    });
    await tableRepository.save(table);
    console.log('Sample table created');

    // Create sample fields
    const fieldRepository = AppDataSource.getRepository(FieldSchema);
    const fields = [
      {
        name: 'firstName',
        displayName: 'First Name',
        type: FieldType.STRING,
        tableId: table.id,
        order: 1,
      },
      {
        name: 'lastName',
        displayName: 'Last Name',
        type: FieldType.STRING,
        tableId: table.id,
        order: 2,
      },
      {
        name: 'email',
        displayName: 'Email',
        type: FieldType.STRING,
        tableId: table.id,
        order: 3,
        validation: {
          required: true,
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
        },
      },
      {
        name: 'phone',
        displayName: 'Phone',
        type: FieldType.STRING,
        tableId: table.id,
        order: 4,
      },
      {
        name: 'birthDate',
        displayName: 'Birth Date',
        type: FieldType.DATE,
        tableId: table.id,
        order: 5,
      },
      {
        name: 'isActive',
        displayName: 'Active',
        type: FieldType.BOOLEAN,
        tableId: table.id,
        order: 6,
      },
    ];

    for (const fieldData of fields) {
      const field = fieldRepository.create(fieldData);
      await fieldRepository.save(field);
    }
    console.log('Sample fields created');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();