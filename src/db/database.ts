import Dexie, { type Table } from 'dexie';
import { CasualtyReport, User } from '../types';

export class TebitaDB extends Dexie {
  reports!: Table<CasualtyReport>;
  users!: Table<User>;

  constructor() {
    super('TebitaAmbulanceDB');
    this.version(1).stores({
      reports: 'id, status, emtId, emtName, createdAt',
      users: 'id, role'
    });
  }
}

export const db = new TebitaDB();

// Seed initial admin and emt if not exists
export async function seedDB() {
  const usersCount = await db.users.count();
  if (usersCount === 0) {
    await db.users.bulkAdd([
      { id: 'emt1', name: 'John EMT', role: 'EMT', ambulanceId: 'AMB-001' },
      { id: 'admin1', name: 'Tebita Admin', role: 'Admin' }
    ]);
  }
}