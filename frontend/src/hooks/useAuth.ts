import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export const useAppDispatch = () => useDispatch<any>();
export const useAppSelector = useSelector.withTypes<RootState>();
