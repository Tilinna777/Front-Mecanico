import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, User, Car, Phone, FileText } from "lucide-react";
import { useGlobalSearch } from "@/hooks/use-reports";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Buscador global desde el backend
  const { data: searchResults, isLoading } = useGlobalSearch(search);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Clientes" 
        description="Búsqueda de clientes, vehículos y órdenes de trabajo."
      />

      <div className="card-industrial p-6 bg-white space-y-4">
        {/* Búsqueda Principal */}
        <div className="relative">
          {!searchFocused && !search && (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          )}
          <Input 
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-slate-50 border-slate-200 rounded-lg h-12 text-base pl-14"
          />
        </div>

        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Buscando...
          </div>
        )}

        {!isLoading && search && searchResults && (
          <div className="space-y-6">
            {/* Clientes encontrados */}
            {searchResults.clientes && searchResults.clientes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Clientes ({searchResults.clientes.length})
                </h3>
                <div className="grid gap-3">
                  {searchResults.clientes.map((cliente) => (
                    <div 
                      key={cliente.id} 
                      className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{cliente.nombre}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {cliente.rut}
                            </span>
                            {cliente.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {cliente.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehículos encontrados */}
            {searchResults.vehiculos && searchResults.vehiculos.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehículos ({searchResults.vehiculos.length})
                </h3>
                <div className="grid gap-3">
                  {searchResults.vehiculos.map((vehiculo, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{vehiculo.patente}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{vehiculo.marca} {vehiculo.modelo}</span>
                            <span className="text-xs">Año {vehiculo.anio}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Órdenes recientes */}
            {searchResults.ordenes_recientes && searchResults.ordenes_recientes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Órdenes de Trabajo Recientes ({searchResults.ordenes_recientes.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OT#</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.ordenes_recientes.map((orden) => (
                      <TableRow key={orden.id}>
                        <TableCell className="font-medium">#{orden.numero_orden}</TableCell>
                        <TableCell>{orden.cliente_nombre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            {orden.patente}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(orden.fecha).toLocaleDateString('es-CL')}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              orden.estado === "FINALIZADA" ? "default" :
                              orden.estado === "EN_PROCESO" ? "secondary" :
                              "destructive"
                            }
                          >
                            {orden.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${orden.total?.toLocaleString('es-CL') || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* No hay resultados */}
            {(!searchResults.clientes || searchResults.clientes.length === 0) &&
             (!searchResults.vehiculos || searchResults.vehiculos.length === 0) &&
             (!searchResults.ordenes_recientes || searchResults.ordenes_recientes.length === 0) && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No se encontraron resultados para "{search}"</p>
              </div>
            )}
          </div>
        )}

        {!search && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold text-foreground mb-1">Buscar Clientes y Vehículos</p>
            <p className="text-muted-foreground text-sm">
              Ingresa un nombre, RUT, patente o información del vehículo para comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
