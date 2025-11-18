import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";

/**
 * 타입이 지정된 useDispatch 훅
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * 타입이 지정된 useSelector 훅
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
