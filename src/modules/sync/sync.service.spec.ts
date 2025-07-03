import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { ConflictResolverService } from './conflict-resolver.service';
import { SyncOperation } from '../../common/enums/sync-operation.enum';

// Mock the dbconfig module
jest.mock('../../../dbconfig', () => ({
  getRepository: jest.fn(),
  AppDataSource: {
    transaction: jest.fn(),
  },
}));

describe('SyncService', () => {
  let service: SyncService;
  let mockConflictResolver: any;

  beforeEach(async () => {
    mockConflictResolver = {
      hasConflict: jest.fn(),
      resolveConflict: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: ConflictResolverService,
          useValue: mockConflictResolver,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pullChanges', () => {
    it('should return changes from sync log', async () => {
      const { getRepository } = require('../../../dbconfig');
      const mockSyncLogRepository = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            workspaceId: 'workspace-1',
            tableId: 'table-1',
            rowId: 'row-1',
            operation: SyncOperation.INSERT,
            payload: { name: 'Test' },
            clientId: 'client-1',
            timestamp: new Date(),
          },
        ]),
      };

      getRepository.mockReturnValue(mockSyncLogRepository);

      const result = await service.pullChanges({
        workspaceId: 'workspace-1',
        since: '2023-01-01T00:00:00Z',
        clientId: 'client-2',
      });

      expect(result.changes).toHaveLength(1);
      expect(result.serverTime).toBeInstanceOf(Date);
    });
  });

  describe('pushChanges', () => {
    it('should process changes and return results', async () => {
      const { AppDataSource } = require('../../../dbconfig');
      const mockUser = { id: 'user-1' };
      const pushData = {
        workspaceId: 'workspace-1',
        clientId: 'client-1',
        changes: [
          {
            tableId: 'table-1',
            rowId: 'row-1',
            operation: SyncOperation.INSERT,
            payload: { name: 'Test' },
            versionVector: { 'client-1': 1 },
          },
        ],
      };

      AppDataSource.transaction.mockImplementation(async (callback) => {
        const manager = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
        };
        return callback(manager);
      });

      const result = await service.pushChanges(pushData, mockUser as any);

      expect(result.results).toHaveLength(1);
      expect(result.serverTime).toBeInstanceOf(Date);
    });
  });
});