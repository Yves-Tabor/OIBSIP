import { PendingPizzaBuild, User } from '../types';

export const readStoredUser = (): User | null => {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    const value: unknown = JSON.parse(stored);
    if (typeof value !== 'object' || value === null) return null;
    const candidate = value as Partial<User>;
    return typeof candidate.id === 'string' && typeof candidate.name === 'string' && typeof candidate.email === 'string' && (candidate.role === 'user' || candidate.role === 'admin')
      ? { id: candidate.id, name: candidate.name, email: candidate.email, role: candidate.role, isVerified: candidate.isVerified === true }
      : null;
  } catch {
    return null;
  }
};

export const parsePendingPizzaBuild = (value: string): PendingPizzaBuild => {
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid pending pizza build');
  const candidate = parsed as Partial<PendingPizzaBuild>;
  if (!Array.isArray(candidate.items) || typeof candidate.totalPrice !== 'number' || typeof candidate.txRef !== 'string' || typeof candidate.transactionId !== 'string') {
    throw new Error('Invalid pending pizza build');
  }
  return { items: candidate.items, totalPrice: candidate.totalPrice, txRef: candidate.txRef, transactionId: candidate.transactionId };
};