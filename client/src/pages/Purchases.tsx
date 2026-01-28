import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Plus, Trash2, Search, Loader2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchases, useDeletePurchase } from "@/hooks/use-purchases";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Purchases() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");
  const { data: allPurchases = [], isLoading } = usePurchases();
  const { toast } = useToast();
  
  // Verificar si es ADMIN (compatible con ambos formatos)
  const isAdmin = user?.role === "ADMIN" || user?.role === "administrador";
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">Solo los administradores pueden ver esta página.</p>
        </div>
      </div>
    );
  }
  
  // Filtrado de compras
  let purchases = allPurchases.filter(p => {
    const matchesSearch = searchValue === "" || 
                         p.proveedor.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (p.numero_factura?.toLowerCase() || "").includes(searchValue.toLowerCase());
    
    const matchesSupplier = supplierFilter === "all" || 
                           p.proveedor.nombre.toLowerCase().includes(supplierFilter.toLowerCase());
    
    const matchesMonth = monthFilter === "all" || 
                        new Date(p.fecha).getMonth().toString() === monthFilter;
    
    const matchesCost = costFilter === "all" ||
                       (costFilter === "low" && p.costo_total < 100000) ||
                       (costFilter === "medium" && p.costo_total >= 100000 && p.costo_total < 500000) ||
                       (costFilter === "high" && p.costo_total >= 500000);
    
    return matchesSearch && matchesSupplier && matchesMonth && matchesCost;
  });

  // Ordenar por fecha descendente
  purchases = [...purchases].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Compras" 
        description="Registre nuevas adquisiciones de stock y gestione proveedores."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="btn-pill border-slate-300">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              Importar Excel
            </Button>
            <Button 
              className="btn-pill bg-primary shadow-lg shadow-primary/20"
              onClick={() => setLocation("/purchases/create")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Compra
            </Button>
          </div>
        }
      />

      {/* Buscador principal */}
      <div className="relative">
        {!searchFocused && !searchValue && (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        )}
        <Input 
          placeholder=""
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-white border-slate-200 rounded-lg h-12 text-base pl-14"
        />
      </div>

      <div className="card-industrial bg-white p-6 space-y-4 mb-6">
        {/* Filtros */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <span className="text-sm text-slate-600 font-medium">Filtrar por:</span>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[220px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Proveedores</SelectItem>
              <SelectItem value="frenos chile">Frenos Chile</SelectItem>
              <SelectItem value="importadora indra">Importadora Indra</SelectItem>
              <SelectItem value="autoplanet">AutoPlanet</SelectItem>
              <SelectItem value="frenos san francisco">Frenos San Francisco</SelectItem>
              <SelectItem value="würth">Würth Chile</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Meses</SelectItem>
              <SelectItem value="0">Enero</SelectItem>
              <SelectItem value="1">Febrero</SelectItem>
              <SelectItem value="2">Marzo</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Mayo</SelectItem>
              <SelectItem value="5">Junio</SelectItem>
              <SelectItem value="6">Julio</SelectItem>
              <SelectItem value="7">Agosto</SelectItem>
              <SelectItem value="8">Septiembre</SelectItem>
              <SelectItem value="9">Octubre</SelectItem>
              <SelectItem value="10">Noviembre</SelectItem>
              <SelectItem value="11">Diciembre</SelectItem>
            </SelectContent>
          </Select>
          <Select value={costFilter} onValueChange={setCostFilter}>
            <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Costo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Costos</SelectItem>
              <SelectItem value="asc">Menor a Mayor</SelectItem>
              <SelectItem value="desc">Mayor a Menor</SelectItem>
              <SelectItem value="range1">Hasta $500.000</SelectItem>
              <SelectItem value="range2">$500.000 - $1.500.000</SelectItem>
              <SelectItem value="range3">Más de $1.500.000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-industrial bg-white p-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
              <TableHead className="font-display font-bold text-slate-900 h-14">Proveedor</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Nº Documento</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Fecha</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Items</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">Neto</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">IVA</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">Total</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Registrado por</TableHead>
              <TableHead className="w-[100px] h-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Cargando compras...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 text-slate-300" />
                    <p>No se encontraron compras.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PurchaseRow({ purchase }: { purchase: any }) {
  const { toast } = useToast();
  const deleteMutation = useDeletePurchase();

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar la compra de ${purchase.proveedor.nombre}?`)) {
      deleteMutation.mutate(purchase.id, {
        onSuccess: () => {
          toast({ 
            title: "Compra eliminada", 
            description: `Compra de ${purchase.proveedor.nombre} eliminada correctamente`,
            className: "bg-red-600 text-white border-none"
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo eliminar la compra",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <TableRow className="table-row-hover group border-b border-slate-100">
      <TableCell className="font-semibold text-slate-900">{purchase.proveedor.nombre}</TableCell>
      <TableCell className="text-slate-600 font-mono text-sm">
        {purchase.numero_factura || <span className="text-slate-400">Sin documento</span>}
      </TableCell>
      <TableCell className="text-slate-600">{new Date(purchase.fecha).toLocaleDateString('es-CL')}</TableCell>
      <TableCell className="text-slate-600">{purchase.detalles.length} items</TableCell>
      <TableCell className="text-right font-mono text-slate-900">
        ${purchase.monto_neto.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-right font-mono text-slate-600">
        ${purchase.monto_iva.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-slate-900">
        ${purchase.monto_total.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">{purchase.createdByName}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

