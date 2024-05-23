import { create } from "zustand";

interface LocationType {
    selected: [string, string, number, number];
    location: [number, number];
    openList: boolean;
    direction: string;
    setLocation: (newLocation: [number, number]) => void;
    setSelected: (newSelected: [string, string, number, number]) => void;
    setOpenList: () => void;
    setOpenListTrue: () => void;
    setDirection: (newDirection: string) => void;
}

const MapStore = create<LocationType>((set) => ({
    //좌표 서울 시청 default 값 설정
    location: [37.570227990912244, 126.98315081716676],
    selected: ["", "", 0, 0],
    openList: true,
    direction: "",
    setLocation: (newLocation: [number, number]) =>
        set((state) => ({ ...state, location: newLocation })),
    setSelected: (newSelected: [string, string, number, number]) =>
        set((state) => ({ ...state, selected: newSelected })),
    setOpenList: () =>
        set((state) => ({ ...state, openList: !state.openList })),
    setOpenListTrue: () => set((state) => ({ ...state, openList: true })),
    setDirection: (newDirection: string) =>
        set((state) => ({ ...state, direction: newDirection })),
}));

export default MapStore;
