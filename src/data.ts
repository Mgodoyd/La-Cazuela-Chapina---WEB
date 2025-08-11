import type { BebidaSize, BebidaTipo, EndulzanteType, MasaType, PicanteType, RellenoType, TamalSize, ToppingType } from "./types";

export const TAMAL_PRICES: Record<TamalSize, number> = {
  unidad: 12,
  media_docena: 65,
  docena: 120,
};

export const BEBIDA_PRICES: Record<BebidaSize, number> = {
  "12oz": 10,
  "1L": 28,
};

export const MASAS: { value: MasaType; label: string }[] = [
  { value: "maiz_amarillo", label: "Maíz amarillo" },
  { value: "maiz_blanco", label: "Maíz blanco" },
  { value: "arroz", label: "Arroz" },
];

export const RELLENOS: { value: RellenoType; label: string }[] = [
  { value: "recado_rojo_cerdo", label: "Recado rojo (cerdo)" },
  { value: "negro_pollo", label: "Negro (pollo)" },
  { value: "chipilin_veg", label: "Chipilín (veg)" },
  { value: "mezcla_chuchito", label: "Mezcla estilo chuchito" },
];

export const PICANTES: { value: PicanteType; label: string }[] = [
  { value: "sin", label: "Sin chile" },
  { value: "suave", label: "Suave" },
  { value: "chapin", label: "Chapín" },
];

export const BEBIDAS: { value: BebidaTipo; label: string }[] = [
  { value: "atol_elote", label: "Atol de elote" },
  { value: "atole_shuco", label: "Atole shuco" },
  { value: "pinol", label: "Pinol" },
  { value: "cacao_batido", label: "Cacao batido" },
];

export const ENDULZANTES: { value: EndulzanteType; label: string }[] = [
  { value: "panela", label: "Panela" },
  { value: "miel", label: "Miel" },
  { value: "sin_azucar", label: "Sin azúcar" },
];

export const TOPPINGS: { value: ToppingType; label: string }[] = [
  { value: "malvaviscos", label: "Malvaviscos" },
  { value: "canela", label: "Canela" },
  { value: "ralladura_cacao", label: "Ralladura de cacao" },
  { value: "ninguno", label: "Ninguno" },
]; 