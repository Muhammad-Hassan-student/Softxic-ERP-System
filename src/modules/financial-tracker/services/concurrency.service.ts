import { Types } from "mongoose";
import RecordModel, { IRecord } from "../models/record.model";
import { RecordSocketHandler } from "../lib/socket/handlers/record.handler";
import { throws } from "assert";


export class ConcurrencyError extends Error {
    constructor(public latestRecord: IRecord) {
        super('Record was modified by another user');
        this.name = 'ConcurrencyError';
    }
}

class ConcurrencyService {
    /**
     * Update record with optimistic locking 
     */
    static async updateWithLock(
        recordId: string | Types.ObjectId,
        updateData: Partial<IRecord>,
        clientVersion: number,
        userId: string | Types.ObjectId,
        module: string, 
        entity: string,
        socketId?: string
    ): Promise<IRecord> {
        // Atomic update with version check
        const updateRecord = await RecordModel.findOneAndUpdate(
            {
                _id: recordId,
                version: clientVersion,
                isDelete: false
            },
            {
                $set: {
                    ...updateData,
                    updatedBy: userId,
                    updatedAt: new Date(),
                    version: clientVersion + 1
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateRecord) {
            // Fetch latest version for conflict resolution 
            const latestRecord = await RecordModel.findById(recordId);

            if (!latestRecord) {
                throw new Error('Record not found');
            }

            // Notify client about conflict 
            if (socketId) {
                RecordSocketHandler.emitConflict(
                    module,
                    entity,
                    socketId,
                    recordId.toString(),
                    latestRecord
                );
            }
            throw new ConcurrencyError(latestRecord);
        }

        return updateRecord;
    }

    /**
     * Create new record with version 1
     */
    static async createWithLock(
        data: Map<string, any>,
        module: string, 
        entity: string,
        userId: string | Types.ObjectId,
        branchId?: string        
    ): Promise<IRecord> {
        const record = new RecordModel({
            module,
            entity,
            data,
            version: 1,
            status: 'draft',
            branchId,
            createdBy: userId,
            updatedBy: userId,
            isDeleted: false
        });

        await record.save()
        return record;
    }

    /**
     * Merge changes with conflict resolution
     */
    static async mergeChanges(
        recordId: string | Types.ObjectId,
        clientData: Map<string, any>,
        clientVersion: number,
        userId: string | Types.ObjectId,
        module: string,
        entity: string,
        resolutionStrategy: 'client' | 'server' | 'manual'
    ): Promise<IRecord> {
        const latestRecord = await RecordModel.findById(recordId);

        if (!latestRecord) {
            throw new Error('Record not found');
        }

        // If versions match, not conflict
        if (latestRecord.version === clientVersion) {
            return this.updateWithLock(
                recordId,
                { data: clientData },
                clientVersion,
                userId,
                module,
                entity,
            );
        }

        // Handle conflict based on strategy
        switch (resolutionStrategy) {
            case 'client':
                // Force client changes (overwrite)
                return this.updateWithLock(
                    recordId,
                    { data: clientData },
                    latestRecord.version, // Use latest version
                    userId,
                    module,
                    entity
                );
            case 'server':
                // Keep server changes
                return latestRecord;
            case 'manual': 
            // Return latest record for manual merge
            throw new ConcurrencyError(latestRecord);
            
            default:
                throw new Error('Invalid resolution strategy');
        }
    }

}

export default ConcurrencyService;