export type MasaType = "maiz_amarillo" | "maiz_blanco" | "arroz";
export type RellenoType = "recado_rojo_cerdo" | "negro_pollo" | "chipilin_veg" | "mezcla_chuchito";
export type EnvolturaType = "platano" | "tusa";
export type PicanteType = "sin" | "suave" | "chapin";

export type BebidaTipo = "atol_elote" | "atole_shuco" | "pinol" | "cacao_batido";
export type EndulzanteType = "panela" | "miel" | "sin_azucar";
export type ToppingType = "malvaviscos" | "canela" | "ralladura_cacao" | "ninguno";

export type TamalSize = "unidad" | "media_docena" | "docena";
export type BebidaSize = "12oz" | "1L";

export interface TamalConfig {
  masa: MasaType;
  relleno: RellenoType;
  envoltura: EnvolturaType;
  picante: PicanteType;
  size: TamalSize;
}

export interface BebidaConfig {
  tipo: BebidaTipo;
  endulzante: EndulzanteType;
  topping: ToppingType;
  size: BebidaSize;
}

export interface ComboItemRef {
  kind: "tamal" | "bebida";
  quantity: number;
  // opcionalmente se pueden fijar presets
  tamalPreset?: Partial<TamalConfig>;
  bebidaPreset?: Partial<BebidaConfig>;
}

export interface Combo {
  id: string;
  nombre: string;
  descripcion?: string;
  items: ComboItemRef[];
  precio: number;
  estacional?: boolean;
}

export type CartLine =
  | { id: string; kind: "tamal"; config: TamalConfig; unitPrice: number; quantity: number }
  | { id: string; kind: "bebida"; config: BebidaConfig; unitPrice: number; quantity: number }
  | { id: string; kind: "combo"; comboId: string; displayName: string; unitPrice: number; quantity: number };

export interface InventoryItem {
  id: string;
  categoria: "materia_prima" | "empaque" | "combustible";
  nombre: string;
  unidad: string; // kg, L, unidad
  stock: number;
  costoUnitario: number;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  tipo: "entrada" | "salida" | "merma";
  cantidad: number;
  costoUnitario?: number;
  fecha: string;
  nota?: string;
} 