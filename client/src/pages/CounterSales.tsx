import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Loader2, ShoppingCart, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCounterSales } from "@/hooks/use-counter-sales";
import { Badge } from "@/components/ui/badge";

export default function CounterSales() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"VENTA" | "PERDIDA" | "USO_INTERNO" | "all">("all");
  
  const { sales: allSales = [], isLoading } = useCounterSales();
  const { toast } = useToast();
  
  // Filtrado
  let sales = allSales.filter(s => {
    const matchesSearch = search === "" || 
                         (s.comprador?.toLowerCase() || "").includes(search.toLowerCase()) ||
                         (s.comentario?.toLowerCase() || "").includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || s.tipo_movimiento === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Ordenar por fecha descendente
  sales = [...sales].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ventas Mostrador" 
        description="Registra ventas directas, pérdidas y uso interno de inventario"
        action={<CreateCounterSaleDialog />}
      />

      {/* Buscador y Filtros */}
      <div className="card-industrial p-4 bg-white space-y-4">
        <div className="relative">
          {!searchFocused && !search && (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          )}
          <Input 
            placeholder=""
            className="h-12 pl-14 text-base bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <span className="text-sm text-slate-600 font-medium">Filtrar por:</span>
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Tipo de Movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Movimientos</SelectItem>
              <SelectItem value="VENTA">
                <span className="text-green-600 font-semibold">Ventas</span>
              </SelectItem>
              <SelectItem value="PERDIDA">
                <span className="text-red-600 font-semibold">Pérdidas</span>
              </SelectItem>
              <SelectItem value="USO_INTERNO">
                <span className="text-blue-600 font-semibold">Uso Interno</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-industrial bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
              <TableHead className="font-display font-bold text-slate-900 h-14">Tipo</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Fecha</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Comprador/Motivo</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Items</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">Monto</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Registrado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Cargando movimientos...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 text-slate-300" />
                    <p>No se encontraron movimientos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <SaleRow key={sale.id} sale={sale} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SaleRow({ sale }: { sale: any }) {
  const getTypeBadge = (tipo: string) => {
    switch (tipo) {
      case "VENTA":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Venta</Badge>;
      case "PERDIDA":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Pérdida</Badge>;
      case "USO_INTERNO":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Uso Interno</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <TableRow className="table-row-hover group border-b border-slate-100">
      <TableCell>{getTypeBadge(sale.tipo_movimiento)}</TableCell>
      <TableCell className="text-slate-600">{new Date(sale.fecha).toLocaleDateString('es-CL')}</TableCell>
      <TableCell>
        {sale.tipo_movimiento === "VENTA" ? (
          <div className="font-semibold text-slate-900">{sale.comprador || "Cliente anónimo"}</div>
        ) : (
          <div className="text-slate-600 text-sm">{sale.comentario || "Sin comentario"}</div>
        )}
      </TableCell>
      <TableCell className="text-slate-600">{sale.detalles.length} items</TableCell>
      <TableCell className="text-right font-mono">
        {sale.tipo_movimiento === "VENTA" ? (
          <span className="font-bold text-green-700">${sale.total_venta.toLocaleString('es-CL')}</span>
        ) : sale.tipo_movimiento === "PERDIDA" ? (
          <span className="font-bold text-red-700">-${sale.costo_perdida.toLocaleString('es-CL')}</span>
        ) : (
          <span className="text-slate-500">-</span>
        )}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">{sale.createdByName}</TableCell>
    </TableRow>
  );
}

function CreateCounterSaleDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento de Inventario</DialogTitle>
        </DialogHeader>
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium mb-2">Formulario en construcción</p>
          <p className="text-sm">El formulario completo de movimientos se implementará próximamente.</p>
          <p className="text-xs mt-4 text-slate-500">
            Incluirá: tipo de movimiento (Venta/Pérdida/Uso Interno), selección de productos y cálculo automático.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
