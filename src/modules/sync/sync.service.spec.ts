import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SyncService } from './sync.service';
import { SyncLog } from '../../entities/sync-log.entity';
import { DataRow } from '../../entities/data-row.entity';
import { DataHistory } from '../../entities/data-history.entity';
import { ConflictResolverService } from './conflict-resolver.service';
import { SyncOperation } from '../../common/enums/sync-operation.enum';

describe('SyncService', () => {
  let service: SyncService;
  let mockSyncLogRepository: any;
  let mockDataRowRepository: any;
  let mockDataHistoryRepository: any;
  let mockDataSource: any;
  let mockConflictResolver: any;

  beforeEach(async () => {
    mockSyncLogRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    mockDataRowRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockDataHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn((callback) => callback({})),
    };

    mockConflictResolver = {
      hasConflict: jest.fn(),
      resolveConflict: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: getRepositoryToken(SyncLog),
          useValue: mockSyncLogRepository,
        },
        {
          provide: getRepositoryToken(DataRow),
          useValue: mockDataRowRepository,
        },
        {
          provide: getRepositoryToken(DataHistory),
          useValue: mockDataHistoryRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
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
      const mockChanges = [
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
      ];

      mockSyncLogRepository.getMany.mockResolvedValue(mockChanges);

      const result = await service.pullChanges({
        workspaceId: 'workspace-1',
        since: '2023-01-01T00:00:00Z',
        clientId: 'client-2',
      });

      expect(result.changes).toEqual(mockChanges);
      expect(result.serverTime).toBeInstanceOf(Date);
    });
  });

  describe('pushChanges', () => {
    it('should process changes and return results', async () => {
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

      mockDataSource.transaction.mockImplementation(async (callback) => {
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