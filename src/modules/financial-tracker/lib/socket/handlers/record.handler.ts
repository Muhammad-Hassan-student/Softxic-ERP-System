import { IRecord } from "@/modules/financial-tracker/models/record.model";
import { io } from "../server";

export class RecordSocketHandler {
  static emitRecordCreated(module: string, entity: string, record: IRecord) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordCreated', {
      recordId: record._id,
      data: record.data,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      version: record.version
    });
  }

  static emitRecordUpdated(module: string, entity: string, record: IRecord, changes: any[]) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordUpdated', {
      recordId: record._id,
      data: record.data,
      changes,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt,
      version: record.version
    });
  }

  static emitRecordDeleted(module: string, entity: string, recordId: string) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordDeleted', {
      recordId,
      deletedAt: new Date()
    });
  }

  static emitRecordRestored(module: string, entity: string, recordId: string) {
    const room = `${module}:${entity}`;
    io.to(room).emit('recordRestored', {
      recordId,
      restoredAt: new Date()
    });
  }

  static emitConflict(module: string, entity: string, socketId: string, recordId: string, latestRecord: any) {
    io.to(socketId).emit('versionConflict', {
      recordId,
      latestRecord,
      message: 'This record was updated by another user. Please refresh.'
    });
  }
}