import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePolygonStore = create(
	persist(
		(set) => ({
			polygons: [], // Store array of polygons

			// Action to save a polygon
			savePolygon: (newPolygon) =>
				set((state) => ({
					polygons: [...state.polygons, newPolygon],
				})),

			// Action to clear all polygons
			clearAllPolygons: () => set({ polygons: [] }),
			editPolygons: (editPolygons) => set({ polygons: editPolygons }),
			deletePolygon: (deletePolygon) =>
				set((state) => ({
					polygons: state.polygons.filter(
						(polygon) => polygon.name !== deletePolygon.name,
					),
				})),
		}),
		{
			name: "polygon-storage", // Persist polygons in local storage
		},
	),
);
