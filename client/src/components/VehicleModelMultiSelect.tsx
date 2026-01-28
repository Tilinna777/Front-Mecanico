import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Search, Loader2, Car } from "lucide-react";
import { useSearchVehicleModels, useVehicleModelBrands, useVehicleModelsByBrand, type VehicleModel } from "@/hooks/use-vehicle-models";
import { cn } from "@/lib/utils";

interface VehicleModelMultiSelectProps {
  selectedModels: VehicleModel[];
  onModelsChange: (models: VehicleModel[]) => void;
  className?: string;
}

export function VehicleModelMultiSelect({ 
  selectedModels, 
  onModelsChange, 
  className 
}: VehicleModelMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: brands = [], isLoading: brandsLoading } = useVehicleModelBrands();
  
  // Búsqueda global si no hay marca seleccionada
  const { data: searchResults = [], isLoading: searchLoading } = useSearchVehicleModels(
    searchQuery,
  );
  
  // Modelos por marca si hay una marca seleccionada
  const { data: brandModels = [], isLoading: brandLoading } = useVehicleModelsByBrand(
    selectedBrand !== "all" ? selectedBrand : "",
  );

  // Decidir qué resultados mostrar
  const availableModels = selectedBrand === "all" 
    ? searchResults 
    : brandModels.filter(m => 
        searchQuery.length < 2 || 
        m.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.anio.toString().includes(searchQuery)
      );

  const isLoading = searchLoading || brandLoading;

  const handleSelectModel = (model: VehicleModel) => {
    // Evitar duplicados
    const exists = selectedModels.some(m => m.id === model.id);
    if (!exists) {
      onModelsChange([...selectedModels, model]);
    }
    setSearchQuery("");
  };

  const handleRemoveModel = (modelId: string) => {
    onModelsChange(selectedModels.filter(m => m.id !== modelId));
  };

  const filteredAvailableModels = availableModels.filter(
    model => !selectedModels.some(selected => selected.id === model.id)
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filtro por marca (opcional) */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="h-10 bg-white border-slate-300">
              <SelectValue placeholder="Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedBrand !== "all" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedBrand("all")}
            className="text-slate-500 hover:text-slate-700"
          >
            Limpiar filtro
          </Button>
        )}
      </div>

      {/* Buscador con autocomplete */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-opacity duration-200",
              (searchFocused || searchQuery) && "opacity-0"
            )} />
            <Input
              placeholder=""
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                setOpen(true);
                setSearchFocused(true);
              }}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "h-11 bg-white border-slate-300 transition-all duration-200",
                (searchFocused || searchQuery) ? "pl-3" : "pl-10"
              )}
            />
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 border-slate-200 shadow-lg" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command className="rounded-lg">
            <CommandList className="max-h-[280px]">
              {isLoading ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Buscando modelos...</p>
                </div>
              ) : filteredAvailableModels.length === 0 ? (
                <CommandEmpty className="py-6 text-center">
                  <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">No se encontraron modelos</p>
                  {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="text-xs text-slate-400 mt-1">Escribe al menos 2 caracteres</p>
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredAvailableModels.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={`${model.marca} ${model.modelo} ${model.anio}`}
                      onSelect={() => {
                        handleSelectModel(model);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {model.marca} {model.modelo}
                        </div>
                        <div className="text-xs text-slate-500">Año: {model.anio}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Chips de modelos seleccionados */}
      {selectedModels.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          {selectedModels.map((model) => (
            <Badge
              key={model.id}
              variant="secondary"
              className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 gap-1.5"
            >
              <Car className="w-3 h-3" />
              <span className="font-medium">
                {model.marca} {model.modelo} ({model.anio})
              </span>
              <button
                type="button"
                onClick={() => handleRemoveModel(model.id)}
                className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500">
        {selectedBrand === "all" 
          ? "Escribe al menos 2 caracteres para buscar modelos"
          : "Selecciona modelos de la lista filtrada por marca"}
      </p>
    </div>
  );
}
